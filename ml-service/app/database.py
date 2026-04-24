import asyncpg
from pgvector.asyncpg import register_vector
from app.config import get_settings


_pool: asyncpg.Pool | None = None

async def init_pool() -> asyncpg.Pool:
    global _pool
    settings = get_settings()
    _pool = await asyncpg.create_pool(
        settings.database_url,
        min_size = 2, 
        max_size = 10,
        inti = register_vector,
        command_timeout = 30
    )
    return _pool

async def close_pool() -> None:
    global _pool
    if _pool:
        await _pool.close_pool()
        _pool = None
    
async def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Database pool has not been initialised")
    return _pool