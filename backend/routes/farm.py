"""Farm, Farmer, Field routes with full multi-tenant user scoping."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.db import get_db
from models.tables import Farmer, Farm, Field
from schemas.schemas import (
    FarmerCreate, FarmerOut, FarmCreate, FarmOut,
    FieldCreate, FieldOut, MessageOut
)
from auth.deps import get_current_farm, get_current_farmer

router = APIRouter(prefix="/api/farm", tags=["Farm"])


@router.get("/profile")
def get_profile(
    farmer: Farmer = Depends(get_current_farmer),
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    return {
        "farmer": {
            "id": farmer.id,
            "name": farmer.name,
            "phone": farmer.phone,
            "location": farmer.location,
            "language": farmer.language,
        },
        "farm": {
            "id": farm.id,
            "total_area_acre": farm.total_area_acre,
            "soil_type": farm.soil_type,
            "soil_ph": farm.soil_ph or 6.8,
            "n_value": farm.n_value or 185.0,
            "p_value": farm.p_value or 24.0,
            "k_value": farm.k_value or 290.0,
            "water_avail": farm.water_avail,
            "irrigation_type": farm.irrigation_type,
            "season": farm.season,
            "region": farm.region,
        },
    }


from pydantic import BaseModel
from typing import Optional

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    farmer_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    language: Optional[str] = None
    total_area_acre: Optional[float] = None
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = None
    n_value: Optional[float] = None
    p_value: Optional[float] = None
    k_value: Optional[float] = None
    water_avail: Optional[str] = None
    irrigation_type: Optional[str] = None
    season: Optional[str] = None
    region: Optional[str] = None


@router.put("/profile")
def update_profile(
    req: ProfileUpdate,
    farmer: Farmer = Depends(get_current_farmer),
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    name = req.farmer_name or req.name
    if name:
        farmer.name = name
    if req.phone is not None:
        farmer.phone = req.phone
    if req.location is not None:
        farmer.location = req.location
    if req.language is not None:
        farmer.language = req.language

    if req.total_area_acre is not None:
        farm.total_area_acre = req.total_area_acre
    if req.soil_type is not None:
        farm.soil_type = req.soil_type
    if req.soil_ph is not None:
        farm.soil_ph = req.soil_ph
    if req.n_value is not None:
        farm.n_value = req.n_value
    if req.p_value is not None:
        farm.p_value = req.p_value
    if req.k_value is not None:
        farm.k_value = req.k_value
    if req.water_avail is not None:
        farm.water_avail = req.water_avail
    if req.irrigation_type is not None:
        farm.irrigation_type = req.irrigation_type
    if req.season is not None:
        farm.season = req.season
    if req.region is not None:
        farm.region = req.region

    db.commit()
    return {"message": "Profile updated successfully"}


class SoilHealthUpdate(BaseModel):
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = None
    n_value: Optional[float] = None
    p_value: Optional[float] = None
    k_value: Optional[float] = None
    organic_carbon: Optional[float] = 0.65
    zinc_ppm: Optional[float] = 0.9


@router.get("/soil")
def get_soil_health(
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    ph = farm.soil_ph if farm.soil_ph is not None else 6.8
    n = farm.n_value if farm.n_value is not None else 185.0
    p = farm.p_value if farm.p_value is not None else 24.0
    k = farm.k_value if farm.k_value is not None else 290.0
    
    # Dynamic ratings
    ph_rating = "Optimal" if 6.0 <= ph <= 7.5 else ("Acidic" if ph < 6.0 else "Alkaline")
    n_rating = "Optimal" if 200 <= n <= 350 else ("Low" if n < 200 else "High")
    p_rating = "Optimal" if 20 <= p <= 45 else ("Low" if p < 20 else "High")
    k_rating = "Optimal" if 150 <= k <= 300 else ("Low" if k < 150 else "High")
    
    # Dynamic fertilizer advisory
    advisory = []
    if n < 200:
        advisory.append(f"Apply 25-30 kg/acre Urea (or Neem Coated Urea) to restore soil Nitrogen (current: {n} kg/ha).")
    if p < 20:
        advisory.append(f"Apply 40-50 kg/acre DAP or Single Super Phosphate (SSP) for Phosphorus deficiency (current: {p} kg/ha).")
    if k < 150:
        advisory.append(f"Incorporate Muriate of Potash (MOP 60%) to improve grain development and drought tolerance.")
    if ph < 6.0:
        advisory.append("Acidic soil detected: Broadcast agricultural lime / dolomite (200 kg/acre) to neutralize pH.")
    elif ph > 8.0:
        advisory.append("Alkaline soil detected: Apply agricultural gypsum (150 kg/acre) and organic compost.")
    if not advisory:
        advisory.append("All soil chemical ratings are in the optimal agronomic range. Maintain current FYM organic application.")

    return {
        "farm_id": farm.id,
        "soil_type": farm.soil_type or "Clay Loam",
        "soil_ph": ph,
        "soil_ph_rating": ph_rating,
        "n_value": n,
        "n_rating": n_rating,
        "p_value": p,
        "p_rating": p_rating,
        "k_value": k,
        "k_rating": k_rating,
        "organic_carbon": 0.65,
        "zinc_ppm": 0.9,
        "advisory": advisory,
    }


@router.put("/soil")
def update_soil_health(
    req: SoilHealthUpdate,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    if req.soil_type is not None:
        farm.soil_type = req.soil_type
    if req.soil_ph is not None:
        farm.soil_ph = req.soil_ph
    if req.n_value is not None:
        farm.n_value = req.n_value
    if req.p_value is not None:
        farm.p_value = req.p_value
    if req.k_value is not None:
        farm.k_value = req.k_value

    db.commit()
    db.refresh(farm)
    return get_soil_health(farm, db)


def _format_field_out(f: Field) -> dict:
    return {
        "id": f.id,
        "farm_id": f.farm_id,
        "name": f.name,
        "area_acre": f.area_acre,
        "current_crop": f.current_crop,
        "crop_name": f.current_crop,
        "soil_type": f.soil_type,
        "sowing_date": f.sowing_date,
        "notes": f.notes,
        "created_at": f.created_at,
    }


def _sync_farm_total_area(farm: Farm, db: Session):
    all_fields = db.query(Field).filter(Field.farm_id == farm.id).all()
    sum_acres = round(sum(float(f.area_acre or 0.0) for f in all_fields), 1)
    farm.total_area_acre = sum_acres
    db.commit()


# ── Fields ────────────────────────────────────────────────────────────────────
@router.get("/fields")
def list_fields(
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    fields = db.query(Field).filter(Field.farm_id == farm.id).all()
    return [_format_field_out(f) for f in fields]


@router.post("/fields")
def create_field(
    field_in: FieldCreate,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    data = field_in.model_dump()
    crop = data.pop("crop_name", None) or data.get("current_crop")
    data["current_crop"] = crop
    valid_cols = {"name", "area_acre", "soil_type", "current_crop", "sowing_date", "notes"}
    clean_data = {k: v for k, v in data.items() if k in valid_cols}
    field = Field(farm_id=farm.id, **clean_data)
    db.add(field)
    db.commit()
    db.refresh(field)
    _sync_farm_total_area(farm, db)
    return _format_field_out(field)


@router.get("/fields/{field_id}")
def get_field(
    field_id: str,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    field = db.query(Field).filter(Field.id == field_id, Field.farm_id == farm.id).first()
    if not field:
        raise HTTPException(404, "Field not found on this farm")
    return _format_field_out(field)


@router.put("/fields/{field_id}")
def update_field(
    field_id: str,
    field_in: FieldCreate,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    field = db.query(Field).filter(Field.id == field_id, Field.farm_id == farm.id).first()
    if not field:
        raise HTTPException(404, "Field not found on this farm")
    data = field_in.model_dump()
    crop = data.pop("crop_name", None) or data.get("current_crop")
    if crop:
        data["current_crop"] = crop
    valid_cols = {"name", "area_acre", "soil_type", "current_crop", "sowing_date", "notes"}
    for k, v in data.items():
        if k in valid_cols and v is not None:
            setattr(field, k, v)
    db.commit()
    db.refresh(field)
    _sync_farm_total_area(farm, db)
    return _format_field_out(field)


@router.delete("/fields/{field_id}", response_model=MessageOut)
def delete_field(
    field_id: str,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    field = db.query(Field).filter(Field.id == field_id, Field.farm_id == farm.id).first()
    if not field:
        raise HTTPException(404, "Field not found on this farm")
    db.delete(field)
    db.commit()
    _sync_farm_total_area(farm, db)
    return {"message": "Field deleted"}
