# Use official Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code
COPY . .

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Expose the port (Render uses PORT env variable)
EXPOSE ${PORT:-8004}

# Use entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
