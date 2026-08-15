"""Disease (Plant) module package."""
import sys
from pathlib import Path
if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
from Data import (
    DISEASE_DB,
    DISEASE_ALIAS_MAP,
    ALL_38_CLASSES,
    REGIONS,
    SEASONS,
    SEVERITY_LEVELS,
    URGENCY_MAP,
    FARMER_PROFILES,
    REGIONAL_NOTES,
    SEASONAL_NOTES,
    normalise_disease,
)
