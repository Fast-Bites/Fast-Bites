from logging.config import fileConfig
from sqlalchemy import pool, create_engine
from alembic import context
import sys
sys.path.insert(0, ".")

from config import settings
from database import Base
from models import User

config = context.config

if not settings.DATABASE_URL:
    raise Exception("DATABASE_URL not set in .env file. Migrations require a database connection.")

# Convert async URL to sync for Alembic
db_url = settings.DATABASE_URL.replace("+asyncpg", "+psycopg2")
config.set_main_option("sqlalchemy.url", db_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Tables managed by this app (won't drop others)
MANAGED_TABLES = {"users"}

# Constraints to keep (don't drop)
KEEP_CONSTRAINTS = {"profiles_email_key"}

def include_object(object, name, type_, reflected, compare_to):
    # Only manage tables we define, ignore others
    if type_ == "table":
        if reflected and name not in MANAGED_TABLES:
            return False
    # Don't drop existing constraints we want to keep
    if type_ in ("unique_constraint", "foreign_key_constraint"):
        if reflected and name in KEEP_CONSTRAINTS:
            return False
    # Don't drop foreign keys from reflected tables
    if type_ == "foreign_key_constraint" and reflected:
        return False
    return True

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = create_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            include_object=include_object,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()



