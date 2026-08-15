"""
=============================================================================
SIH AgriTech — Unified Pipeline Bridge
=============================================================================
Connects all 4 modules so they communicate with a single clean API:

  Module A │ Disease/          — EfficientNet-B4 plant disease vision model
  Module B │ Live_Stock_Disease/ — Keras MLP livestock disease classifier
  Module C │ Disease/disease_knowledge_base/ — 38 per-disease advisory JSONs
  Module D │ Dataset/          — Crop recommendation + activity + livestock KB

Usage:
    from pipeline import AgriPipeline
    ap = AgriPipeline()

    # 1. Plant leaf image → diagnosis + advisory
    result = ap.diagnose_plant(image_path="leaf.jpg", region="...", season="...")

    # 2. Livestock symptoms → diagnosis + advisory + vaccination status
    result = ap.diagnose_livestock(
        animal="cow", age=5, temperature=104.0,
        symptoms=["painless lumps", "depression"],
        region="...", vaccination_history=[...]
    )

    # 3. Farm details → top-3 crop recommendations
    result = ap.recommend_crops(soil_type="Loamy", season="Winter", ...)

    # 4. Crop growth task + weather advisory
    result = ap.get_crop_activity(crop="Tomato", das=60, weather="rain")
=============================================================================
"""

from __future__ import annotations
import json
import pickle
import sys
import warnings
import numpy as np
from pathlib import Path
from typing import Any, Optional

# ── Resolve project root (works when run from anywhere) ──────────────────────
ROOT = Path(__file__).resolve().parent
DISEASE_DIR  = ROOT / "Disease"
LIVESTOCK_DIR = ROOT / "Live_Stock_Disease"
DATASET_DIR  = ROOT / "Dataset"

# Add Dataset to sys.path so its modules import cleanly
if str(DATASET_DIR) not in sys.path:
    sys.path.insert(0, str(DATASET_DIR))

from crop_recommendation   import CropRecommendationEngine
from crop_activity_weather import CropActivityWeatherEngine
from livestock             import LivestockRecordManager, LIVESTOCK_DISEASE_DB

# =============================================================================
# BRIDGE MAPS — the 3 critical name translators
# =============================================================================

# Bridge 1: MLP output (lowercase short) → Dataset/livestock.py KB key
LIVESTOCK_DISEASE_BRIDGE: dict[str, str] = {
    "anthrax":        "Anthrax",
    "blackleg":       "Blackleg (Black Quarter)",
    "foot and mouth": "Foot & Mouth Disease (FMD)",
    "lumpy virus":    "Lumpy Skin Disease (LSD)",
    "pneumonia":      "Pneumonia / Respiratory Complex",
}

# Bridge 2: PlantVillage raw folder format → clean display crop name
_SPECIAL_CROP_MAP: dict[str, str] = {
    "Corn_(maize)":         "Corn",
    "Pepper,_bell":         "Bell Pepper",
    "Cherry_(including_sour)": "Cherry",
}

def extract_crop_name(plantvillage_label: str) -> str:
    """
    'Tomato___Late_blight'          → 'Tomato'
    'Corn_(maize)___Common_rust_'  → 'Corn'
    'Pepper,_bell___Bacterial_spot' → 'Bell Pepper'
    """
    raw_crop = plantvillage_label.split("___")[0]
    return _SPECIAL_CROP_MAP.get(raw_crop, raw_crop.replace("_", " "))

def extract_disease_name(plantvillage_label: str) -> str:
    """
    'Tomato___Late_blight' → 'Late blight'
    """
    parts = plantvillage_label.split("___")
    return parts[1].replace("_", " ").strip() if len(parts) > 1 else "Unknown"

# Bridge 3: Animal name casing — MLP uses lowercase, Dataset uses Title Case
def normalise_animal(animal: str) -> str:
    return animal.strip().lower()  # for MLP input
def display_animal(animal: str) -> str:
    return animal.strip().title()  # for Dataset KB lookup

# =============================================================================
# SYMPTOM CONSTANTS (must match training data exactly)
# =============================================================================
ALL_SYMPTOMS = sorted([
    "blisters on gums", "blisters on hooves", "blisters on mouth", "blisters on tongue",
    "chest discomfort", "chills", "crackling sound", "depression",
    "difficulty walking", "fatigue", "lameness", "loss of appetite",
    "painless lumps", "shortness of breath", "sores on gums", "sores on hooves",
    "sores on mouth", "sores on tongue", "sweats", "swelling in abdomen",
    "swelling in extremities", "swelling in limb", "swelling in muscle", "swelling in neck",
])

ALL_ANIMALS = ["buffalo", "cow", "goat", "sheep"]

# =============================================================================
# LAZY LOADERS — models are loaded only on first call to keep startup fast
# =============================================================================
_mlp_model      = None
_label_encoder  = None
_scaler         = None
_vision_model   = None
_class_map      = None

_mlp_weights   = None

def _load_livestock_models():
    global _mlp_model, _mlp_weights, _label_encoder, _scaler, _TF_AVAILABLE
    if _label_encoder is None:
        with open(LIVESTOCK_DIR / "label_encoder.pkl", "rb") as f:
            _label_encoder = pickle.load(f)
    if _scaler is None:
        with open(LIVESTOCK_DIR / "scaler.pkl", "rb") as f:
            _scaler = pickle.load(f)
    if _mlp_weights is None:
        try:
            import h5py
            with h5py.File(LIVESTOCK_DIR / "livestock_disease_mlp.h5", "r") as f:
                _mlp_weights = {
                    "W1": f['model_weights/dense/sequential/dense/kernel'][:],
                    "b1": f['model_weights/dense/sequential/dense/bias'][:],
                    "W2": f['model_weights/dense_1/sequential/dense_1/kernel'][:],
                    "b2": f['model_weights/dense_1/sequential/dense_1/bias'][:],
                    "W3": f['model_weights/dense_2/sequential/dense_2/kernel'][:],
                    "b3": f['model_weights/dense_2/sequential/dense_2/bias'][:],
                }
        except Exception:
            _mlp_weights = None

def _load_vision_model():
    global _vision_model, _class_map
    if _vision_model is None:
        import torch
        import torch.nn as nn
        import timm

        with open(DISEASE_DIR / "class_name.json", encoding="utf-8") as f:
            _class_map = json.load(f)

        class PlantDiseaseClassifier(nn.Module):
            def __init__(self, num_classes=38):
                super().__init__()
                self.backbone = timm.create_model(
                    "efficientnet_b4", pretrained=False, num_classes=0
                )
                self.classifier = nn.Sequential(
                    nn.Dropout(p=0.3),
                    nn.Linear(1792, num_classes),
                )
            def forward(self, x):
                return self.classifier(self.backbone(x))

        device = "cuda" if __import__("torch").cuda.is_available() else "cpu"
        model = PlantDiseaseClassifier(num_classes=38)
        ckpt = __import__("torch").load(
            str(DISEASE_DIR / "efficientnet_b4_best.pt"), map_location=device
        )
        model.load_state_dict(ckpt["state_dict"])
        model.to(device)
        model.eval()
        _vision_model = (model, device)

# =============================================================================
# MAIN PIPELINE CLASS
# =============================================================================
class AgriPipeline:
    """
    Unified bridge connecting all 4 modules.
    Instantiate once and call any of the 4 public methods.
    """

    def __init__(self):
        self._crop_engine    = CropRecommendationEngine()
        self._activity_engine = CropActivityWeatherEngine()
        self._livestock_kb   = LivestockRecordManager()

    # ──────────────────────────────────────────────────────────────────────────
    # 1. PLANT DISEASE DIAGNOSIS
    # ──────────────────────────────────────────────────────────────────────────
    def diagnose_plant(
        self,
        image_path: str,
        region: str = "West India (Gujarat)",
        season: str  = "Kharif (Monsoon, Jun–Oct)",
        severity: str = "Moderate (30–60% infection)",
        farmer_type: str = "Small-scale subsistence farmer",
    ) -> dict[str, Any]:
        """
        Leaf image → EfficientNet-B4 prediction → advisory JSON lookup.
        Returns merged result: prediction + full treatment advisory.
        """
        from torchvision import transforms
        from PIL import Image

        _load_vision_model()
        model, device = _vision_model

        # Step 1: vision inference
        transform = transforms.Compose([
            transforms.Resize((380, 380)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])
        img = Image.open(image_path).convert("RGB")
        tensor = transform(img).unsqueeze(0).to(device)
        import torch
        with torch.no_grad():
            probs = torch.softmax(model(tensor), dim=1)
            conf, idx = torch.max(probs, dim=1)

        raw_class  = _class_map[str(idx.item())]
        confidence = round(conf.item() * 100, 2)
        crop_name  = extract_crop_name(raw_class)
        is_healthy = "healthy" in raw_class.lower()

        # Step 2: advisory JSON lookup
        advisory = self._load_plant_advisory(raw_class, region, season, severity, farmer_type)

        return {
            "source": "EfficientNet-B4 Vision Model",
            "prediction": {
                "raw_class":      raw_class,
                "display_name":   raw_class.replace("___", " — ").replace("_", " "),
                "crop":           crop_name,
                "is_healthy":     is_healthy,
                "confidence_pct": confidence,
                "model_epoch":    38,
                "model_val_acc":  99.78,
            },
            "advisory": advisory,
        }

    def _load_plant_advisory(
        self, raw_class: str, region: str, season: str,
        severity: str, farmer_type: str
    ) -> dict[str, Any]:
        """
        Looks up the pre-built advisory JSON from disease_knowledge_base/.
        Key format: "{region}|{season}|{severity}|{farmer_type}"
        """
        from Disease.Data import normalise_disease  # noqa: E402
        canonical = normalise_disease(raw_class)
        safe_name = (
            canonical.replace("(", "").replace(")", "").replace(" ", "_") + ".json"
        )
        json_path = DISEASE_DIR / "disease_knowledge_base" / safe_name

        if not json_path.exists():
            return {"status": "Advisory file not found for this disease class."}

        with open(json_path, encoding="utf-8") as f:
            data = json.load(f)

        lookup_key = f"{region}|{season}|{severity}|{farmer_type}"
        advisory = data.get("fast_lookup", {}).get(lookup_key)

        if advisory is None:
            # Fallback: return base info if exact combo not found
            return {
                "status": "Exact combination not pre-computed; returning base advisory.",
                "base_info": data.get("base_info", {}),
            }
        return advisory

    # ──────────────────────────────────────────────────────────────────────────
    # 2. LIVESTOCK DISEASE DIAGNOSIS
    # ──────────────────────────────────────────────────────────────────────────
    def diagnose_livestock(
        self,
        animal: str,
        age: int,
        temperature: float,
        symptoms: list[str],
        region: str = "",
        vaccination_history: Optional[list[dict]] = None,
        confidence_threshold: float = 60.0,
    ) -> dict[str, Any]:
        """
        Animal symptoms → MLP prediction (if ≥3 symptoms) or KB match fallback
        → full advisory from Dataset/livestock.py KB.

        Handles 1, 2, or 3 symptoms gracefully.
        """
        # Pad symptoms to 3 (repeat last one — safe for multi-hot encoding)
        padded = (symptoms + [symptoms[-1]] * 3)[:3] if symptoms else ["loss of appetite"] * 3

        # Determine which source to use
        _load_livestock_models()
        use_mlp = len(symptoms) >= 1 and (_mlp_weights is not None or _mlp_model is not None)

        if use_mlp:
            mlp_result = self._run_livestock_mlp(animal, age, temperature, padded)
            if mlp_result["confidence_pct"] >= confidence_threshold:
                predicted_raw = mlp_result["predicted_disease_raw"]
                source = "MLP Neural Network"
            else:
                # Low confidence → fall back to KB
                use_mlp = False
                source = "Knowledge Base (MLP confidence too low)"

        if not use_mlp:
            # KB symptom matching — try exact, then word-by-word partial
            kb_matches = self._livestock_kb.match_symptoms(display_animal(animal), symptoms)

            if not kb_matches:
                # Expand: break each symptom into individual words and retry
                word_tokens = []
                for s in symptoms:
                    word_tokens.extend(s.lower().split())
                kb_matches = self._livestock_kb.match_symptoms(display_animal(animal), word_tokens)

            if kb_matches:
                predicted_raw = next(
                    (k for k, v in LIVESTOCK_DISEASE_BRIDGE.items()
                     if v == kb_matches[0]["disease"]), kb_matches[0]["disease"]
                )
                mlp_result = {
                    "predicted_disease_raw": predicted_raw,
                    "confidence_pct": kb_matches[0]["confidence_pct"],
                    "all_probabilities": {},
                }
                source = "Knowledge Base (symptom keyword match)"
            else:
                # Final fallback: flag as inconclusive but return structured response
                predicted_raw = "pneumonia"   # Most common default
                mlp_result = {
                    "predicted_disease_raw": predicted_raw,
                    "confidence_pct": 0.0,
                    "all_probabilities": {},
                }
                source = "Insufficient data — provide more symptoms for accurate diagnosis"

        # Bridge: MLP name → Dataset KB name
        predicted_raw    = mlp_result["predicted_disease_raw"]
        kb_disease_name  = LIVESTOCK_DISEASE_BRIDGE.get(predicted_raw, predicted_raw.title())
        kb_animal        = display_animal(animal)

        # Fetch advisory from Dataset KB
        advisory = self._fetch_livestock_advisory(kb_animal, kb_disease_name)

        # Vaccination status check if history provided
        vaccine_status = None
        if vaccination_history is not None:
            vaccine_status = self._livestock_kb.evaluate_animal_record(
                animal_id="query_animal",
                animal_type=kb_animal,
                tag_number="N/A",
                age_months=age * 12,
                vaccination_history=vaccination_history,
            )

        return {
            "source":             source,
            "symptoms_provided":  symptoms,
            "symptoms_used":      padded,
            "prediction": {
                "disease_display":   kb_disease_name,
                "disease_model_key": predicted_raw,
                "confidence_pct":    mlp_result["confidence_pct"],
                "all_probabilities": mlp_result.get("all_probabilities", {}),
            },
            "advisory":           advisory,
            "vaccination_status": vaccine_status,
        }

    def _run_livestock_mlp(
        self, animal: str, age: int, temperature: float, symptoms: list[str]
    ) -> dict:
        """Builds feature vector and runs MLP inference."""
        # Animal one-hot
        a_vec = [1 if a == normalise_animal(animal) else 0 for a in ALL_ANIMALS]

        # Scale age + temperature using saved scaler
        scaled = _scaler.transform([[age, temperature]])[0]
        age_s, temp_s = scaled[0], scaled[1]

        # Symptom multi-hot
        given = {s.lower().strip() for s in symptoms}
        sym_vec = [1 if s in given else 0 for s in ALL_SYMPTOMS]

        # Feature vector: [Age, Temp, Buffalo, Cow, Goat, Sheep, 24 symptoms] (30 features matching training data)
        features = np.array([[age_s, temp_s] + a_vec + sym_vec], dtype=np.float32)

        if _mlp_weights is not None:
            def relu(x): return np.maximum(0, x)
            def softmax(x):
                e = np.exp(x - np.max(x, axis=-1, keepdims=True))
                return e / np.sum(e, axis=-1, keepdims=True)
            h1 = relu(np.dot(features, _mlp_weights["W1"]) + _mlp_weights["b1"])
            h2 = relu(np.dot(h1, _mlp_weights["W2"]) + _mlp_weights["b2"])
            probs = softmax(np.dot(h2, _mlp_weights["W3"]) + _mlp_weights["b3"])[0]
        elif _mlp_model is not None:
            probs = _mlp_model.predict(features, verbose=0)[0]
        else:
            raise RuntimeError("MLP weights or model not loaded")

        pred_idx = int(np.argmax(probs))
        disease  = _label_encoder.inverse_transform([pred_idx])[0]

        return {
            "predicted_disease_raw": disease,
            "confidence_pct":        round(float(probs[pred_idx]) * 100, 2),
            "all_probabilities": {
                _label_encoder.inverse_transform([i])[0]: round(float(p) * 100, 2)
                for i, p in enumerate(probs)
            },
        }

    def _fetch_livestock_advisory(self, animal: str, disease: str) -> dict:
        """Pull clinical advisory from Dataset/livestock.py KB."""
        record = next(
            (r for r in LIVESTOCK_DISEASE_DB
             if r["animal"].lower() == animal.lower()
             and r["disease"].lower() == disease.lower()),
            None,
        )
        if not record:
            return {"status": f"No advisory found for {animal} – {disease} in knowledge base."}
        return {
            "symptoms_checklist": record["symptoms"],
            "vaccination_required": record["vaccination_required"],
            "vaccination_schedule": record["vaccination_due_rule"],
            "prevention": record["prevention"],
            "first_aid_advisory": record["advisory"],
            "zoonotic_risk": record.get("zoonotic_risk", "Not specified"),
        }

    # ──────────────────────────────────────────────────────────────────────────
    # 3. CROP RECOMMENDATION
    # ──────────────────────────────────────────────────────────────────────────
    def recommend_crops(
        self,
        soil_type: str,
        farm_area_ha: float | None = None,
        season: str = "Winter",
        temperature_c: float = 25.0,
        rainfall_mm: float = 450.0,
        water_availability: str = "Medium",
        region: str = "",
        top_k: int = 3,
        **kwargs
    ) -> dict[str, Any]:
        """
        Farm details + weather → Top-k crop recommendations with scores & reasons.
        Wraps Dataset/crop_recommendation.py CropRecommendationEngine.
        Supports keyword aliases (water_avail, farm_area).
        """
        area = farm_area_ha or kwargs.get("farm_area") or 5.0
        water = water_availability if water_availability != "Medium" or "water_avail" not in kwargs else kwargs["water_avail"]
        result = self._crop_engine.recommend(
            soil_type=soil_type,
            farm_area_ha=area,
            season=season,
            temperature_c=temperature_c,
            rainfall_mm=rainfall_mm,
            water_availability=water,
            region=region,
            top_k=top_k,
        )
        result["source"] = "CropRecommendationEngine (Dataset/crop_recommendation.py)"
        return result

    # ──────────────────────────────────────────────────────────────────────────
    # 4. CROP ACTIVITY & WEATHER ADVISORY
    # ──────────────────────────────────────────────────────────────────────────
    def get_crop_activity(
        self,
        crop: str,
        days_after_sowing: int,
        weather: str = "normal",
    ) -> dict[str, Any]:
        """
        Crop + DAS + weather condition → full farm task + weather override advisory.
        Wraps Dataset/crop_activity_weather.py CropActivityWeatherEngine.
        """
        result = self._activity_engine.full_advisory(crop, days_after_sowing, weather)
        result["source"] = "CropActivityWeatherEngine (Dataset/crop_activity_weather.py)"
        return result

    # ──────────────────────────────────────────────────────────────────────────
    # 5. VACCINATION DUE-DATE CHECKER (standalone helper)
    # ──────────────────────────────────────────────────────────────────────────
    def check_vaccination(
        self,
        animal_id: str,
        animal_type: str,
        tag_number: str,
        age_months: int,
        vaccination_history: list[dict],
    ) -> dict[str, Any]:
        """
        Returns vaccination status + urgent alerts for an individual animal.
        """
        result = self._livestock_kb.evaluate_animal_record(
            animal_id=animal_id,
            animal_type=display_animal(animal_type),
            tag_number=tag_number,
            age_months=age_months,
            vaccination_history=vaccination_history,
        )
        result["source"] = "LivestockRecordManager (Dataset/livestock.py)"
        return result
