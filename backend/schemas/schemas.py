"""Pydantic schemas for all API request/response models."""
from __future__ import annotations
from datetime import date, date as dt_date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────────────────────
# FARMER / FARM / FIELD
# ─────────────────────────────────────────────────────────────────────────────
class FarmerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    location: Optional[str] = None
    language: str = "English"

class FarmerOut(FarmerCreate):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class FarmCreate(BaseModel):
    total_area_acre: float = 0
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = None
    water_avail: Optional[str] = None
    irrigation_type: Optional[str] = None
    season: Optional[str] = None
    region: Optional[str] = None
    previous_crop: Optional[str] = None
    n_value: Optional[float] = None
    p_value: Optional[float] = None
    k_value: Optional[float] = None

class FarmOut(FarmCreate):
    id: str
    farmer_id: str
    created_at: datetime
    class Config:
        from_attributes = True

class FieldCreate(BaseModel):
    name: str
    area_acre: float
    current_crop: Optional[str] = None
    crop_name: Optional[str] = None
    sowing_date: Optional[dt_date] = None
    soil_type: Optional[str] = None
    notes: Optional[str] = None

class FieldUpdate(BaseModel):
    name: Optional[str] = None
    area_acre: Optional[float] = None
    current_crop: Optional[str] = None
    crop_name: Optional[str] = None
    sowing_date: Optional[dt_date] = None
    soil_type: Optional[str] = None
    notes: Optional[str] = None

class FieldOut(BaseModel):
    id: str
    farm_id: str
    name: str
    area_acre: float
    current_crop: Optional[str] = None
    crop_name: Optional[str] = None
    sowing_date: Optional[dt_date] = None
    soil_type: Optional[str] = None
    notes: Optional[str] = None
    das: Optional[int] = None
    growth_stage: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────
# ANIMAL / VACCINATION / HEALTH ASSESSMENT
# ─────────────────────────────────────────────────────────────────────────────
class AnimalCreate(BaseModel):
    tag: str
    name: str
    species: str
    breed: Optional[str] = None
    age_years: float = 1.0
    weight_kg: float = 100.0
    health_status: str = "Healthy"
    notes: Optional[str] = None

class AnimalOut(AnimalCreate):
    id: str
    farm_id: str
    created_at: datetime
    class Config:
        from_attributes = True

class VaccinationCreate(BaseModel):
    vaccine_name: str
    given_on: Optional[dt_date] = None
    next_due: Optional[dt_date] = None
    status: str = "Pending"
    notes: Optional[str] = None

class VaccinationOut(VaccinationCreate):
    id: str
    animal_id: str
    created_at: datetime
    class Config:
        from_attributes = True

class HealthAssessmentRequest(BaseModel):
    animal_id: str
    age_years: float
    temperature_f: float
    symptoms: List[str]
    notes: Optional[str] = None

class HealthAssessmentOut(BaseModel):
    id: str
    animal_id: str
    age_at_exam: float
    temperature_f: float
    symptoms: List[str]
    disease_name: Optional[str]
    confidence: Optional[float]
    risk_level: Optional[str]
    raw_result: Optional[Dict[str, Any]]
    assessed_at: datetime
    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────
class CropRecommendRequest(BaseModel):
    soil_type: Optional[str] = "Loamy"
    season: Optional[str] = "Winter"
    temperature_c: Optional[float] = 26.0
    rainfall_mm: Optional[float] = 450.0
    water_avail: Optional[str] = "Medium"
    region: Optional[str] = "North India (Punjab/Haryana)"
    farm_area: Optional[float] = 5.0
    # Optional NPK fallback fields
    N: Optional[float] = None
    P: Optional[float] = None
    K: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    ph: Optional[float] = None
    rainfall: Optional[float] = None
    top_k: Optional[int] = 3

class CropRecommendationItem(BaseModel):
    rank: int
    crop: str
    probability_pct: float
    suitability: str
    market_outlook: Dict[str, Any]
    growing_season: str
    water_requirement: str

class CropRecommendResponse(BaseModel):
    recommendations: List[CropRecommendationItem]
    soil_profile_evaluated: Dict[str, Any]
    input_params: Dict[str, Any]


# ─────────────────────────────────────────────────────────────────────────────
# CROP ACTIVITY
# ─────────────────────────────────────────────────────────────────────────────
class CropActivityRequest(BaseModel):
    crop: str
    das: int
    weather_condition: Optional[str] = "Sunny"

CropActivityManualRequest = CropActivityRequest

class CropActivityOut(BaseModel):
    field_id: Optional[str] = None
    crop: str
    das: int
    current_stage: str
    routine_tasks: Dict[str, Any]
    weather_override: Dict[str, Any]
    upcoming: List[Dict[str, Any]]
    weather_alerts: List[Dict[str, Any]]


# ─────────────────────────────────────────────────────────────────────────────
# WEATHER
# ─────────────────────────────────────────────────────────────────────────────
class WeatherOut(BaseModel):
    location: str
    temperature_c: float
    feels_like_c: float
    humidity_pct: float
    condition: str
    condition_raw: str
    wind_kmh: float
    rain_probability: float
    forecast: List[Dict[str, Any]]
    is_cached: bool = False
    fetched_at: Optional[datetime] = None


# ─────────────────────────────────────────────────────────────────────────────
# CROP DISEASE
# ─────────────────────────────────────────────────────────────────────────────
class CropDiseaseOut(BaseModel):
    crop: str
    disease: str
    confidence: float
    severity: Optional[str]
    raw_label: str
    advisory_available: bool
    prediction_id: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# EXPENSE
# ─────────────────────────────────────────────────────────────────────────────
class ExpenseCreate(BaseModel):
    category: str
    amount: float
    description: Optional[str] = None
    date: Optional[dt_date] = None

class ExpenseOut(ExpenseCreate):
    id: str
    farm_id: str
    created_at: datetime
    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────
# HISTORY
# ─────────────────────────────────────────────────────────────────────────────
class HistoryCreate(BaseModel):
    entry_type: str
    title: str
    detail: Optional[str] = None
    date: Optional[date] = None

class HistoryOut(HistoryCreate):
    id: str
    farm_id: str
    created_at: datetime
    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────
# NOTIFICATION
# ─────────────────────────────────────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: str
    priority: str
    title: str
    body: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────
# MISC
# ─────────────────────────────────────────────────────────────────────────────
class MessageOut(BaseModel):
    message: str

class HealthOut(BaseModel):
    status: str
    version: str
    modules: Dict[str, bool]
