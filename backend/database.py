import logging
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config import settings

log = logging.getLogger(__name__)
Base = declarative_base()

engine = None
AsyncSessionLocal = None


def _build_engine_kwargs(database_url: str) -> dict:
    """Pool settings that work with Supabase and avoid stale asyncpg connections."""
    kwargs: dict = {
        "echo": False,
        "pool_pre_ping": True,
        "pool_recycle": 280,
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
    }

    if database_url.startswith("postgresql+asyncpg"):
        # Required for Supabase transaction pooler; safe on direct connections too.
        kwargs["connect_args"] = {"statement_cache_size": 0}

    return kwargs


def init_db():
    global engine, AsyncSessionLocal
    if not settings.DATABASE_URL:
        log.warning("DATABASE_URL not set")
        return False
    try:
        engine = create_async_engine(
            settings.DATABASE_URL,
            **_build_engine_kwargs(settings.DATABASE_URL),
        )
        AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        log.info("Database initialized")
        return True
    except Exception as e:
        log.error(f"DB init failed: {e}")
        return False


async def get_db():
    if not AsyncSessionLocal:
        raise Exception("Database not initialized")
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
