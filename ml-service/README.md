# Recall ML Service

Internal FastAPI microservice providing semantic embedding and two-stage retrieval.

## Models

| Role | Model | Dims | Device | Latency |
|---|---|---|---|---|
| Bi-encoder | BAAI/bge-large-en-v1.5 | 1024 | MPS (M4) / CPU | ~15ms |
| Reranker | cross-encoder/ms-marco-MiniLM-L-6-v2 | — | CPU | ~40ms / 20 pairs |

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/embed` | Embed one text → 1024-dim vector |
| POST | `/search` | Two-stage search for a user's notes |
| GET | `/health` | Model readiness probe |

## Running locally (M4 Mac — MPS acceleration)

```bash
cp .env.example .env
# Set DEVICE=mps for GPU acceleration on M4
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
# First run downloads ~1.3GB of model weights to ./model_cache/
```

## Running tests

```bash
pytest tests/ -v
# Tests mock both models — no network / GPU required
```

## Two-stage retrieval

```
query text
    │
    ▼ bi_encoder.embed_query()       ~15ms on M4 MPS
1024-dim vector
    │
    ▼ pgvector ivfflat ANN           ~5ms
top-20 candidate notes
    │
    ▼ cross_encoder.rerank()         ~40ms on M4 CPU
top-5 results (sorted by relevance)
    │
    ▼ SearchResponse JSON
```