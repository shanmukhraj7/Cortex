from pydantic import BaseModel, Field

class EmbedRequest(BaseModel):
    text: str = Field(..., min_length = 1, max_length = 8192)
    is_query: bool = Field(
        default=False,
        description="True for search queries, False for documents"
    )

class EmbedResponse(BaseModel):
    vector: list[float]
    model: str
    dimensions: int

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=512)
    user_id: str = Field(..., description="UUID of the authenticated user")
    top_k: int = Field(default=5, ge=1, le=20)

class SearchResultItem(BaseModel):
    note_id: str
    similarity_score: float = Field(description="Cosine similarity from bi-encoder (0–1)")
    rerank_score: float = Field(description="Cross-encoder relevance score")

class SearchResponse(BaseModel):
    results: list[SearchResultItem]
    query_time_ms: float
    retrieval_count: int = Field(description="Candidates retrieved before reranking")


class HealthResponse(BaseModel):
    status: str
    bi_encoder_loaded: bool
    reranker_loaded: bool
    device: str