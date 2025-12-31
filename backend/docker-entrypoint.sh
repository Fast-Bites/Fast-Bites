#!/bin/bash
set -e

echo "Starting Fast Bites API..."

# Use PORT from environment (Render provides this) or default to 8004
PORT="${PORT:-8004}"
echo "Using port: $PORT"

# Run database migrations
if [ -n "$DATABASE_URL" ]; then
    echo "Running database migrations..."
    alembic upgrade head || echo "Migrations skipped or failed"
fi

# Check environment and start server accordingly
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Starting in PRODUCTION mode..."
    exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
else
    echo "Starting in DEVELOPMENT mode (hot reload enabled)..."
    exec uvicorn main:app --host 0.0.0.0 --port "$PORT" --reload
fi

