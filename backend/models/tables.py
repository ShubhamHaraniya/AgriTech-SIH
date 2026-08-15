"""
SQLAlchemy ORM table definitions.
Designed as Postgres-ready (types work for both SQLite and PG).
"""
import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, Date, DateTime,
    ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship

import sys
from pathlib import Path

# Ensure backend/ dir is on sys.path so `from database.db import Base` resolves
_BACKEND = Path(__file__).resolve().parents[1]
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from database.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Farmer(Base):
    __tablename__ = "farmers"
    id           = Column(String, primary_key=True, default=_uuid)
    name         = Column(String, nullable=False)
    phone        = Column(String)
    location     = Column(String)
    language     = Column(String, default="English")
    created_at   = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="farmer", uselist=False)


class Farm(Base):
    __tablename__ = "farms"
    id              = Column(String, primary_key=True, default=_uuid)
    farmer_id       = Column(String, ForeignKey("farmers.id"), nullable=False)
    total_area_acre = Column(Float, default=0)
    soil_type       = Column(String)
    soil_ph         = Column(Float)
    water_avail     = Column(String)  # Low / Medium / High
    irrigation_type = Column(String)
    season          = Column(String)  # Summer / Winter / Monsoon
    region          = Column(String)
    previous_crop   = Column(String)
    n_value         = Column(Float)
    p_value         = Column(Float)
    k_value         = Column(Float)
    created_at      = Column(DateTime, default=datetime.utcnow)

    farmer  = relationship("Farmer", back_populates="farm")
    fields  = relationship("Field", back_populates="farm")
    animals = relationship("Animal", back_populates="farm")


class Field(Base):
    __tablename__ = "fields"
    id           = Column(String, primary_key=True, default=_uuid)
    farm_id      = Column(String, ForeignKey("farms.id"), nullable=False)
    name         = Column(String, nullable=False)
    area_acre    = Column(Float)
    soil_type    = Column(String)
    current_crop = Column(String)
    sowing_date  = Column(Date)
    notes        = Column(Text)
    created_at   = Column(DateTime, default=datetime.utcnow)

    farm       = relationship("Farm", back_populates="fields")
    activities = relationship("CropActivity", back_populates="field")


class Animal(Base):
    __tablename__ = "animals"
    id               = Column(String, primary_key=True, default=_uuid)
    farm_id          = Column(String, ForeignKey("farms.id"), nullable=False)
    tag              = Column(String)
    name             = Column(String)
    species          = Column(String)  # Cow / Buffalo / Sheep / Goat
    breed            = Column(String)
    age_years        = Column(Float)
    weight_kg        = Column(Float)
    health_status    = Column(String, default="Healthy")  # Healthy / Sick / Under Treatment
    notes            = Column(Text)
    created_at       = Column(DateTime, default=datetime.utcnow)

    farm            = relationship("Farm", back_populates="animals")
    vaccinations    = relationship("Vaccination", back_populates="animal")
    health_records  = relationship("HealthAssessment", back_populates="animal")


class Vaccination(Base):
    __tablename__ = "vaccinations"
    id           = Column(String, primary_key=True, default=_uuid)
    animal_id    = Column(String, ForeignKey("animals.id"), nullable=False)
    vaccine_name = Column(String, nullable=False)
    given_on     = Column(Date)
    next_due     = Column(Date)
    status       = Column(String, default="Pending")  # Done / Due / Overdue / Upcoming
    notes        = Column(Text)
    created_at   = Column(DateTime, default=datetime.utcnow)

    animal = relationship("Animal", back_populates="vaccinations")


class HealthAssessment(Base):
    __tablename__ = "health_assessments"
    id             = Column(String, primary_key=True, default=_uuid)
    animal_id      = Column(String, ForeignKey("animals.id"), nullable=False)
    age_at_exam    = Column(Float)
    temperature_f  = Column(Float)
    symptoms       = Column(JSON)   # list of strings
    raw_result     = Column(JSON)   # pipeline output
    disease_name   = Column(String)
    confidence     = Column(Float)
    risk_level     = Column(String)
    notes          = Column(Text)
    assessed_at    = Column(DateTime, default=datetime.utcnow)

    animal = relationship("Animal", back_populates="health_records")


class CropActivity(Base):
    __tablename__ = "crop_activities"
    id          = Column(String, primary_key=True, default=_uuid)
    field_id    = Column(String, ForeignKey("fields.id"), nullable=False)
    activity    = Column(String)
    scheduled   = Column(Date)
    completed   = Column(Boolean, default=False)
    notes       = Column(Text)
    created_at  = Column(DateTime, default=datetime.utcnow)

    field = relationship("Field", back_populates="activities")


class DiseasePrediction(Base):
    __tablename__ = "disease_predictions"
    id            = Column(String, primary_key=True, default=_uuid)
    field_id      = Column(String, ForeignKey("fields.id"), nullable=True)
    crop          = Column(String)
    image_path    = Column(String)
    disease_name  = Column(String)
    confidence    = Column(Float)
    severity      = Column(String)
    raw_result    = Column(JSON)
    predicted_at  = Column(DateTime, default=datetime.utcnow)


class Expense(Base):
    __tablename__ = "expenses"
    id          = Column(String, primary_key=True, default=_uuid)
    farm_id     = Column(String, ForeignKey("farms.id"), nullable=False)
    category    = Column(String)   # Fertilizer / Labour / Seeds / Veterinary / ...
    amount      = Column(Float)
    description = Column(Text)
    date        = Column(Date, default=date.today)
    created_at  = Column(DateTime, default=datetime.utcnow)


class HistoryEntry(Base):
    __tablename__ = "history"
    id          = Column(String, primary_key=True, default=_uuid)
    farm_id     = Column(String, ForeignKey("farms.id"), nullable=False)
    entry_type  = Column(String)   # Crop / Animal / Expense / Scan / Vaccine
    title       = Column(String)
    detail      = Column(Text)
    date        = Column(Date, default=date.today)
    created_at  = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id          = Column(String, primary_key=True, default=_uuid)
    farm_id     = Column(String, ForeignKey("farms.id"), nullable=False)
    priority    = Column(String, default="info")  # urgent / action / info
    title       = Column(String)
    body        = Column(Text)
    is_read     = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.utcnow)


class WeatherCache(Base):
    __tablename__ = "weather_cache"
    id          = Column(String, primary_key=True, default=_uuid)
    location    = Column(String, unique=True)
    data        = Column(JSON)
    fetched_at  = Column(DateTime, default=datetime.utcnow)
