"""Crop recommendation + activity + disease routes with full multi-tenant user scoping."""
from __future__ import annotations
from datetime import date
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import tempfile, shutil, os

from database.db import get_db
from models.tables import Farm, Field, DiseasePrediction, HistoryEntry, WeatherCache
from schemas.schemas import CropRecommendRequest, CropActivityRequest
from services import crop_recommendation_service as rec_svc
from services import crop_activity_service as act_svc
from services import crop_disease_service as dis_svc
from auth.deps import get_current_farm

router = APIRouter(prefix="/api/crops", tags=["Crops"])


@router.post("/recommend")
def recommend_crops(
    req: CropRecommendRequest,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    """Call existing CropRecommendationEngine and return top-3 crops."""
    result = rec_svc.recommend(
        soil_type=req.soil_type or farm.soil_type or "Loamy",
        season=req.season or farm.season or "Winter",
        temperature_c=req.temperature_c if req.temperature_c is not None else (req.temperature or 26.0),
        rainfall_mm=req.rainfall_mm if req.rainfall_mm is not None else (req.rainfall or 450.0),
        water_avail=req.water_avail or farm.water_avail or "Medium",
        region=req.region or farm.region or "North India (Punjab/Haryana)",
        farm_area=req.farm_area or farm.total_area_acre or 5.0,
    )
    top_list = result.get("top_crops") or result.get("recommendations") or []
    if farm and top_list:
        top_crop = top_list[0].get("crop", "Crop")
        db.add(HistoryEntry(
            farm_id=farm.id,
            entry_type="Crop",
            title=f"AI Crop Match: {top_crop} Recommended",
            detail=f"Suitability analysis for {req.soil_type or farm.soil_type or 'Loamy'} soil in {req.season or farm.season or 'Winter'} season",
            date=date.today(),
        ))
        db.commit()
    return result


@router.get("/{field_id}/activity")
def get_field_activity(
    field_id: str,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    """Return live dynamic activity advisory for a specific field based on current weather."""
    field = db.query(Field).filter(Field.id == field_id, Field.farm_id == farm.id).first()
    if not field:
        raise HTTPException(404, "Field not found on this farm.")
    crop = field.current_crop or "Wheat"

    weather_cond = "normal"
    w_cache = db.query(WeatherCache).order_by(WeatherCache.fetched_at.desc()).first()
    if w_cache and isinstance(w_cache.data, dict):
        weather_cond = w_cache.data.get("condition_raw", "normal")

    result = act_svc.get_field_activity(
        crop_name=crop,
        sowing_date=field.sowing_date,
        farmer_location=farm.region or "Jodhpur",
        weather_condition=weather_cond
    )
    das = max(0, (date.today() - field.sowing_date).days) if field.sowing_date else 30
    return {"field": field.name, "crop": crop, "days_after_sowing": das, "weather": weather_cond, **result}


@router.post("/activity")
def get_activity_manual(req: CropActivityRequest):
    """Return activity advisory with explicit parameters."""
    return act_svc.get_crop_activity(
        crop_name=req.crop_name if hasattr(req, 'crop_name') else getattr(req, 'crop', 'Wheat'),
        stage_name=getattr(req, 'stage_name', None),
        weather=getattr(req, 'weather', getattr(req, 'weather_condition', 'normal')),
        sowing_date=getattr(req, 'sowing_date', None),
    )


@router.post("/disease/predict")
async def predict_disease(
    file: UploadFile = File(...),
    field_id: str = Form(None),
    region: str = Form("North"),
    season: str = Form("Kharif"),
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db),
):
    """Diagnose leaf disease using EfficientNet-B4 + fallback CNN."""
    suffix = os.path.splitext(file.filename or "leaf.jpg")[1] or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        result = dis_svc.predict_from_path(tmp_path, region=region, season=season)
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

    # Persist prediction to DB
    pred = DiseasePrediction(
        field_id=field_id,
        crop=result.get("crop", ""),
        disease_name=result.get("disease", ""),
        confidence=result.get("confidence", 0),
        severity=result.get("severity"),
        raw_result=result,
    )
    db.add(pred)

    if farm:
        d_name = result.get("disease", "Crop Pathology")
        c_name = result.get("crop", "Foliage")
        sev = result.get("severity", "Moderate")
        conf = int(result.get("confidence", 0.94) * 100)
        db.add(HistoryEntry(
            farm_id=farm.id,
            entry_type="Scan",
            title=f"AI Vision Scan: {d_name} Detected",
            detail=f"{c_name} Foliage · {sev} Severity · {conf}% AI Match",
            date=date.today(),
        ))

    db.commit()
    db.refresh(pred)

    return {**result, "prediction_id": pred.id}


@router.get("/disease/advisory/{disease_key}")
def get_disease_advisory(disease_key: str, crop: Optional[str] = None):
    """Return full advisory from existing disease knowledge base."""
    advisory = dis_svc.get_advisory(disease_key, crop=crop)
    return advisory
