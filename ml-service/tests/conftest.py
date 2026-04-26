import pytest
import numpy as np
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch, PropertyMock
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

@pytest.fixture(params=[pytest.param("asyncio", id="asyncio")])
def anyio_backend():
    return "asyncio"

@pytest.fixture(autouse=True)
def mock_models():
    dummy_vector = np.random.rand(1024).astype(np.float32)
    dummy_vector /= np.linalg.norm(dummy_vector)

    with (
        patch("app.models.embedder.bi_encoder.load"),
        patch("app.models.reranker.reranker.load"),
        patch("app.models.embedder.BiEncoder.is_loaded", new_callable=PropertyMock, return_value=True),
        patch("app.models.reranker.Reranker.is_loaded", new_callable=PropertyMock, return_value=True),
        patch("app.models.embedder.bi_encoder.embed_query", return_value=dummy_vector),
        patch("app.models.embedder.bi_encoder.embed_document", return_value=dummy_vector),
        patch("app.models.embedder.BiEncoder.dimensions", new_callable=PropertyMock, return_value=1024),
        patch("app.models.embedder.BiEncoder.device", new_callable=PropertyMock, return_value="cpu"),
        patch("app.database.init_pool"),
        patch("app.database.close_pool"),
    ):
        yield
        

@pytest.fixture
async def client():
    from app.main import app
    from app.database import get_pool
    
    mock_pool = MagicMock()
    app.dependency_overrides[get_pool] = lambda: mock_pool
    
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as c:
        yield c
        
    app.dependency_overrides.clear()
