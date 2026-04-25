import pytest
import numpy as np

pytestmark = pytest.mark.anyio


async def test_embed_document(client):
    resp = await client.post("/embed", json={"text": "QuickSort algorithm notes", "is_query": False})
    assert resp.status_code == 200
    body = resp.json()
    assert body["dimensions"] == 1024
    assert len(body["vector"]) == 1024
    assert body["model"] == "BAAI/bge-large-en-v1.5"


async def test_embed_query(client):
    resp = await client.post("/embed", json={"text": "sorting algorithms", "is_query": True})
    assert resp.status_code == 200
    assert len(resp.json()["vector"]) == 1024


async def test_embed_empty_text_rejected(client):
    resp = await client.post("/embed", json={"text": "", "is_query": False})
    assert resp.status_code == 422


async def test_embed_vector_is_normalised(client):
    import numpy as np
    resp = await client.post("/embed", json={"text": "test", "is_query": False})
    vec = np.array(resp.json()["vector"])
    norm = float(np.linalg.norm(vec))
    assert abs(norm - 1.0) < 0.01, f"Vector norm {norm:.4f} is not ~1.0"