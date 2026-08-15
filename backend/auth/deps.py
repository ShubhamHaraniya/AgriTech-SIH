"""Authentication & multi-tenant user scoping dependencies."""
from __future__ import annotations
from typing import Optional
from fastapi import Header, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.tables import Farmer, Farm


def get_current_user_id(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    user_id: Optional[str] = None
) -> str:
    """Extract authenticated user ID from X-User-Id header or query parameter."""
    uid = x_user_id or user_id
    if uid and uid.strip():
        return uid.strip()
    return "shubham_gujarat"


def get_current_farmer(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Farmer:
    """Retrieve Farmer record matching current authenticated user ID."""
    farmer = db.query(Farmer).filter(
        (Farmer.id == user_id) |
        (Farmer.phone == user_id) |
        (Farmer.name.ilike(user_id))
    ).first()

    if not farmer:
        # If user does not exist in DB yet, auto-provision their partitioned farmer record
        clean_name = user_id.replace("_", " ").title()
        farmer = Farmer(
            id=user_id,
            name=clean_name,
            phone="9876543210",
            location="Anand, Gujarat" if "gujarat" in user_id.lower() else ("Jodhpur, Rajasthan" if "jodhpur" in user_id.lower() else "New Delhi, Delhi"),
            language="English"
        )
        db.add(farmer)
        db.flush()

    return farmer


def get_current_farm(
    farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
) -> Farm:
    """Retrieve Farm record strictly belonging to current authenticated farmer."""
    farm = db.query(Farm).filter(Farm.farmer_id == farmer.id).first()

    if not farm:
        # Auto-provision isolated farm partition for this user
        farm = Farm(
            farmer_id=farmer.id,
            total_area_acre=5.0,
            soil_type="Loamy Soil",
            soil_ph=7.0,
            water_avail="Medium",
            irrigation_type="Borewell",
            season="Winter",
            region="West India" if "gujarat" in farmer.location.lower() else ("North India" if "jodhpur" in farmer.location.lower() else "Central India")
        )
        db.add(farm)
        db.commit()
        db.refresh(farm)

    return farm
