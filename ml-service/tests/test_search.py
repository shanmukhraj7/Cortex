import pytest
from unittest.mock import patch, AsyncMock

pytestmark = pytest.mark.anyio

_FAKE_USER_ID = "00000000-0000-0000-0000-000000000001"

_MOCK_ROWS = [
    {"note_id": "note-1", "content": "QuickSort has O(n log n) average case", "similarity_score": 0.91},
    {"note_id": "note-2", "content": "Binary search trees and traversal", "similarity_score": 0.74},
    {"note_id": "note-3", "content": "Gradient descent optimisation", "similarity_score": 0.61},
]


async def test_search_returns_results(client):
    from app.main import app
    from app.database import get_pool
    
    from unittest.mock import MagicMock
    mock_pool = MagicMock()
    mock_conn = AsyncMock()
    mock_conn.fetch = AsyncMock(return_value=_MOCK_ROWS[:2])
    
    # Setup acquire() to be an async context manager
    mock_acquire = AsyncMock()
    mock_acquire.__aenter__.return_value = mock_conn
    mock_pool.acquire.return_value = mock_acquire
    
    app.dependency_overrides[get_pool] = lambda: mock_pool
    
    with patch("app.routers.search.reranker.rerank", return_value=([0, 1], [2.3, 1.1])):
        resp = await client.post(
            "/search",
            json={"query": "sorting algorithms", "user_id": _FAKE_USER_ID, "top_k": 2},
        )
    
    app.dependency_overrides.clear()

    assert resp.status_code == 200
    body = resp.json()
    assert len(body["results"]) <= 2
    assert body["retrieval_count"] >= 0
    assert body["query_time_ms"] >= 0


async def test_search_empty_notes_returns_empty(client):
    from app.main import app
    from app.database import get_pool

    from unittest.mock import MagicMock
    mock_pool = MagicMock()
    mock_conn = AsyncMock()
    mock_conn.fetch = AsyncMock(return_value=[])
    
    mock_acquire = AsyncMock()
    mock_acquire.__aenter__.return_value = mock_conn
    mock_pool.acquire.return_value = mock_acquire
    
    app.dependency_overrides[get_pool] = lambda: mock_pool

    resp = await client.post(
        "/search",
        json={"query": "anything", "user_id": _FAKE_USER_ID, "top_k": 5},
    )
    
    app.dependency_overrides.clear()

    assert resp.status_code == 200
    assert resp.json()["results"] == []


async def test_search_validates_empty_query(client):
    resp = await client.post(
        "/search",
        json={"query": "", "user_id": _FAKE_USER_ID, "top_k": 5},
    )
    assert resp.status_code == 422


async def test_health_endpoint(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert "bi_encoder_loaded" in body
    assert "reranker_loaded" in body