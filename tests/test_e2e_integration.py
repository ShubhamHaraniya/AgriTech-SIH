"""
=============================================================================
AgriTech SIH — Comprehensive End-to-End QA Integration & Persistence Test Suite
=============================================================================
Tests all layers:
  Client / API Headers -> FastAPI Endpoints -> ML Services & Rule Engines -> Database ORM / SQLite
"""
import pytest
import io
import sys
from pathlib import Path
from datetime import date, timedelta
from PIL import Image
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
for p in (str(BACKEND), str(ROOT)):
    if p not in sys.path:
        sys.path.insert(0, p)

from main import app
from database.db import SessionLocal, init_db
from models.tables import (
    Farmer, Farm, Field, Animal, Vaccination,
    HealthAssessment, CropActivity, DiseasePrediction,
    Expense, HistoryEntry, Notification, WeatherCache
)
from database.seed import seed_demo

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Ensure tables exist and demo data is seeded."""
    init_db()
    db = SessionLocal()
    try:
        seed_demo(db)
    finally:
        db.close()


# =============================================================================
# 1. SYSTEM HEALTH & CORE MODULES
# =============================================================================
def test_health_check_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"
    assert data["modules"]["crop_recommendation"] is True
    assert data["modules"]["crop_activity"] is True


# =============================================================================
# 2. MULTI-TENANT ISOLATION & FARMER PROFILES
# =============================================================================
@pytest.mark.parametrize("user_id, expected_name, expected_fields, expected_animals", [
    ("user_arun_punjab", "Arun Singh Dhaliwal", 18, 32),
    ("user_priya_karnataka", "Priya Venkataraman", 12, 24),
    ("user_ibrahim_assam", "Ibrahim Ali Sheikh", 5, 45),
    ("user_kavita_mp", "Kavita Patel", 20, 18),
])
def test_production_master_profiles(user_id, expected_name, expected_fields, expected_animals):
    headers = {"X-User-Id": user_id}
    # Profile
    res = client.get("/api/farm/profile", headers=headers)
    assert res.status_code == 200
    prof = res.json()
    assert prof["farmer"]["name"] == expected_name

    # Fields count
    f_res = client.get("/api/farm/fields", headers=headers)
    assert f_res.status_code == 200
    assert len(f_res.json()) >= expected_fields

    # Animals count
    a_res = client.get("/api/livestock", headers=headers)
    assert a_res.status_code == 200
    assert a_res.json()["total"] >= expected_animals


def test_dynamic_farmer_auto_provisioning():
    """Brand new user ID automatically provisions an isolated tenant database partition."""
    unique_user = "user_qa_tester_gujarat_999"
    headers = {"X-User-Id": unique_user}

    res = client.get("/api/farm/profile", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["farmer"]["id"] == unique_user
    assert "Gujarat" in data["farmer"]["location"]

    # Verify DB persistence directly
    db = SessionLocal()
    farmer_row = db.query(Farmer).filter(Farmer.id == unique_user).first()
    farm_row = db.query(Farm).filter(Farm.farmer_id == unique_user).first()
    assert farmer_row is not None
    assert farm_row is not None
    db.close()


def test_update_profile_persistence():
    headers = {"X-User-Id": "user_qa_tester_gujarat_999"}
    payload = {
        "farmer_name": "QA Test Farmer",
        "location": "Anand Organic Research Station, Gujarat",
        "phone": "9998887776",
        "soil_type": "Rich Sandy Loam",
        "total_area_acre": 12.5,
    }
    res = client.put("/api/farm/profile", json=payload, headers=headers)
    assert res.status_code == 200

    # Verify updated profile via API
    get_res = client.get("/api/farm/profile", headers=headers)
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["farmer"]["name"] == "QA Test Farmer"
    assert data["farmer"]["phone"] == "9998887776"
    assert data["farm"]["soil_type"] == "Rich Sandy Loam"
    assert data["farm"]["total_area_acre"] == 12.5


# =============================================================================
# 3. FIELD LIFECYCLE MANAGEMENT (CRUD + DAS + ACREAGE SYNC)
# =============================================================================
def test_field_crud_and_acreage_recalculation():
    user = "user_arun_punjab"
    headers = {"X-User-Id": user}

    # Initial profile area
    p_before = client.get("/api/farm/profile", headers=headers).json()
    init_area = p_before["farm"]["total_area_acre"]

    # 1. CREATE field
    field_payload = {
        "name": "E2E QA Test Plot — Organic Chilli",
        "area_acre": 3.5,
        "current_crop": "Chilli",
        "crop_name": "Chilli",
        "soil_type": "Sandy Loam",
        "sowing_date": str(date.today() - timedelta(days=45)),
        "notes": "Automated QA Verification Field"
    }
    create_res = client.post("/api/farm/fields", json=field_payload, headers=headers)
    assert create_res.status_code == 200
    created = create_res.json()
    field_id = created["id"]
    assert created["name"] == field_payload["name"]
    assert created["current_crop"] == "Chilli"

    # Verify acreage updated
    p_after_create = client.get("/api/farm/profile", headers=headers).json()
    assert p_after_create["farm"]["total_area_acre"] == round(init_area + 3.5, 1)

    # 2. READ field
    get_field_res = client.get(f"/api/farm/fields/{field_id}", headers=headers)
    assert get_field_res.status_code == 200
    assert get_field_res.json()["id"] == field_id

    # 3. UPDATE field
    update_payload = {
        "name": "E2E QA Test Plot — Bell Pepper",
        "area_acre": 4.0,
        "current_crop": "Bell Pepper",
        "soil_type": "Clay Loam",
    }
    update_res = client.put(f"/api/farm/fields/{field_id}", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "E2E QA Test Plot — Bell Pepper"
    assert update_res.json()["current_crop"] == "Bell Pepper"

    # 4. FIELD ACTIVITY / DAS
    act_res = client.get(f"/api/crops/{field_id}/activity", headers=headers)
    assert act_res.status_code == 200
    act_data = act_res.json()
    assert act_data["days_after_sowing"] >= 45
    assert "current_stage" in act_data or "stage" in act_data

    # 5. DELETE field
    del_res = client.delete(f"/api/farm/fields/{field_id}", headers=headers)
    assert del_res.status_code == 200

    # Confirm 404 after deletion
    get_deleted = client.get(f"/api/farm/fields/{field_id}", headers=headers)
    assert get_deleted.status_code == 404

    # Confirm farm acreage returned to baseline
    p_after_delete = client.get("/api/farm/profile", headers=headers).json()
    assert p_after_delete["farm"]["total_area_acre"] == init_area


# =============================================================================
# 4. CROP RECOMMENDATION ENGINE
# =============================================================================
def test_crop_recommendation_and_history_logging():
    user = "user_priya_karnataka"
    headers = {"X-User-Id": user}
    req = {
        "soil_type": "Black Cotton Soil",
        "season": "Winter",
        "temperature_c": 22.0,
        "rainfall_mm": 500.0,
        "water_avail": "High",
        "region": "South India (Karnataka)",
        "farm_area": 5.0,
    }
    res = client.post("/api/crops/recommend", json=req, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "top_crops" in data
    assert len(data["top_crops"]) >= 1
    top_crop = data["top_crops"][0]
    assert "crop" in top_crop
    assert "score" in top_crop
    assert "grade" in top_crop

    # Verify automatic History record in DB
    db = SessionLocal()
    farm = db.query(Farm).filter(Farm.farmer_id == user).first()
    history_entry = db.query(HistoryEntry).filter(
        HistoryEntry.farm_id == farm.id,
        HistoryEntry.entry_type == "Crop"
    ).order_by(HistoryEntry.created_at.desc()).first()
    assert history_entry is not None
    assert "Recommended" in history_entry.title
    db.close()


# =============================================================================
# 5. PLANT PATHOLOGY (EFFICIENTNET-B4 CNN + ADVISORY)
# =============================================================================
def test_plant_disease_prediction_and_advisory():
    user = "user_arun_punjab"
    headers = {"X-User-Id": user}

    # Generate synthetic in-memory image
    img = Image.new("RGB", (380, 380), color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    # Predict endpoint
    files = {"file": ("leaf_test.jpg", buf, "image/jpeg")}
    data = {"region": "North India (Punjab/Haryana)", "season": "Kharif"}
    res = client.post("/api/crops/disease/predict", files=files, data=data, headers=headers)
    assert res.status_code == 200
    pred = res.json()
    assert "crop" in pred
    assert "disease" in pred
    assert "confidence" in pred
    assert "prediction_id" in pred
    pred_id = pred["prediction_id"]

    # Verify DB persistence of DiseasePrediction & HistoryEntry
    db = SessionLocal()
    dp_row = db.query(DiseasePrediction).filter(DiseasePrediction.id == pred_id).first()
    assert dp_row is not None
    assert dp_row.crop == pred["crop"]

    farm = db.query(Farm).filter(Farm.farmer_id == user).first()
    hist_scan = db.query(HistoryEntry).filter(
        HistoryEntry.farm_id == farm.id,
        HistoryEntry.entry_type == "Scan"
    ).order_by(HistoryEntry.created_at.desc()).first()
    assert hist_scan is not None
    assert "AI Vision Scan" in hist_scan.title
    db.close()

    # Advisory retrieval
    adv_res = client.get(f"/api/crops/disease/advisory/{pred['disease']}?crop={pred['crop']}", headers=headers)
    assert adv_res.status_code == 200
    adv = adv_res.json()
    assert isinstance(adv, dict)


# =============================================================================
# 6. LIVESTOCK HERD & DIGITAL REGISTRY
# =============================================================================
def test_livestock_add_animal_and_auto_vaccine_schedules():
    user = "user_ibrahim_assam"
    headers = {"X-User-Id": user}

    animal_payload = {
        "name": "E2E QA Murrah Buffalo",
        "species": "Buffalo",
        "breed": "Murrah",
        "tag": "TAG-E2E-BF99",
        "age_years": 4.5,
        "weight_kg": 540.0,
        "health_status": "Healthy",
        "notes": "Digitally registered via E2E test"
    }
    res = client.post("/api/livestock", json=animal_payload, headers=headers)
    assert res.status_code == 200
    animal = res.json()
    animal_id = animal["id"]
    assert animal["name"] == "E2E QA Murrah Buffalo"

    # Verify auto-generated vaccinations in DB
    db = SessionLocal()
    vaccs = db.query(Vaccination).filter(Vaccination.animal_id == animal_id).all()
    assert len(vaccs) >= 3  # FMD, BQ, HS
    v_names = [v.vaccine_name for v in vaccs]
    assert any("FMD" in v or "Foot & Mouth" in v for v in v_names)
    assert any("Blackleg" in v or "BQ" in v for v in v_names)
    db.close()


# =============================================================================
# 7. CLINICAL VETERINARY MLP HEALTH ASSESSMENT
# =============================================================================
def test_livestock_mlp_health_assessment():
    user = "user_ibrahim_assam"
    headers = {"X-User-Id": user}

    # Find the animal registered
    db = SessionLocal()
    animal = db.query(Animal).filter(Animal.tag == "TAG-E2E-BF99").first()
    assert animal is not None
    animal_id = animal.id
    db.close()

    # 1. SICK Assessment with clinical symptoms
    symptoms = ["painless lumps", "depression", "loss of appetite"]
    assess_payload = {
        "animal_id": animal_id,
        "age_years": 4.5,
        "temperature_f": 104.5,
        "symptoms": symptoms,
        "notes": "Examined by E2E QA Automated Tester"
    }
    res = client.post("/api/livestock/assess", json=assess_payload, headers=headers)
    assert res.status_code == 200
    result = res.json()
    assert result["disease"] is not None
    assert result["confidence"] > 0
    assert result["risk_level"] in ["High", "Critical", "Moderate", "Medium", "Low"]

    # Verify DB persistence and animal status update
    db = SessionLocal()
    updated_animal = db.query(Animal).filter(Animal.id == animal_id).first()
    assert updated_animal.health_status in ["Sick", "Under Observation"]

    assessment_row = db.query(HealthAssessment).filter(HealthAssessment.animal_id == animal_id).first()
    assert assessment_row is not None
    assert assessment_row.temperature_f == 104.5
    assert assessment_row.symptoms == symptoms
    db.close()

    # 2. HEALTHY Assessment (empty symptoms)
    healthy_payload = {
        "animal_id": animal_id,
        "age_years": 4.5,
        "temperature_f": 101.8,
        "symptoms": [],
        "notes": "Certified healthy after observation"
    }
    h_res = client.post("/api/livestock/assess", json=healthy_payload, headers=headers)
    assert h_res.status_code == 200
    h_result = h_res.json()
    assert "Healthy" in h_result["disease"]
    assert h_result["risk_level"] == "Low"

    # Confirm animal status restored to Healthy in DB
    db = SessionLocal()
    healthy_animal = db.query(Animal).filter(Animal.id == animal_id).first()
    assert healthy_animal.health_status == "Healthy"
    db.close()


# =============================================================================
# 8. VACCINATION TRACKER & STATUS UPDATES
# =============================================================================
def test_vaccination_lifecycle_and_mark_done():
    user = "user_kavita_mp"
    headers = {"X-User-Id": user}

    # Fetch all vaccinations
    res = client.get("/api/livestock/vaccinations/all", headers=headers)
    assert res.status_code == 200
    vaccs = res.json()
    assert len(vaccs) > 0

    # Pick first pending/due vaccine
    pending_v = next((v for v in vaccs if v["status"] != "Done"), None)
    if pending_v:
        vac_id = pending_v["id"]
        # Mark as Done
        done_res = client.put(f"/api/livestock/vaccinations/{vac_id}/done", headers=headers)
        assert done_res.status_code == 200
        done_data = done_res.json()
        assert done_data["vaccination"]["status"] == "Done"
        assert done_data["vaccination"]["given_on"] == str(date.today())

        # Verify in DB directly
        db = SessionLocal()
        v_row = db.query(Vaccination).filter(Vaccination.id == vac_id).first()
        assert v_row.status == "Done"
        assert v_row.given_on == date.today()
        assert v_row.next_due == date.today() + timedelta(days=365)
        db.close()


# =============================================================================
# 9. WEATHER & AGRO-METEOROLOGICAL ADVISORIES
# =============================================================================
def test_weather_and_field_advisory():
    user = "user_arun_punjab"
    headers = {"X-User-Id": user}

    # Weather
    w_res = client.get("/api/weather?city=Ludhiana", headers=headers)
    assert w_res.status_code == 200
    w_data = w_res.json()
    assert "temperature_c" in w_data
    assert "condition" in w_data

    # Weather advisory per field
    adv_res = client.get("/api/weather/advisory?city=Ludhiana", headers=headers)
    assert adv_res.status_code == 200
    adv_data = adv_res.json()
    assert "field_advisories" in adv_data
    assert len(adv_data["field_advisories"]) >= 1
    first_adv = adv_data["field_advisories"][0]
    assert "field_name" in first_adv
    assert "crop" in first_adv
    assert "stage" in first_adv


# =============================================================================
# 10. EXPENSE LEDGER & FINANCIAL ANALYTICS
# =============================================================================
def test_expenses_and_financial_analytics():
    user = "user_kavita_mp"
    headers = {"X-User-Id": user}

    # Get initial
    exp_before = client.get("/api/expenses", headers=headers).json()
    init_total = exp_before["total"]

    # Add new expense
    new_exp = {
        "category": "Seeds",
        "amount": 15000.0,
        "description": "E2E Certified High-Yield Soybean Seeds",
        "date": str(date.today())
    }
    add_res = client.post("/api/expenses", json=new_exp, headers=headers)
    assert add_res.status_code == 200
    exp_id = add_res.json()["id"]

    # Verify total outlay increased
    exp_after = client.get("/api/expenses", headers=headers).json()
    assert exp_after["total"] == init_total + 15000.0
    assert exp_after["by_category"]["Seeds"] >= 15000.0

    # Verify DB persistence in Expense & HistoryEntry
    db = SessionLocal()
    e_row = db.query(Expense).filter(Expense.id == exp_id).first()
    assert e_row is not None
    assert e_row.amount == 15000.0

    farm = db.query(Farm).filter(Farm.farmer_id == user).first()
    hist_row = db.query(HistoryEntry).filter(
        HistoryEntry.farm_id == farm.id,
        HistoryEntry.entry_type == "Expense"
    ).order_by(HistoryEntry.created_at.desc()).first()
    assert hist_row is not None
    assert "15000" in hist_row.detail
    db.close()


# =============================================================================
# 11. AUDIT TIMELINE & NOTIFICATION ENGINE
# =============================================================================
def test_history_and_notification_flow():
    user = "user_priya_karnataka"
    headers = {"X-User-Id": user}

    # 1. Manual History Entry
    hist_payload = {
        "entry_type": "Crop",
        "title": "E2E Field Drip Fertigation Cycle",
        "detail": "Applied 19:19:19 water soluble NPK across Block 1 Sugarcane"
    }
    h_res = client.post("/api/history", json=hist_payload, headers=headers)
    assert h_res.status_code == 200

    # Get history with filter
    list_h = client.get("/api/history?entry_type=Crop", headers=headers).json()
    assert any(e["title"] == "E2E Field Drip Fertigation Cycle" for e in list_h)

    # 2. Notifications & Read Status
    notifs = client.get("/api/notifications", headers=headers).json()
    assert len(notifs) >= 1

    first_notif = notifs[0]
    notif_id = first_notif["id"]

    # Mark single as read
    read_res = client.post(f"/api/notifications/{notif_id}/read", headers=headers)
    assert read_res.status_code == 200

    # Verify read in DB
    db = SessionLocal()
    n_row = db.query(Notification).filter(Notification.id == notif_id).first()
    assert n_row.is_read is True
    db.close()

    # Mark all read
    all_read_res = client.post("/api/notifications/read-all", headers=headers)
    assert all_read_res.status_code == 200

    # Verify all are read in DB
    db = SessionLocal()
    farm = db.query(Farm).filter(Farm.farmer_id == user).first()
    unread_count = db.query(Notification).filter(
        Notification.farm_id == farm.id,
        Notification.is_read == False
    ).count()
    assert unread_count == 0
    db.close()
