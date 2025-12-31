#!/bin/bash
set -e

echo "Starting Fast Bites API..."

# Use PORT from environment (Render provides this) or default to 8004
PORT="${PORT:-8004}"
echo "Using port: $PORT"

# Check environment and start server accordingly
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Starting in PRODUCTION mode..."
    exec gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:"$PORT"
else
    echo "Starting in DEVELOPMENT mode (hot reload enabled)..."
    exec uvicorn main:app --host 0.0.0.0 --port "$PORT" --reload
fi

