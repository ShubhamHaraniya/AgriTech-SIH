import sys
sys.path.insert(0, 'Dataset')

from crop_recommendation import CropRecommendationEngine
from crop_activity_weather import CropActivityWeatherEngine
from livestock import LivestockRecordManager

# Test 1: Recommendation
engine = CropRecommendationEngine()
result = engine.recommend('Sandy Loam', 3.0, 'Winter', 18, 450, 'Medium', 'North India (Punjab/Haryana)', top_k=3)
print('-- CROP RECOMMENDATION (Sandy Loam, Winter, 18C, 450mm) --')
for r in result['top_recommendations']:
    print(f"  {r['crop']}: {r['match_score']}/100 ({r['grade']})")
    for reason in r['reasons']:
        print(f"    -> {reason}")

# Test 2: Weather Advisory
ae = CropActivityWeatherEngine()
adv = ae.full_advisory('Tomato', 60, 'rain probable tomorrow')
print('\n-- TOMATO DAS-60 RAIN ADVISORY --')
print(f"  Stage: {adv['current_stage']}")
print(f"  Fertilizer: {adv['routine_tasks']['fertilizer'][:80]}...")
print(f"  Weather Alert: {adv['weather_override']['alert']}")
print(f"  Irrigation: {adv['weather_override']['irrigation_directive']}")

# Test 3: Livestock symptom match
lr = LivestockRecordManager()
matches = lr.match_symptoms('Cow', ['excessive frothy salivation', 'vesicles on tongue', 'severe lameness'])
print('\n-- LIVESTOCK SYMPTOM MATCH (Cow) --')
if matches:
    m = matches[0]
    print(f"  Top match: {m['disease']} ({m['confidence_pct']}%)")
    print(f"  Zoonotic risk: {m['zoonotic_risk']}")

# Test 4: Vaccination due date check
rec = lr.calculate_next_due(
    'FMD Inactivated Trivalent / Tetravalent Oil-Adjuvant Vaccine',
    {'recurrence': 'Bi-annual (every 6 months)'},
    '2026-03-01'
)
print(f"\n  FMD Vaccine status: {rec['status']}  Next due: {rec['next_due_date']}")
print(f"  Days remaining: {rec['days_remaining']}")
