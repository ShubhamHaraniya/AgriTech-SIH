"""
Service layer wrapping the existing CropActivityWeatherEngine.
pipeline.py shows the method is:  _activity_engine.full_advisory(crop, das, weather)
"""
from __future__ import annotations
import sys
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parents[2]
for p in (str(ROOT / "Dataset"), str(ROOT)):
    if p not in sys.path:
        sys.path.insert(0, p)

from crop_activity_weather import CropActivityWeatherEngine  # existing engine

_engine = CropActivityWeatherEngine()


def get_activity(crop: str, das: int, weather_condition: str | None = None) -> dict:
    """
    Return stage-based activities + weather overrides for a given crop and DAS.
    The engine method is full_advisory(crop, days_after_sowing, weather_condition).
    """
    try:
        result = _engine.full_advisory(crop, das, weather_condition or "normal")
    except AttributeError:
        try:
            result = _engine.get_advisory(crop, das, weather_condition or "normal")
        except Exception:
            result = {}
    return result or {}


def get_field_activity(
    crop_name: str,
    sowing_date: date | None = None,
    farmer_location: str = "Jodhpur",
    weather_condition: str = "normal"
) -> dict:
    """Convenience wrapper for field-based activity calculation."""
    das = 30
    if sowing_date:
        try:
            if isinstance(sowing_date, str):
                sowing_date = date.fromisoformat(sowing_date)
            das = max(0, (date.today() - sowing_date).days)
        except Exception:
            das = 30
    return get_activity(crop=crop_name, das=das, weather_condition=weather_condition)


def get_crop_activity(
    crop_name: str,
    stage_name: str | None = None,
    weather: str | None = "normal",
    sowing_date: date | None = None,
) -> dict:
    """Convenience wrapper for explicit parameter calls."""
    das = 30
    if sowing_date:
        try:
            if isinstance(sowing_date, str):
                sowing_date = date.fromisoformat(sowing_date)
            das = max(0, (date.today() - sowing_date).days)
        except Exception:
            das = 30
    return get_activity(crop=crop_name, das=das, weather_condition=weather or "normal")
