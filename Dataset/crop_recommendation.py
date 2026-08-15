"""
=============================================================================
DATASET 1: CROP RECOMMENDATION
=============================================================================
Seed data for 14 PlantVillage crops.
Each crop has full agronomic profile.
The CropRecommendationEngine scores all 14 crops against farmer inputs and
returns the Top-3 with per-factor breakdown reasons.

Dimensions covered:
  Crops     : 14
  Soil types: 6  (Loamy, Sandy Loam, Clay Loam, Black Soil, Alluvial, Red Loam)
  Seasons   : 3  (Summer / Winter / Monsoon)
  Regions   : 15 Indian states (used for region-specific notes)
  Severities: N/A  (advisory, not disease)
"""

from __future__ import annotations
from typing import Any

# ─────────────────────────────────────────────────────────────────────────────
# CONTEXTUAL CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────
ALL_SOIL_TYPES = [
    "Loamy",
    "Sandy Loam",
    "Clay Loam",
    "Black Soil",
    "Alluvial",
    "Red Loam",
]

ALL_SEASONS = ["Summer", "Winter", "Monsoon"]

ALL_WATER_LEVELS = ["Low", "Medium", "High"]

ALL_REGIONS = [
    "North India (Punjab/Haryana)",
    "North India (Uttar Pradesh)",
    "North India (Himachal Pradesh)",
    "South India (Karnataka)",
    "South India (Tamil Nadu)",
    "South India (Andhra Pradesh)",
    "East India (West Bengal)",
    "East India (Odisha)",
    "East India (Bihar)",
    "West India (Maharashtra/Vidarbha)",
    "West India (Gujarat)",
    "West India (Rajasthan)",
    "Central India (Madhya Pradesh)",
    "Central India (Chhattisgarh)",
    "North-East India (Assam/Meghalaya)",
]

REGIONAL_NOTES: dict[str, str] = {
    "North India (Punjab/Haryana)":       "Hot dry summers; wheat-rice dominant; high groundwater; prefer drip irrigation.",
    "North India (Uttar Pradesh)":        "Semi-arid plains; high sugarcane & wheat acreage; dust formulations preferred.",
    "North India (Himachal Pradesh)":     "Cool temperate hills; high humidity; dense canopy management critical for orchards.",
    "South India (Karnataka)":            "Bimodal rainfall; high year-round humidity; increase spray frequency 30%.",
    "South India (Tamil Nadu)":           "Tropical; high temps & monsoon irrigation; bacterial diseases peak in rainy season.",
    "South India (Andhra Pradesh)":       "Coastal humid; chilli/rice dominant; viral diseases via whitefly vectors common.",
    "East India (West Bengal)":           "High rainfall; blight-prone Jul–Sep; prophylactic copper sprays critical.",
    "East India (Odisha)":                "Tribal farming; emphasis on IPM and locally sourced botanicals.",
    "East India (Bihar)":                 "Flood-prone Gangetic plains; post-flood disease build-up; drainage critical.",
    "West India (Maharashtra/Vidarbha)":  "Cotton/soybean dominant; dry Vidarbha; disease stress during patchy monsoon.",
    "West India (Gujarat)":               "Semi-arid; groundnut/cotton; drip irrigation reduces foliar disease pressure.",
    "West India (Rajasthan)":             "Arid; reduced fungal pressure but severe viral and spider-mite problems.",
    "Central India (Madhya Pradesh)":     "Black cotton soil; soybean/wheat; post-monsoon disease build-up common.",
    "Central India (Chhattisgarh)":       "Tribal/small-scale; rice dominant; blast and brown spot management critical.",
    "North-East India (Assam/Meghalaya)": "High rainfall >2000 mm/yr; extreme fungal pressure; systemic fungicide essential.",
}

# ─────────────────────────────────────────────────────────────────────────────
# 14-CROP AGRONOMIC PROFILE DATABASE
# Each entry fully describes one crop's soil, seasonal, climate requirements.
# ─────────────────────────────────────────────────────────────────────────────
CROP_PROFILES: list[dict[str, Any]] = [
    # ── 1. TOMATO ────────────────────────────────────────────────────────────
    {
        "crop": "Tomato",
        "suitable_soils": ["Loamy", "Sandy Loam", "Clay Loam", "Black Soil"],
        "ideal_ph": {"min": 6.0, "max": 7.0},
        "seasons": ["Summer", "Winter", "Monsoon"],
        "temperature_c": {"min": 18, "max": 30, "optimal": 24},
        "rainfall_mm": {"min": 600, "max": 1200, "optimal": 800},
        "water_requirement": "Medium",
        "crop_duration_days": "90–120",
        "farm_scale": "All scales (0.1–100+ ha)",
        "profit_potential": "High",
        "key_advantages": [
            "Short growing cycle allows 2–3 crops per year",
            "High market demand nationwide; perishable so locally valued",
            "Excellent for drip fertigation systems",
        ],
        "key_constraints": [
            "Highly susceptible to Late Blight in high-humidity Monsoon",
            "Blossom drop at >32°C daytime temperature",
            "Requires staking & canopy management labour",
        ],
    },
    # ── 2. POTATO ────────────────────────────────────────────────────────────
    {
        "crop": "Potato",
        "suitable_soils": ["Sandy Loam", "Loamy", "Alluvial"],
        "ideal_ph": {"min": 5.2, "max": 6.5},
        "seasons": ["Winter"],
        "temperature_c": {"min": 14, "max": 24, "optimal": 18},
        "rainfall_mm": {"min": 400, "max": 800, "optimal": 500},
        "water_requirement": "Medium",
        "crop_duration_days": "90–110",
        "farm_scale": "Medium–large (0.5–50+ ha)",
        "profit_potential": "High",
        "key_advantages": [
            "Highest yield per acre among vegetable crops",
            "Staple crop with strong cold-storage demand",
            "Excellent for North Indian plains during Rabi season",
        ],
        "key_constraints": [
            "Tuberisation stops above 28°C – unsuitable for Summer",
            "Sensitive to waterlogging; needs well-drained ridges",
            "Heavy input cost (seed, fertilizer, water)",
        ],
    },
    # ── 3. CORN (MAIZE) ──────────────────────────────────────────────────────
    {
        "crop": "Corn",
        "suitable_soils": ["Loamy", "Alluvial", "Black Soil", "Sandy Loam"],
        "ideal_ph": {"min": 5.8, "max": 7.5},
        "seasons": ["Monsoon", "Summer"],
        "temperature_c": {"min": 20, "max": 35, "optimal": 28},
        "rainfall_mm": {"min": 500, "max": 1000, "optimal": 750},
        "water_requirement": "Medium",
        "crop_duration_days": "85–110",
        "farm_scale": "All scales (>0.5 ha)",
        "profit_potential": "Medium-High",
        "key_advantages": [
            "Dual-purpose crop: food grain & cattle fodder",
            "Moderate drought tolerance in vegetative stage",
            "Government MSP support ensures stable floor price",
        ],
        "key_constraints": [
            "Sensitive to waterlogging at seedling stage",
            "Fall Armyworm (FAW) is a major recurring pest",
            "Tasseling–silking stage MUST have adequate water",
        ],
    },
    # ── 4. BELL PEPPER ───────────────────────────────────────────────────────
    {
        "crop": "Bell Pepper",
        "suitable_soils": ["Loamy", "Sandy Loam", "Clay Loam"],
        "ideal_ph": {"min": 6.0, "max": 6.8},
        "seasons": ["Winter", "Summer", "Monsoon"],
        "temperature_c": {"min": 18, "max": 28, "optimal": 22},
        "rainfall_mm": {"min": 600, "max": 1000, "optimal": 700},
        "water_requirement": "Medium",
        "crop_duration_days": "100–130",
        "farm_scale": "Open field or polyhouse (0.1–20 ha)",
        "profit_potential": "High",
        "key_advantages": [
            "Premium cash-crop with high per-kg market value",
            "Excellent for protected cultivation / greenhouse",
            "Long continuous bearing period after first fruit set",
        ],
        "key_constraints": [
            "Flower drop and fruit abortion at >32°C",
            "Thrips and mites require diligent scouting",
            "Requires plastic mulch and drip system for best results",
        ],
    },
    # ── 5. SOYBEAN ───────────────────────────────────────────────────────────
    {
        "crop": "Soybean",
        "suitable_soils": ["Black Soil", "Loamy", "Clay Loam", "Alluvial"],
        "ideal_ph": {"min": 6.0, "max": 7.5},
        "seasons": ["Monsoon"],
        "temperature_c": {"min": 22, "max": 34, "optimal": 28},
        "rainfall_mm": {"min": 600, "max": 1000, "optimal": 800},
        "water_requirement": "Medium",
        "crop_duration_days": "90–105",
        "farm_scale": "Broad acre (1–100+ ha)",
        "profit_potential": "Medium-High",
        "key_advantages": [
            "Fixes atmospheric nitrogen – improves soil fertility",
            "Strong oilseed/protein market and export demand",
            "Low labour requirement with mechanised harvesting",
        ],
        "key_constraints": [
            "Requires well-drained soil during germination",
            "Soybean rust and pod borer are recurring threats",
            "Prices volatile linked to international oilseed markets",
        ],
    },
    # ── 6. STRAWBERRY ────────────────────────────────────────────────────────
    {
        "crop": "Strawberry",
        "suitable_soils": ["Sandy Loam", "Loamy", "Alluvial"],
        "ideal_ph": {"min": 5.5, "max": 6.5},
        "seasons": ["Winter"],
        "temperature_c": {"min": 12, "max": 25, "optimal": 18},
        "rainfall_mm": {"min": 300, "max": 700, "optimal": 450},
        "water_requirement": "Medium",
        "crop_duration_days": "120–150",
        "farm_scale": "Small–medium (0.1–5 ha), raised bed mulching",
        "profit_potential": "Very High",
        "key_advantages": [
            "Premium retail price (Rs 100–400/kg depending on season)",
            "High yield per square metre on raised beds",
            "Ideal crop for agro-tourism / direct farm-gate selling",
        ],
        "key_constraints": [
            "Requires plastic mulch, drip fertigation and shade nets",
            "Highly perishable – must reach cold chain within 12 hrs",
            "Botrytis (grey mould) devastates fruit in wet winters",
        ],
    },
    # ── 7. SQUASH ────────────────────────────────────────────────────────────
    {
        "crop": "Squash",
        "suitable_soils": ["Loamy", "Sandy Loam", "Alluvial", "Black Soil"],
        "ideal_ph": {"min": 6.0, "max": 7.0},
        "seasons": ["Summer", "Monsoon"],
        "temperature_c": {"min": 20, "max": 35, "optimal": 26},
        "rainfall_mm": {"min": 400, "max": 800, "optimal": 600},
        "water_requirement": "Low-Medium",
        "crop_duration_days": "50–70",
        "farm_scale": "All scales (0.2–20 ha)",
        "profit_potential": "Medium",
        "key_advantages": [
            "Fastest turnaround (50–60 days from sowing to harvest)",
            "Prolific continuous bearing – 2–3 harvests per flush",
            "Low input cost and high local market availability",
        ],
        "key_constraints": [
            "Powdery mildew devastates crop in high humidity Monsoon",
            "Fruit borers and aphids need routine management",
            "Vine spread requires large spacing (3×2 m minimum)",
        ],
    },
    # ── 8. GRAPE ─────────────────────────────────────────────────────────────
    {
        "crop": "Grape",
        "suitable_soils": ["Sandy Loam", "Loamy", "Red Loam"],
        "ideal_ph": {"min": 6.5, "max": 7.8},
        "seasons": ["Summer", "Winter"],
        "temperature_c": {"min": 15, "max": 36, "optimal": 27},
        "rainfall_mm": {"min": 450, "max": 850, "optimal": 600},
        "water_requirement": "Low-Medium",
        "crop_duration_days": "Perennial (annual harvest cycle)",
        "farm_scale": "Medium–large (0.5–50+ ha)",
        "profit_potential": "Very High",
        "key_advantages": [
            "High export value (table grapes, raisins, wine)",
            "Established value-addition processing industry",
            "Perennial crop with 15–25 year productive life",
        ],
        "key_constraints": [
            "High initial setup cost (trellis, irrigation, pruning)",
            "Downy mildew can destroy entire crop in monsoon",
            "Requires expert pruning knowledge for annual cycle",
        ],
    },
    # ── 9. ORANGE ────────────────────────────────────────────────────────────
    {
        "crop": "Orange",
        "suitable_soils": ["Loamy", "Sandy Loam", "Alluvial", "Red Loam"],
        "ideal_ph": {"min": 6.0, "max": 7.5},
        "seasons": ["Summer", "Winter", "Monsoon"],
        "temperature_c": {"min": 15, "max": 38, "optimal": 28},
        "rainfall_mm": {"min": 750, "max": 1400, "optimal": 900},
        "water_requirement": "Medium-High",
        "crop_duration_days": "Perennial (240 days bloom to harvest)",
        "farm_scale": "Orchard scale (1–100+ ha)",
        "profit_potential": "High",
        "key_advantages": [
            "Long productive tree life (20–30 years)",
            "Steady year-round juice and fresh-fruit market",
            "Nagpur oranges have strong GI-tagged export demand",
        ],
        "key_constraints": [
            "3–4 year gestation before first commercial harvest",
            "Citrus Greening (HLB via psyllid) is an incurable threat",
            "High water requirement in summer dry period",
        ],
    },
    # ── 10. APPLE ────────────────────────────────────────────────────────────
    {
        "crop": "Apple",
        "suitable_soils": ["Loamy", "Clay Loam", "Alluvial"],
        "ideal_ph": {"min": 5.8, "max": 6.8},
        "seasons": ["Winter", "Summer"],
        "temperature_c": {"min": -2, "max": 24, "optimal": 16},
        "rainfall_mm": {"min": 800, "max": 1300, "optimal": 1000},
        "water_requirement": "Medium",
        "crop_duration_days": "Perennial (130–160 days bloom to harvest)",
        "farm_scale": "Hill slopes / orchards (0.5–20+ ha)",
        "profit_potential": "Very High",
        "key_advantages": [
            "Extremely high commercial value per tonne",
            "Excellent cold-storage shelf life (up to 6 months CA)",
            "Strong brand recognition (Himachali / Kashmiri apples)",
        ],
        "key_constraints": [
            "Strict chilling requirement: 800–1200 hrs below 7°C",
            "Only viable in cool temperate hill regions",
            "Apple Scab and Fire Blight require intensive spray programs",
        ],
    },
    # ── 11. PEACH ────────────────────────────────────────────────────────────
    {
        "crop": "Peach",
        "suitable_soils": ["Sandy Loam", "Loamy", "Alluvial"],
        "ideal_ph": {"min": 6.0, "max": 7.0},
        "seasons": ["Winter", "Summer"],
        "temperature_c": {"min": 5, "max": 28, "optimal": 20},
        "rainfall_mm": {"min": 600, "max": 1000, "optimal": 750},
        "water_requirement": "Medium",
        "crop_duration_days": "Perennial (90–120 days post-bloom)",
        "farm_scale": "Sub-temperate/hill (0.5–15 ha)",
        "profit_potential": "High",
        "key_advantages": [
            "Early season stone fruit – enters market before mangoes",
            "Rapid 90–120 day post-bloom cycle allows quick returns",
            "High demand in north Indian hill-station tourist markets",
        ],
        "key_constraints": [
            "Requires 300–600 winter chilling hours (7°C or below)",
            "Brown rot fungus destroys near-harvest fruit rapidly",
            "Intolerant of any waterlogging; needs sloped well-drained land",
        ],
    },
    # ── 12. CHERRY ───────────────────────────────────────────────────────────
    {
        "crop": "Cherry",
        "suitable_soils": ["Sandy Loam", "Loamy", "Alluvial"],
        "ideal_ph": {"min": 6.2, "max": 7.2},
        "seasons": ["Winter", "Summer"],
        "temperature_c": {"min": 2, "max": 25, "optimal": 17},
        "rainfall_mm": {"min": 700, "max": 1100, "optimal": 850},
        "water_requirement": "Medium",
        "crop_duration_days": "Perennial (60–80 days post petal fall)",
        "farm_scale": "Cool temperate regions (0.5–10 ha)",
        "profit_potential": "Very High",
        "key_advantages": [
            "Highest premium fruit price of any Indian stone fruit",
            "Short ripening window creates intense market demand",
            "Kashmiri cherries fetching Rs 400–800/kg at peak",
        ],
        "key_constraints": [
            "Fruit cracking if rainfall occurs near harvest",
            "Very strict chilling requirement; limited geographic zones",
            "Requires cross-pollinator variety in same orchard",
        ],
    },
    # ── 13. BLUEBERRY ────────────────────────────────────────────────────────
    {
        "crop": "Blueberry",
        "suitable_soils": ["Sandy Loam", "Alluvial"],
        "ideal_ph": {"min": 4.5, "max": 5.5},
        "seasons": ["Winter", "Summer"],
        "temperature_c": {"min": 5, "max": 26, "optimal": 19},
        "rainfall_mm": {"min": 650, "max": 1200, "optimal": 900},
        "water_requirement": "Medium-High",
        "crop_duration_days": "Perennial bush (90–120 days ripening)",
        "farm_scale": "Specialised beds (0.1–5 ha)",
        "profit_potential": "Super Premium",
        "key_advantages": [
            "Fastest-growing superfood market demand in India",
            "Exceptionally high price per kg (Rs 600–1200)",
            "Extremely long productive lifespan (20–30 years)",
        ],
        "key_constraints": [
            "Requires strict acidic soil pH 4.5–5.5 (rarely natural in India)",
            "Needs peat moss / sulphur soil amendment – high cost",
            "Limited expertise and planting material availability in India",
        ],
    },
    # ── 14. RASPBERRY ────────────────────────────────────────────────────────
    {
        "crop": "Raspberry",
        "suitable_soils": ["Loamy", "Sandy Loam", "Alluvial"],
        "ideal_ph": {"min": 5.6, "max": 6.5},
        "seasons": ["Summer", "Monsoon"],
        "temperature_c": {"min": 10, "max": 27, "optimal": 20},
        "rainfall_mm": {"min": 700, "max": 1100, "optimal": 850},
        "water_requirement": "Medium",
        "crop_duration_days": "Perennial cane (60–75 days fruiting)",
        "farm_scale": "Trellised rows (0.1–5 ha)",
        "profit_potential": "Very High",
        "key_advantages": [
            "Multiple fruiting flushes per season after establishment",
            "High culinary/bakery and café demand in urban markets",
            "Quick first harvest in year-2 after cane establishment",
        ],
        "key_constraints": [
            "Fragile fruit – requires immediate post-harvest cold chain",
            "Cane trellis infrastructure required upfront",
            "Susceptible to cane blight in waterlogged soils",
        ],
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# RECOMMENDATION ENGINE
# ─────────────────────────────────────────────────────────────────────────────
class CropRecommendationEngine:
    """
    Scores all 14 crops against farmer's inputs and returns top-k results
    with a detailed per-factor breakdown.

    Scoring weights (total = 100 pts):
        Soil compatibility  30 pts
        Season alignment    25 pts
        Temperature range   20 pts
        Rainfall / water    15 pts
        Water availability  10 pts
    """

    def __init__(self, profiles: list[dict] | None = None):
        self.profiles = profiles or CROP_PROFILES

    # ── Internal scorers ────────────────────────────────────────────────────
    def _score_soil(self, crop: dict, soil: str) -> tuple[int, str]:
        match = any(soil.strip() in s for s in crop["suitable_soils"])
        if match:
            return 30, f"'{soil}' is a preferred soil for {crop['crop']}."
        partial = any(
            soil.split()[0].lower() in s.lower() for s in crop["suitable_soils"]
        )
        if partial:
            return 15, f"'{soil}' is acceptable but not optimal (prefers {', '.join(crop['suitable_soils'])})."
        return 5, f"'{soil}' is poorly suited (prefers {', '.join(crop['suitable_soils'])})."

    def _score_season(self, crop: dict, season: str) -> tuple[int, str]:
        if season in crop["seasons"]:
            return 25, f"{season} is a natural growing season for {crop['crop']}."
        return 0, f"{season} is outside natural cycle (grows in {', '.join(crop['seasons'])})."

    def _score_temperature(self, crop: dict, temp: float) -> tuple[int, str]:
        lo, hi, opt = (
            crop["temperature_c"]["min"],
            crop["temperature_c"]["max"],
            crop["temperature_c"]["optimal"],
        )
        if lo <= temp <= hi:
            deviation = abs(temp - opt)
            pts = max(10, 20 - int(deviation * 1.5))
            return pts, f"{temp}°C is within optimal range ({lo}°C–{hi}°C)."
        if temp < lo:
            return 0, f"{temp}°C is too cold (minimum {lo}°C required)."
        return 0, f"{temp}°C is too hot (maximum {hi}°C tolerated)."

    def _score_rainfall(self, crop: dict, rain: float, water: str) -> tuple[int, str]:
        lo, hi = crop["rainfall_mm"]["min"], crop["rainfall_mm"]["max"]
        if lo <= rain <= hi:
            return 15, f"Rainfall {rain} mm fits requirement ({lo}–{hi} mm)."
        if rain < lo and water in ("Medium", "High"):
            return 10, f"Low rainfall {rain} mm offset by farm irrigation ({water} availability)."
        if rain > hi:
            return 5, f"Excess rainfall {rain} mm; ensure good drainage."
        return 3, f"Rainfall {rain} mm is insufficient and irrigation is limited."

    def _score_water(self, crop: dict, water: str) -> tuple[int, str]:
        req = crop["water_requirement"]
        # Normalise
        req_level = "Medium" if "-" in req else req
        levels = {"Low": 1, "Medium": 2, "High": 3}
        diff = abs(levels.get(water, 2) - levels.get(req_level, 2))
        pts = [10, 7, 3][min(diff, 2)]
        return pts, f"Farm water level '{water}' vs crop requirement '{req}'."

    # ── Public API ──────────────────────────────────────────────────────────
    def recommend(
        self,
        soil_type: str,
        farm_area_ha: float,
        season: str,
        temperature_c: float,
        rainfall_mm: float,
        water_availability: str = "Medium",
        region: str = "",
        top_k: int = 3,
    ) -> dict:
        """Return top-k crop recommendations with full reasoning."""
        results = []
        for crop in self.profiles:
            s_soil, r_soil   = self._score_soil(crop, soil_type)
            s_seas, r_seas   = self._score_season(crop, season)
            s_temp, r_temp   = self._score_temperature(crop, temperature_c)
            s_rain, r_rain   = self._score_rainfall(crop, rainfall_mm, water_availability)
            s_watr, r_watr   = self._score_water(crop, water_availability)
            total = min(100, s_soil + s_seas + s_temp + s_rain + s_watr)

            results.append({
                "crop": crop["crop"],
                "match_score": total,
                "grade": ("Excellent" if total >= 80
                          else "Good" if total >= 60
                          else "Fair" if total >= 40
                          else "Poor"),
                "crop_duration": crop["crop_duration_days"],
                "water_requirement": crop["water_requirement"],
                "profit_potential": crop["profit_potential"],
                "key_advantages": crop["key_advantages"],
                "key_constraints": crop["key_constraints"],
                "score_breakdown": {
                    "soil": s_soil, "season": s_seas, "temperature": s_temp,
                    "rainfall": s_rain, "water_access": s_watr,
                },
                "reasons": [r_soil, r_seas, r_temp, r_rain, r_watr],
            })

        results.sort(key=lambda x: x["match_score"], reverse=True)
        return {
            "query": {
                "soil_type": soil_type, "farm_area_ha": farm_area_ha,
                "season": season, "temperature_c": temperature_c,
                "rainfall_mm": rainfall_mm, "water_availability": water_availability,
                "region": region,
            },
            "regional_note": REGIONAL_NOTES.get(region, ""),
            "total_crops_evaluated": len(results),
            "top_recommendations": results[:top_k],
            "all_scores": [{
                "crop": r["crop"],
                "score": r["match_score"],
                "grade": r["grade"],
            } for r in results],
        }
