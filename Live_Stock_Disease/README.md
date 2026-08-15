# 🐄 Live_Stock_Disease — Livestock Disease Classification Module

> **AI-powered livestock disease predictor** using a trained MLP (Neural Network)
> that classifies the disease from an animal's symptoms, age, and temperature.

---

## 📁 Folder Contents

```
Live_Stock_Disease/
├── animal_disease_dataset.csv   ← 43,778-row training dataset (Kaggle source)
├── LiveStock.ipynb              ← Training notebook (EDA → preprocessing → 3 models → saved best)
├── livestock_disease_mlp.h5     ← Saved Keras MLP model (best performing)
├── label_encoder.pkl            ← Sklearn LabelEncoder (5 disease class names)
└── README.md                    ← This file
```

---

## 📊 Dataset — `animal_disease_dataset.csv`

**Source:** Kaggle – *Livestock Disease Diagnosis Dataset*
**Rows:** 43,778 | **Columns:** 7

| Column | Type | Values |
|--------|------|--------|
| `Animal` | Categorical | `cow`, `buffalo`, `sheep`, `goat` |
| `Age` | Integer | 1 – 15 (years) |
| `Temperature` | Float | 100.0 – 105.0 (°F) |
| `Symptom 1` | Categorical | 24 unique symptom labels |
| `Symptom 2` | Categorical | 24 unique symptom labels |
| `Symptom 3` | Categorical | 24 unique symptom labels |
| `Disease` | Categorical (Target) | 5 disease classes (see below) |

### Disease Class Distribution

| Disease | Records | % |
|---------|---------|---|
| Anthrax | 9,842 | 22.5% |
| Blackleg | 9,713 | 22.2% |
| Foot and Mouth | 9,701 | 22.2% |
| Pneumonia | 7,330 | 16.7% |
| Lumpy Virus | 7,192 | 16.4% |

### Animal Distribution

| Animal | Records |
|--------|---------|
| Cow | 11,254 |
| Buffalo | 11,238 |
| Sheep | 10,658 |
| Goat | 10,628 |

### 24 Possible Symptom Values

```
blisters on gums    | blisters on hooves  | blisters on mouth    | blisters on tongue
chest discomfort    | chills              | crackling sound      | depression
difficulty walking  | fatigue             | lameness             | loss of appetite
painless lumps      | shortness of breath | sores on gums        | sores on hooves
sores on mouth      | sores on tongue     | sweats               | swelling in abdomen
swelling in extremities | swelling in limb | swelling in muscle  | swelling in neck
```

---

## 🧪 Training Notebook — `LiveStock.ipynb`

### Preprocessing Pipeline (Cell 10)
1. **Animal** → `pd.get_dummies` (one-hot encode: 4 columns)
2. **Symptoms 1/2/3** → Binary multi-hot encoding (24 binary columns, one per symptom)
3. **Age + Temperature** → `StandardScaler` normalization
4. **Disease** → `LabelEncoder` → 0–4 integer labels

**Final feature vector size: 4 + 24 + 2 = 30 features**

### Models Trained & Compared

| Model | Description |
|-------|-------------|
| Random Forest | `n_estimators=100`, `random_state=42` |
| XGBoost | `n_estimators=200`, `lr=0.1`, `max_depth=5` |
| **MLP (Keras)** ← Saved | `Dense(128→64→5)`, Dropout 0.3/0.2, Adam, 30 epochs |

### MLP Architecture
```
Input (30 features)
  → Dense(128, relu) → Dropout(0.3)
  → Dense(64, relu)  → Dropout(0.2)
  → Dense(5, softmax)
```
Loss: `categorical_crossentropy` | Optimizer: `Adam` | Batch: `64`

---

## 🤖 Saved Artefacts

### `livestock_disease_mlp.h5`
- **Format:** Keras HDF5 saved model (TensorFlow 2.x)
- **Input shape:** `(None, 30)` — 30 preprocessed features
- **Output:** Softmax probabilities for 5 disease classes

### `label_encoder.pkl`
- **Format:** Scikit-learn `LabelEncoder` (pickled)
- **Classes (in encoded order):**
  ```
  0 = anthrax
  1 = blackleg
  2 = foot and mouth
  3 = lumpy virus
  4 = pneumonia
  ```
- ⚠️ **Version Warning:** Saved with sklearn `1.2.2`, current environment has `1.4.0`.
  Use with `warnings.filterwarnings("ignore")` or re-pickle with current version.

---

## 🚀 How to Use the Trained Model (Inference)

```python
import numpy as np
import pickle
import warnings
import tensorflow as tf

# 1. Load artefacts
model = tf.keras.models.load_model("Live_Stock_Disease/livestock_disease_mlp.h5")

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    with open("Live_Stock_Disease/label_encoder.pkl", "rb") as f:
        le = pickle.load(f)

# 2. Build input feature vector (same 30-feature format as training)
#    Order: Animal_buffalo, Animal_cow, Animal_goat, Animal_sheep,
#           Age (scaled), Temperature (scaled),
#           24 symptom binary flags (alphabetically sorted)

ALL_SYMPTOMS = sorted([
    'blisters on gums', 'blisters on hooves', 'blisters on mouth', 'blisters on tongue',
    'chest discomfort', 'chills', 'crackling sound', 'depression',
    'difficulty walking', 'fatigue', 'lameness', 'loss of appetite',
    'painless lumps', 'shortness of breath', 'sores on gums', 'sores on hooves',
    'sores on mouth', 'sores on tongue', 'sweats', 'swelling in abdomen',
    'swelling in extremities', 'swelling in limb', 'swelling in muscle', 'swelling in neck'
])

from sklearn.preprocessing import StandardScaler
import pandas as pd

def predict_disease(animal, age, temperature, symptom1, symptom2, symptom3):
    # Animal one-hot
    animals = ['buffalo', 'cow', 'goat', 'sheep']
    animal_vec = [1 if a == animal.lower() else 0 for a in animals]

    # Numeric scaling (refit or load saved scaler)
    # NOTE: ideally save and reload StandardScaler as well
    age_scaled = (age - 8.0) / 4.3       # approx. from dataset stats
    temp_scaled = (temperature - 102.5) / 1.4

    # Symptom multi-hot
    given = {symptom1.lower(), symptom2.lower(), symptom3.lower()}
    symptom_vec = [1 if s in given else 0 for s in ALL_SYMPTOMS]

    # Final feature vector
    features = np.array(animal_vec + [age_scaled, temp_scaled] + symptom_vec).reshape(1, -1)

    # Predict
    probs = model.predict(features)[0]
    pred_class = np.argmax(probs)
    disease = le.inverse_transform([pred_class])[0]
    confidence = round(float(probs[pred_class]) * 100, 2)

    return {
        "predicted_disease": disease,
        "confidence_pct": confidence,
        "all_probabilities": {le.inverse_transform([i])[0]: round(float(p)*100, 2)
                              for i, p in enumerate(probs)}
    }

# Example
result = predict_disease(
    animal="cow", age=5, temperature=104.0,
    symptom1="painless lumps", symptom2="depression", symptom3="loss of appetite"
)
print(result)
# {'predicted_disease': 'lumpy virus', 'confidence_pct': 98.7, ...}
```

---

## ⚠️ Compatibility & Communication Analysis with Other Folders

### Project Structure Overview

```
SIH/
├── Disease/                     ← CROP disease detection (EfficientNet-B4 vision model)
│   ├── Data.py                  ← CROP disease knowledge base + LLM dataset generator
│   ├── class_name.json          ← 38 PlantVillage class labels (crop diseases)
│   ├── efficientnet_b4_best.pt  ← Vision model for leaf image classification
│   └── disease_knowledge_base/  ← 38 pre-computed advisory JSONs (one per crop disease)
│
├── Live_Stock_Disease/          ← LIVESTOCK disease detection (MLP on tabular symptoms)
│   ├── animal_disease_dataset.csv  ← Training data
│   ├── livestock_disease_mlp.h5    ← Trained Keras MLP
│   └── label_encoder.pkl           ← Sklearn LabelEncoder
│
└── Dataset/                     ← Shared AgriTech advisory data layer
    ├── crop_recommendation.py   ← Crop suitability engine (14 crops)
    ├── crop_activity_weather.py ← Farm task + weather advisory engine
    └── livestock.py             ← Livestock disease KB + vaccination tracker
```

### Compatibility Issues Found

| # | Issue | Severity | Description |
|---|-------|----------|-------------|
| 1 | **Disease name mismatch** | 🔴 HIGH | `Live_Stock_Disease` model outputs: `anthrax`, `blackleg`, `foot and mouth`, `lumpy virus`, `pneumonia`. `Dataset/livestock.py` uses: `Anthrax`, `Blackleg (Black Quarter)`, `Foot & Mouth Disease (FMD)`, `Lumpy Skin Disease (LSD)`, `Pneumonia / Respiratory Complex`. These must be mapped before the two can communicate. |
| 2 | **Animal name casing** | 🟡 MEDIUM | CSV/model uses lowercase `cow`, `buffalo`, `sheep`, `goat`. `Dataset/livestock.py` uses `Cow`, `Buffalo`, `Sheep`, `Goat`. A simple `.title()` call fixes this. |
| 3 | **StandardScaler not saved** | 🟡 MEDIUM | The notebook scales `Age` and `Temperature` using `StandardScaler.fit_transform()` but only saves the model and `LabelEncoder` — not the scaler. At inference time, you need the exact same scale parameters (mean, std). |
| 4 | **sklearn version gap** | 🟡 MEDIUM | `label_encoder.pkl` was pickled with sklearn `1.2.2` but current env has `1.4.0`. Produces `InconsistentVersionWarning`. Re-pickle the encoder to fix. |
| 5 | **No bridge between models** | 🟠 MEDIUM | There is currently no integration code that: (a) takes MLP output → (b) looks up advisory in `Dataset/livestock.py`. These two modules work independently and need a connector. |
| 6 | **Crop vs Livestock isolation** | 🟢 LOW | `Disease/` (crop) and `Live_Stock_Disease/` (livestock) are completely separate models and domains — this is correct by design and not a problem. |
| 7 | **`Dataset/livestock.py` is richer** | 🟢 INFO | The hardcoded Dataset has 6–8 diseases per animal with full clinical detail (vaccination, prevention, advisory). The MLP only classifies 5 diseases. They complement each other — MLP predicts → Dataset provides advisory. |

### Recommended Communication Bridge (Idea Only)

```
                ┌─────────────────────────────────┐
                │  Farmer inputs symptoms          │
                │  (animal, age, temp, 3 symptoms) │
                └──────────────┬──────────────────┘
                               │
                               ▼
                ┌─────────────────────────────────┐
                │  MLP Model (livestock_disease_   │
                │  mlp.h5 + label_encoder.pkl)     │
                │  Output: "lumpy virus" (98.7%)   │
                └──────────────┬──────────────────┘
                               │
                      NAME MAPPING LAYER
                   "lumpy virus" → "Lumpy Skin Disease (LSD)"
                               │
                               ▼
                ┌─────────────────────────────────┐
                │  Dataset/livestock.py            │
                │  LivestockRecordManager          │
                │  .match_symptoms() or direct     │
                │  LIVESTOCK_DISEASE_DB lookup     │
                │  → Full advisory, vaccination,   │
                │    prevention & first-aid        │
                └─────────────────────────────────┘
```

### Required Name Mapping Table

```python
# Bridge: MLP output → Dataset/livestock.py disease key
DISEASE_NAME_MAP = {
    "anthrax":       "Anthrax",
    "blackleg":      "Blackleg (Black Quarter)",
    "foot and mouth":"Foot & Mouth Disease (FMD)",
    "lumpy virus":   "Lumpy Skin Disease (LSD)",
    "pneumonia":     "Pneumonia / Respiratory Complex",
}
ANIMAL_NAME_MAP = {
    "cow":     "Cow",
    "buffalo": "Buffalo",
    "sheep":   "Sheep",
    "goat":    "Goat",
}
```
