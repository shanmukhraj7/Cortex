import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import HealthResponse
from app.config import get_settings
from app.database import init_pool, close_pool
from app.models.embedder import bi_encoder
from app.models.reranker import reranker
from app.routers import search, embed


settings = get_settings()
logging.basicConfig(level= settings.log_level)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Cortex ML Service")

    logger.info("Loading bi-encoder…")
    bi_encoder.load()

    logger.info("Loading cross-encoder reranker…")
    reranker.load()

    logger.info("Initialising database pool…")
    await init_pool()

    logger.info("ML Service ready — bi-encoder dim=%d device=%s",
                bi_encoder.dimensions, bi_encoder.device)
    yield

    logger.info("Shutting down…")
    await close_pool()

app = FastAPI(
    title="Cortex ML Service",
    description=(
        "Semantic embedding and two-stage retrieval for the Cortex knowledge base. "
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8082", "http://notes-service:8082"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(embed.router)
app.include_router(search.router)

@app.get("/health", response_model=HealthResponse, tags=["ops"])
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok" if (bi_encoder.is_loaded and reranker.is_loaded) else "loading",
        bi_encoder_loaded=bi_encoder.is_loaded,
        reranker_loaded=reranker.is_loaded,
        device=bi_encoder.device,
    )
