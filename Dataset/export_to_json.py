"""
Exports all 3 datasets from Python modules to standalone JSON files.
Run from within the Dataset/ folder OR from the SIH project root.
"""

import sys
import json
import itertools
from pathlib import Path

# Ensure this script can find sibling modules regardless of how it is invoked
HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

from crop_recommendation    import CROP_PROFILES, ALL_SOIL_TYPES, ALL_SEASONS, ALL_REGIONS, ALL_WATER_LEVELS, CropRecommendationEngine
from crop_activity_weather  import CROP_STAGE_RULES, WEATHER_RULES, CropActivityWeatherEngine
from livestock              import LIVESTOCK_DISEASE_DB, ANIMAL_TYPES, DISEASE_NAMES


def export_crop_recommendation(out_path: Path) -> None:
    """Dataset 1 – 14 crop profiles + all scoring permutations."""
    engine = CropRecommendationEngine()

    # All individual input permutations
    perms = []
    for soil, season, region, water in itertools.product(
        ALL_SOIL_TYPES, ALL_SEASONS, ALL_REGIONS, ALL_WATER_LEVELS
    ):
        result = engine.recommend(
            soil_type=soil, farm_area_ha=2.0,
            season=season, temperature_c=25.0,
            rainfall_mm=700.0, water_availability=water,
            region=region, top_k=3
        )
        perms.append({
            "soil":   soil,
            "season": season,
            "region": region,
            "water":  water,
            "top_3":  [r["crop"] for r in result["top_recommendations"]],
            "scores": result["all_scores"],
        })

    data = {
        "description":    "Crop Recommendation Dataset – 14 PlantVillage crops",
        "crop_profiles":  CROP_PROFILES,
        "total_profiles": len(CROP_PROFILES),
        "dimensions": {
            "soil_types":   ALL_SOIL_TYPES,
            "seasons":      ALL_SEASONS,
            "regions":      ALL_REGIONS,
            "water_levels": ALL_WATER_LEVELS,
        },
        "total_permutations": len(perms),
        "all_permutations":   perms,
    }

    f = out_path / "crop_recommendation.json"
    f.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[OK] {f.name}  ({len(perms):,} combinations, {len(CROP_PROFILES)} crops)")


def export_crop_activity_weather(out_path: Path) -> None:
    """Dataset 2 – all crop stage rules + 5 weather trigger overrides."""
    engine = CropActivityWeatherEngine()

    # All (crop, stage, weather) combinations
    weather_ids = [r["trigger_id"] for r in WEATHER_RULES] + ["normal"]
    stage_samples = []
    for rule in CROP_STAGE_RULES:
        mid_das = (rule["das_min"] + rule["das_max"]) // 2
        for wid in weather_ids:
            adv = engine.full_advisory(rule["crop"], mid_das, wid)
            stage_samples.append({
                "crop":    rule["crop"],
                "stage":   rule["growth_stage"],
                "das":     mid_das,
                "weather": wid,
                "advisory": adv,
            })

    data = {
        "description":       "Crop Activity & Weather Advisory Dataset",
        "crop_stage_rules":  CROP_STAGE_RULES,
        "weather_rules":     WEATHER_RULES,
        "total_stage_rules": len(CROP_STAGE_RULES),
        "total_weather_triggers": len(WEATHER_RULES),
        "total_combinations":     len(stage_samples),
        "all_stage_x_weather_combinations": stage_samples,
    }

    f = out_path / "crop_activity_weather.json"
    f.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[OK] {f.name}  ({len(CROP_STAGE_RULES)} stages x {len(weather_ids)} weather triggers = {len(stage_samples)} combos)")


def export_livestock(out_path: Path) -> None:
    """Dataset 3 – all animal × disease records + symptom lookup index."""
    # Build a fast lookup map: {animal: {disease: record}}
    lookup: dict = {}
    for rec in LIVESTOCK_DISEASE_DB:
        animal = rec["animal"]
        lookup.setdefault(animal, {})[rec["disease"]] = rec

    # Build a summary: which diseases covered per animal
    coverage = {
        animal: list(lookup.get(animal, {}).keys())
        for animal in ANIMAL_TYPES
    }

    data = {
        "description":       "Livestock Health, Disease & Vaccination Dataset",
        "animals_covered":   ANIMAL_TYPES,
        "diseases_covered":  DISEASE_NAMES,
        "total_records":     len(LIVESTOCK_DISEASE_DB),
        "coverage_summary":  coverage,
        "disease_records":   LIVESTOCK_DISEASE_DB,
        "fast_lookup":       lookup,
    }

    f = out_path / "livestock_diseases.json"
    f.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[OK] {f.name}  ({len(LIVESTOCK_DISEASE_DB)} records across {len(ANIMAL_TYPES)} animals)")


def main() -> None:
    out_path = HERE
    print("Exporting all 3 AgriTech datasets to JSON...")
    print(f"Output directory: {out_path}\n")

    export_crop_recommendation(out_path)
    export_crop_activity_weather(out_path)
    export_livestock(out_path)

    print("\nAll datasets exported successfully.")


if __name__ == "__main__":
    main()
