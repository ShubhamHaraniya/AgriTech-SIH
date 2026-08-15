"""
Notification generation service.
Reads from DB state (vaccinations, field activities, weather) and generates
Notification records so they originate from rules, not just hardcoded UI.
"""
from __future__ import annotations
from datetime import date, timedelta
import logging
from sqlalchemy.orm import Session

from models.tables import (
    Animal, Vaccination, Field, Notification, Farm
)

logger = logging.getLogger(__name__)


def generate_notifications(farm_id: str, db: Session, weather_condition: str = "") -> int:
    """
    Run rule engine to create new Notification rows.
    Returns count of new notifications created.
    Idempotent — checks for duplicates by title before inserting.
    """
    created = 0
    today = date.today()

    def _add(priority: str, title: str, body: str):
        nonlocal created
        # Avoid duplicates from today
        exists = db.query(Notification).filter(
            Notification.farm_id == farm_id,
            Notification.title == title,
        ).first()
        if not exists:
            db.add(Notification(
                farm_id=farm_id, priority=priority, title=title, body=body
            ))
            created += 1

    # ── Rule 1: Vaccination overdue ──────────────────────────────────────────
    farm_animals = db.query(Animal).filter(Animal.farm_id == farm_id).all()
    animal_ids = [a.id for a in farm_animals]
    if animal_ids:
        overdue_vaccs = db.query(Vaccination).filter(
            Vaccination.animal_id.in_(animal_ids),
            Vaccination.next_due < today,
            Vaccination.status != "Done",
        ).all()
        for v in overdue_vaccs:
            animal = next((a for a in farm_animals if a.id == v.animal_id), None)
            name = f"{animal.name} ({animal.species})" if animal else "Animal"
            _add("urgent", f"Vaccination Overdue — {name}",
                 f"{v.vaccine_name} was due on {v.next_due}. Vaccinate immediately.")

    # ── Rule 2: Vaccination due in next 7 days ───────────────────────────────
    if animal_ids:
        due_soon = db.query(Vaccination).filter(
            Vaccination.animal_id.in_(animal_ids),
            Vaccination.next_due.between(today, today + timedelta(days=7)),
            Vaccination.status != "Done",
        ).all()
        for v in due_soon:
            animal = next((a for a in farm_animals if a.id == v.animal_id), None)
            name = f"{animal.name} ({animal.species})" if animal else "Animal"
            days_left = (v.next_due - today).days
            _add("action", f"Vaccination Due in {days_left} days — {name}",
                 f"{v.vaccine_name} is due on {v.next_due}.")

    # ── Rule 3: Weather alert ─────────────────────────────────────────────────
    if "rain" in weather_condition.lower():
        _add("action", "Rain expected tomorrow",
             "Postpone fertilizer spraying. Check field drainage. Suspend irrigation.")
    elif "heatwave" in weather_condition.lower() or "heat" in weather_condition.lower():
        _add("action", "Heatwave alert",
             "Increase irrigation frequency. Apply mulch around root zones.")

    # ── Rule 4: Fields with activities due today ──────────────────────────────
    fields = db.query(Field).filter(Field.farm_id == farm_id).all()
    for field in fields:
        if field.sowing_date and field.current_crop:
            das = (today - field.sowing_date).days
            if 30 <= das <= 45:
                _add("info", f"Fertilizer due — {field.current_crop} ({field.name})",
                     f"Tillering stage: Urea top-dressing recommended for {field.name}.")

    db.commit()
    return created
