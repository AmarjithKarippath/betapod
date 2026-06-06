from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.core.db import engine
from app.core.logging import setup_logging
from app.core.middleware import SecurityHeadersMiddleware
from app.core.redis import redis_client
from app.routers import admin as admin_router
from app.routers import auth as auth_router
from app.routers import feedback as feedback_router
from app.routers import requests as requests_router

setup_logging()

app = FastAPI(title="BetaPod API", version="0.1.0")

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=3600,
)

app.include_router(auth_router.router)
app.include_router(requests_router.router)
app.include_router(feedback_router.router)
app.include_router(admin_router.router)

_upload_dir = Path(settings.upload_dir)
_upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_upload_dir)), name="uploads")


@app.get("/health")
def health() -> dict:
    db_ok = False
    redis_ok = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass
    try:
        redis_ok = redis_client.ping()
    except Exception:
        pass
    return {"status": "ok", "db": db_ok, "redis": redis_ok}
