# Fast Bites

Food delivery platform — customer app, vendor portal, and API.

## Structure

```
backend/    FastAPI API (Render)
frontend/   React apps — customer, vendor (Vercel root directory)
```

## Development

**Backend**

```bash
cd backend
# use your usual Python/venv setup
```

**Frontend** (from `frontend/`)

```bash
npm install
npm run dev           # customer app — http://localhost:8080
npm run dev:vendor    # vendor app — http://localhost:8081
npm run build         # production build → frontend/dist/
```

Copy `frontend/env.example` to `frontend/.env` and fill in values.

**Docker (backend only)**

```bash
docker compose up
```

## Deploy

| Service  | Platform | Root / notes        |
|----------|----------|---------------------|
| Frontend | Vercel   | Root directory: `frontend`, output: `dist` |
| Backend  | Render   | `backend/`          |
