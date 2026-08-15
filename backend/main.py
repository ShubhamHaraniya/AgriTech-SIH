"""
FastAPI application entry point.
Run from project root: uvicorn backend.main:app --reload --port 8000
"""
from __future__ import annotations
import sys
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# ── path setup ────────────────────────────────────────────────────────────────
ROOT    = Path(__file__).resolve().parent.parent   # .../SIH
BACKEND = Path(__file__).resolve().parent          # .../SIH/backend
for p in (str(BACKEND), str(ROOT)):
    if p not in sys.path:
        sys.path.insert(0, p)

from config import settings
from database.db import init_db, SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agritech")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables + seed demo data."""
    logger.info("Initialising database …")
    init_db()
    db = SessionLocal()
    try:
        from database.seed import seed_demo
        seed_demo(db)
    except Exception as exc:
        logger.warning("Seed failed (non-fatal): %s", exc)
    finally:
        db.close()
    logger.info("AgriTech backend ready.")
    yield


app = FastAPI(
    title="AgriTech — Smart Farming Platform",
    description="AI-powered crop advisory, livestock health, and farm management API.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
from routes.farm      import router as farm_router
from routes.crops     import router as crops_router
from routes.weather   import router as weather_router
from routes.livestock import router as livestock_router
from routes.misc      import (
    expense_router, history_router, notif_router
)

app.include_router(farm_router)
app.include_router(crops_router)
app.include_router(weather_router)
app.include_router(livestock_router)
app.include_router(expense_router)
app.include_router(history_router)
app.include_router(notif_router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
def health_check():
    modules = {}
    # Test pipeline availability (lazy — don't load models on health check)
    try:
        from pipeline import AgriPipeline  # noqa
        modules["pipeline"] = True
    except Exception:
        modules["pipeline"] = False
    try:
        from Dataset.crop_recommendation import CropRecommendationEngine  # noqa
        modules["crop_recommendation"] = True
    except Exception:
        modules["crop_recommendation"] = False
    try:
        from Dataset.crop_activity_weather import CropActivityWeatherEngine  # noqa
        modules["crop_activity"] = True
    except Exception:
        modules["crop_activity"] = False
    return {
        "status": "ok",
        "version": "1.0.0",
        "modules": modules,
    }


# ── Yield prediction placeholder ──────────────────────────────────────────────
@app.post("/api/yield/predict")
def yield_predict_placeholder():
    """
    Placeholder endpoint. Yield prediction model not yet trained.
    Connect trained model here when available — no frontend changes needed.
    """
    return {
        "status": "not_implemented",
        "message": "Yield prediction model is not yet available. This endpoint is reserved for future integration.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
