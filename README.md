# 🌾 AgriTech AI & Offline Advisory Platform (SIH)

> An integrated, offline-first agricultural intelligence platform combining **Computer Vision (Plant Pathology)**, **Neural Network Tabular Classifiers (Livestock Health)**, and a **deterministic Agronomic Rule Engine** for end-to-end smart farming advisory.

---

## 📌 Architecture Overview

The system is designed with a **two-tier architecture**:
1. **AI / Deep Learning Layer**: Vision models and Multi-Layer Perceptrons (MLP) for disease diagnosis.
2. **Hardcoded Agronomic Rule & Knowledge Layer**: Zero-latency, deterministic data layer with fallbacks, treatment plans, growth stages, weather overrides, and vaccination trackers.

```
                               ┌──────────────────────────────────────────────┐
                               │             Farmer / Client App              │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼
                                        ┌───────────────────────────┐
                                        │   Unified Pipeline Bridge │
                                        │        (pipeline.py)      │
                                        └─────────────┬─────────────┘
                                                      │
         ┌────────────────────────────┬───────────────┴───────────────┬────────────────────────────┐
         │                            │                               │                            │
         ▼                            ▼                               ▼                            ▼
┌──────────────────┐        ┌──────────────────┐            ┌──────────────────┐         ┌──────────────────┐
│  Plant Pathology │        │ Livestock Health │            │       Crop       │         │  Activity & Farm │
│     (Vision)     │        │     (MLP/KB)     │            │  Recommendation  │         │ Weather Advisory │
├──────────────────┤        ├──────────────────┤            ├──────────────────┤         ├──────────────────┤
│ EfficientNet-B4  │        │ Keras MLP Model  │            │ 14 Crops         │         │ 47 Growth Stages │
│ 38 Plant Classes │        │ 5 Diseases       │            │ 6 Soil Types     │         │ 5 Weather Alert  │
│ 99.78% Accuracy  │        │ 4 Farm Animals   │            │ 3 Seasons        │         │   Overrides      │
│ Treatment JSONs  │        │ Vaccine Tracker  │            │ Top-3 Scorer     │         │ Fertigation/Care │
└────────┬─────────┘        └────────┬─────────┘            └────────┬─────────┘         └────────┬─────────┘
         │                           │                               │                            │
         ▼                           ▼                               ▼                            ▼
  Disease/ Folder            Live_Stock_Disease/                      Dataset/ Folder (Python + JSON)
```

---

## 🗂️ Project Repository Structure

```
SIH/
├── README.md                          ← You are here (Main Project Documentation)
├── pipeline.py                        ← Unified API Bridge connecting all modules
│
├── Disease/                           ← Plant Pathology Module (Vision AI + Treatments)
│   ├── efficientnet_b4_best.pt        ← Trained PyTorch EfficientNet-B4 model (99.78% accuracy)
│   ├── class_name.json                ← 38 PlantVillage disease class mappings
│   ├── Data.py                        ← Plant disease agronomic knowledge base generator
│   └── disease_knowledge_base/        ← 38 pre-computed comprehensive advisory JSONs
│
├── Live_Stock_Disease/                ← Livestock Pathology Module (Neural Network + Data)
│   ├── animal_disease_dataset.csv     ← 43,778 clinical records (Cow, Buffalo, Sheep, Goat)
│   ├── LiveStock.ipynb                ← Training & benchmarking notebook (RF, XGBoost, MLP)
│   ├── livestock_disease_mlp.h5       ← Trained Keras MLP classifier
│   ├── label_encoder.pkl              ← Pickled scikit-learn disease label encoder
│   ├── scaler.pkl                     ← Pickled StandardScaler for Age & Temperature
│   └── README.md                      ← Detailed livestock module documentation
│
└── Dataset/                           ← Hardcoded Offline Agronomic Data & Fallback Layer
    ├── crop_recommendation.py         ← 14-crop suitability scoring engine (0–100 scale)
    ├── crop_activity_weather.py       ← 47 crop stage rules + 5 weather trigger overrides
    ├── livestock.py                   ← 26 livestock clinical records + vaccination tracker
    ├── export_to_json.py              ← JSON permutation generator
    ├── crop_recommendation.json       ← 810 pre-computed crop recommendation combinations
    ├── crop_activity_weather.json     ← 282 crop stage × weather trigger combinations
    ├── livestock_diseases.json        ← Fast-lookup clinical livestock records
    ├── test_all.py                    ← Dataset layer verification script
    └── README.md                      ← Detailed Dataset layer documentation
```

---

## 🚀 Key Modules & Capabilities

### 1. Plant Disease Vision Diagnosis (`Disease/`)
- **Model**: `EfficientNet-B4` fine-tuned on PlantVillage dataset.
- **Coverage**: 38 classes across 14 crops (Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Bell Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato).
- **Advisory Output**: Organic treatments, chemical treatments (active ingredient, formulation, dosage, PHI, spray technique), preventive measures, and regional/seasonal guidelines.

### 2. Livestock Disease Diagnosis & Vaccine Tracker (`Live_Stock_Disease/` + `Dataset/`)
- **Model**: Multi-Layer Perceptron (MLP) trained on 43,778 records.
- **Animals Covered**: Cow, Buffalo, Sheep, Goat.
- **Diseases Detected**: Anthrax, Blackleg (BQ), Foot & Mouth Disease (FMD), Lumpy Skin Disease (LSD), Pneumonia / Respiratory Complex, Brucellosis, Enterotoxemia, PPR, CCPP.
- **Symptom Flexibility**: Seamlessly handles full inputs (MLP mode) or 1–2 partial symptoms (Knowledge Base fallback mode).
- **Individual Animal Health Tracking**: Computes next vaccine due dates and generates `OVERDUE`, `DUE SOON`, or `NEVER VACCINATED` alerts.

### 3. Crop Recommendation Engine (`Dataset/crop_recommendation.py`)
- **Weighted Multi-Factor Scoring (0–100 pts)**:
  - Soil Compatibility (30 pts)
  - Season Alignment (25 pts)
  - Temperature Tolerance (20 pts)
  - Rainfall Adequacy (15 pts)
  - Water Availability (10 pts)
- **Output**: Ranked Top-3 crops with suitability grades (`Excellent`, `Good`, `Fair`, `Poor`) and per-factor reasoning.

### 4. Crop Activity & Weather Advisory Engine (`Dataset/crop_activity_weather.py`)
- **Growth Stage Tracking**: 47 stage schedules across 14 crops from germination to harvest.
- **Dynamic Weather Overrides**:
  - `rain_tomorrow` $\rightarrow$ Postpones spraying/fertigation, suspends irrigation, opens drains.
  - `heatwave` $\rightarrow$ Increases drip frequency, advises mulching and anti-transpirant sprays.
  - `high_humidity` $\rightarrow$ Triggers preventive bio-fungicide, disables overhead watering.
  - `frost_warning` $\rightarrow$ Recommends night sprinkler thermal buffering and agro-film covers.
  - `harvest_imminent` $\rightarrow$ Enforces Pre-Harvest Intervals (PHI) and withholds pre-harvest irrigation.

---

## ⚡ Quick Start & Usage

### Prerequisites
Install the required dependencies:
```bash
pip install torch torchvision timm tensorflow scikit-learn pandas numpy pillow
```

### Running via Unified Bridge (`pipeline.py`)

```python
from pipeline import AgriPipeline

# Initialize the pipeline (models load lazily on first use)
pipeline = AgriPipeline()

# -------------------------------------------------------------
# 1. Plant Disease Diagnosis
# -------------------------------------------------------------
plant_result = pipeline.diagnose_plant(
    image_path="sample_leaf.jpg",
    region="North India (Punjab/Haryana)",
    season="Kharif (Monsoon, Jun–Oct)"
)
print("Crop:", plant_result["prediction"]["crop"])
print("Condition:", plant_result["prediction"]["display_name"])
print("Confidence:", plant_result["prediction"]["confidence_pct"], "%")

# -------------------------------------------------------------
# 2. Livestock Disease Diagnosis & Vaccination Evaluation
# -------------------------------------------------------------
livestock_result = pipeline.diagnose_livestock(
    animal="cow",
    age=4,
    temperature=104.2,
    symptoms=["painless lumps", "depression", "loss of appetite"],
    vaccination_history=[
        {"vaccine_name": "FMD Inactivated Trivalent / Tetravalent Oil-Adjuvant Vaccine", "date_administered": "2026-03-01"}
    ]
)
print("Predicted Disease:", livestock_result["prediction"]["disease_display"])
print("Advisory:", livestock_result["advisory"]["first_aid_advisory"][:100])
print("Vaccine Status:", livestock_result["vaccination_status"]["health_summary"])

# -------------------------------------------------------------
# 3. Smart Crop Recommendation
# -------------------------------------------------------------
crops = pipeline.recommend_crops(
    soil_type="Sandy Loam",
    farm_area_ha=2.5,
    season="Winter",
    temperature_c=18.0,
    rainfall_mm=450.0,
    water_availability="Medium",
    region="North India (Punjab/Haryana)",
    top_k=3
)
for crop in crops["top_recommendations"]:
    print(f"-> {crop['crop']}: {crop['match_score']}/100 ({crop['grade']})")

# -------------------------------------------------------------
# 4. Crop Activity & Weather-Responsive Advisory
# -------------------------------------------------------------
advisory = pipeline.get_crop_activity(
    crop="Tomato",
    days_after_sowing=60,
    weather="rain probable tomorrow"
)
print("Current Stage:", advisory["current_stage"])
print("Fertilizer Task:", advisory["routine_tasks"]["fertilizer"])
print("Weather Action:", advisory["weather_override"]["immediate_action"])
```

---

## 🛠️ Testing & Verification

Run the dataset validation test:
```bash
python Dataset/test_all.py
```

Re-export pre-computed JSON datasets (if data rules are updated):
```bash
python Dataset/export_to_json.py
```

---

## 💡 System Design Highlights
- **100% Offline & Deterministic**: Full offline capability; zero reliance on third-party LLMs or external APIs for core decisions.
- **Graceful Degradation**: If sensor data or symptoms are incomplete (e.g., only 1 symptom provided), the system seamlessly transitions from machine learning models to the expert clinical knowledge base.
- **Fast Lookups**: Over 1,000+ permutations pre-indexed as JSON for constant time $O(1)$ response in resource-constrained environments.
