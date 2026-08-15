from __future__ import annotations
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from models.tables import (
    Farmer, Farm, Field, Animal, Vaccination,
    Expense, Notification, HistoryEntry, CropActivity
)

# ─────────────────────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────────────────────
def d(y, m, dy): return date(y, m, dy)
def ago(days): return date.today() - timedelta(days=days)


def seed_demo(db: Session) -> None:

    # =========================================================================
    # USER 1 — ARUN SINGH DHALIWAL · Ludhiana, Punjab
    # Large Commercial Farm: 18 fields · 32 animals
    # =========================================================================
    if not db.query(Farmer).filter(Farmer.id == "user_arun_punjab").first():
        f1 = Farmer(id="user_arun_punjab", name="Arun Singh Dhaliwal",
                    phone="9814412234", location="Ludhiana, Punjab", language="Punjabi")
        db.add(f1); db.flush()

        fm1 = Farm(id="farm_arun_punjab", farmer_id=f1.id,
                   total_area_acre=52.0, soil_type="Clay Loam", soil_ph=7.6,
                   water_avail="High", irrigation_type="Canal + Drip",
                   season="Rabi+Kharif", region="North India (Punjab)",
                   n_value=280, p_value=65, k_value=42)
        db.add(fm1); db.flush()

        fields_pb = [
            Field(id="fld_pb_1",  farm_id=fm1.id, name="North Block — Wheat (HD-3086)",         area_acre=4.5, soil_type="Clay Loam",    current_crop="Wheat",        sowing_date=d(2026,11,5)),
            Field(id="fld_pb_2",  farm_id=fm1.id, name="North Block — Rice (PUSA Basmati 1121)",area_acre=4.0, soil_type="Heavy Clay",    current_crop="Rice",         sowing_date=d(2026,6,18)),
            Field(id="fld_pb_3",  farm_id=fm1.id, name="South Block A — Maize (DKC 9108)",      area_acre=3.5, soil_type="Loamy Soil",    current_crop="Maize",        sowing_date=d(2026,7,2)),
            Field(id="fld_pb_4",  farm_id=fm1.id, name="South Block B — Wheat (PBW-343)",       area_acre=3.5, soil_type="Clay Loam",    current_crop="Wheat",        sowing_date=d(2026,11,8)),
            Field(id="fld_pb_5",  farm_id=fm1.id, name="East Paddock — Sugarcane (COJ-84)",     area_acre=5.0, soil_type="Sandy Clay",   current_crop="Sugarcane",    sowing_date=d(2026,2,10)),
            Field(id="fld_pb_6",  farm_id=fm1.id, name="East Paddock B — Rice (PR-126)",        area_acre=3.0, soil_type="Heavy Clay",   current_crop="Rice",         sowing_date=d(2026,6,25)),
            Field(id="fld_pb_7",  farm_id=fm1.id, name="West Field — Cotton (BT Punjab 1)",     area_acre=3.0, soil_type="Sandy Loam",   current_crop="Cotton",       sowing_date=d(2026,4,28)),
            Field(id="fld_pb_8",  farm_id=fm1.id, name="West Field B — Mustard (GSL-1)",        area_acre=2.5, soil_type="Loamy Soil",   current_crop="Mustard",      sowing_date=d(2026,10,20)),
            Field(id="fld_pb_9",  farm_id=fm1.id, name="Central Patch — Potato (Kufri Pukhraj)",area_acre=2.0, soil_type="Sandy Loam",  current_crop="Potato",       sowing_date=d(2026,10,1)),
            Field(id="fld_pb_10", farm_id=fm1.id, name="Central Patch B — Onion (Nasik Red)",   area_acre=1.5, soil_type="Clay Loam",    current_crop="Onion",        sowing_date=d(2026,11,1)),
            Field(id="fld_pb_11", farm_id=fm1.id, name="Orchard Row 1 — Kinnow (Punjab Kinnow)",area_acre=2.0, soil_type="Sandy Loam",  current_crop="Kinnow",       sowing_date=d(2022,1,15)),
            Field(id="fld_pb_12", farm_id=fm1.id, name="Orchard Row 2 — Guava (Allahabad Safeda)",area_acre=1.5,soil_type="Sandy Loam", current_crop="Guava",        sowing_date=d(2021,3,10)),
            Field(id="fld_pb_13", farm_id=fm1.id, name="Nursery Block — Sunflower (KBSH-1)",    area_acre=1.5, soil_type="Loamy Soil",   current_crop="Sunflower",    sowing_date=d(2026,7,15)),
            Field(id="fld_pb_14", farm_id=fm1.id, name="River Edge — Chickpea (GNG-663)",       area_acre=2.0, soil_type="Sandy Clay",   current_crop="Chickpea",     sowing_date=d(2026,10,28)),
            Field(id="fld_pb_15", farm_id=fm1.id, name="Greenhouse 1 — Tomato (Hybrid Rashmi)", area_acre=0.5, soil_type="Potting Mix",  current_crop="Tomato",       sowing_date=d(2026,8,5)),
            Field(id="fld_pb_16", farm_id=fm1.id, name="Greenhouse 2 — Capsicum (Orobelle)",    area_acre=0.5, soil_type="Potting Mix",  current_crop="Capsicum",     sowing_date=d(2026,8,10)),
            Field(id="fld_pb_17", farm_id=fm1.id, name="Fodder Plot — Maize Fodder (African Tall)",area_acre=3.0,soil_type="Clay Loam", current_crop="Maize Fodder", sowing_date=d(2026,7,20)),
            Field(id="fld_pb_18", farm_id=fm1.id, name="Fallow A — Toria (TL-15)",              area_acre=2.0, soil_type="Sandy Loam",   current_crop="Toria",        sowing_date=d(2026,9,15)),
        ]
        db.add_all(fields_pb); db.flush()

        # 32 Animals
        animals_pb = [
            Animal(id="pb_an1",  farm_id=fm1.id, tag="TAG-PB101", name="Raja",    species="Cow",    breed="Murrah Cross",     age_years=5.0, weight_kg=490, health_status="Healthy"),
            Animal(id="pb_an2",  farm_id=fm1.id, tag="TAG-PB102", name="Rani",    species="Cow",    breed="HF Crossbred",     age_years=4.0, weight_kg=470, health_status="Healthy"),
            Animal(id="pb_an3",  farm_id=fm1.id, tag="TAG-PB103", name="Shyama",  species="Cow",    breed="HF Crossbred",     age_years=3.5, weight_kg=450, health_status="Healthy"),
            Animal(id="pb_an4",  farm_id=fm1.id, tag="TAG-PB104", name="Kamla",   species="Cow",    breed="Sahiwal",          age_years=6.0, weight_kg=440, health_status="Healthy"),
            Animal(id="pb_an5",  farm_id=fm1.id, tag="TAG-PB105", name="Gori",    species="Cow",    breed="Sahiwal",          age_years=4.5, weight_kg=430, health_status="Healthy"),
            Animal(id="pb_an6",  farm_id=fm1.id, tag="TAG-PB106", name="Laxmi",   species="Cow",    breed="Jersey Cross",     age_years=3.0, weight_kg=410, health_status="Healthy"),
            Animal(id="pb_an7",  farm_id=fm1.id, tag="TAG-PB107", name="Meera",   species="Cow",    breed="Jersey Cross",     age_years=5.5, weight_kg=420, health_status="Under Treatment"),
            Animal(id="pb_an8",  farm_id=fm1.id, tag="TAG-PB108", name="Sona",    species="Cow",    breed="HF Crossbred",     age_years=2.5, weight_kg=390, health_status="Healthy"),
            Animal(id="pb_an9",  farm_id=fm1.id, tag="TAG-PB109", name="Tara",    species="Cow",    breed="Sahiwal",          age_years=7.0, weight_kg=460, health_status="Healthy"),
            Animal(id="pb_an10", farm_id=fm1.id, tag="TAG-PB110", name="Paro",    species="Cow",    breed="HF Crossbred",     age_years=4.0, weight_kg=480, health_status="Healthy"),
            Animal(id="pb_an11", farm_id=fm1.id, tag="TAG-PB201", name="Bhola",   species="Buffalo",breed="Murrah",           age_years=5.0, weight_kg=560, health_status="Healthy"),
            Animal(id="pb_an12", farm_id=fm1.id, tag="TAG-PB202", name="Kali",    species="Buffalo",breed="Murrah",           age_years=4.0, weight_kg=540, health_status="Healthy"),
            Animal(id="pb_an13", farm_id=fm1.id, tag="TAG-PB203", name="Nanda",   species="Buffalo",breed="Murrah",           age_years=6.0, weight_kg=580, health_status="Healthy"),
            Animal(id="pb_an14", farm_id=fm1.id, tag="TAG-PB204", name="Sapna",   species="Buffalo",breed="Nili-Ravi",        age_years=3.5, weight_kg=520, health_status="Healthy"),
            Animal(id="pb_an15", farm_id=fm1.id, tag="TAG-PB205", name="Chamki",  species="Buffalo",breed="Nili-Ravi",        age_years=5.0, weight_kg=550, health_status="Healthy"),
            Animal(id="pb_an16", farm_id=fm1.id, tag="TAG-PB206", name="Motia",   species="Buffalo",breed="Surti",            age_years=4.0, weight_kg=510, health_status="Healthy"),
            Animal(id="pb_an17", farm_id=fm1.id, tag="TAG-PB301", name="Bullet",  species="Ox",     breed="Haryana Breed",    age_years=6.0, weight_kg=520, health_status="Healthy"),
            Animal(id="pb_an18", farm_id=fm1.id, tag="TAG-PB302", name="Storm",   species="Ox",     breed="Haryana Breed",    age_years=7.0, weight_kg=540, health_status="Healthy"),
            Animal(id="pb_an19", farm_id=fm1.id, tag="TAG-PB401", name="Bhoomi1", species="Goat",   breed="Beetal",           age_years=2.0, weight_kg=52,  health_status="Healthy"),
            Animal(id="pb_an20", farm_id=fm1.id, tag="TAG-PB402", name="Bhoomi2", species="Goat",   breed="Beetal",           age_years=2.5, weight_kg=55,  health_status="Healthy"),
            Animal(id="pb_an21", farm_id=fm1.id, tag="TAG-PB403", name="Bhoomi3", species="Goat",   breed="Beetal",           age_years=1.5, weight_kg=44,  health_status="Healthy"),
            Animal(id="pb_an22", farm_id=fm1.id, tag="TAG-PB404", name="Bhoomi4", species="Goat",   breed="Sirohi",           age_years=3.0, weight_kg=58,  health_status="Healthy"),
            Animal(id="pb_an23", farm_id=fm1.id, tag="TAG-PB405", name="Bhoomi5", species="Goat",   breed="Sirohi",           age_years=2.0, weight_kg=49,  health_status="Healthy"),
            Animal(id="pb_an24", farm_id=fm1.id, tag="TAG-PB111", name="Heifer1", species="Cow",    breed="HF Crossbred",     age_years=1.0, weight_kg=200, health_status="Healthy"),
            Animal(id="pb_an25", farm_id=fm1.id, tag="TAG-PB112", name="Heifer2", species="Cow",    breed="HF Crossbred",     age_years=1.5, weight_kg=250, health_status="Healthy"),
            Animal(id="pb_an26", farm_id=fm1.id, tag="TAG-PB113", name="Heifer3", species="Cow",    breed="Sahiwal",          age_years=1.2, weight_kg=220, health_status="Healthy"),
            Animal(id="pb_an27", farm_id=fm1.id, tag="TAG-PB114", name="Calf1",   species="Cow",    breed="Murrah Cross",     age_years=0.5, weight_kg=90,  health_status="Healthy"),
            Animal(id="pb_an28", farm_id=fm1.id, tag="TAG-PB115", name="Calf2",   species="Cow",    breed="HF Crossbred",     age_years=0.4, weight_kg=78,  health_status="Healthy"),
            Animal(id="pb_an29", farm_id=fm1.id, tag="TAG-PB207", name="Bhura",   species="Buffalo",breed="Murrah",           age_years=1.0, weight_kg=180, health_status="Healthy"),
            Animal(id="pb_an30", farm_id=fm1.id, tag="TAG-PB208", name="Kesar",   species="Buffalo",breed="Murrah",           age_years=0.8, weight_kg=150, health_status="Healthy"),
            Animal(id="pb_an31", farm_id=fm1.id, tag="TAG-PB501", name="Sheep1",  species="Sheep",  breed="Nali",             age_years=2.0, weight_kg=40,  health_status="Healthy"),
            Animal(id="pb_an32", farm_id=fm1.id, tag="TAG-PB502", name="Sheep2",  species="Sheep",  breed="Nali",             age_years=3.0, weight_kg=44,  health_status="Healthy"),
        ]
        db.add_all(animals_pb); db.flush()

        # Vaccinations
        db.add_all([
            Vaccination(animal_id="pb_an1",  vaccine_name="FMD Polyvalent",    given_on=ago(120), next_due=ago(-60),  status="Done"),
            Vaccination(animal_id="pb_an1",  vaccine_name="HS + BQ Bivalent",  given_on=ago(90),  next_due=ago(-90),  status="Done"),
            Vaccination(animal_id="pb_an5",  vaccine_name="FMD Polyvalent",    given_on=ago(30),  next_due=ago(-150), status="Due"),
            Vaccination(animal_id="pb_an7",  vaccine_name="Theileria Vaccine", given_on=ago(10),  next_due=ago(-355), status="Done"),
            Vaccination(animal_id="pb_an11", vaccine_name="FMD Polyvalent",    given_on=ago(60),  next_due=ago(-120), status="Done"),
            Vaccination(animal_id="pb_an14", vaccine_name="HS Vaccine",        given_on=ago(180), next_due=ago(-5),   status="Due"),
        ])

        # Expenses
        db.add_all([
            Expense(farm_id=fm1.id, category="Seeds",       amount=85000,  description="Certified Wheat + Basmati seeds",             date=ago(180)),
            Expense(farm_id=fm1.id, category="Fertilizer",  amount=140000, description="DAP, Urea, MOP for all blocks",               date=ago(150)),
            Expense(farm_id=fm1.id, category="Pesticides",  amount=42000,  description="Fungicides + Herbicides for Rice + Cotton",   date=ago(120)),
            Expense(farm_id=fm1.id, category="Irrigation",  amount=28000,  description="Canal maintenance + drip system repair",      date=ago(90)),
            Expense(farm_id=fm1.id, category="Labour",      amount=95000,  description="Seasonal sowing labour — 25 workers",         date=ago(80)),
            Expense(farm_id=fm1.id, category="Machinery",   amount=65000,  description="Combine harvester rental — Kharif season",    date=ago(60)),
            Expense(farm_id=fm1.id, category="Veterinary",  amount=18000,  description="Quarterly health screening + deworming",      date=ago(50)),
            Expense(farm_id=fm1.id, category="Feed",        amount=55000,  description="Concentrate feed + mineral supplement",       date=ago(40)),
            Expense(farm_id=fm1.id, category="Seeds",       amount=32000,  description="Kinnow + Guava orchard fertilizer & pruning", date=ago(30)),
            Expense(farm_id=fm1.id, category="Labour",      amount=42000,  description="Post-harvest rice straw management",          date=ago(20)),
            Expense(farm_id=fm1.id, category="Irrigation",  amount=15000,  description="Sugarcane drip line expansion",              date=ago(15)),
            Expense(farm_id=fm1.id, category="Fertilizer",  amount=22000,  description="Micronutrient spray — Zinc + Boron",         date=ago(10)),
            Expense(farm_id=fm1.id, category="Machinery",   amount=38000,  description="Tractor service + implement repair",         date=ago(7)),
            Expense(farm_id=fm1.id, category="Miscellaneous",amount=12000, description="Farm record keeping + soil testing",         date=ago(5)),
        ])

        # Crop Activities
        for fld_id, act, sched in [
            ("fld_pb_1",  "Irrigation — Crown Root Initiation Stage",  ago(-5)),
            ("fld_pb_2",  "Panicle Initiation Spray — K2SO4",          ago(-2)),
            ("fld_pb_3",  "Tassel emergence — top dressing urea",      ago(2)),
            ("fld_pb_5",  "Sugarcane earthing up + trash mulching",    ago(-8)),
            ("fld_pb_7",  "Cotton boll-weevil pheromone trap check",   ago(1)),
            ("fld_pb_9",  "Potato hilling operation",                  ago(3)),
            ("fld_pb_15", "Tomato staking + tying",                    ago(-3)),
            ("fld_pb_17", "Fodder cutting — 3rd cycle",                ago(-1)),
        ]:
            db.add(CropActivity(field_id=fld_id, activity=act, scheduled=sched, completed=sched < date.today()))

        # Notifications
        db.add_all([
            Notification(farm_id=fm1.id, priority="urgent", title="Meera (Cow) Under Treatment", body="Milk fever detected. Calcium borogluconate administered. Monitor closely for 48 hours."),
            Notification(farm_id=fm1.id, priority="action", title="Gori — FMD Vaccine Due", body="TAG-PB105 Sahiwal cow FMD booster is due. Schedule with Dr. Harpreet Singh."),
            Notification(farm_id=fm1.id, priority="action", title="Rice Panicle Stage — Blast Risk", body="Humidity above 85% forecast this week. Apply Tricyclazole on North Block Rice immediately."),
            Notification(farm_id=fm1.id, priority="info",   title="Kinnow Harvest in 60 Days", body="Orchard Row 1 — Kinnow estimated harvest window: October 12–18, 2026."),
            Notification(farm_id=fm1.id, priority="info",   title="Cotton Boll Opening Progress", body="West Field bolls at 65% opening. Arrange picker teams for next 10 days."),
            Notification(farm_id=fm1.id, priority="urgent", title="Nanda + Sapna — Buffalo HS Due", body="TAG-PB203 and PB204 HS vaccine overdue by 15 days. High-risk season approaching."),
        ])

        # History entries
        db.add_all([
            HistoryEntry(farm_id=fm1.id, entry_type="Crop",    title="Wheat Harvest — Rabi 2025–26",     detail="Total yield: 4,680 qtl across 9.0 ac. MSP price achieved.",                  date=ago(200)),
            HistoryEntry(farm_id=fm1.id, entry_type="Crop",    title="Rice Harvest — Kharif 2025",       detail="Basmati 1121: 4,560 qtl premium grade. Export-quality grading done.",        date=ago(185)),
            HistoryEntry(farm_id=fm1.id, entry_type="Animal",  title="Rani calved — Heifer born",        detail="TAG-PB102 HF Crossbred delivered healthy heifer. Mother & calf both healthy.",date=ago(45)),
            HistoryEntry(farm_id=fm1.id, entry_type="Expense", title="Seasonal input purchase",          detail="Total Kharif 2026 input cost: ₹2,82,000.",                                  date=ago(100)),
            HistoryEntry(farm_id=fm1.id, entry_type="Scan",    title="AI Scan — Cotton Boll Weevil",     detail="Detected early infestation. Recommended spray applied within 48 hours.",     date=ago(20)),
        ])

    # =========================================================================
    # USER 2 — PRIYA VENKATARAMAN · Mysuru, Karnataka
    # Medium Mixed Farm: 12 fields · 24 animals
    # =========================================================================
    if not db.query(Farmer).filter(Farmer.id == "user_priya_karnataka").first():
        f2 = Farmer(id="user_priya_karnataka", name="Priya Venkataraman",
                    phone="9844421890", location="Mysuru, Karnataka", language="Kannada")
        db.add(f2); db.flush()

        fm2 = Farm(id="farm_priya_karnataka", farmer_id=f2.id,
                   total_area_acre=23.5, soil_type="Red Laterite + Black Cotton", soil_ph=6.5,
                   water_avail="Medium", irrigation_type="Drip + Borewell",
                   season="Kharif+Rabi", region="South India (Karnataka)",
                   n_value=180, p_value=45, k_value=38)
        db.add(fm2); db.flush()

        fields_ka = [
            Field(id="fld_ka_1",  farm_id=fm2.id, name="Block 1 — Sugarcane (Co-86032)",          area_acre=3.0, soil_type="Red Laterite",     current_crop="Sugarcane",  sowing_date=d(2026,1,20)),
            Field(id="fld_ka_2",  farm_id=fm2.id, name="Block 2 — Ragi (MR-6)",                   area_acre=2.5, soil_type="Sandy Clay",       current_crop="Ragi",       sowing_date=d(2026,7,10)),
            Field(id="fld_ka_3",  farm_id=fm2.id, name="Block 3 — Tomato (Arka Rakshak)",         area_acre=1.5, soil_type="Black Cotton",     current_crop="Tomato",     sowing_date=d(2026,8,1)),
            Field(id="fld_ka_4",  farm_id=fm2.id, name="Block 4 — Banana (Grand Nain)",           area_acre=2.0, soil_type="Alluvial Loam",    current_crop="Banana",     sowing_date=d(2025,10,5)),
            Field(id="fld_ka_5",  farm_id=fm2.id, name="Block 5 — Jowar (M-35-1)",               area_acre=2.0, soil_type="Black Cotton",     current_crop="Jowar",      sowing_date=d(2026,6,25)),
            Field(id="fld_ka_6",  farm_id=fm2.id, name="Block 6 — Groundnut (TMV-7)",            area_acre=2.5, soil_type="Red Sandy",        current_crop="Groundnut",  sowing_date=d(2026,7,5)),
            Field(id="fld_ka_7",  farm_id=fm2.id, name="Paddy Block — Paddy (BR-10)",            area_acre=3.0, soil_type="Clay Loam",        current_crop="Paddy",      sowing_date=d(2026,7,1)),
            Field(id="fld_ka_8",  farm_id=fm2.id, name="Vegetable A — Beans (KDL-1)",            area_acre=1.0, soil_type="Sandy Loam",       current_crop="Beans",      sowing_date=d(2026,8,10)),
            Field(id="fld_ka_9",  farm_id=fm2.id, name="Vegetable B — Brinjal (Arka Anand)",     area_acre=1.0, soil_type="Sandy Loam",       current_crop="Brinjal",    sowing_date=d(2026,7,28)),
            Field(id="fld_ka_10", farm_id=fm2.id, name="Coconut Grove (West Coast Tall)",         area_acre=2.0, soil_type="Laterite",         current_crop="Coconut",    sowing_date=d(2015,3,10)),
            Field(id="fld_ka_11", farm_id=fm2.id, name="Areca Patch (Mangala)",                   area_acre=1.5, soil_type="Laterite Loam",    current_crop="Areca Nut",  sowing_date=d(2018,6,15)),
            Field(id="fld_ka_12", farm_id=fm2.id, name="Fodder — Napier Grass",                   area_acre=1.5, soil_type="Clay Loam",        current_crop="Napier Grass",sowing_date=d(2025,6,1)),
        ]
        db.add_all(fields_ka); db.flush()

        animals_ka = [
            Animal(id="ka_an1",  farm_id=fm2.id, tag="TAG-KA101", name="Surabhi",    species="Cow",    breed="Malnad Gidda",   age_years=5.0, weight_kg=280, health_status="Healthy"),
            Animal(id="ka_an2",  farm_id=fm2.id, tag="TAG-KA102", name="Parvati",    species="Cow",    breed="HF Crossbred",   age_years=4.0, weight_kg=450, health_status="Healthy"),
            Animal(id="ka_an3",  farm_id=fm2.id, tag="TAG-KA103", name="Saraswati",  species="Cow",    breed="Jersey Cross",   age_years=3.5, weight_kg=420, health_status="Healthy"),
            Animal(id="ka_an4",  farm_id=fm2.id, tag="TAG-KA104", name="Kaveri",     species="Cow",    breed="Hallikar",       age_years=6.0, weight_kg=350, health_status="Healthy"),
            Animal(id="ka_an5",  farm_id=fm2.id, tag="TAG-KA105", name="Tungabhadra",species="Cow",    breed="Amrit Mahal",    age_years=4.5, weight_kg=380, health_status="Healthy"),
            Animal(id="ka_an6",  farm_id=fm2.id, tag="TAG-KA106", name="Netravati",  species="Cow",    breed="HF Crossbred",   age_years=3.0, weight_kg=440, health_status="Under Treatment"),
            Animal(id="ka_an7",  farm_id=fm2.id, tag="TAG-KA201", name="Mandakini",  species="Buffalo",breed="Surti",          age_years=4.0, weight_kg=500, health_status="Healthy"),
            Animal(id="ka_an8",  farm_id=fm2.id, tag="TAG-KA202", name="Alaknanda",  species="Buffalo",breed="Murrah",         age_years=5.0, weight_kg=550, health_status="Healthy"),
            Animal(id="ka_an9",  farm_id=fm2.id, tag="TAG-KA203", name="Godavari",   species="Buffalo",breed="Surti",          age_years=3.5, weight_kg=490, health_status="Healthy"),
            Animal(id="ka_an10", farm_id=fm2.id, tag="TAG-KA204", name="Krishna",    species="Buffalo",breed="Jafrabadi",      age_years=6.0, weight_kg=580, health_status="Healthy"),
            Animal(id="ka_an11", farm_id=fm2.id, tag="TAG-KA301", name="Billy1",     species="Goat",   breed="Osmanabadi",     age_years=2.0, weight_kg=45,  health_status="Healthy"),
            Animal(id="ka_an12", farm_id=fm2.id, tag="TAG-KA302", name="Billy2",     species="Goat",   breed="Osmanabadi",     age_years=3.0, weight_kg=52,  health_status="Healthy"),
            Animal(id="ka_an13", farm_id=fm2.id, tag="TAG-KA303", name="Billy3",     species="Goat",   breed="Sangamneri",     age_years=2.5, weight_kg=48,  health_status="Healthy"),
            Animal(id="ka_an14", farm_id=fm2.id, tag="TAG-KA304", name="Billy4",     species="Goat",   breed="Sangamneri",     age_years=1.5, weight_kg=38,  health_status="Healthy"),
            Animal(id="ka_an15", farm_id=fm2.id, tag="TAG-KA305", name="Billy5",     species="Goat",   breed="Osmanabadi",     age_years=4.0, weight_kg=56,  health_status="Healthy"),
            Animal(id="ka_an16", farm_id=fm2.id, tag="TAG-KA401", name="Nandu",      species="Ox",     breed="Hallikar",       age_years=7.0, weight_kg=480, health_status="Healthy"),
            Animal(id="ka_an17", farm_id=fm2.id, tag="TAG-KA402", name="Basava",     species="Ox",     breed="Amrit Mahal",    age_years=6.0, weight_kg=510, health_status="Healthy"),
            Animal(id="ka_an18", farm_id=fm2.id, tag="TAG-KA107", name="Calf KA1",   species="Cow",    breed="HF Crossbred",   age_years=0.5, weight_kg=95,  health_status="Healthy"),
            Animal(id="ka_an19", farm_id=fm2.id, tag="TAG-KA108", name="Calf KA2",   species="Cow",    breed="Jersey Cross",   age_years=0.8, weight_kg=120, health_status="Healthy"),
            Animal(id="ka_an20", farm_id=fm2.id, tag="TAG-KA501", name="Duck KA1",   species="Duck",   breed="Khaki Campbell", age_years=1.0, weight_kg=2.2, health_status="Healthy"),
            Animal(id="ka_an21", farm_id=fm2.id, tag="TAG-KA502", name="Duck KA2",   species="Duck",   breed="Khaki Campbell", age_years=1.0, weight_kg=2.1, health_status="Healthy"),
            Animal(id="ka_an22", farm_id=fm2.id, tag="TAG-KA503", name="Duck KA3",   species="Duck",   breed="Khaki Campbell", age_years=1.2, weight_kg=2.3, health_status="Healthy"),
            Animal(id="ka_an23", farm_id=fm2.id, tag="TAG-KA504", name="Duck KA4",   species="Duck",   breed="Desi Duck",      age_years=0.8, weight_kg=1.9, health_status="Healthy"),
            Animal(id="ka_an24", farm_id=fm2.id, tag="TAG-KA505", name="Duck KA5",   species="Duck",   breed="Desi Duck",      age_years=0.9, weight_kg=2.0, health_status="Healthy"),
        ]
        db.add_all(animals_ka); db.flush()

        db.add_all([
            Vaccination(animal_id="ka_an3",  vaccine_name="FMD Polyvalent",   given_on=ago(20),  next_due=ago(-160), status="Due"),
            Vaccination(animal_id="ka_an6",  vaccine_name="HS Vaccine",       given_on=ago(5),   next_due=ago(-355), status="Overdue"),
            Vaccination(animal_id="ka_an9",  vaccine_name="Brucellosis",      given_on=ago(60),  next_due=ago(-305), status="Done"),
        ])

        db.add_all([
            Expense(farm_id=fm2.id, category="Seeds",      amount=55000, description="Ragi, Groundnut, Paddy certified seed",   date=ago(160)),
            Expense(farm_id=fm2.id, category="Fertilizer", amount=72000, description="NPK complex + Organic compost",           date=ago(130)),
            Expense(farm_id=fm2.id, category="Labour",     amount=48000, description="Sugarcane planting labour — 15 workers",  date=ago(110)),
            Expense(farm_id=fm2.id, category="Irrigation", amount=22000, description="Drip emitter replacement — 3 blocks",    date=ago(80)),
            Expense(farm_id=fm2.id, category="Veterinary", amount=14000, description="Mastitis treatment — Netravati",         date=ago(40)),
            Expense(farm_id=fm2.id, category="Pesticides", amount=18000, description="Leaf miner control — Banana + Tomato",   date=ago(30)),
            Expense(farm_id=fm2.id, category="Feed",       amount=28000, description="Bypass fat + Mineral mixture",           date=ago(20)),
            Expense(farm_id=fm2.id, category="Machinery",  amount=15000, description="Mini tractor servicing",                 date=ago(10)),
        ])

        for fld_id, act, sched in [
            ("fld_ka_1",  "Sugarcane trash mulching + earthing",    ago(-3)),
            ("fld_ka_3",  "Tomato staking — 2nd tier",              ago(1)),
            ("fld_ka_7",  "Paddy weeding + gap filling",            ago(2)),
            ("fld_ka_10", "Coconut basal fertilizer application",   ago(-7)),
        ]:
            db.add(CropActivity(field_id=fld_id, activity=act, scheduled=sched, completed=sched < date.today()))

        db.add_all([
            Notification(farm_id=fm2.id, priority="urgent", title="Netravati — Mastitis Treatment Ongoing", body="TAG-KA106 Jersey Cross cow is under antibiotic treatment. Milk discard mandatory for 7 days."),
            Notification(farm_id=fm2.id, priority="action", title="Saraswati — FMD Vaccine Due", body="TAG-KA103 FMD booster due in 10 days. Book Dr. Lakshmi for farm visit."),
            Notification(farm_id=fm2.id, priority="action", title="Banana Bunch Emergence — Mysuru Block 4", body="Grand Nain bunch emergence observed in 40% plants. Apply potassium spray this week."),
            Notification(farm_id=fm2.id, priority="info",   title="Groundnut Pod Formation Stage", body="TMV-7 at 45 DAS — optimal soil moisture critical for peg penetration in Block 6."),
        ])

        db.add_all([
            HistoryEntry(farm_id=fm2.id, entry_type="Crop",   title="Ragi Harvest — Kharif 2025",       detail="MR-6 yield: 68 qtl from 2.5 ac. Sold at ₹3200/qtl.",              date=ago(210)),
            HistoryEntry(farm_id=fm2.id, entry_type="Animal", title="Parvati calved — Bull calf",       detail="TAG-KA102 delivered healthy male calf. Colostrum feeding confirmed.",date=ago(55)),
            HistoryEntry(farm_id=fm2.id, entry_type="Crop",   title="Sugarcane Crushing — Jan 2026",    detail="Co-86032: 310 qtl delivered to KBS Sugar Mill. Payment received.",   date=ago(180)),
        ])

    # =========================================================================
    # USER 3 — IBRAHIM ALI SHEIKH · Guwahati, Assam
    # Livestock-Focused Farm: 5 fields · 45 animals
    # =========================================================================
    if not db.query(Farmer).filter(Farmer.id == "user_ibrahim_assam").first():
        f3 = Farmer(id="user_ibrahim_assam", name="Ibrahim Ali Sheikh",
                    phone="9435188876", location="Guwahati, Assam", language="Assamese")
        db.add(f3); db.flush()

        fm3 = Farm(id="farm_ibrahim_assam", farmer_id=f3.id,
                   total_area_acre=12.5, soil_type="Alluvial Clay", soil_ph=5.8,
                   water_avail="High", irrigation_type="Rain-fed + Borewell",
                   season="Kharif", region="Northeast India (Assam)",
                   n_value=160, p_value=35, k_value=28)
        db.add(fm3); db.flush()

        fields_as = [
            Field(id="fld_as_1", farm_id=fm3.id, name="Paddy Field — Joha Saul (Aromatic Rice)", area_acre=4.0, soil_type="Clay Loam",  current_crop="Rice",         sowing_date=d(2026,6,15)),
            Field(id="fld_as_2", farm_id=fm3.id, name="Mustard Block — Toria (B-9)",             area_acre=2.5, soil_type="Sandy Loam", current_crop="Mustard",      sowing_date=d(2026,10,10)),
            Field(id="fld_as_3", farm_id=fm3.id, name="Vegetable Patch — Bottle Gourd",          area_acre=1.0, soil_type="Alluvial",   current_crop="Bottle Gourd", sowing_date=d(2026,7,20)),
            Field(id="fld_as_4", farm_id=fm3.id, name="Fodder A — Napier + Jowar Mix",           area_acre=3.0, soil_type="Clay Loam",  current_crop="Napier Grass", sowing_date=d(2025,5,10)),
            Field(id="fld_as_5", farm_id=fm3.id, name="Fodder B — Oat Fodder (Kent)",            area_acre=2.0, soil_type="Sandy Clay", current_crop="Oat Fodder",   sowing_date=d(2026,10,1)),
        ]
        db.add_all(fields_as); db.flush()

        species_data = [
            # 12 Cows
            ("as_an1","TAG-AS101","Jamuna",    "Cow","Assam Hill Cattle",5.0,260,"Healthy"),
            ("as_an2","TAG-AS102","Doli",      "Cow","Assam Hill Cattle",4.0,245,"Healthy"),
            ("as_an3","TAG-AS103","Rosy",      "Cow","HF Crossbred",     3.5,420,"Healthy"),
            ("as_an4","TAG-AS104","Moni",      "Cow","Jersey Cross",     4.5,410,"Healthy"),
            ("as_an5","TAG-AS105","Puja",      "Cow","Red Sindhi",       6.0,390,"Healthy"),
            ("as_an6","TAG-AS106","Lata",      "Cow","Gir Crossbred",    3.0,400,"Healthy"),
            ("as_an7","TAG-AS107","Meena",     "Cow","HF Crossbred",     5.0,455,"Healthy"),
            ("as_an8","TAG-AS108","Nitu",      "Cow","Jersey Cross",     4.0,430,"Under Treatment"),
            ("as_an9","TAG-AS109","Pari",      "Cow","HF Crossbred",     2.5,370,"Healthy"),
            ("as_an10","TAG-AS110","Rina",     "Cow","Sahiwal",          5.5,440,"Healthy"),
            ("as_an11","TAG-AS111","Sita",     "Cow","Assam Hill Cattle",7.0,270,"Healthy"),
            ("as_an12","TAG-AS112","Uma",      "Cow","HF Crossbred",     3.5,460,"Healthy"),
            # 3 Buffalos
            ("as_an13","TAG-AS201","Kamal",    "Buffalo","Murrah",       4.0,530,"Healthy"),
            ("as_an14","TAG-AS202","Bela",     "Buffalo","Murrah",       5.0,560,"Healthy"),
            ("as_an15","TAG-AS203","Chand",    "Buffalo","Nili-Ravi",    3.5,510,"Healthy"),
            # 5 Heifers + calves
            ("as_an16","TAG-AS113","Heifer A1","Cow","HF Crossbred",    1.0,180,"Healthy"),
            ("as_an17","TAG-AS114","Heifer A2","Cow","Jersey Cross",     1.2,200,"Healthy"),
            ("as_an18","TAG-AS115","Heifer A3","Cow","Sahiwal",          1.5,230,"Healthy"),
            ("as_an19","TAG-AS116","Calf A1",  "Cow","HF Crossbred",    0.4,75, "Healthy"),
            ("as_an20","TAG-AS117","Calf A2",  "Cow","Jersey Cross",     0.5,82, "Healthy"),
            # 8 Goats
            ("as_an21","TAG-AS301","Goat AS1", "Goat","Black Bengal",   2.0,22, "Healthy"),
            ("as_an22","TAG-AS302","Goat AS2", "Goat","Black Bengal",   2.5,24, "Healthy"),
            ("as_an23","TAG-AS303","Goat AS3", "Goat","Black Bengal",   1.5,18, "Healthy"),
            ("as_an24","TAG-AS304","Goat AS4", "Goat","Black Bengal",   3.0,28, "Healthy"),
            ("as_an25","TAG-AS305","Goat AS5", "Goat","Assam Goat",     2.0,20, "Healthy"),
            ("as_an26","TAG-AS306","Goat AS6", "Goat","Assam Goat",     1.0,14, "Healthy"),
            ("as_an27","TAG-AS307","Goat AS7", "Goat","Black Bengal",   2.5,25, "Healthy"),
            ("as_an28","TAG-AS308","Goat AS8", "Goat","Assam Goat",     3.5,30, "Healthy"),
            # 4 Pigs
            ("as_an29","TAG-AS601","Pig AS1",  "Pig","Ghungroo",        1.5,65, "Healthy"),
            ("as_an30","TAG-AS602","Pig AS2",  "Pig","Ghungroo",        2.0,80, "Healthy"),
            ("as_an31","TAG-AS603","Pig AS3",  "Pig","LW Yorkshire",    1.0,55, "Healthy"),
            ("as_an32","TAG-AS604","Pig AS4",  "Pig","Ghungroo",        2.5,90, "Healthy"),
            # 5 Ducks
            ("as_an33","TAG-AS501","Duck AS1", "Duck","Khaki Campbell", 1.0,2.1,"Healthy"),
            ("as_an34","TAG-AS502","Duck AS2", "Duck","Khaki Campbell", 1.1,2.2,"Healthy"),
            ("as_an35","TAG-AS503","Duck AS3", "Duck","Desi Assam",     0.9,1.8,"Healthy"),
            ("as_an36","TAG-AS504","Duck AS4", "Duck","Desi Assam",     1.2,2.0,"Healthy"),
            ("as_an37","TAG-AS505","Duck AS5", "Duck","Khaki Campbell", 0.8,1.9,"Healthy"),
            # 5 Poultry
            ("as_an38","TAG-AS701","Hen AS1",  "Poultry","RIR Layer",   1.0,1.8,"Healthy"),
            ("as_an39","TAG-AS702","Hen AS2",  "Poultry","RIR Layer",   1.0,1.8,"Healthy"),
            ("as_an40","TAG-AS703","Hen AS3",  "Poultry","RIR Layer",   1.1,1.9,"Healthy"),
            ("as_an41","TAG-AS704","Hen AS4",  "Poultry","Kadaknath",   0.8,1.5,"Healthy"),
            ("as_an42","TAG-AS705","Hen AS5",  "Poultry","Kadaknath",   0.9,1.6,"Healthy"),
            # 2 Sheep
            ("as_an43","TAG-AS801","Sheep AS1","Sheep","Assam Sheep",   2.0,32, "Healthy"),
            ("as_an44","TAG-AS802","Sheep AS2","Sheep","Assam Sheep",   3.0,38, "Healthy"),
            # 1 Ox
            ("as_an45","TAG-AS901","Ox AS1",   "Ox","Assam Breed",      5.0,380,"Healthy"),
        ]
        animals_as = [Animal(id=x[0],farm_id=fm3.id,tag=x[1],name=x[2],species=x[3],breed=x[4],age_years=x[5],weight_kg=x[6],health_status=x[7]) for x in species_data]
        db.add_all(animals_as); db.flush()

        db.add_all([
            Vaccination(animal_id="as_an3",  vaccine_name="FMD Polyvalent",  given_on=ago(15),  next_due=ago(-165), status="Due"),
            Vaccination(animal_id="as_an8",  vaccine_name="Theileria",       given_on=ago(5),   next_due=ago(-360), status="Overdue"),
            Vaccination(animal_id="as_an15", vaccine_name="HS Vaccine",      given_on=ago(30),  next_due=ago(-150), status="Due"),
        ])

        db.add_all([
            Expense(farm_id=fm3.id, category="Feed",       amount=92000,  description="TMR ration + Bypass fat + Minerals for 45 animals", date=ago(20)),
            Expense(farm_id=fm3.id, category="Veterinary", amount=38000,  description="Quarterly herd health camp + deworming",            date=ago(30)),
            Expense(farm_id=fm3.id, category="Feed",       amount=48000,  description="Paddy straw + oilcake supplement",                  date=ago(50)),
            Expense(farm_id=fm3.id, category="Seeds",      amount=18000,  description="Joha Saul paddy seed + Toria seed",                 date=ago(120)),
            Expense(farm_id=fm3.id, category="Labour",     amount=28000,  description="Herd management + milking labour",                  date=ago(10)),
            Expense(farm_id=fm3.id, category="Veterinary", amount=22000,  description="Nitu treatment — antibiotics + mineral support",    date=ago(8)),
            Expense(farm_id=fm3.id, category="Infrastructure",amount=55000, description="Cattle shed expansion — 500 sqft concrete flooring", date=ago(60)),
            Expense(farm_id=fm3.id, category="Fertilizer", amount=14000,  description="Paddy field fertilizer — Urea + SSP",              date=ago(90)),
        ])

        db.add_all([
            CropActivity(field_id="fld_as_1", activity="Paddy weeding — 2nd round",        scheduled=ago(2),  completed=True),
            CropActivity(field_id="fld_as_4", activity="Napier 4th cutting + re-planting", scheduled=ago(-2), completed=False),
            CropActivity(field_id="fld_as_5", activity="Oat fodder first irrigation",       scheduled=ago(1),  completed=True),
        ])

        db.add_all([
            Notification(farm_id=fm3.id, priority="urgent", title="Nitu (Cow) — Fever + Off-Feed", body="TAG-AS108 Jersey Cross showing 104°F temp. Dr. Rafiqul Islam called. Under treatment."),
            Notification(farm_id=fm3.id, priority="action", title="Chand — Buffalo HS Vaccine Due", body="TAG-AS203 Nili-Ravi HS vaccine overdue. Monsoon season is high-risk. Vaccinate immediately."),
            Notification(farm_id=fm3.id, priority="action", title="Rosy — FMD Booster Due",         body="TAG-AS103 HF Crossbred FMD booster due in 5 days."),
            Notification(farm_id=fm3.id, priority="info",   title="Joha Saul Paddy Tillering Stage", body="Paddy Field at 45 DAS — tillering stage. Apply 2nd split of Urea (25 kg/ac)."),
            Notification(farm_id=fm3.id, priority="info",   title="Duck Egg Production Record",      body="Khaki Campbell flock averaging 4.8 eggs/day. Peak production recorded this week."),
        ])

        db.add_all([
            HistoryEntry(farm_id=fm3.id, entry_type="Animal", title="Meena calved — Heifer born",   detail="TAG-AS107 HF Crossbred delivered healthy heifer. Peak milk yield 17L expected.",  date=ago(40)),
            HistoryEntry(farm_id=fm3.id, entry_type="Animal", title="Ghungroo Pig — Litter of 7",   detail="TAG-AS601 sow delivered 7 piglets. 6 survived. Creep feeding started.",             date=ago(80)),
            HistoryEntry(farm_id=fm3.id, entry_type="Crop",   title="Joha Saul Harvest — Rabi 2025", detail="Aromatic rice 3.8 qtl/ac achieved. Premium grade sold at ₹4,800/qtl.",           date=ago(220)),
        ])

    # =========================================================================
    # USER 4 — KAVITA PATEL · Indore, Madhya Pradesh
    # Crop-Diverse Farm: 20 fields · 18 animals
    # =========================================================================
    if not db.query(Farmer).filter(Farmer.id == "user_kavita_mp").first():
        f4 = Farmer(id="user_kavita_mp", name="Kavita Patel",
                    phone="9826611022", location="Indore, Madhya Pradesh", language="Hindi")
        db.add(f4); db.flush()

        fm4 = Farm(id="farm_kavita_mp", farmer_id=f4.id,
                   total_area_acre=48.0, soil_type="Black Cotton Soil", soil_ph=7.2,
                   water_avail="Medium", irrigation_type="Rain-fed + Canal",
                   season="Kharif+Rabi", region="Central India (MP)",
                   n_value=220, p_value=55, k_value=40)
        db.add(fm4); db.flush()

        fields_mp = [
            Field(id="fld_mp_1",  farm_id=fm4.id, name="Soybean Block A (JS-9305)",       area_acre=4.0, soil_type="Black Cotton",    current_crop="Soybean",     sowing_date=d(2026,6,25)),
            Field(id="fld_mp_2",  farm_id=fm4.id, name="Soybean Block B (NRC-7)",         area_acre=3.5, soil_type="Black Cotton",    current_crop="Soybean",     sowing_date=d(2026,6,28)),
            Field(id="fld_mp_3",  farm_id=fm4.id, name="Cotton Field (Bunny BT)",         area_acre=3.0, soil_type="Medium Black",    current_crop="Cotton",      sowing_date=d(2026,5,15)),
            Field(id="fld_mp_4",  farm_id=fm4.id, name="Chickpea Block (JG-14)",          area_acre=3.5, soil_type="Clay Loam",       current_crop="Chickpea",    sowing_date=d(2026,10,20)),
            Field(id="fld_mp_5",  farm_id=fm4.id, name="Wheat Block A (GW-496)",          area_acre=4.0, soil_type="Black Cotton",    current_crop="Wheat",       sowing_date=d(2026,11,15)),
            Field(id="fld_mp_6",  farm_id=fm4.id, name="Wheat Block B (HD-2781)",         area_acre=3.0, soil_type="Clay Loam",       current_crop="Wheat",       sowing_date=d(2026,11,20)),
            Field(id="fld_mp_7",  farm_id=fm4.id, name="Lentil / Masoor (IPL-406)",       area_acre=2.5, soil_type="Sandy Loam",      current_crop="Lentil",      sowing_date=d(2026,10,25)),
            Field(id="fld_mp_8",  farm_id=fm4.id, name="Onion Red (Phule Suvarna)",       area_acre=2.0, soil_type="Sandy Loam",      current_crop="Onion",       sowing_date=d(2026,10,5)),
            Field(id="fld_mp_9",  farm_id=fm4.id, name="Garlic (Godavari)",               area_acre=1.5, soil_type="Sandy Clay",      current_crop="Garlic",      sowing_date=d(2026,10,10)),
            Field(id="fld_mp_10", farm_id=fm4.id, name="Coriander / Dhaniya (RCr-41)",   area_acre=1.5, soil_type="Sandy Loam",      current_crop="Coriander",   sowing_date=d(2026,10,15)),
            Field(id="fld_mp_11", farm_id=fm4.id, name="Fenugreek / Methi",              area_acre=1.0, soil_type="Sandy Loam",      current_crop="Fenugreek",   sowing_date=d(2026,10,20)),
            Field(id="fld_mp_12", farm_id=fm4.id, name="Maize Kharif (DHM-117)",         area_acre=3.0, soil_type="Clay Loam",       current_crop="Maize",       sowing_date=d(2026,6,20)),
            Field(id="fld_mp_13", farm_id=fm4.id, name="Sorghum / Jowar (SPV-462)",      area_acre=2.5, soil_type="Black Cotton",    current_crop="Jowar",       sowing_date=d(2026,6,22)),
            Field(id="fld_mp_14", farm_id=fm4.id, name="Turmeric (Rajendra Sonia)",      area_acre=1.5, soil_type="Sandy Clay Loam", current_crop="Turmeric",    sowing_date=d(2026,5,10)),
            Field(id="fld_mp_15", farm_id=fm4.id, name="Ginger (Suprabha)",              area_acre=1.0, soil_type="Sandy Loam",      current_crop="Ginger",      sowing_date=d(2026,4,20)),
            Field(id="fld_mp_16", farm_id=fm4.id, name="Black Gram / Urad (T-9)",        area_acre=2.0, soil_type="Sandy Loam",      current_crop="Black Gram",  sowing_date=d(2026,7,5)),
            Field(id="fld_mp_17", farm_id=fm4.id, name="Green Gram / Moong (PDM-11)",    area_acre=2.0, soil_type="Sandy Loam",      current_crop="Green Gram",  sowing_date=d(2026,7,10)),
            Field(id="fld_mp_18", farm_id=fm4.id, name="Sesame / Til (RT-46)",           area_acre=1.5, soil_type="Sandy Loam",      current_crop="Sesame",      sowing_date=d(2026,6,15)),
            Field(id="fld_mp_19", farm_id=fm4.id, name="Castor (GCH-4)",                 area_acre=2.0, soil_type="Sandy Clay",      current_crop="Castor",      sowing_date=d(2026,6,10)),
            Field(id="fld_mp_20", farm_id=fm4.id, name="Fodder — Berseem + Oat Mix",     area_acre=2.0, soil_type="Clay Loam",       current_crop="Berseem",     sowing_date=d(2026,10,1)),
        ]
        db.add_all(fields_mp); db.flush()

        animals_mp = [
            Animal(id="mp_an1",  farm_id=fm4.id, tag="TAG-MP101", name="Ganga",     species="Cow",    breed="HF Crossbred",  age_years=4.5, weight_kg=455, health_status="Healthy"),
            Animal(id="mp_an2",  farm_id=fm4.id, tag="TAG-MP102", name="Yamuna",    species="Cow",    breed="Sahiwal",       age_years=5.0, weight_kg=430, health_status="Healthy"),
            Animal(id="mp_an3",  farm_id=fm4.id, tag="TAG-MP103", name="Saraswati", species="Cow",    breed="Gir Crossbred", age_years=3.5, weight_kg=420, health_status="Healthy"),
            Animal(id="mp_an4",  farm_id=fm4.id, tag="TAG-MP104", name="Lakshmi",   species="Cow",    breed="HF Crossbred",  age_years=4.0, weight_kg=470, health_status="Healthy"),
            Animal(id="mp_an5",  farm_id=fm4.id, tag="TAG-MP201", name="Kaveri",    species="Buffalo",breed="Murrah",        age_years=5.5, weight_kg=560, health_status="Healthy"),
            Animal(id="mp_an6",  farm_id=fm4.id, tag="TAG-MP202", name="Narmada",   species="Buffalo",breed="Murrah",        age_years=4.0, weight_kg=540, health_status="Healthy"),
            Animal(id="mp_an7",  farm_id=fm4.id, tag="TAG-MP203", name="Chambal",   species="Buffalo",breed="Bhadawari",     age_years=6.0, weight_kg=490, health_status="Healthy"),
            Animal(id="mp_an8",  farm_id=fm4.id, tag="TAG-MP301", name="Goat MP1",  species="Goat",   breed="Jakhrana",     age_years=2.0, weight_kg=50,  health_status="Healthy"),
            Animal(id="mp_an9",  farm_id=fm4.id, tag="TAG-MP302", name="Goat MP2",  species="Goat",   breed="Jakhrana",     age_years=3.0, weight_kg=58,  health_status="Healthy"),
            Animal(id="mp_an10", farm_id=fm4.id, tag="TAG-MP303", name="Goat MP3",  species="Goat",   breed="Sirohi",       age_years=2.5, weight_kg=52,  health_status="Healthy"),
            Animal(id="mp_an11", farm_id=fm4.id, tag="TAG-MP304", name="Goat MP4",  species="Goat",   breed="Sirohi",       age_years=1.5, weight_kg=38,  health_status="Healthy"),
            Animal(id="mp_an12", farm_id=fm4.id, tag="TAG-MP105", name="Heifer MP1",species="Cow",    breed="HF Crossbred", age_years=1.0, weight_kg=190, health_status="Healthy"),
            Animal(id="mp_an13", farm_id=fm4.id, tag="TAG-MP106", name="Heifer MP2",species="Cow",    breed="Sahiwal",      age_years=1.2, weight_kg=210, health_status="Healthy"),
            Animal(id="mp_an14", farm_id=fm4.id, tag="TAG-MP107", name="Calf MP1",  species="Cow",    breed="HF Crossbred", age_years=0.4, weight_kg=72,  health_status="Healthy"),
            Animal(id="mp_an15", farm_id=fm4.id, tag="TAG-MP401", name="Sheep MP1", species="Sheep",  breed="Manpuri",      age_years=2.5, weight_kg=36,  health_status="Healthy"),
            Animal(id="mp_an16", farm_id=fm4.id, tag="TAG-MP402", name="Sheep MP2", species="Sheep",  breed="Manpuri",      age_years=3.0, weight_kg=40,  health_status="Healthy"),
            Animal(id="mp_an17", farm_id=fm4.id, tag="TAG-MP403", name="Sheep MP3", species="Sheep",  breed="Manpuri",      age_years=2.0, weight_kg=33,  health_status="Healthy"),
            Animal(id="mp_an18", farm_id=fm4.id, tag="TAG-MP501", name="Ox MP1",    species="Ox",     breed="Nimari",       age_years=6.0, weight_kg=500, health_status="Healthy"),
        ]
        db.add_all(animals_mp); db.flush()

        db.add_all([
            Vaccination(animal_id="mp_an3",  vaccine_name="FMD Polyvalent",  given_on=ago(25),  next_due=ago(-155), status="Due"),
            Vaccination(animal_id="mp_an5",  vaccine_name="HS Vaccine",      given_on=ago(90),  next_due=ago(-90),  status="Done"),
            Vaccination(animal_id="mp_an7",  vaccine_name="Brucellosis",     given_on=ago(180), next_due=ago(5),    status="Upcoming"),
        ])

        db.add_all([
            Expense(farm_id=fm4.id, category="Seeds",       amount=78000,  description="Soybean + Chickpea + Wheat certified seed",   date=ago(170)),
            Expense(farm_id=fm4.id, category="Fertilizer",  amount=95000,  description="DAP + MOP + Urea for 20 field blocks",        date=ago(140)),
            Expense(farm_id=fm4.id, category="Pesticides",  amount=36000,  description="Soybean girdle beetle + Cotton bollworm spray",date=ago(100)),
            Expense(farm_id=fm4.id, category="Labour",      amount=62000,  description="Kharif sowing + weeding — 18 workers",        date=ago(80)),
            Expense(farm_id=fm4.id, category="Irrigation",  amount=20000,  description="Canal water charges + borewell running cost", date=ago(60)),
            Expense(farm_id=fm4.id, category="Veterinary",  amount=12000,  description="Cattle herd annual health check",             date=ago(40)),
            Expense(farm_id=fm4.id, category="Feed",        amount=24000,  description="Soybean meal + mineral supplement for herd",  date=ago(30)),
            Expense(farm_id=fm4.id, category="Machinery",   amount=18000,  description="Power weeder + tractor disc plough service",  date=ago(20)),
            Expense(farm_id=fm4.id, category="Miscellaneous",amount=9000,  description="Soil testing 20 fields + moisture sensor",    date=ago(15)),
            Expense(farm_id=fm4.id, category="Seeds",       amount=22000,  description="Onion + Garlic + Coriander rabi seed",        date=ago(10)),
        ])

        for fld_id, act, sched in [
            ("fld_mp_1",  "Soybean spraying — Sclerotinia control",   ago(1)),
            ("fld_mp_3",  "Cotton squaring — nitrogen top dressing",  ago(-1)),
            ("fld_mp_8",  "Onion transplanting 2nd batch",             ago(2)),
            ("fld_mp_14", "Turmeric earthing up",                      ago(-2)),
            ("fld_mp_20", "Berseem 1st cutting",                       ago(3)),
        ]:
            db.add(CropActivity(field_id=fld_id, activity=act, scheduled=sched, completed=sched < date.today()))

        db.add_all([
            Notification(farm_id=fm4.id, priority="action", title="Soybean Girdle Beetle Alert", body="Block A & B showing girdle beetle damage on 15% plants. Spray Profenofos immediately."),
            Notification(farm_id=fm4.id, priority="action", title="Saraswati — FMD Vaccine Due",  body="TAG-MP103 Gir Crossbred FMD booster due in 5 days. Contact Dr. Hemant Joshi."),
            Notification(farm_id=fm4.id, priority="action", title="Onion Transplanting Window",   body="Phule Suvarna nursery seedlings 5–6 leaf stage. Transplant Block 8 this week."),
            Notification(farm_id=fm4.id, priority="info",   title="Turmeric Rhizome Development", body="Rajendra Sonia at 95 DAS — rhizome bulking stage. Ensure soil moisture and earthing up."),
            Notification(farm_id=fm4.id, priority="info",   title="Ginger Ready for Harvest",     body="Suprabha ginger at 210 DAS. Leaves yellowing — initiate partial harvest for green ginger."),
            Notification(farm_id=fm4.id, priority="info",   title="Cotton Boll Opening — MP3",    body="Bunny BT bolls 55% open. Schedule harvesting team for 7–10 days."),
        ])

        db.add_all([
            HistoryEntry(farm_id=fm4.id, entry_type="Crop",    title="Soybean Harvest — Kharif 2025",  detail="JS-9305 yield: 22 qtl/ac. Sold to SAMPAC at ₹4,300/qtl.",               date=ago(200)),
            HistoryEntry(farm_id=fm4.id, entry_type="Crop",    title="Chickpea Harvest — Rabi 2025–26",detail="JG-14 yield: 13 qtl/ac. Delivered to NAFED procurement centre.",          date=ago(160)),
            HistoryEntry(farm_id=fm4.id, entry_type="Animal",  title="Lakshmi calved — Male calf",     detail="TAG-MP104 HF Crossbred delivered healthy bull calf. Colostrum given.",     date=ago(38)),
            HistoryEntry(farm_id=fm4.id, entry_type="Scan",    title="AI Disease Scan — Soybean",      detail="Bacterial pustule detected at early stage. Recommended copper oxychloride.", date=ago(15)),
        ])

    db.commit()
    print("[OK] 4-User Production Dataset seeded: Punjab, Karnataka, Assam, Madhya Pradesh")
