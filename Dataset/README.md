# 📦 AgriTech Dataset Layer

> **Hardcoded, offline, zero-latency data layer** for the SIH AgriTech application.  
> No LLM, no API, no internet required — pure Python + JSON lookups.

---

## 📁 Folder Structure

```
Dataset/
├── README.md                    ← You are here
│
├── crop_recommendation.py       ← Dataset 1 source + Recommendation Engine
├── crop_activity_weather.py     ← Dataset 2 source + Weather Advisory Engine
├── livestock.py                 ← Dataset 3 source + Vaccination Tracker
│
├── crop_recommendation.json     ← 810 pre-computed permutations (exported)
├── crop_activity_weather.json   ← 282 stage × weather combinations (exported)
├── livestock_diseases.json      ← 26 disease records + fast lookup map (exported)
│
├── export_to_json.py            ← Re-generate all JSON files from Python sources
├── test_all.py                  ← End-to-end verification script
└── __init__.py                  ← Python package exports
```

---

## 📊 Dataset 1 — Crop Recommendation

**File:** `crop_recommendation.py` → `crop_recommendation.json`

### Purpose
Given a farmer's **soil type, season, temperature, rainfall, and water availability**, score all 14 PlantVillage crops and return the **Top-3 best-suited crops** with reasons.

### Crops Covered (14)

| # | Crop | Seasons | Water Req. | Profit Potential |
|---|------|---------|-----------|-----------------|
| 1 | Tomato | Summer / Winter / Monsoon | Medium | High |
| 2 | Potato | Winter | Medium | High |
| 3 | Corn | Monsoon / Summer | Medium | Medium-High |
| 4 | Bell Pepper | All Seasons | Medium | High |
| 5 | Soybean | Monsoon | Medium | Medium-High |
| 6 | Strawberry | Winter | Medium | Very High |
| 7 | Squash | Summer / Monsoon | Low-Medium | Medium |
| 8 | Grape | Summer / Winter | Low-Medium | Very High |
| 9 | Orange | All Seasons | Medium-High | High |
| 10 | Apple | Winter / Summer | Medium | Very High |
| 11 | Peach | Winter / Summer | Medium | High |
| 12 | Cherry | Winter / Summer | Medium | Very High |
| 13 | Blueberry | Winter / Summer | Medium-High | Super Premium |
| 14 | Raspberry | Summer / Monsoon | Medium | Very High |

### Input Dimensions & Combinations

| Dimension | Options | Count |
|-----------|---------|-------|
| Soil Types | Loamy, Sandy Loam, Clay Loam, Black Soil, Alluvial, Red Loam | 6 |
| Seasons | Summer, Winter, Monsoon | 3 |
| Indian Regions | Punjab/Haryana, UP, Himachal Pradesh, Karnataka, Tamil Nadu, Andhra Pradesh, West Bengal, Odisha, Bihar, Maharashtra, Gujarat, Rajasthan, MP, Chhattisgarh, Assam | 15 |
| Water Levels | Low, Medium, High | 3 |
| **Total JSON Permutations** | | **810** |

### Scoring Weights (out of 100)

| Factor | Weight |
|--------|--------|
| Soil compatibility | 30 pts |
| Season alignment | 25 pts |
| Temperature range | 20 pts |
| Rainfall match | 15 pts |
| Water availability | 10 pts |

### Usage Example

```python
from Dataset import CropRecommendationEngine

engine = CropRecommendationEngine()
result = engine.recommend(
    soil_type        = "Sandy Loam",
    farm_area_ha     = 2.0,
    season           = "Winter",
    temperature_c    = 18.0,
    rainfall_mm      = 450.0,
    water_availability = "Medium",
    region           = "North India (Punjab/Haryana)",
    top_k            = 3
)

for crop in result["top_recommendations"]:
    print(f"{crop['crop']}: {crop['match_score']}/100 ({crop['grade']})")
    # Potato: 100/100 (Excellent)
    # Strawberry: 100/100 (Excellent)
    # Cherry: 94/100 (Excellent)
```

### JSON Fast Lookup

```python
import json

with open("Dataset/crop_recommendation.json") as f:
    data = json.load(f)

# Find best crops for a specific combination
match = next(
    p for p in data["all_permutations"]
    if p["soil"] == "Sandy Loam" and p["season"] == "Winter" and p["water"] == "Medium"
)
print(match["top_3"])   # ['Potato', 'Strawberry', 'Cherry']
```

---

## 📅 Dataset 2 — Crop Activity & Weather Advisory

**File:** `crop_activity_weather.py` → `crop_activity_weather.json`

### Purpose
For a given **crop + days after sowing (DAS) + current weather condition**, return:
1. Routine **growth-stage tasks** (field activity, fertilizer, irrigation, care action)
2. **Weather-override directive** that fires on top of the stage schedule

### Growth Stage Rules (47 rules across 14 crops)

Each crop has 3–5 growth stages defined:

| Crop | Stages |
|------|--------|
| Tomato | Nursery → Vegetative → Flowering → Fruiting/Harvest |
| Potato | Sprouting → Vegetative → Tuber Bulking → Dehaulming/Harvest |
| Corn | Germination → Knee-High → Tasseling → Grain Fill/Harvest |
| Bell Pepper | Nursery → Vegetative → Flowering/Harvest |
| Soybean | Germination → Vegetative → Pod Development → Harvest |
| Strawberry | Planting → Crown Expansion → Fruiting |
| Squash | Germination → Vine/Flowering → Fruit/Harvest |
| Grape | Pruning → Canopy → Flower/Berry Set → Berry Development/Harvest |
| Orange | Stress Induction → Flower Flush → Fruit Development |
| Apple | Dormancy Breaking → Bloom → Fruitlet → Maturity/Harvest |
| Peach | Dormancy → Bloom → Fruit/Harvest |
| Cherry | Dormancy → Bloom → Fruit/Harvest |
| Blueberry | Planting/Establishment → Flowering/Fruiting |
| Raspberry | Planting/Cane → Primocane/Flowering → Fruit/Harvest |

### Weather Trigger Rules (5 triggers)

| Trigger | Keywords | Action |
|---------|----------|--------|
| `rain_tomorrow` | rain, thunderstorm, precipitation | **Postpone** all sprays & fertigation; suspend irrigation; clear drains |
| `heatwave` | heatwave, hot_dry, drought, loo | **Increase** drip frequency; apply mulch; use anti-transpirant spray |
| `high_humidity` | fog, high_humidity, cloudy, dew | **Apply preventive fungicide**; switch to drip-only; prune lower foliage |
| `frost_warning` | frost, freezing, cold_wave | **Run night sprinklers**; cover nursery beds with agro-film |
| `harvest_imminent` | maturity, ripe, pre_harvest | **Stop all chemical sprays** (PHI enforcement); withhold water 3–7 days |

> **Total combinations in JSON: 282** (47 stages × 6 weather options including "normal")

### Usage Example

```python
from Dataset import CropActivityWeatherEngine

engine = CropActivityWeatherEngine()
advisory = engine.full_advisory(
    crop    = "Tomato",
    das     = 60,                       # Days After Sowing
    weather = "rain probable tomorrow"
)

print(advisory["current_stage"])
# Flowering & Fruit Set

print(advisory["routine_tasks"]["fertilizer"])
# [POSTPONED – RAIN FORECAST] 13:0:45 (Potassium Nitrate) 3 g/L + ...

print(advisory["weather_override"]["alert"])
# Rain Forecast Alert

print(advisory["weather_override"]["irrigation_directive"])
# SUSPEND scheduled irrigation – rain will supply sufficient moisture. Check field bunds.
```

---

## 🐄 Dataset 3 — Livestock Health & Vaccination

**File:** `livestock.py` → `livestock_diseases.json`

### Purpose
Complete clinical knowledge base for 4 livestock animals covering major Indian endemic diseases, with:
- Full symptom list for diagnosis assistance
- Vaccination schedule (initial age, booster, recurrence frequency)
- Prevention guidelines and first-aid advisory
- **Individual animal vaccination tracker** with auto-calculated next due dates

### Animals & Diseases Covered

| Animal | Diseases |
|--------|---------|
| **Cow** | Anthrax · Blackleg (BQ) · FMD · Lumpy Skin Disease · Pneumonia · Brucellosis |
| **Buffalo** | Anthrax · Blackleg (BQ) · FMD · Hemorrhagic Septicemia (HS) · LSD · Pneumonia |
| **Sheep** | Anthrax · Blackleg · FMD · Pneumonia · LSD · Enterotoxemia |
| **Goat** | Anthrax · Blackleg · FMD · Pneumonia · LSD · PPR · CCPP · Enterotoxemia |
| **Total records** | **26** |

### Vaccine Recurrence Schedule

| Frequency | Interval | Diseases |
|-----------|---------|---------|
| Bi-annual | Every 6 months | FMD (all animals) |
| Annual | Every 12 months | BQ, HS, LSD, Pneumonia, Anthrax |
| Once every 3 years | 1095 days | PPR (Goats) |
| Single lifetime dose | One-time | Brucellosis S19 (Heifers 4–8 months) |

### Vaccination Status Labels

| Status | Meaning |
|--------|---------|
| `UP TO DATE` | Next due date > 15 days away |
| `DUE SOON` | Next due date ≤ 15 days away |
| `OVERDUE` | Next due date has already passed |
| `NEVER VACCINATED` | No record found in animal's history |
| `NOT YET DUE` | Animal is below minimum vaccination age |
| `LIFETIME – No booster needed` | Single-dose vaccine already administered |

### Usage Examples

```python
from Dataset import LivestockRecordManager

manager = LivestockRecordManager()

# 1. Symptom-to-Disease Matching
matches = manager.match_symptoms(
    animal_type       = "Cow",
    observed_symptoms = ["excessive frothy salivation", "vesicles on tongue", "severe lameness"]
)
print(matches[0]["disease"])          # Foot & Mouth Disease (FMD)
print(matches[0]["confidence_pct"])   # 66.7
print(matches[0]["first_aid_advisory"][:80])

# 2. Individual Animal Vaccination Record
health = manager.evaluate_animal_record(
    animal_id          = "COW-101",
    animal_type        = "Cow",
    tag_number         = "TAG-9842",
    age_months         = 24,
    vaccination_history = [
        {"vaccine_name": "FMD Inactivated Trivalent / Tetravalent Oil-Adjuvant Vaccine",
         "date_administered": "2026-03-01"},
        {"vaccine_name": "Blackleg (BQ) Alum-Precipitated Vaccine",
         "date_administered": "2026-05-15"},
    ]
)
print(health["health_summary"])     # "2 alert(s) need attention"
print(health["urgent_alerts"])      # [list of overdue / never-vaccinated vaccines]

# 3. Calculate Next Due Date for a Specific Vaccine
status = manager.calculate_next_due(
    vaccine_name = "FMD Inactivated Trivalent / Tetravalent Oil-Adjuvant Vaccine",
    due_rule     = {"recurrence": "Bi-annual (every 6 months)"},
    last_vaccinated_date = "2026-03-01"
)
print(status["status"])         # DUE SOON
print(status["next_due_date"])  # 2026-08-28
```

---

## 🔄 Re-generating JSON Files

If you modify any `.py` data source, regenerate the JSON exports:

```bash
# From project root (SIH/)
python Dataset/export_to_json.py
```

Output:
```
[OK] crop_recommendation.json  (810 combinations, 14 crops)
[OK] crop_activity_weather.json  (47 stages x 6 weather triggers = 282 combos)
[OK] livestock_diseases.json  (26 records across 4 animals)
```

---

## ✅ Running Tests

```bash
# From project root (SIH/)
python Dataset/test_all.py
```

---

## 🔌 Replacing with Real Database / API Later

All 3 datasets are **fully modular**. To swap in a real database or REST API:

| Dataset | What to Replace | Where |
|---------|----------------|-------|
| Crop Recommendation | `CROP_PROFILES` list | `crop_recommendation.py` line 43 |
| Activity & Weather | `CROP_STAGE_RULES` + `WEATHER_RULES` | `crop_activity_weather.py` lines 55 & 320 |
| Livestock | `LIVESTOCK_DISEASE_DB` list | `livestock.py` line 56 |

Simply replace the hardcoded lists with calls to your DB/API and the engines work unchanged:

```python
# Example: swap in database records
import requests
CROP_PROFILES = requests.get("https://your-api/crops").json()["crops"]
```

---

## 📌 Key Design Decisions

- **No LLM, no internet** — entire advisory pipeline works offline
- **Instant lookups** — pre-generated JSON `fast_lookup` maps for O(1) response
- **Modular** — each dataset is a standalone `.py` module with no cross-dependencies
- **Extensible** — add new crops / diseases / stages by appending to the data lists
- **Region-aware** — 15 Indian state regions with specific agronomic and climatic notes
- **Zoonotic alerts included** — livestock records flag human health risk (Anthrax, Brucellosis)
