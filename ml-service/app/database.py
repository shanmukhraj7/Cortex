from app.config import get_settings

_pool = None


async def init_pool():
    import asyncpg
    from pgvector.asyncpg import register_vector

    global _pool
    settings = get_settings()

    bootstrap_conn = await asyncpg.connect(settings.database_url)
    try:
        await bootstrap_conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
    finally:
        await bootstrap_conn.close()

    _pool = await asyncpg.create_pool(
        settings.database_url,
        min_size=2,
        max_size=10,
        init=register_vector,       
        command_timeout=30,
    )
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool:
        await _pool.close()        
        _pool = None


async def get_pool():
    if _pool is None:
        raise RuntimeError("Database pool has not been initialised")
    return _pool
