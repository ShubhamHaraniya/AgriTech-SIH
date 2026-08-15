import sys, json
sys.path.insert(0, r'c:\Users\Shubham Haraniya\Desktop\Deep Learning\Project\SIH\backend')
sys.path.insert(0, r'c:\Users\Shubham Haraniya\Desktop\Deep Learning\Project\SIH')

print("--- Crop Recommendation ---")
from services.crop_recommendation_service import recommend
r = recommend("Loamy","Winter",25,450,"Medium","North India (Punjab/Haryana)",5)
crops = [c["crop"] for c in r["top_crops"]]
print("Top crops:", crops)
assert len(crops) >= 1, "No crops returned"

print("--- Crop Activity ---")
from services.crop_activity_service import get_activity
a = get_activity("Tomato", 30, "normal")
print("Activity keys:", list(a.keys())[:5])
assert isinstance(a, dict), "Activity must return dict"

print("--- Weather Demo ---")
from services.weather_service import demo_weather
w = demo_weather()
print("Weather:", w.get("condition"), w.get("temperature_c"))
assert w.get("condition"), "Weather missing condition"

print("\nALL SERVICES OK")
