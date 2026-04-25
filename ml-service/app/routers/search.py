from fastapi import APIRouter, HTTPException, Depends
import time
import asyncio
import logging
import asyncpg

from app.schemas import SearchRequest, SearchResponse, SearchResultItem
from app.models.embedder import bi_encoder
from app.models.reranker import reranker
from app.database import get_pool
from app.config import get_settings

router = APIRouter(prefix="/search", tags=["search"])
logger = logging.getLogger(__name__)

_VECTOR_SEARCH_SQL = """
    SELECT
        id::text       AS note_id,
        content,
        1 - (embedding <=> $1::vector) AS similarity_score
    FROM notes
    WHERE user_id = $2::uuid
    ORDER BY embedding <=> $1::vector
    LIMIT $3
"""


@router.post("", response_model=SearchResponse, summary="Two-stage semantic search")
async def semantic_search(
    request: SearchRequest,
    pool: asyncpg.Pool = Depends(get_pool),
) -> SearchResponse:
    """
    Stage 1: Bi-Encoder  + pgvector (fast + approximate):
        Embed the query with bge-large-en-v1.5, then use pgvector ivfflat index to retrieve the top20 docs for the user.
    Stage 2: Cross-Encoder (slow + precise):
        Score each (query, user_content) pair with ms-macro-MiniLM, return the top_k score re-sorted by cross-encoder relevance score. 
    """

    if not bi_encoder.is_loaded or not reranker.is_loaded:
        raise HTTPException(status_code=503, detail="Models not ready")

    start = time.perf_counter()
    settings = get_settings() 

    # Stage 1: bi-encoder + pgvector
    query_vector = bi_encoder.embed_query(request.query)
    retrieval_k = settings.top_k_retrieval

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            _VECTOR_SEARCH_SQL,
            query_vector.tolist(),
            request.user_id,
            retrieval_k
        )
    
    if not rows:
        elapsed = (time.perf_counter() - start) * 1000
        return SearchResponse(results = [], query_time_ms = round(elapsed, 2), retrieval_count = 0)

    # Stage 2: cross-encoder reranking
    note_ids = [row["note_id"] for row in rows]
    contents = [row["content"] for row in rows]
    bi_scores = [float(row["similarity_score"]) for row in rows]


    loop = asyncio.get_event_loop()
    top_indices, rerank_scores = await loop.run_in_executor(
        None,
        reranker.rerank,
        request.query,
        contents,
        request.top_k,
    )
    results = [
        SearchResultItem(
            note_id = note_ids[i],
            similarity_score = bi_scores[i],
            rerank_score = rerank_scores[rank],
        )
        for rank, i in enumerate(top_indices)
    ]
    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "Search: user=%s query=%r retrieved=%d reranked=%d time=%.1fms",
        request.user_id,
        request.query[:60],
        len(rows),
        len(results),
        elapsed_ms,
    )
    return SearchResponse(
        results = results,
        query_time_ms = round(elapsed_ms, 2),
        retrieval_count = len(rows)
    )
    
