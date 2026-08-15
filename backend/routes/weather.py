"""Weather + advisory routes with full multi-tenant user scoping."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from database.db import get_db
from models.tables import WeatherCache, Farm, Field, Farmer
from services.weather_service import fetch_weather, demo_weather
from services.crop_activity_service import get_activity
from config import settings
from auth.deps import get_current_farm, get_current_farmer

router = APIRouter(prefix="/api/weather", tags=["Weather"])


@router.get("")
async def get_weather(
    city: Optional[str] = Query(None),
    farmer: Farmer = Depends(get_current_farmer),
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    """
    Fetch current weather for authenticated farmer's location.
    """
    target_city = city
    if not target_city or not target_city.strip():
        if farmer and farmer.location:
            target_city = farmer.location.split(",")[0].strip()
        elif farm and farm.region:
            target_city = farm.region.split("(")[0].strip()
        else:
            target_city = "Anand"

    country = settings.WEATHER_DEFAULT_COUNTRY or "IN"
    cache_key = f"{target_city},{country}".lower()

    # Check cache
    cached = db.query(WeatherCache).filter(WeatherCache.location == cache_key).first()
    if cached:
        age = datetime.utcnow() - cached.fetched_at
        if age < timedelta(minutes=15):
            data = cached.data
            data["is_cached"] = True
            return data

    # Live fetch
    live = await fetch_weather(target_city, country, settings.WEATHER_API_KEY)
    if live:
        if cached:
            cached.data = live
            cached.fetched_at = datetime.utcnow()
        else:
            db.add(WeatherCache(location=cache_key, data=live))
        db.commit()
        return live

    # Offline demo
    if cached:
        data = cached.data
        data["is_cached"] = True
        return data
    return demo_weather(city=target_city, country=country)


@router.get("/advisory")
async def get_weather_advisory(
    city: Optional[str] = Query(None),
    farmer: Farmer = Depends(get_current_farmer),
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    """
    Returns weather data + crop-specific advisory for all active fields belonging to THIS farmer.
    """
    weather = await get_weather(city=city, farmer=farmer, farm=farm, db=db)
    condition = weather.get("condition_raw", "")

    # Strictly query fields belonging to the authenticated farm
    fields = db.query(Field).filter(Field.farm_id == farm.id).all()

    from datetime import date
    advisories = []
    seen_names = set()

    for field in fields:
        fname = field.name.strip()
        if fname.lower() in seen_names:
            continue
        seen_names.add(fname.lower())

        crop = field.current_crop or "Wheat"
        if field.sowing_date:
            das = max(1, (date.today() - field.sowing_date).days)
        else:
            das = 30

        activity = get_activity(
            crop=crop,
            das=das,
            weather_condition=condition,
        )
        advisories.append({
            "field_id": field.id,
            "field_name": field.name,
            "field": field.name,
            "crop": crop,
            "area_acre": field.area_acre,
            "das": das,
            "stage": activity.get("stage", "Vegetative Phase"),
            "advisory": activity,
            "routine_tasks": activity.get("routine_tasks", {}),
            "weather_override": activity.get("weather_override"),
            "fertilizer": activity.get("routine_tasks", {}).get("fertilizer"),
            "irrigation": activity.get("routine_tasks", {}).get("irrigation"),
        })

    return {
        "weather": weather,
        "farmer": {
            "name": farmer.name,
            "location": farmer.location,
        },
        "field_advisories": advisories,
    }
