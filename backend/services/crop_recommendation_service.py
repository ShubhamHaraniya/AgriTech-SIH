"""
Service layer that wraps the existing CropRecommendationEngine.
Never duplicates the recommendation logic — only calls it.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
for p in (str(ROOT / "Dataset"), str(ROOT)):
    if p not in sys.path:
        sys.path.insert(0, p)

from crop_recommendation import CropRecommendationEngine   # existing engine

_engine = CropRecommendationEngine()


def recommend(
    soil_type: str,
    season: str,
    temperature_c: float,
    rainfall_mm: float,
    water_avail: str,
    region: str,
    farm_area: float | None = None,
) -> dict:
    """
    Call the existing engine and return top-3 crops + conditions dict.
    Engine returns:  { "top_recommendations": [...], "all_scores": [...], ... }
    Each crop dict has keys: crop, match_score, grade, crop_duration, water_requirement,
                              profit_potential, key_advantages, key_constraints, reasons
    """
    raw = _engine.recommend(
        soil_type=soil_type,
        farm_area_ha=farm_area or 5.0,
        season=season,
        temperature_c=temperature_c,
        rainfall_mm=rainfall_mm,
        water_availability=water_avail,
        region=region,
        top_k=3,
    )

    top_raw = raw.get("top_recommendations", [])

    # Normalise to API-friendly shape
    top_crops = []
    for c in top_raw:
        top_crops.append({
            "crop":              c.get("crop", ""),
            "score":             c.get("match_score", 0),
            "grade":             c.get("grade", ""),
            "crop_duration":     c.get("crop_duration", ""),
            "water_requirement": c.get("water_requirement", ""),
            "profit_potential":  c.get("profit_potential", ""),
            "season":            season,
            "reasons":           [r for r in c.get("reasons", []) if r],
        })

    return {
        "top_crops":       top_crops,
        "regional_note":   raw.get("regional_note", ""),
        "crops_evaluated": raw.get("total_crops_evaluated", 0),
        "conditions_used": {
            "soil_type": soil_type, "season": season,
            "temperature_c": temperature_c, "rainfall_mm": rainfall_mm,
            "water_avail": water_avail, "region": region, "farm_area": farm_area,
        },
    }
