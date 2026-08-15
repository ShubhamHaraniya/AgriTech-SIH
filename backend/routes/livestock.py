"""Livestock animals + health assessment + vaccination routes with full multi-tenant user scoping."""
from __future__ import annotations
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.db import get_db
from models.tables import Animal, Farm, Vaccination, HealthAssessment, HistoryEntry
from schemas.schemas import (
    AnimalCreate, AnimalOut, VaccinationCreate, VaccinationOut,
    HealthAssessmentRequest
)
from services import livestock_service as ls_svc
from auth.deps import get_current_farm

router = APIRouter(prefix="/api/livestock", tags=["Livestock"])


# 1. List all animals for the authenticated farm
@router.get("")
def list_animals(
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    animals = db.query(Animal).filter(Animal.farm_id == farm.id).all()
    today = date.today()

    result = []
    for a in animals:
        vaccs = db.query(Vaccination).filter(Vaccination.animal_id == a.id).all()
        overdue = [v for v in vaccs if v.next_due and v.next_due < today and v.status != "Done"]
        due_soon = [v for v in vaccs if v.next_due and today <= v.next_due <= date.fromordinal(today.toordinal() + 7) and v.status != "Done"]
        result.append({
            "id": a.id,
            "tag": a.tag,
            "name": a.name,
            "species": a.species,
            "breed": a.breed,
            "age_years": a.age_years,
            "weight_kg": a.weight_kg,
            "health_status": a.health_status,
            "vaccination_alert": "overdue" if overdue else ("due_soon" if due_soon else "ok"),
        })
    return {
        "total": len(animals),
        "by_species": {
            sp: sum(1 for a in animals if a.species.title() == sp)
            for sp in ["Cow", "Buffalo", "Sheep", "Goat", "Pig", "Duck", "Poultry", "Ox"]
            if any(a.species.title() == sp for a in animals)
        },
        "animals": result,
    }


# 2. Add New Animal (with auto-generated vaccination schedules)
@router.post("", response_model=AnimalOut)
def add_animal(
    animal_in: AnimalCreate,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    obj = Animal(farm_id=farm.id, **animal_in.model_dump())
    db.add(obj)
    db.flush()

    today = date.today()
    sp = obj.species.title()
    if sp in ["Cow", "Buffalo"]:
        default_vaccs = [
            ("Foot & Mouth Disease (FMD) Vaccine", today + timedelta(days=30)),
            ("Blackleg (BQ) Vaccine", today + timedelta(days=90)),
            ("Hemorrhagic Septicemia (HS) Vaccine", today + timedelta(days=180)),
        ]
    else:  # Sheep / Goat
        default_vaccs = [
            ("PPR (Peste des Petits Ruminants) Vaccine", today + timedelta(days=30)),
            ("Enterotoxemia (ET) Vaccine", today + timedelta(days=60)),
            ("Foot & Mouth Disease (FMD) Vaccine", today + timedelta(days=120)),
        ]

    for vname, vdue in default_vaccs:
        v = Vaccination(
            animal_id=obj.id,
            vaccine_name=vname,
            next_due=vdue,
            status="Scheduled"
        )
        db.add(v)

    hist = HistoryEntry(
        farm_id=farm.id,
        entry_type="Animal",
        title=f"Added {obj.species} ({obj.name})",
        detail=f"Tag: {obj.tag}, Breed: {obj.breed}, Age: {obj.age_years} yrs, Initial Health: {obj.health_status}"
    )
    db.add(hist)
    db.commit()
    db.refresh(obj)

    return obj


# 3. All Vaccinations
@router.get("/vaccinations/all")
def all_vaccinations(
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    animals = db.query(Animal).filter(Animal.farm_id == farm.id).all()
    animal_map = {a.id: a for a in animals}
    vaccs = db.query(Vaccination).filter(
        Vaccination.animal_id.in_([a.id for a in animals])
    ).all() if animals else []
    today = date.today()

    result = []
    for v in vaccs:
        a = animal_map.get(v.animal_id)
        status = v.status
        if v.status == "Done":
            status = "Done"
        elif v.next_due:
            if v.next_due < today:
                status = "Overdue"
            elif today <= v.next_due <= date.fromordinal(today.toordinal() + 7):
                status = "Due"
            else:
                status = "Scheduled"
        result.append({
            "id": v.id,
            "animal_id": v.animal_id,
            "animal_name": a.name if a else "",
            "animal_species": a.species if a else "",
            "vaccine_name": v.vaccine_name,
            "given_on": str(v.given_on) if v.given_on else None,
            "next_due": str(v.next_due) if v.next_due else None,
            "status": status,
        })
    return sorted(result, key=lambda x: (
        0 if x["status"] == "Overdue" else 1 if x["status"] == "Due" else 2 if x["status"] == "Scheduled" else 3
    ))


# 4. Mark Vaccination as Done + auto-create next annual booster
@router.put("/vaccinations/{vaccination_id}/done")
def mark_vaccination_done(
    vaccination_id: str,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    v = db.query(Vaccination).filter(Vaccination.id == vaccination_id).first()
    if not v:
        raise HTTPException(404, "Vaccination record not found")

    # Verify animal belongs to this farm
    animal = db.query(Animal).filter(Animal.id == v.animal_id, Animal.farm_id == farm.id).first()
    if not animal:
        raise HTTPException(403, "Animal not on this farm")

    today = date.today()

    # ── Mark this record as administered (close it) ──────────────────────────
    v.status   = "Done"
    v.given_on = today
    v.next_due = None   # closed — booster is a fresh row

    # ── Create new booster row (annual re-schedule) ──────────────────────────
    booster_due = today + timedelta(days=365)
    booster = Vaccination(
        animal_id    = v.animal_id,
        vaccine_name = v.vaccine_name,
        status       = "Scheduled",
        next_due     = booster_due,
        notes        = f"Annual booster after administration on {today}."
    )
    db.add(booster)

    # ── Audit history ────────────────────────────────────────────────────────
    hist = HistoryEntry(
        farm_id    = farm.id,
        entry_type = "Vaccine",
        title      = f"Vaccination Administered: {v.vaccine_name}",
        detail     = (
            f"Given to {animal.name} ({animal.species}) on {today}. "
            f"Annual booster auto-scheduled for {booster_due}."
        )
    )
    db.add(hist)
    db.commit()
    db.refresh(v)
    db.refresh(booster)

    return {
        "message": "Vaccination marked as completed. Annual booster scheduled.",
        "vaccination": {
            "id": v.id, "status": v.status,
            "given_on": str(v.given_on), "next_due": None
        },
        "booster_scheduled": {
            "id": booster.id, "vaccine_name": booster.vaccine_name,
            "status": booster.status, "next_due": str(booster.next_due)
        }
    }


# 5. Run ML Health Assessment
@router.post("/assess")
def assess_health(
    req: HealthAssessmentRequest,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    animal = db.query(Animal).filter(Animal.id == req.animal_id, Animal.farm_id == farm.id).first()
    if not animal:
        raise HTTPException(404, "Animal not found on this farm")

    result = ls_svc.assess(
        animal=animal.species,
        age=req.age_years,
        temperature_f=req.temperature_f,
        symptoms=req.symptoms,
    )

    record = HealthAssessment(
        animal_id=req.animal_id,
        age_at_exam=req.age_years,
        temperature_f=req.temperature_f,
        symptoms=req.symptoms,
        raw_result=result,
        disease_name=result.get("disease"),
        confidence=result.get("confidence"),
        risk_level=result.get("risk_level"),
        notes=req.notes,
    )
    db.add(record)

    if result.get("risk_level") in ["High", "Critical"]:
        animal.health_status = "Sick"
    elif result.get("risk_level") == "Medium":
        animal.health_status = "Under Observation"
    else:
        animal.health_status = "Healthy"

    hist = HistoryEntry(
        farm_id=farm.id,
        entry_type="Animal",
        title=f"Health Assessment: {animal.name} ({animal.species})",
        detail=f"Diagnosed: {result.get('disease')} (Confidence: {int(result.get('confidence',0)*100)}%, Risk: {result.get('risk_level')})"
    )
    db.add(hist)

    # ── Auto-schedule vaccination when a disease is detected ──────────────────
    # Disease diseases (not generic "healthy" or "fever") should get a vaccine
    # scheduled with a 7-day urgent deadline.
    disease_raw = result.get("disease_key", "").lower()
    vaccine_name = (result.get("advisory") or {}).get("vaccine_name")
    auto_vaccine = None

    is_clinical_disease = disease_raw not in ["healthy", "fever", "", None]
    if is_clinical_disease and vaccine_name:
        # Avoid creating a duplicate if the vaccine is already pending
        existing = db.query(Vaccination).filter(
            Vaccination.animal_id == req.animal_id,
            Vaccination.vaccine_name == vaccine_name,
            Vaccination.status == "Pending"
        ).first()

        if not existing:
            due_date = date.today() + timedelta(days=7)
            auto_vaccine = Vaccination(
                animal_id=req.animal_id,
                vaccine_name=vaccine_name,
                status="Pending",
                next_due=due_date,
                notes=f"Auto-scheduled after ML diagnosis: {result.get('disease')} "
                      f"(Risk: {result.get('risk_level')}, Conf: {int(result.get('confidence',0)*100)}%). "
                      f"Administer within 7 days of diagnosis."
            )
            db.add(auto_vaccine)

            vhist = HistoryEntry(
                farm_id=farm.id,
                entry_type="Animal",
                title=f"Auto Vaccination Scheduled: {animal.name}",
                detail=f"Vaccine '{vaccine_name}' due by {due_date} — triggered by ML diagnosis of {result.get('disease')}"
            )
            db.add(vhist)

    db.commit()
    db.refresh(record)

    return {
        "assessment_id": record.id,
        "animal_id": animal.id,
        "animal_name": animal.name,
        "disease": result.get("disease"),
        "disease_key": result.get("disease_key"),
        "confidence": result.get("confidence"),
        "confidence_pct": result.get("confidence_pct"),
        "risk_level": result.get("risk_level"),
        "primary_cause": result.get("primary_cause"),
        "critical_alert": result.get("critical_alert"),
        "matched_symptoms": result.get("matched_symptoms", req.symptoms),
        "all_symptoms_provided": req.symptoms,
        "probabilities": result.get("probabilities", {}),
        "advisory": result.get("advisory", {}),
        "immediate_actions": result.get("immediate_actions", result.get("advisory", {}).get("immediate_action", [])),
        "medicines": result.get("medicines", []),
        "isolation_recommended": result.get("isolation_recommended", False),
        "vet_call_urgency": result.get("vet_call_urgency", "Routine"),
        "assessed_at": str(record.assessed_at),
        # Vaccination auto-scheduling info
        "auto_vaccination_scheduled": auto_vaccine is not None,
        "vaccination_due_date": str(date.today() + timedelta(days=7)) if auto_vaccine else None,
        "vaccination_name": vaccine_name if auto_vaccine else None,
    }


# 6. Get Single Animal Profile
@router.get("/{animal_id}")
def get_animal(
    animal_id: str,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    animal = db.query(Animal).filter(Animal.id == animal_id, Animal.farm_id == farm.id).first()
    if not animal:
        raise HTTPException(404, f"Animal '{animal_id}' not found on this farm")

    today = date.today()
    vaccs = db.query(Vaccination).filter(Vaccination.animal_id == animal.id).all()
    history = db.query(HealthAssessment).filter(HealthAssessment.animal_id == animal.id).order_by(HealthAssessment.assessed_at.desc()).all()

    vacc_list = []
    for v in vaccs:
        status = v.status
        if v.status == "Done":
            status = "Done"
        elif v.next_due:
            if v.next_due < today:
                status = "Overdue"
            elif today <= v.next_due <= date.fromordinal(today.toordinal() + 7):
                status = "Due"
            else:
                status = "Scheduled"
        vacc_list.append({
            "id": v.id,
            "vaccine_name": v.vaccine_name,
            "given_on": str(v.given_on) if v.given_on else None,
            "next_due": str(v.next_due) if v.next_due else None,
            "status": status,
        })

    hist_list = [{
        "id": h.id,
        "disease": h.disease_name,
        "confidence": h.confidence,
        "risk_level": h.risk_level,
        "temperature_f": h.temperature_f,
        "symptoms": h.symptoms,
        "raw_result": h.raw_result,
        "assessed_at": str(h.assessed_at),
    } for h in history]

    return {
        "id": animal.id,
        "farm_id": animal.farm_id,
        "tag": animal.tag,
        "name": animal.name,
        "species": animal.species,
        "breed": animal.breed,
        "age_years": animal.age_years,
        "weight_kg": animal.weight_kg,
        "health_status": animal.health_status,
        "notes": animal.notes,
        "vaccinations": vacc_list,
        "health_history": hist_list,
    }


# 7. Add Custom Vaccination Record
@router.post("/{animal_id}/vaccinations")
def add_vaccination(
    animal_id: str,
    v_in: VaccinationCreate,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    animal = db.query(Animal).filter(Animal.id == animal_id, Animal.farm_id == farm.id).first()
    if not animal:
        raise HTTPException(404, "Animal not found on this farm")

    v = Vaccination(animal_id=animal.id, **v_in.model_dump())
    db.add(v)
    db.commit()
    db.refresh(v)
    return {
        "id": v.id,
        "vaccine_name": v.vaccine_name,
        "given_on": str(v.given_on) if v.given_on else None,
        "next_due": str(v.next_due) if v.next_due else None,
        "status": v.status
    }


# 8. Veterinary Advisory
@router.get("/{animal_id}/advisory/{disease}")
def get_advisory(
    animal_id: str,
    disease: str,
    farm: Farm = Depends(get_current_farm),
    db: Session = Depends(get_db)
):
    animal = db.query(Animal).filter(Animal.id == animal_id, Animal.farm_id == farm.id).first()
    sp = animal.species if animal else "Cow"
    adv = ls_svc.get_advisory(disease, sp)
    if not adv:
        raise HTTPException(404, f"No advisory found for '{disease}'")
    return adv
