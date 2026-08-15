"""
=============================================================================
DATASET 2: CROP ACTIVITY & WEATHER ADVISORY
=============================================================================
For each of the 14 crops we cover:
  - All major growth stages (Germination → Vegetative → Flowering →
    Fruit/Grain Development → Maturity/Harvest)
  - Specific activity, fertilizer schedule, irrigation guidance per stage
  - 5 weather-condition overrides that fire on top of the base schedule

Weather triggers:
  1. rain_tomorrow       → postpone spraying / fertigation, open drains
  2. heatwave            → increase irrigation, apply mulch
  3. high_humidity       → preventive fungicide, avoid overhead watering
  4. frost_warning       → night irrigation heat buffer, cover nursery beds
  5. harvest_imminent    → enforce PHI, withhold water, clean storage
"""

from __future__ import annotations
from typing import Any

# ─────────────────────────────────────────────────────────────────────────────
# WEATHER-TRIGGER RULE TABLE
# Applies ACROSS all crops and stages as an override / alert layer
# ─────────────────────────────────────────────────────────────────────────────
WEATHER_RULES: list[dict[str, Any]] = [
    {
        "trigger_id": "rain_tomorrow",
        "keywords": ["rain", "thunderstorm", "precipitation", "overcast_rain", "heavy rain"],
        "alert_label": "Rain Forecast Alert",
        "action": (
            "POSTPONE all foliar fertilizer sprays and pesticide applications. "
            "Rain washes active ingredients before absorption and causes chemical runoff."
        ),
        "irrigation_directive": (
            "SUSPEND scheduled irrigation – rain will supply sufficient moisture. "
            "Check field bunds to prevent waterlogging."
        ),
        "protective_measure": (
            "Clear drainage channels and ensure water can exit the field freely "
            "within 30 minutes of heavy downpour."
        ),
        "reschedule_guidance": "Reschedule sprays within 24 hrs after rain, once leaf surface is dry.",
    },
    {
        "trigger_id": "heatwave",
        "keywords": ["heatwave", "high_temp", "drought", "hot_dry", "extreme heat", "loo"],
        "alert_label": "Heat & Moisture Stress Alert",
        "action": (
            "Increase irrigation frequency. Apply organic mulch (paddy straw 5 cm) "
            "around root zone to conserve moisture and lower soil temperature."
        ),
        "irrigation_directive": (
            "PROVIDE light, frequent drip/micro-sprinkler irrigation in early morning "
            "(05:00–07:00) and late evening (19:00–21:00) to minimise evapotranspiration loss."
        ),
        "protective_measure": (
            "Apply anti-transpirant / Kaolin clay spray (2%) on fruit canopy to reduce "
            "sun-scorch and excessive transpiration."
        ),
        "reschedule_guidance": "Avoid heavy dose chemical sprays during peak daytime heat; reschedule to evening.",
    },
    {
        "trigger_id": "high_humidity",
        "keywords": ["fog", "high_humidity", "cloudy", "dew", "mist", "overcast_humid"],
        "alert_label": "Fungal Disease Risk Alert",
        "action": (
            "CONDITIONS IDEAL FOR FUNGAL SPORE GERMINATION. Apply preventive "
            "bio-fungicide (Trichoderma @ 5 g/L or Copper Oxychloride @ 2.5 g/L) "
            "before humidity exceeds 85% consistently."
        ),
        "irrigation_directive": (
            "SWITCH ENTIRELY TO DRIP – avoid all overhead sprinklers to keep "
            "leaf surface dry and reduce free moisture on canopy."
        ),
        "protective_measure": (
            "Increase plant row spacing air-flow. Prune dense lower foliage for "
            "better ventilation. Remove affected leaves and destroy."
        ),
        "reschedule_guidance": "Spray fungicide in early morning so it dries before night humidity peaks.",
    },
    {
        "trigger_id": "frost_warning",
        "keywords": ["frost", "freezing", "cold_wave", "below_zero", "ice"],
        "alert_label": "Frost / Cold Wave Warning",
        "action": (
            "Protect sensitive crops and nursery beds. Light evening sprinkler irrigation "
            "releases latent heat of fusion (~80 cal/g) as water freezes, keeping leaf temp above 0°C."
        ),
        "irrigation_directive": (
            "Run light overhead sprinklers overnight across orchards and tender vegetable crops. "
            "Do NOT use drip – surface thermal protection requires overhead spray."
        ),
        "protective_measure": (
            "Cover nursery beds and young transplants with agro-film / straw mulch blanket. "
            "Apply straw smoke in border areas if temperature drops below 2°C."
        ),
        "reschedule_guidance": "Resume normal activities once temperature rises above 5°C in the morning.",
    },
    {
        "trigger_id": "harvest_imminent",
        "keywords": ["maturity", "ripe", "pre_harvest", "harvest_time", "picking_due"],
        "alert_label": "Harvest Window Advisory",
        "action": (
            "STOP all synthetic chemical spraying to honour Pre-Harvest Intervals (PHI). "
            "Clean and sanitise harvesting crates, storage containers and transport vehicles."
        ),
        "irrigation_directive": (
            "WITHHOLD irrigation 3–7 days before scheduled harvest to improve "
            "fruit sugar concentration, firmness and post-harvest shelf life."
        ),
        "protective_measure": (
            "Harvest during early morning (05:00–09:00) when ambient temperature is lowest. "
            "Avoid mechanical bruising; use padded crates."
        ),
        "reschedule_guidance": "Resume fertilizer and irrigation only after all harvesting is complete for that flush.",
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# CROP GROWTH STAGE ACTIVITY RULES
# 14 crops × 4–5 stages = ~60 stage records
# Fields: crop, growth_stage, das_min, das_max, activity, fertilizer,
#         irrigation, standard_action
# ─────────────────────────────────────────────────────────────────────────────
CROP_STAGE_RULES: list[dict[str, Any]] = [

    # ═══════════════════════════════════════════════════════════════════════
    # TOMATO
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Tomato", "growth_stage": "Nursery & Seedling",
        "das_min": 0, "das_max": 25,
        "activity": "Nursery bed preparation; seed treatment with Trichoderma 5 g/kg; apply silver plastic mulch on main beds; thin overcrowded seedlings at 12 DAS.",
        "fertilizer": "FYM 25 t/ha basal; 19:19:19 @ 2 g/L foliar spray at 18 DAS to establish root mass.",
        "irrigation": "Light daily rose-can watering on nursery beds; maintain moderate but even moisture.",
        "standard_action": "Harden seedlings 4 days before transplanting by reducing water and exposing to outdoor conditions.",
    },
    {
        "crop": "Tomato", "growth_stage": "Vegetative & Trellising",
        "das_min": 26, "das_max": 50,
        "activity": "Transplant to main field at 45×60 cm; install bamboo stakes and jute twine; first hand-weeding; remove lower soil-contact leaves.",
        "fertilizer": "Basal DAP 50 kg/ha + Urea 25 kg/ha top dress; Magnesium Sulphate 2 g/L foliar at 35 DAS.",
        "irrigation": "Drip every 2–3 days; target 25–30 mm/week; avoid wetting foliage.",
        "standard_action": "Remove all side suckers below the first fruit-set truss to maintain single/double-stem vertical structure.",
    },
    {
        "crop": "Tomato", "growth_stage": "Flowering & Fruit Set",
        "das_min": 51, "das_max": 75,
        "activity": "Install Helicoverpa pheromone traps; shake trusses gently at 10:00–12:00 to assist pollination; spray Boron 1 g/L to improve fruit set.",
        "fertilizer": "13:0:45 (Potassium Nitrate) 3 g/L + Calcium Nitrate 2 g/L foliar; Boron 1 g/L.",
        "irrigation": "Critical: consistent uniform moisture every 2 days to prevent Blossom End Rot (BER).",
        "standard_action": "NEVER allow soil to dry completely then irrigate heavily – causes fruit cracking and BER.",
    },
    {
        "crop": "Tomato", "growth_stage": "Fruit Development & Harvesting",
        "das_min": 76, "das_max": 120,
        "activity": "Support heavy fruit trusses with strings; remove bottom yellowed/diseased leaves; harvest at breaker stage for long-distance markets, ripe stage for local.",
        "fertilizer": "0:0:50 (SOP) 4 g/L to enhance fruit colour, firmness and sugar; stop fertigation 10 days pre-final harvest.",
        "irrigation": "Maintain moderate uniform moisture; reduce water 3 days before peak picking to improve shelf life.",
        "standard_action": "Harvest in early morning; cool in shade immediately; never mix diseased and healthy fruits in same crate.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # WHEAT
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Wheat", "growth_stage": "Crown Root Initiation (CRI & Early Growth)",
        "das_min": 0, "das_max": 25,
        "activity": "Pre-sowing seed treatment with Carboxin/Thiram @ 2 g/kg; first weeding at 20 DAS; ensure optimum seed-to-soil contact.",
        "fertilizer": "Basal application: DAP 100 kg/ha + MOP 40 kg/ha + Zinc Sulphate 25 kg/ha; top dress 1/3 Nitrogen (Urea 45 kg/ha).",
        "irrigation": "Critical Crown Root Initiation (CRI) irrigation at 21 DAS is mandatory for tiller initiation.",
        "standard_action": "Avoid standing water in wheat field; excessive moisture at CRI causes collar rot and stunted root architecture.",
    },
    {
        "crop": "Wheat", "growth_stage": "Tillering & Jointing Stage",
        "das_min": 26, "das_max": 55,
        "activity": "Broadleaf weed management (Metsulfuron methyl @ 4 g/ha at 30–35 DAS); inspect for termite mounds and aphid colonies.",
        "fertilizer": "Second top-dress of Urea (45 kg/ha) at 40–45 DAS after second irrigation; spray 19:19:19 @ 2 g/L for vigor.",
        "irrigation": "Second irrigation at late tillering (40–45 DAS); third irrigation at late jointing (55 DAS).",
        "standard_action": "Scout for yellow rust pustules on upper leaves; spray Propiconazole 25% EC @ 1 ml/L if stripe rust appears.",
    },
    {
        "crop": "Wheat", "growth_stage": "Booting & Flowering / Heading",
        "das_min": 56, "das_max": 85,
        "activity": "Monitor for armyworm and ear-cutting caterpillars; install yellow sticky traps; inspect flag leaf health.",
        "fertilizer": "Foliar spray of 0:52:34 (MKP) @ 3 g/L + Potassium Schoenite @ 2 g/L to boost spikelet fertility and grain number.",
        "irrigation": "Critical flowering irrigation at 70–75 DAS; water stress at this stage causes flower abortion and empty ear-heads.",
        "standard_action": "Do NOT apply heavy overhead flood irrigation on windy days to prevent lodging (falling over) of tall stalks.",
    },
    {
        "crop": "Wheat", "growth_stage": "Milking & Grain Filling",
        "das_min": 86, "das_max": 115,
        "activity": "Foliar spray of 13:0:45 (Potassium Nitrate) @ 3 g/L to enhance starch accumulation and 1000-grain test weight.",
        "fertilizer": "No soil nitrogen at this stage; foliar Potassium Sulphate (0:0:50) @ 2.5 g/L if terminal heat stress is forecasted.",
        "irrigation": "Light irrigation at dough stage (95–100 DAS) during morning hours; stops kernel shrivelling.",
        "standard_action": "Maintain soil moisture to protect developing grains from unseasonal high daytime temperatures (heat waves).",
    },
    {
        "crop": "Wheat", "growth_stage": "Maturity & Harvesting",
        "das_min": 116, "das_max": 150,
        "activity": "Check grain hardness (moisture < 12–14%); combine harvest or manual sickle reaping during clear sunny hours.",
        "fertilizer": "Zero fertilizer application; Pre-Harvest Interval fully elapsed.",
        "irrigation": "WITHHOLD all irrigation 12–15 days before harvest to facilitate even drying and field combine machinery entry.",
        "standard_action": "Sun-dry threshed grains to 10% moisture before bagging in clean gunny bags treated with Deltamethrin.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # WHEAT
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Wheat", "growth_stage": "Crown Root Initiation (CRI & Early Growth)",
        "das_min": 0, "das_max": 25,
        "activity": "Pre-sowing seed treatment with Carboxin/Thiram @ 2 g/kg; first weeding at 20 DAS; ensure optimum seed-to-soil contact.",
        "fertilizer": "Basal application: DAP 100 kg/ha + MOP 40 kg/ha + Zinc Sulphate 25 kg/ha; top dress 1/3 Nitrogen (Urea 45 kg/ha).",
        "irrigation": "Critical Crown Root Initiation (CRI) irrigation at 21 DAS is mandatory for tiller initiation.",
        "standard_action": "Avoid standing water in wheat field; excessive moisture at CRI causes collar rot and stunted root architecture.",
    },
    {
        "crop": "Wheat", "growth_stage": "Tillering & Jointing Stage",
        "das_min": 26, "das_max": 55,
        "activity": "Broadleaf weed management (Metsulfuron methyl @ 4 g/ha at 30–35 DAS); inspect for termite mounds and aphid colonies.",
        "fertilizer": "Second top-dress of Urea (45 kg/ha) at 40–45 DAS after second irrigation; spray 19:19:19 @ 2 g/L for vigor.",
        "irrigation": "Second irrigation at late tillering (40–45 DAS); third irrigation at late jointing (55 DAS).",
        "standard_action": "Scout for yellow rust pustules on upper leaves; spray Propiconazole 25% EC @ 1 ml/L if stripe rust appears.",
    },
    {
        "crop": "Wheat", "growth_stage": "Booting & Flowering / Heading",
        "das_min": 56, "das_max": 85,
        "activity": "Monitor for armyworm and ear-cutting caterpillars; install yellow sticky traps; inspect flag leaf health.",
        "fertilizer": "Foliar spray of 0:52:34 (MKP) @ 3 g/L + Potassium Schoenite @ 2 g/L to boost spikelet fertility and grain number.",
        "irrigation": "Critical flowering irrigation at 70–75 DAS; water stress at this stage causes flower abortion and empty ear-heads.",
        "standard_action": "Do NOT apply heavy overhead flood irrigation on windy days to prevent lodging of tall stalks.",
    },
    {
        "crop": "Wheat", "growth_stage": "Milking & Grain Filling",
        "das_min": 86, "das_max": 115,
        "activity": "Foliar spray of 13:0:45 (Potassium Nitrate) @ 3 g/L to enhance starch accumulation and 1000-grain test weight.",
        "fertilizer": "No soil nitrogen at this stage; foliar Potassium Sulphate (0:0:50) @ 2.5 g/L if terminal heat stress is forecasted.",
        "irrigation": "Light irrigation at dough stage (95–100 DAS) during morning hours; stops kernel shrivelling.",
        "standard_action": "Maintain soil moisture to protect developing grains from unseasonal high daytime temperatures.",
    },
    {
        "crop": "Wheat", "growth_stage": "Maturity & Harvesting",
        "das_min": 116, "das_max": 150,
        "activity": "Check grain hardness (moisture < 12–14%); combine harvest or manual sickle reaping during clear sunny hours.",
        "fertilizer": "Zero fertilizer application; Pre-Harvest Interval fully elapsed.",
        "irrigation": "WITHHOLD all irrigation 12–15 days before harvest to facilitate even drying and field combine machinery entry.",
        "standard_action": "Sun-dry threshed grains to 10% moisture before bagging in clean gunny bags.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # POTATO
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Potato", "growth_stage": "Sprouting & Emergence",
        "das_min": 0, "das_max": 20,
        "activity": "Plant certified cut tubers treated with Mancozeb 2 g/kg; form furrow ridges 60×20 cm; pre-emergence weed control with Pendimethalin.",
        "fertilizer": "Basal: 12:32:16 NPK @ 150 kg/ha + Zinc Sulphate 25 kg/ha + FYM 25 t/ha.",
        "irrigation": "Pre-sowing irrigation to bring soil to field capacity; light irrigation at 5 DAS if soil dry.",
        "standard_action": "Check 15 DAS for uniform emergence; gap-fill missing plants with sprouted reserve tubers immediately.",
    },
    {
        "crop": "Potato", "growth_stage": "Vegetative & Earthing Up",
        "das_min": 21, "das_max": 45,
        "activity": "First earthing-up at 30 DAS to cover developing stolons; first hand / chemical weeding; hilling to protect tubers from sunlight greening.",
        "fertilizer": "Top dress Urea 50 kg/ha just before earthing up; Neem Cake 200 kg/ha around root zone.",
        "irrigation": "Furrow irrigation every 7–10 days; avoid water topping over ridges.",
        "standard_action": "Well-formed ridges insulate developing tubers and prevent green-skin problem (solanine toxicity).",
    },
    {
        "crop": "Potato", "growth_stage": "Tuber Bulking",
        "das_min": 46, "das_max": 75,
        "activity": "Monitor foliage closely for early/late blight (concentric rings or water-soaked lesions); spray preventive Mancozeb at first sign.",
        "fertilizer": "Potassium Sulphate (0:0:50) @ 5 g/L + Boron 1 g/L foliar spray to maximise tuber size and quality.",
        "irrigation": "MOST CRITICAL STAGE: Irrigate every 5–7 days; uniform consistent moisture maximises tuber bulk.",
        "standard_action": "Never allow soil around bulking tubers to become bone-dry; drought stress now causes malformed tubers.",
    },
    {
        "crop": "Potato", "growth_stage": "Maturity & Dehaulming",
        "das_min": 76, "das_max": 110,
        "activity": "Dehaulm (cut top foliage) 10–12 days before harvest to harden potato skin for storage; monitor for volunteer regrowth.",
        "fertilizer": "No fertilizer application; any late nitrogen causes soft tubers prone to bacterial rot.",
        "irrigation": "Completely withhold irrigation 10 days before harvest to dry soil for mechanical lifting.",
        "standard_action": "Harvest with potato digger; avoid mechanical skinning; cure tubers 7 days at 15°C before cold storage.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # CORN (MAIZE)
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Corn", "growth_stage": "Germination & Seedling",
        "das_min": 0, "das_max": 20,
        "activity": "Sow at 60×20 cm; treat seed with Azospirillum + PSB biofertilizer; apply pre-emergence weedicide (Atrazine 1.5 kg a.i./ha).",
        "fertilizer": "Basal: 10:26:26 @ 100 kg/ha + Zinc Sulphate 25 kg/ha at sowing.",
        "irrigation": "Pre-sowing irrigation; light irrigation at 5–7 DAS; avoid heavy watering at emergence.",
        "standard_action": "Thin to one healthy plant per hill at 12 DAS if multiple germinated; retain tallest seedling.",
    },
    {
        "crop": "Corn", "growth_stage": "Knee-High Vegetative",
        "das_min": 21, "das_max": 45,
        "activity": "First inter-cultivation weeding at 25 DAS; earthing up; scout leaf whorls for Fall Armyworm (FAW) frass and feeding holes.",
        "fertilizer": "First Urea top-dress 50 kg/ha around root zone; incorporate before earthing up.",
        "irrigation": "Irrigate at 25–30 DAS; ensure no waterlogging in root zone.",
        "standard_action": "Apply Emamectin Benzoate 0.4 g/L into leaf whorls if FAW larvae (green caterpillars) found.",
    },
    {
        "crop": "Corn", "growth_stage": "Tasseling & Silking",
        "das_min": 46, "das_max": 70,
        "activity": "Monitor silk emergence; pollen shed visible; avoid all chemical sprays in 10:00–14:00 window when bees actively pollinate silks.",
        "fertilizer": "Second Urea 35 kg/ha top-dress + 13:0:45 foliar 3 g/L to maximise grain number.",
        "irrigation": "MOST CRITICAL STAGE: Moisture stress now = barren ears and severe yield loss. Irrigate every 4–6 days.",
        "standard_action": "Any drought stress at this stage is IRREVERSIBLE – prioritise corn irrigation over other crops if water is limited.",
    },
    {
        "crop": "Corn", "growth_stage": "Grain Filling & Harvest",
        "das_min": 71, "das_max": 105,
        "activity": "Monitor cob husk for drying; erect bird-scaring devices; harvest when a hard black layer forms at grain base (milk-line disappears).",
        "fertilizer": "No fertilizer; excessive N at grain fill causes lodging.",
        "irrigation": "Terminal irrigation at dough stage only; withhold 10 days before harvest.",
        "standard_action": "Shell cobs and dry grain to <12% moisture before storage to prevent aflatoxin contamination.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # BELL PEPPER
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Bell Pepper", "growth_stage": "Nursery & Transplanting",
        "das_min": 0, "das_max": 30,
        "activity": "Prepare nursery pro-trays; sow single seed/cell; transplant 4–6 leaf seedling onto silver-black mulch beds with drip tape.",
        "fertilizer": "Pro-tray media: cocopeat 50% + perlite 25% + vermicompost 25%; 19:19:19 @ 1 g/L fortnightly in nursery.",
        "irrigation": "Micro-mist nursery 2–3 times daily; daily drip 1 hour after transplanting to establish roots.",
        "standard_action": "Remove crown flower bud (first central bud) at transplanting to push lateral branching.",
    },
    {
        "crop": "Bell Pepper", "growth_stage": "Vegetative & Branching",
        "das_min": 31, "das_max": 55,
        "activity": "Tie lateral branches to Y-support string; inspect for thrips and broad mites using 10× hand lens weekly.",
        "fertilizer": "Fertigation: 19:19:19 @ 3 kg/acre weekly + MgSO4 2 g/L + Zinc 0.5 g/L foliar fortnightly.",
        "irrigation": "Drip 1.5–2 hours daily in summer; 1 hour in cooler weather; target 20–25 mm/week.",
        "standard_action": "Maintain plant at 2-stem Y-structure; remove all stems below first fork. Install sticky yellow traps for whitefly/thrips monitoring.",
    },
    {
        "crop": "Bell Pepper", "growth_stage": "Flowering & Continuous Fruit Set",
        "das_min": 56, "das_max": 100,
        "activity": "Begin harvesting green fruits once full size reached; harvest every 7–10 days; leave 1 cm pedicel attached.",
        "fertilizer": "Alternate weekly: Week A = Calcium Nitrate 3 g/L + 13:0:45 3 g/L; Week B = 0:0:50 4 g/L + Boron 1 g/L.",
        "irrigation": "Consistent drip daily; any moisture stress causes bitter/malformed fruits and Blossom End Rot.",
        "standard_action": "Harvest before colour change for green pepper; allow to fully colour (red/yellow) for coloured premium grades.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # SOYBEAN
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Soybean", "growth_stage": "Germination & Establishment",
        "das_min": 0, "das_max": 14,
        "activity": "Treat seed with Rhizobium + PSB inoculant slurry 2 hours before sowing; sow at 45×5 cm; apply Pendimethalin pre-emergence.",
        "fertilizer": "Basal: SSP (Single Super Phosphate) 150 kg/ha at sowing; no Nitrogen – Rhizobium fixes all N required.",
        "irrigation": "Monsoon rainfed; if rainfall delayed past 10 DAS, provide single light protective irrigation.",
        "standard_action": "Check root nodule colour at 21 DAS: pink/red nodules = active N-fixation; white nodules = re-inoculate.",
    },
    {
        "crop": "Soybean", "growth_stage": "Vegetative & Nodulation",
        "das_min": 15, "das_max": 40,
        "activity": "Hand/mechanical weeding at 20 DAS; intercultivation with bullock-drawn blade harrow; scout for semi-looper and soybean leaf folder.",
        "fertilizer": "Foliar spray 2% DAP (Diammonium Phosphate) solution at 30 DAS if nodulation weak; MgSO4 1 g/L.",
        "irrigation": "Rainfed; provide supplemental irrigation only if no rainfall >10 days.",
        "standard_action": "Perform hoeing at 20 DAS to loosen soil for maximum nodule aeration and root activity.",
    },
    {
        "crop": "Soybean", "growth_stage": "Flowering & Pod Development",
        "das_min": 41, "das_max": 70,
        "activity": "Scout intensely for pod borer (Maruca vitrata) and soybean rust; spray Chlorantraniliprole for borer, Hexaconazole for rust.",
        "fertilizer": "0:52:34 (MKP) @ 5 g/L foliar at pod initiation; Sulphur 0.5 g/L for oil quality.",
        "irrigation": "Provide 1 supplemental irrigation at pod fill if monsoon has withdrawn; critical for final seed weight.",
        "standard_action": "DO NOT apply any insecticide during open flower stages; wait for late afternoon when pollinators are less active.",
    },
    {
        "crop": "Soybean", "growth_stage": "Maturity & Harvest",
        "das_min": 71, "das_max": 105,
        "activity": "Harvest when 95% of pods turn brown; leaves yellow and shed; use combine or manual sickle cutting.",
        "fertilizer": "No fertilizer required.",
        "irrigation": "No irrigation; dry conditions ensure easy threshing and reduced mycotoxin risk.",
        "standard_action": "Dry harvested material to <12% grain moisture; store in moisture-proof bins with fumigant sachets.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # STRAWBERRY
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Strawberry", "growth_stage": "Planting & Runner Establishment",
        "das_min": 0, "das_max": 30,
        "activity": "Prepare raised beds 30 cm high × 60 cm wide; apply black plastic mulch; transplant runners from certified mother plants; install drip tape under mulch.",
        "fertilizer": "Basal: FYM 40 t/ha + SSP 300 kg/ha + MOP 150 kg/ha; 12:61:0 (MAP) @ 2 kg/acre via fertigation at 15 DAS.",
        "irrigation": "Critical first 7 days: drip 2–3 times daily for 30 minutes to establish roots; reduce to twice daily from 7 DAS.",
        "standard_action": "Remove all runner stolons for the first 30 days to direct energy to crown and root development.",
    },
    {
        "crop": "Strawberry", "growth_stage": "Vegetative Crown Expansion",
        "das_min": 31, "das_max": 60,
        "activity": "Remove dead leaves; scout for two-spotted spider mite (check leaf undersides); apply Abamectin if >3 mites per leaf.",
        "fertilizer": "Fertigation: 19:19:19 @ 3 kg/acre weekly + Calcium Nitrate 2 kg/acre weekly; Boron 1 g/L monthly.",
        "irrigation": "Drip 2 hours daily morning; maintain root zone at 60–70% field capacity.",
        "standard_action": "Install bird nets and slug-bait pellets before first flower emergence to protect fruits.",
    },
    {
        "crop": "Strawberry", "growth_stage": "Flowering & Fruiting",
        "das_min": 61, "das_max": 150,
        "activity": "Hand-pick ripe fruits every 2–3 days; inspect for Botrytis grey mould (fluffy grey coating); remove infected fruits immediately.",
        "fertilizer": "Week A: Calcium Nitrate 3 g/L + K2SO4 4 g/L; Week B: 13:0:45 4 g/L + Humic Acid 2 ml/L.",
        "irrigation": "Drip 1.5 hours daily; NEVER wet fruit or leaves in evenings – Botrytis thrives on wet surfaces.",
        "standard_action": "Harvest fruits with intact calyx (green cap) attached; cool in shade immediately; do not stack more than 2 crate layers high.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # SQUASH
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Squash", "growth_stage": "Germination & Vine Establishment",
        "das_min": 0, "das_max": 18,
        "activity": "Sow 2 seeds per pit at 3×2 m spacing; thin to 1 plant/pit at 10 DAS; apply pre-emergence herbicide if weeds are a recurring issue.",
        "fertilizer": "Basal: FYM 20 t/ha + 8:16:8 NPK @ 150 kg/ha at sowing.",
        "irrigation": "Pre-sowing irrigation; light irrigation at 5 DAS to break soil crust.",
        "standard_action": "Direct sow – avoid transplanting squash as it does not tolerate root disturbance.",
    },
    {
        "crop": "Squash", "growth_stage": "Vine Running & Flowering",
        "das_min": 19, "das_max": 40,
        "activity": "Train vines on wire trellis if growing vertically; hand pollinate female flowers at 08:00–10:00 using male flower pollen if bee activity is low.",
        "fertilizer": "Urea 25 kg/ha top-dress; Potassium Sulphate 30 kg/ha; Boron 1 g/L foliar for fruit set.",
        "irrigation": "Furrow or drip every 3–4 days; target 25–30 mm/week during flowering.",
        "standard_action": "Female flowers have a tiny fruit behind the petals; male flowers have only a thin stalk – pollinate female with fresh male pollen.",
    },
    {
        "crop": "Squash", "growth_stage": "Fruit Development & Harvest",
        "das_min": 41, "das_max": 70,
        "activity": "Harvest immature squash every 4–5 days for maximum continuous yield; leaving over-ripe fruits on vine halts new flowering.",
        "fertilizer": "0:0:50 SOP @ 3 g/L foliar to improve fruit firmness; no Urea at this stage.",
        "irrigation": "Reduce irrigation slightly to firm up fruits and reduce powdery mildew risk.",
        "standard_action": "Inspect all leaves for white powdery coating of Powdery Mildew; spray Sulphur 3 g/L or Trifloxystrobin at first appearance.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # GRAPE
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Grape", "growth_stage": "Pruning & Bud Burst",
        "das_min": 0, "das_max": 25,
        "activity": "Annual cane pruning to 2-bud spurs; apply dormant spray (lime sulphur 5%) before bud burst to kill overwintering Downy Mildew spores.",
        "fertilizer": "Apply 20 t/ha FYM + 200 g/vine NPK 19:19:19 around drip zone just before bud burst.",
        "irrigation": "First post-pruning irrigation to break full dormancy; drip every 5–7 days.",
        "standard_action": "Tie all canes to the trellis wire immediately after pruning to orient new growth uniformly.",
    },
    {
        "crop": "Grape", "growth_stage": "Shoot Growth & Canopy Development",
        "das_min": 26, "das_max": 55,
        "activity": "Shoot thinning (retain 6–8 shoots per vine); remove any suckers from trunk; first Downy Mildew preventive spray.",
        "fertilizer": "Fertigation: 19:19:19 @ 5 g/vine/week + MgSO4 0.5% foliar; Zinc 0.3% foliar at 35 DAS.",
        "irrigation": "Drip every 3–4 days; critical to keep soil moisture consistent during shoot growth.",
        "standard_action": "Spray protective copper-based Downy Mildew fungicide (Metalaxyl + Mancozeb 2 g/L) at every 10-day interval.",
    },
    {
        "crop": "Grape", "growth_stage": "Flowering & Berry Set",
        "das_min": 56, "das_max": 80,
        "activity": "Cluster thinning to 1–2 clusters/shoot for large berry size; dust Sulphur at 80% flowering for Powdery Mildew; never wet spray during full bloom.",
        "fertilizer": "0:52:34 (MKP) @ 2 g/L foliar at 10% and 80% flowering; Boron 1 g/L at 10% bloom.",
        "irrigation": "Reduce irrigation slightly during full bloom to prevent berry shattering; resume normal after berry set.",
        "standard_action": "Apply gibberellic acid (GA3 @ 25–50 ppm) at 50% bloom if seedless varieties are grown, to elongate berry and cluster.",
    },
    {
        "crop": "Grape", "growth_stage": "Berry Development & Harvest",
        "das_min": 81, "das_max": 150,
        "activity": "Colour break (veraison) marks start of sugar accumulation; stop all N-containing fertilizers; remove dense leaves blocking sun on clusters.",
        "fertilizer": "Potassium Sulphate 300 g/vine via drip fertigate to maximise sugar (Brix) accumulation.",
        "irrigation": "Drastically reduce irrigation after veraison – stress improves sugar/acid balance; completely stop 10 days before harvest.",
        "standard_action": "Harvest when Brix ≥ 18 (table), ≥ 22 (wine/raisin); use sharp scissors to retain intact cluster.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # ORANGE
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Orange", "growth_stage": "Stress Induction & Bud Differentiation",
        "das_min": 0, "das_max": 45,
        "activity": "Apply drought/stress to induce flower bud differentiation (Bahar treatment); completely withhold water for 40–60 days in dry season.",
        "fertilizer": "Apply 20 kg FYM + 200 g Urea + 200 g SSP + 100 g MOP per tree at start of stress cycle.",
        "irrigation": "COMPLETELY WITHHOLD – deliberate dry stress triggers the tree to shift from vegetative to reproductive mode.",
        "standard_action": "Thin dense interior branches to allow light penetration for uniform flower bud setting on entire canopy.",
    },
    {
        "crop": "Orange", "growth_stage": "Flower Flush & Fruit Set",
        "das_min": 46, "das_max": 90,
        "activity": "Resume irrigation at bud break; spray Boron 1 g/L + Zinc 0.5 g/L at balloon stage of flowers; hand thin excess fruitlets if load is very high.",
        "fertilizer": "Boron 1 g/L + 0:52:34 @ 3 g/L foliar at petal fall for improved fruit set; K2SO4 via drip.",
        "irrigation": "Resume drip immediately after flower bud swelling; maintain consistent moisture through fruit set.",
        "standard_action": "Natural June-drop will remove 70–80% of fruitlets – this is normal; do not be alarmed.",
    },
    {
        "crop": "Orange", "growth_stage": "Fruit Development & Colour",
        "das_min": 91, "das_max": 200,
        "activity": "Apply 2,4-D (4 ppm) spray at marble stage to reduce pre-harvest fruit drop; apply reflective mulch under canopy to improve colour.",
        "fertilizer": "Potassium Nitrate 13:0:45 @ 3 g/L foliar monthly; Calcium Nitrate 3 g/L for peel quality.",
        "irrigation": "Steady drip every 4–5 days through fruit swell; reduce 15 days before harvest.",
        "standard_action": "Spray Ethephon (39% SL @ 250 ppm) 30 days before target harvest date to advance and uniform fruit colouring.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # APPLE
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Apple", "growth_stage": "Dormancy Breaking & Silver Tip",
        "das_min": 0, "das_max": 30,
        "activity": "Apply DNOC (Dinitro-ortho-cresol 0.5%) dormant spray; prune dead/crossing branches; apply Bordeaux mixture (8:8:100) before bud burst.",
        "fertilizer": "FYM 30 kg/tree + 600 g Urea + 300 g SSP + 300 g MOP applied in soil around drip zone.",
        "irrigation": "First pre-bloom irrigation when soil starts thawing; drip at 5-day intervals.",
        "standard_action": "Inspect every branch for Apple Scab overwintering lesions; Bordeaux spray is non-negotiable at silver-tip stage.",
    },
    {
        "crop": "Apple", "growth_stage": "Bloom & Pollination",
        "das_min": 31, "das_max": 50,
        "activity": "Release honey bee hives (8 hives/ha) for cross-pollination; avoid ALL insecticide sprays during bloom; remove frost-damaged open flowers daily.",
        "fertilizer": "Boron 0.3% foliar at pink bud stage; NO fertilizer during full bloom.",
        "irrigation": "Light irrigation every 4–5 days; frost-protective night sprinklers if temperature forecasted below 0°C.",
        "standard_action": "This is the MOST CRITICAL window in apple production. Any mistake at bloom = 100% loss of that year's crop.",
    },
    {
        "crop": "Apple", "growth_stage": "Fruitlet Development & June Drop",
        "das_min": 51, "das_max": 90,
        "activity": "Chemical thinning: spray Carbaryl 1.5 g/L at petal fall + 10 days to reduce cluster; hand thin to 1 fruit/spur at 15 mm fruitlet size.",
        "fertilizer": "Urea 300 g/tree top dress; Calcium Chloride 0.4% foliar at 3-week intervals to prevent Bitter Pit.",
        "irrigation": "Drip every 5–7 days; consistent moisture during cell division phase is critical for final fruit size.",
        "standard_action": "Retain only the largest central fruitlet per cluster; rest should be manually removed by 60 DAS.",
    },
    {
        "crop": "Apple", "growth_stage": "Fruit Maturity & Harvest",
        "das_min": 91, "das_max": 160,
        "activity": "Apply Kaolin clay reflective spray at colour break; use Iodine starch test + starch pattern index to determine harvest maturity.",
        "fertilizer": "No Nitrogen from 90 DAS; Potassium Sulphate 300 g/tree via drip for colour development.",
        "irrigation": "Reduce to every 7–10 days; withhold completely 15 days before picking.",
        "standard_action": "Harvest when starch pattern index = 6–7 (scale of 8); use twist-and-lift motion to avoid breaking spurs.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # PEACH
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Peach", "growth_stage": "Dormancy & Pruning",
        "das_min": 0, "das_max": 25,
        "activity": "Annual dormant pruning to open vase shape; apply Bordeaux paste on cut wounds; thin out crossing branches and old 3-year wood.",
        "fertilizer": "FYM 25 kg/tree + 300 g Urea + 200 g SSP + 150 g MOP pre-bloom soil application.",
        "irrigation": "First pre-bloom irrigation; drip every 6–8 days.",
        "standard_action": "Peach is a very precocious bearer – fruit set can be excessive; chemical thinning is usually needed.",
    },
    {
        "crop": "Peach", "growth_stage": "Bloom & Fruit Set",
        "das_min": 26, "das_max": 50,
        "activity": "No chemical sprays at full bloom; place honey bee hives; protect from late frost with smoke pots or overhead sprinklers.",
        "fertilizer": "Boron 0.3% foliar at pink bud stage for improved fruit set.",
        "irrigation": "Light irrigation immediately after petal fall; avoid wetting ripening fruit.",
        "standard_action": "Manual or chemical thinning to 15–20 cm fruit spacing on every branch by 30 DAS after petal fall.",
    },
    {
        "crop": "Peach", "growth_stage": "Fruit Development & Harvest",
        "das_min": 51, "das_max": 120,
        "activity": "Apply brown rot fungicide (Iprodione 2 g/L) 3 weeks before harvest; install bird-scare; harvest fruit at firm-ripe stage.",
        "fertilizer": "Potassium Sulphate 200 g/tree via drip for firmness and colour; no Nitrogen from pit hardening.",
        "irrigation": "Keep soil evenly moist to prevent pit borer; withhold water 7 days before harvest.",
        "standard_action": "Harvest peaches in 2–3 passes as individual fruits mature at different rates on same tree.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # CHERRY
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Cherry", "growth_stage": "Dormancy & Pruning",
        "das_min": 0, "das_max": 25,
        "activity": "Dormant pruning for open-centre structure; apply Bordeaux mixture to all wounds; remove blind wood (unproductive old spurs).",
        "fertilizer": "25 kg FYM + 250 g Urea + 150 g SSP + 100 g MOP per tree.",
        "irrigation": "First pre-growth irrigation; drip every 7 days.",
        "standard_action": "Cherry requires two or more compatible varieties for cross-pollination; verify orchard variety mix.",
    },
    {
        "crop": "Cherry", "growth_stage": "Bloom & Fruit Set",
        "das_min": 26, "das_max": 45,
        "activity": "Deploy honey bee hives; NO sprays during bloom; frost protection is critical at this stage.",
        "fertilizer": "Boron 0.3% at balloon bud stage; no fertilizer during full bloom.",
        "irrigation": "Light pre-bloom irrigation only; heavy irrigation during bloom causes pollen washing.",
        "standard_action": "Cherry flowers for only 7–10 days; bee activity during this window determines entire year's crop.",
    },
    {
        "crop": "Cherry", "growth_stage": "Fruit Development & Harvest",
        "das_min": 46, "das_max": 80,
        "activity": "Apply calcium sprays every 10 days to prevent fruit cracking; cover trees with anti-bird net and anti-rain cover 2 weeks before harvest.",
        "fertilizer": "Calcium Chloride 0.5% foliar every 10 days from fruitlet to harvest.",
        "irrigation": "Maintain steady uniform drip; any sudden rainfall causes catastrophic fruit cracking – cover is essential.",
        "standard_action": "Harvest cherries with stalk attached using scissors; chill immediately to 0–2°C to retain firmness.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # BLUEBERRY
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Blueberry", "growth_stage": "Planting & First Year Establishment",
        "das_min": 0, "das_max": 60,
        "activity": "Prepare acidic beds with sulphur amendment to achieve pH 4.5–5.5; plant 2-year rooted plugs; mulch 10 cm pine bark or sawdust.",
        "fertilizer": "Ammonium Sulphate (acid-forming N) 30 g/plant; NO Urea or other alkaline fertilizers.",
        "irrigation": "Drip every day for 20 minutes in first month; reduce to alternate day once established; critical – blueberry is shallow-rooted.",
        "standard_action": "Remove all flower buds in Year 1 – do not allow any fruit set; all energy must go to root establishment.",
    },
    {
        "crop": "Blueberry", "growth_stage": "Flowering & Berry Development",
        "das_min": 61, "das_max": 130,
        "activity": "Introduce bumble bee hives; cross-pollination between varieties mandatory; thin excessive berries in Year 2 for larger berry size.",
        "fertilizer": "Ammonium Sulphate 50 g/plant; Sulphur 30 g/plant to maintain pH; no Phosphorus – blueberries have low P requirement.",
        "irrigation": "Drip daily; maintain soil moisture at 70% field capacity; mulch layer MUST be kept intact to conserve moisture.",
        "standard_action": "Pick berries when they turn deep blue-black and detach with gentle roll – wait 3–4 days after colour for full sweetness.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # RASPBERRY
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Raspberry", "growth_stage": "Planting & Cane Establishment",
        "das_min": 0, "das_max": 45,
        "activity": "Plant dormant canes 45 cm apart in rows 2.5 m wide; install T-bar trellis with 3 horizontal wires; mulch 8 cm straw around base.",
        "fertilizer": "FYM 30 t/ha + NPK 10:26:26 @ 200 kg/ha at planting time.",
        "irrigation": "Drip every 2–3 days; shallow roots require frequent light irrigation rather than heavy deep watering.",
        "standard_action": "Cut all canes to 25 cm after planting to encourage vigorous new primocane growth from root crown.",
    },
    {
        "crop": "Raspberry", "growth_stage": "Primocane Growth & Flowering",
        "das_min": 46, "das_max": 90,
        "activity": "Tie new primocanes to trellis as they grow; remove any diseased floricanes immediately; harvest begins on floricanes in Year 2.",
        "fertilizer": "Fertigation: 19:19:19 @ 3 kg/acre monthly; Calcium Nitrate 2 g/L foliar for cane strength.",
        "irrigation": "Drip every 2 days; avoid overhead watering – cane blight thrives in wet conditions.",
        "standard_action": "After fruiting, cut floricanes (2-year old) to ground level; RETAIN all current-year primocanes for next season's harvest.",
    },
    {
        "crop": "Raspberry", "growth_stage": "Fruit Set & Harvest",
        "das_min": 91, "das_max": 150,
        "activity": "Pick raspberries every 2 days at full red colour; handle gently – drupelets detach easily causing bruising.",
        "fertilizer": "0:0:50 SOP @ 3 g/L for fruit firmness and storage; no N at fruiting stage.",
        "irrigation": "Maintain drip every 2 days; consistent moisture critical – drought causes small seedy fruits.",
        "standard_action": "Chill harvested raspberries within 2 hours to 0–2°C; shelf life is only 2–4 days even under refrigeration.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # ONION
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Onion", "growth_stage": "Nursery & Seedling",
        "das_min": 0, "das_max": 25,
        "activity": "Prepare raised nursery beds; seed treatment with Thiram 3 g/kg; transplant 6–8 week old seedlings at 15 × 10 cm spacing.",
        "fertilizer": "Apply basal FYM 20 t/ha + 50 kg DAP + 50 kg MOP + 15 kg elemental Sulphur/acre for bulb pungency and firmness.",
        "irrigation": "Light daily sprinkler/drip irrigation for first 10 days to facilitate quick root establishment.",
        "standard_action": "Dip seedling roots in Carbendazim (1 g/L) solution for 15 minutes before transplanting to prevent damping off.",
    },
    {
        "crop": "Onion", "growth_stage": "Vegetative Foliage Growth",
        "das_min": 26, "das_max": 60,
        "activity": "Intercultural manual weeding at 30 and 45 DAS; maintain clean ridges; monitor for onion thrips (Thrips tabaci).",
        "fertilizer": "Top dress Urea @ 30 kg/Ac in two splits (30 & 45 DAS); foliar spray of 19:19:19 @ 3 g/L.",
        "irrigation": "Provide irrigation every 6–7 days in loamy soil; avoid water stagnation around root neck.",
        "standard_action": "Spray Mancozeb (2.5 g/L) + sticker if purple blotch lesions appear on lower leaf tips.",
    },
    {
        "crop": "Onion", "growth_stage": "Bulb Initiation & Enlargement",
        "das_min": 61, "das_max": 95,
        "activity": "Loosen surface soil around bulbs; ensure bulbs are partially exposed for uniform spherical swelling.",
        "fertilizer": "Foliar spray of 0:52:34 (MKP @ 4 g/L) + Boron (1 g/L) followed by Potassium Sulphate (0:0:50 @ 4 g/L) at 75 DAS.",
        "irrigation": "Regulate drip irrigation to maintain uniform 60–70% field capacity; avoid moisture fluctuation to prevent split bulbs.",
        "standard_action": "STOP all Nitrogen applications from 60 DAS onwards to prevent thick necks and poor storage quality.",
    },
    {
        "crop": "Onion", "growth_stage": "Neck Fall & Harvesting",
        "das_min": 96, "das_max": 150,
        "activity": "Harvest bulbs when 50–70% tops show natural neck fall; field cure bulbs with foliage for 3–5 days in shade.",
        "fertilizer": "No fertilizer application during maturity and harvesting.",
        "irrigation": "WITHHOLD irrigation completely 12–15 days before harvest to seal bulb necks and enhance storage life.",
        "standard_action": "Clip tops leaving 2.5 cm neck attached to bulb; store only well-cured bulbs in aerated onion storage structures.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # RICE / PADDY
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Rice", "growth_stage": "Nursery & Transplanting",
        "das_min": 0, "das_max": 25,
        "activity": "Puddle field thoroughly; level meticulously; transplant 20–25 day old seedlings (2–3 seedlings/hill) at 20 × 15 cm spacing.",
        "fertilizer": "Basal application: 50 kg DAP + 30 kg MOP + 10 kg Zinc Sulphate (21%) per acre.",
        "irrigation": "Maintain shallow standing water (2–3 cm) for 7 days post-transplanting to prevent seedling drying.",
        "standard_action": "Apply pre-emergence herbicide Pretilachlor 50 EC @ 500 ml/Ac within 3 days of transplanting in standing water.",
    },
    {
        "crop": "Rice", "growth_stage": "Active Tillering Phase",
        "das_min": 26, "das_max": 50,
        "activity": "Interculture with rotary weeder/cono-weeder; monitor for yellow stem borer dead hearts and leaf folder.",
        "fertilizer": "1st split top dressing: Urea @ 35 kg/Ac + Neem cake 10 kg/Ac into saturated soil.",
        "irrigation": "Adopt Alternate Wetting and Drying (AWD); allow water to recede to soil surface before reflooding.",
        "standard_action": "Install pheromone traps @ 5/Ac for yellow stem borer monitoring; spray Chlorantraniliprole if threshold exceeded.",
    },
    {
        "crop": "Rice", "growth_stage": "Panicle Initiation & Booting",
        "das_min": 51, "das_max": 80,
        "activity": "Field scouting for bacterial leaf blight and sheath blight along plant borders; maintain bunds.",
        "fertilizer": "2nd split top dressing: Urea @ 25 kg/Ac + MOP @ 15 kg/Ac at panicle initiation stage.",
        "irrigation": "Maintain 5 cm continuous standing water from panicle emergence through complete flowering.",
        "standard_action": "Spray Tricyclazole 75 WP @ 120 g/Ac prophylactically if weather is overcast and humid.",
    },
    {
        "crop": "Rice", "growth_stage": "Grain Filling & Harvesting",
        "das_min": 81, "das_max": 140,
        "activity": "Protect earheads from bird damage; harvest crop when 85% of panicles turn golden straw colour.",
        "fertilizer": "Foliar spray of 0:0:50 @ 1 kg/Ac at dough stage to enhance grain weight and minimize chaffy grains.",
        "irrigation": "Drain water completely from field 10–12 days prior to scheduled combine harvesting.",
        "standard_action": "Thresh and sun-dry grains on clean tarpaulins to bring grain moisture down to safe 12–14% for storage.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # COTTON
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Cotton", "growth_stage": "Emergence & Early Vegetative",
        "das_min": 0, "das_max": 30,
        "activity": "Seed treatment with Imidacloprid 5 g/kg; dibble seeds on ridges; gap filling within 10 DAS; thin to 1 plant/hill at 20 DAS.",
        "fertilizer": "Basal application: 50 kg SSP + 20 kg MOP + 10 kg Zinc Sulphate per acre.",
        "irrigation": "First light irrigation at 4–5 DAS for uniform germination; subsequent irrigation at 15-day intervals.",
        "standard_action": "Inspect lower leaf surface for sucking pests (jassids, aphids, thrips); spray neem oil 1500 ppm @ 3 ml/L if noticed.",
    },
    {
        "crop": "Cotton", "growth_stage": "Square Formation & Branching",
        "das_min": 31, "das_max": 65,
        "activity": "Intercultural hoeing; earthing up along plant rows to support tall stalks against strong winds.",
        "fertilizer": "Top dress Urea @ 35 kg/Ac + Magnesium Sulphate @ 10 kg/Ac to prevent magnesium deficiency leaf reddening.",
        "irrigation": "Irrigate at 10–12 day intervals; critical moisture stage for sympodial branch development.",
        "standard_action": "Install yellow sticky traps (10/Ac) and delta traps for spotted bollworm monitoring.",
    },
    {
        "crop": "Cotton", "growth_stage": "Flowering & Boll Development",
        "das_min": 66, "das_max": 110,
        "activity": "Scout 20 random bolls/Ac for pink bollworm entry holes and internal rots; detop apical bud at 90 DAS if crop exceeds 5 ft.",
        "fertilizer": "Foliar spray of Planofix (NAA @ 4 ml/15 L) + 13:0:45 (Potassium Nitrate @ 5 g/L) to prevent flower and boll shedding.",
        "irrigation": "Maintain steady moisture; avoid extreme wetting and drying cycles which cause severe boll drop.",
        "standard_action": "Spray Emamectin Benzoate 5 SG @ 80 g/Ac if live pink bollworm larvae are detected inside green squares.",
    },
    {
        "crop": "Cotton", "growth_stage": "Boll Bursting & Picking",
        "das_min": 111, "das_max": 180,
        "activity": "Harvest clean, fully burst bolls in dry sunny weather during morning hours after dew evaporates.",
        "fertilizer": "No fertilizer during mature picking stages.",
        "irrigation": "Withhold irrigation when 50% bolls are open to accelerate uniform opening and prevent fiber staining.",
        "standard_action": "Store picked seed-cotton in clean, dry sheds; keep stained/damaged locks separate from grade-A kapas.",
    },

    # ═══════════════════════════════════════════════════════════════════════
    # MUSTARD
    # ═══════════════════════════════════════════════════════════════════════
    {
        "crop": "Mustard", "growth_stage": "Seedling & Rosette Phase",
        "das_min": 0, "das_max": 25,
        "activity": "Sowing in lines at 30 × 10 cm; thin dense seedlings at 15 DAS to ensure 15 cm inter-plant spacing.",
        "fertilizer": "Basal application: 40 kg DAP + 15 kg Bentonite Sulphur/acre (Sulphur is vital for oil synthesis).",
        "irrigation": "Light pre-sowing irrigation (palewa); no post-sowing irrigation needed until 30 DAS in conservation moisture.",
        "standard_action": "Scout for painted bug (Bagrada cruciferarum) and flea beetle on young cotyledon leaves.",
    },
    {
        "crop": "Mustard", "growth_stage": "Branching & Flowering",
        "das_min": 26, "das_max": 60,
        "activity": "Interculture weeding at 25 DAS; inspect floral shoots for mustard aphid (Lipaphis erysimi) colonies.",
        "fertilizer": "Top dress Urea @ 30 kg/Ac just prior to first scheduled irrigation at 30–35 DAS.",
        "irrigation": "First crucial irrigation at flowering initiation stage (35 DAS); ensure water does not stagnate.",
        "standard_action": "Spray Dimethoate 30 EC @ 1.5 ml/L or Thiamethoxam @ 0.3 g/L if aphid colonies appear on > 10% twigs.",
    },
    {
        "crop": "Mustard", "growth_stage": "Pod (Siliqua) Formation & Harvest",
        "das_min": 61, "das_max": 120,
        "activity": "Harvest crop in morning hours when 75% of siliquae turn golden yellow to avoid pod shattering.",
        "fertilizer": "Foliar spray of 0:0:50 @ 3 g/L at pod swelling stage to increase test weight and oil content.",
        "irrigation": "Second light irrigation at early pod filling stage (65 DAS); avoid watering on windy days to prevent lodging.",
        "standard_action": "Bundle harvested stalks and sun-cure on threshing floor for 5–7 days before mechanical threshing.",
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# ENGINE
# ─────────────────────────────────────────────────────────────────────────────
class CropActivityWeatherEngine:
    """
    Given a crop name, days-after-sowing, and current weather condition string,
    returns a combined composite advisory: growth-stage tasks + weather overrides.
    """

    def __init__(self):
        self.stage_rules = CROP_STAGE_RULES
        self.weather_rules = WEATHER_RULES

    def get_stage_advisory(self, crop: str, das: int) -> dict:
        crop_clean = crop.strip().title()
        matched = [
            r for r in self.stage_rules
            if crop_clean.lower() in r["crop"].lower()
        ]
        if not matched:
            return {
                "crop": crop, "growth_stage": "Generic Stage",
                "activity": "Standard field maintenance and pest scouting.",
                "fertilizer": "Apply balanced 19:19:19 @ 2 g/L foliar as maintenance.",
                "irrigation": "Irrigate when top 5 cm soil is dry.",
                "standard_action": "Consult local agri extension officer for crop-specific advice.",
            }

        for rule in matched:
            if rule["das_min"] <= das <= rule["das_max"]:
                return rule

        # Past max DAS — return last stage with modified label
        last = max(matched, key=lambda r: r["das_max"])
        return {**last, "growth_stage": "Harvest Wrap-up / Field Clearance",
                "activity": "Complete final harvest; clear crop residues; deep plough for next crop.",
                "irrigation": "Stop irrigation; allow field to dry before tillage."}

    def get_weather_advisory(self, weather_condition: str) -> dict:
        wl = weather_condition.lower()
        for wr in self.weather_rules:
            if any(kw in wl for kw in wr["keywords"]):
                return wr
        return {
            "trigger_id": "normal", "alert_label": "Normal Conditions",
            "action": "Weather is favourable. Continue standard scheduled activities.",
            "irrigation_directive": "Follow crop-stage irrigation schedule.",
            "protective_measure": "Routine field scouting for pests and diseases.",
            "reschedule_guidance": "No rescheduling required.",
        }

    def full_advisory(self, crop: str, das: int, weather: str = "normal") -> dict:
        stage = self.get_stage_advisory(crop, das)
        weather_info = self.get_weather_advisory(weather)

        rain_block = any(kw in weather.lower()
                        for kw in ["rain", "thunderstorm", "precipitation"])
        active_fertilizer = (
            "[POSTPONED – RAIN FORECAST] " + stage["fertilizer"]
            if rain_block else stage["fertilizer"]
        )

        return {
            "crop": crop,
            "days_after_sowing": das,
            "current_stage": stage["growth_stage"],
            "routine_tasks": {
                "field_activity":    stage["activity"],
                "fertilizer":        active_fertilizer,
                "irrigation":        stage["irrigation"],
                "standard_action":   stage["standard_action"],
            },
            "weather_override": {
                "evaluated_condition": weather,
                "alert":               weather_info["alert_label"],
                "immediate_action":    weather_info["action"],
                "irrigation_directive":weather_info["irrigation_directive"],
                "protective_measure":  weather_info["protective_measure"],
                "reschedule_guidance": weather_info["reschedule_guidance"],
            },
        }
