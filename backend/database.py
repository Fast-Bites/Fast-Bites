import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

log = logging.getLogger(__name__)
Base = declarative_base()

engine = None
AsyncSessionLocal = None

def init_db():
    global engine, AsyncSessionLocal
    if not settings.DATABASE_URL:
        log.warning("DATABASE_URL not set")
        return False
    try:
        engine = create_async_engine(settings.DATABASE_URL, echo=False)
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
        yield session



