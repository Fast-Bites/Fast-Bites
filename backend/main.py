import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import profile_router
from database import init_db
from config import settings

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting Fast Bites API")
    init_db()
    yield
    log.info("Shutting down")

app = FastAPI(title="Fast Bites API", lifespan=lifespan)

# CORS - allow frontend
origins = [
    settings.FRONTEND_URL,
    "http://localhost:8080",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile_router)

@app.get("/")
async def root():
    return {"message": "Fast Bites API"}



