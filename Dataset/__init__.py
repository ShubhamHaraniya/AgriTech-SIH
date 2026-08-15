"""AgriTech Dataset Package"""
import sys
from pathlib import Path

if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))

from crop_recommendation   import CROP_PROFILES, ALL_SOIL_TYPES, ALL_SEASONS, ALL_REGIONS, ALL_WATER_LEVELS, CropRecommendationEngine
from crop_activity_weather import CROP_STAGE_RULES, WEATHER_RULES, CropActivityWeatherEngine
from livestock             import LIVESTOCK_DISEASE_DB, ANIMAL_TYPES, DISEASE_NAMES, LivestockRecordManager

__all__ = [
    "CROP_PROFILES", "ALL_SOIL_TYPES", "ALL_SEASONS", "ALL_REGIONS", "ALL_WATER_LEVELS",
    "CropRecommendationEngine",
    "CROP_STAGE_RULES", "WEATHER_RULES", "CropActivityWeatherEngine",
    "LIVESTOCK_DISEASE_DB", "ANIMAL_TYPES", "DISEASE_NAMES", "LivestockRecordManager",
]
