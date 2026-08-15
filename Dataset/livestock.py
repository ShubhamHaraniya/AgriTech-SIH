"""
=============================================================================
DATASET 3: LIVESTOCK HEALTH, DISEASE & VACCINATION
=============================================================================
Animals : Cow, Buffalo, Sheep, Goat
Diseases: Anthrax, Blackleg (BQ), Foot & Mouth Disease (FMD),
          Pneumonia / HS / CCPP, Lumpy Skin Disease (LSD),
          PPR (Goat Plague), Enterotoxemia, Brucellosis

Each disease record includes:
  - animal, disease, pathogen_type
  - symptoms (list)
  - vaccination_required
  - vaccination_due_rule: initial_age_months, booster_days, recurrence
  - prevention (list)
  - advisory (first-aid / farm action text)

Individual animal support:
  - LivestockRecordManager: tracks vaccine history per animal tag,
    calculates next_due_date, outputs OVERDUE / DUE SOON / UP TO DATE status,
    matches observed symptoms to disease candidates.
"""

from __future__ import annotations
from typing import Any
from datetime import datetime, timedelta

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────
ANIMAL_TYPES  = ["Cow", "Buffalo", "Sheep", "Goat"]
DISEASE_NAMES = [
    "Anthrax",
    "Blackleg (Black Quarter)",
    "Foot & Mouth Disease (FMD)",
    "Hemorrhagic Septicemia (HS)",
    "Lumpy Skin Disease (LSD)",
    "Pneumonia / Respiratory Complex",
    "Brucellosis",
    "Enterotoxemia (Pulpy Kidney)",
    "Peste des Petits Ruminants (PPR)",
    "Contagious Caprine Pleuropneumonia (CCPP)",
]

# ─────────────────────────────────────────────────────────────────────────────
# FULL LIVESTOCK DISEASE KNOWLEDGE BASE
# ─────────────────────────────────────────────────────────────────────────────
LIVESTOCK_DISEASE_DB: list[dict[str, Any]] = [

    # ═══════════════════════════════════════════════════════════════════════
    # COW
    # ═══════════════════════════════════════════════════════════════════════
    {
        "animal": "Cow",
        "disease": "Anthrax",
        "pathogen_type": "Bacillus anthracis (Bacterial, Zoonotic)",
        "zoonotic_risk": "HIGH – infects humans via skin contact, inhalation and ingestion",
        "symptoms": [
            "Sudden peracute death with almost no prior warning signs",
            "High fever (106–107°F) and shivering in acute cases",
            "Rapid laboured breathing and mucous membrane congestion",
            "Dark tarry non-clotting blood oozing from all body orifices (mouth, nostrils, anus, vulva)",
            "Absence of rigor mortis post-death; body bloats rapidly",
        ],
        "vaccination_required": "Anthrax Spore Vaccine (Living; Sterne Strain)",
        "vaccination_due_rule": {
            "initial_age_months": 6,
            "booster_days": None,
            "recurrence": "Annual – strictly in endemic zones; vaccinate 1 month before outbreak season",
        },
        "prevention": [
            "Annual vaccination of all cattle in endemic areas",
            "NEVER OPEN A SUSPECT CARCASS – opening creates indestructible environmental spores",
            "Incinerate carcass completely or bury 6 feet deep with 10 kg quicklime",
            "Quarantine entire farm premises for minimum 21 days",
            "Notify State Veterinary Department immediately",
        ],
        "advisory": (
            "EMERGENCY PROTOCOL: Do not move carcass. Contact veterinary authority immediately. "
            "Anyone who touched the animal must wash with soap and visit a physician. "
            "The spores remain viable in soil for 70+ years. "
            "Early-stage live animals: Penicillin G (22,000 IU/kg, IV) every 4 hours if "
            "available. Chloramphenicol or Tetracycline are alternatives. "
            "Vaccinate all other animals on the farm immediately (with separate needle per animal)."
        ),
    },
    {
        "animal": "Cow",
        "disease": "Blackleg (Black Quarter)",
        "pathogen_type": "Clostridium chauvoei (Bacterial, Spore-forming)",
        "zoonotic_risk": "None",
        "symptoms": [
            "Sudden high fever (104–106°F) and complete loss of appetite",
            "Hot painful swellings on heavy muscle groups (thigh, shoulder, neck, rump)",
            "Swelling becomes cold, painless, emphysematous with crepitant crackle when pressed",
            "Severe lameness and reluctance to move; rapid prostration",
            "Death within 12–48 hours in untreated animals",
        ],
        "vaccination_required": "Blackleg (BQ) Alum-Precipitated Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 6,
            "booster_days": None,
            "recurrence": "Annual; vaccinate before monsoon (May–June) when soil spores are disturbed",
        },
        "prevention": [
            "Annual vaccination of all young cattle aged 6–24 months",
            "Never graze cattle on pastures where soil has been recently excavated or flooded",
            "Burn or bury carcasses with lime – do NOT skin the animal",
            "Provide high-energy diet to keep animals in good body condition",
        ],
        "advisory": (
            "HIGH MORTALITY EMERGENCY. Treatment must begin within hours of first fever. "
            "High-dose Crystalline Penicillin (22,000 IU/kg IV / IM) every 4 hrs for 3 days. "
            "Deep surgical incision of swelling and irrigation with hydrogen peroxide (3%) "
            "and Penicillin powder may be attempted by vet. "
            "Carcass must not be opened – all farm personnel should wear gloves."
        ),
    },
    {
        "animal": "Cow",
        "disease": "Foot & Mouth Disease (FMD)",
        "pathogen_type": "Aphthovirus – Serotypes O, A, C, Asia-1 (Viral)",
        "zoonotic_risk": "Very Low (rare mild blister in humans handling infected animals)",
        "symptoms": [
            "Sudden high fever (104–106°F) lasting 2–3 days",
            "Excessive frothy salivation; smacking sound of lips; drooling",
            "Painful vesicles/blisters on tongue, hard palate, dental pad and lips",
            "Vesicles on interdigital clefts causing severe lameness; hooves may slough in bad cases",
            "Vesicles on teats causing sudden 30–80% drop in milk yield",
            "Suckling calves may die of myocarditis ('tiger heart') with no obvious oral signs",
        ],
        "vaccination_required": "FMD Inactivated Trivalent / Tetravalent Oil-Adjuvant Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 4,
            "booster_days": 30,
            "recurrence": "Bi-annual (every 6 months) – April and October before seasonal transitions",
        },
        "prevention": [
            "Strict bi-annual herd vaccination – no animal to be skipped",
            "21-day quarantine of any newly purchased animal before entry",
            "Foot dip with 2% Sodium Hydroxide or 4% Sodium Carbonate at farm entry",
            "Disinfect water troughs weekly with 2% Virkon S solution",
            "Restrict entry of outsiders and shared equipment during outbreaks",
        ],
        "advisory": (
            "REPORTABLE DISEASE – notify state veterinary dept. "
            "Isolate infected animals immediately in separate shed with separate staff. "
            "Oral lesions: wash with 1% KMnO4 or dilute salt water; apply glycerin-iodine paste. "
            "Hoof lesions: clean, apply 5% Formalin footbath + copper sulphate; bandage with antiseptic dressing. "
            "Anti-inflammatory (Meloxicam 0.5 mg/kg SC) for pain management. "
            "Provide soft gruel feed and clean water. Recovery takes 10–14 days. "
            "No specific antiviral exists – treatment is entirely symptomatic and supportive."
        ),
    },
    {
        "animal": "Cow",
        "disease": "Lumpy Skin Disease (LSD)",
        "pathogen_type": "Capripoxvirus (Viral; vector-borne via flies/mosquitoes)",
        "zoonotic_risk": "None",
        "symptoms": [
            "Sudden high fever and depression",
            "Firm, circumscribed, hard nodules 2–5 cm diameter all over body, udder, head and limbs",
            "Skin nodules ulcerate and develop hard necrotic cores (sitfast lesions)",
            "Oedema/swelling of dewlap and lower limbs",
            "Enlarged, painful superficial lymph nodes (prescapular, prefemoral)",
            "Watery ocular and nasal discharge",
            "Sharp milk yield drop; pregnant cows may abort",
        ],
        "vaccination_required": "Goat Pox Heterologous Vaccine (Neethling / Lumpi-ProVacInd)",
        "vaccination_due_rule": {
            "initial_age_months": 4,
            "booster_days": None,
            "recurrence": "Annual; vaccinate before March/April ahead of insect vector breeding season",
        },
        "prevention": [
            "Annual vaccination of all cattle before monsoon vector season",
            "Vector control: Deltamethrin 1.25% spray on barn walls and animals twice weekly",
            "Install insect-proof netting on windows and barn doors",
            "Isolate sick animals immediately – vector spread is rapid",
            "Never share needles; use new sterile syringe per animal",
        ],
        "advisory": (
            "No specific antiviral. Supportive care only. "
            "Antibiotic cover (Oxytetracycline 10 mg/kg IV) to prevent secondary bacterial infection in open ulcers. "
            "NSAID (Flunixin Meglumine 2.2 mg/kg) for fever and pain. "
            "Apply antiseptic wound ointment (Betadine or Nebasulf) on burst nodules daily. "
            "Provide immune boosters: Vitamin A 500,000 IU IM + Selenium/Vitamin E injection. "
            "Recovery in 4–8 weeks in non-severe cases; permanent skin scars may remain."
        ),
    },
    {
        "animal": "Cow",
        "disease": "Pneumonia / Respiratory Complex",
        "pathogen_type": "Pasteurella multocida, BRSV, IBR virus (Mixed Bacterial/Viral)",
        "zoonotic_risk": "Low (Pasteurella can rarely infect immunocompromised humans)",
        "symptoms": [
            "High fever (103–105°F) and profound lethargy",
            "Persistent moist/wet cough; nasal discharge progressing from clear to purulent yellow",
            "Rapid shallow abdominal breathing; flared nostrils",
            "Drooping ears, hunched back, reluctance to feed",
            "Rattling lung sounds on auscultation",
        ],
        "vaccination_required": "Hemorrhagic Septicemia (HS) Vaccine + IBR/BVD Combined Respiratory Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 6,
            "booster_days": None,
            "recurrence": "Annual; administer before monsoon onset (May–June)",
        },
        "prevention": [
            "Ensure cross-ventilation in barns: target 30 air changes/hour",
            "Eliminate ammonia fumes from deep litter – clean beds weekly",
            "Provide dry elevated bedding (paddy straw / sawdust)",
            "Protect animals from cold draughts during seasonal weather changes",
            "Reduce transport and handling stress which triggers respiratory disease",
        ],
        "advisory": (
            "Start broad-spectrum antibiotic therapy immediately: "
            "Enrofloxacin (5 mg/kg SC) once daily for 5 days, OR "
            "Tulathromycin (2.5 mg/kg SC) single dose. "
            "Add anti-inflammatory: Meloxicam 0.5 mg/kg SC once daily. "
            "Provide electrolyte-glucose drench for weak animals. "
            "Isolate in warm, dry, well-ventilated box stall. "
            "If no improvement in 48 hrs, switch antibiotics based on sensitivity."
        ),
    },
    {
        "animal": "Cow",
        "disease": "Brucellosis",
        "pathogen_type": "Brucella abortus (Bacterial, Zoonotic)",
        "zoonotic_risk": "VERY HIGH – causes undulant fever in humans via raw milk, contact with aborted material",
        "symptoms": [
            "Late-term abortion (last 3 months of pregnancy) without prior illness signs",
            "Retained placenta and foul-smelling vaginal discharge after abortion",
            "Repeat breeding failure / infertility",
            "Swollen joints (hygromas) especially on front knees in bulls",
            "Orchitis and enlarged testicles in infected bulls",
        ],
        "vaccination_required": "Brucella abortus S19 Vaccine (heifers only, 4–8 months age)",
        "vaccination_due_rule": {
            "initial_age_months": 4,
            "booster_days": None,
            "recurrence": "Single lifetime dose for heifer calves aged 4–8 months only",
        },
        "prevention": [
            "Test all cows with Rose Bengal Plate Test (RBPT) before purchase",
            "Vaccinate all heifer calves 4–8 months age with S19 – ONE TIME only",
            "Dispose of aborted foetus and placenta safely – bury with lime",
            "Wear rubber gloves and mask when handling aborted material",
            "Pasteurise all milk before human consumption – critical public health measure",
        ],
        "advisory": (
            "NOTIFIABLE DISEASE – report to veterinary authority. "
            "No effective antibiotic treatment in cattle – infected animals should be culled. "
            "Test-and-Slaughter is the official government control policy. "
            "HUMAN RISK: Any farm worker who handled aborted material must visit a physician for "
            "testing and doxycycline + rifampicin prophylaxis."
        ),
    },

    # ═══════════════════════════════════════════════════════════════════════
    # BUFFALO
    # ═══════════════════════════════════════════════════════════════════════
    {
        "animal": "Buffalo",
        "disease": "Foot & Mouth Disease (FMD)",
        "pathogen_type": "Aphthovirus (Viral) – Serotypes O and Asia-1 most common",
        "zoonotic_risk": "Very Low",
        "symptoms": [
            "High fever (104–106°F) and complete refusal to feed",
            "Excessive drooling and smacking sound from oral lesions",
            "Vesicles on interdigital spaces causing severe deep hoof lesions and lameness",
            "Extremely sharp drop in milk production (up to 80%) within 24 hours",
            "Young buffalo calves die of cardiac failure without visible oral signs",
        ],
        "vaccination_required": "FMD Inactivated Polyvalent Oil-Adjuvant Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 4,
            "booster_days": 30,
            "recurrence": "Bi-annual (every 6 months)",
        },
        "prevention": [
            "Bi-annual herd-wide vaccination without exception",
            "Foot dip 2% Sodium Hydroxide at farm entrance daily",
            "Restrict movement of purchased animals for 21 days",
            "Disinfect farm vehicles entering premises",
        ],
        "advisory": (
            "Isolate from milking line. Oral: wash with 1% KMnO4; apply glycerin-iodine paste. "
            "Hoof: clean, apply 5% Formalin footbath; cover with antiseptic dressing. "
            "Analgesic: Meloxicam 0.5 mg/kg for pain. Feed soft rice gruel and electrolyte water. "
            "Recovery 10–14 days with supportive care."
        ),
    },
    {
        "animal": "Buffalo",
        "disease": "Hemorrhagic Septicemia (HS / Galghotu)",
        "pathogen_type": "Pasteurella multocida Type B:2 (Bacterial)",
        "zoonotic_risk": "Very Low",
        "symptoms": [
            "Sudden very high fever (106–107°F) and complete anorexia",
            "Hot, painful brisket/throat/neck swelling that spreads rapidly",
            "Severe respiratory distress: open-mouth breathing, loud grunting, frothy nasal discharge",
            "Congested bright red mucous membranes, tongue protrusion",
            "Death within 8–36 hours if untreated",
        ],
        "vaccination_required": "HS Alum-Precipitated / Oil-Adjuvant Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 6,
            "booster_days": None,
            "recurrence": "Annual; strictly before monsoon (May–June)",
        },
        "prevention": [
            "Pre-monsoon mass vaccination of all buffaloes",
            "Avoid wallowing in stagnant, contaminated ponds during monsoon",
            "Minimise transport and handling stress",
            "Provide adequate feed and mineral supplementation",
        ],
        "advisory": (
            "LIFE-THREATENING EMERGENCY. Treatment window is extremely short. "
            "Sulphadimidine 33% @ 100 ml IV immediately. "
            "OR Oxytetracycline 20 mg/kg IV slowly. "
            "Add anti-inflammatory: Dexamethasone 0.1 mg/kg IV (once). "
            "Penicillin G 22,000 IU/kg IM every 6 hrs as follow-up. "
            "Recovery rate is low if treatment delayed beyond 4 hrs."
        ),
    },
    {
        "animal": "Buffalo",
        "disease": "Anthrax",
        "pathogen_type": "Bacillus anthracis (Bacterial, Zoonotic)",
        "zoonotic_risk": "HIGH",
        "symptoms": [
            "Sudden collapse and death in most cases",
            "Unclotted blood from body orifices",
            "Absence of rigor mortis; rapid bloating",
        ],
        "vaccination_required": "Anthrax Spore Vaccine (Sterne Strain)",
        "vaccination_due_rule": {
            "initial_age_months": 6,
            "booster_days": None,
            "recurrence": "Annual in endemic areas",
        },
        "prevention": [
            "Do NOT open any suspect carcass",
            "Burn carcass or bury 6 feet deep with quicklime",
            "Notify veterinary authority immediately",
        ],
        "advisory": (
            "Do not open carcass. Vaccinate all other animals immediately with separate needles. "
            "Penicillin G given to still-living febrile animals in first hours may save them. "
            "Human handlers must wear full PPE and seek medical attention."
        ),
    },
    {
        "animal": "Buffalo",
        "disease": "Pneumonia / Respiratory Complex",
        "pathogen_type": "Pasteurella multocida, Mannheimia haemolytica (Bacterial)",
        "zoonotic_risk": "Low",
        "symptoms": [
            "Persistent cough, rapid laboured breathing",
            "Nasal discharge (clear -> thick purulent)",
            "Elevated pulse, high fever, depression",
            "Audible crackles / harsh breath sounds on auscultation",
        ],
        "vaccination_required": "HS + Combined Respiratory Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 6,
            "booster_days": None,
            "recurrence": "Annual",
        },
        "prevention": [
            "Avoid exposure to cold winds post-wallowing in winter",
            "Dry elevated bedding; prevent ammonia build-up",
            "Reduce overcrowding in sheds",
        ],
        "advisory": (
            "Amoxicillin-Clavulanate 15 mg/kg IM twice daily for 5 days. "
            "Add Bromhexine or Mucolytic to reduce mucus. "
            "Provide warm electrolyte drench twice daily. "
            "Keep in dry warm stall; avoid cold draughts."
        ),
    },
    {
        "animal": "Buffalo",
        "disease": "Lumpy Skin Disease (LSD)",
        "pathogen_type": "Capripoxvirus (Viral, vector-borne)",
        "zoonotic_risk": "None",
        "symptoms": [
            "High fever and multiple skin nodules across body",
            "Swollen lymph nodes and lower limb oedema",
            "Milk drop and ocular discharge",
        ],
        "vaccination_required": "Goat Pox Heterologous Vaccine / Lumpi-ProVacInd",
        "vaccination_due_rule": {
            "initial_age_months": 4,
            "booster_days": None,
            "recurrence": "Annual before vector season",
        },
        "prevention": [
            "Vector control: Deltamethrin spray on animals and premises",
            "Insect-proof barn netting",
            "Isolate sick animals",
        ],
        "advisory": (
            "Supportive care. Oxytetracycline for secondary bacterial infection. "
            "Antiseptic dressing on burst nodules. "
            "Vitamin A + Selenium injection to boost immunity."
        ),
    },
    {
        "animal": "Buffalo",
        "disease": "Blackleg (Black Quarter)",
        "pathogen_type": "Clostridium chauvoei (Bacterial)",
        "zoonotic_risk": "None",
        "symptoms": [
            "Hot painful muscle swellings on heavy muscle groups",
            "Crepitant crackle on pressing swelling",
            "Rapid fever and prostration within 12–24 hours",
        ],
        "vaccination_required": "BQ Alum-Precipitated Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 6,
            "booster_days": None,
            "recurrence": "Annual before monsoon",
        },
        "prevention": [
            "Annual vaccination of all young stock 6–24 months",
            "Avoid grazing on recently excavated or flooded pastures",
            "Bury carcass with lime",
        ],
        "advisory": (
            "High-dose Penicillin G IV if started within hours. "
            "Surgical incision and Penicillin wound irrigation by vet. "
            "Prognosis is poor once animal is recumbent."
        ),
    },

    # ═══════════════════════════════════════════════════════════════════════
    # SHEEP
    # ═══════════════════════════════════════════════════════════════════════
    {
        "animal": "Sheep",
        "disease": "Anthrax",
        "pathogen_type": "Bacillus anthracis (Bacterial, Zoonotic)",
        "zoonotic_risk": "HIGH",
        "symptoms": [
            "Sudden death (peracute) in fastest-growing animals",
            "Unclotted blood oozing from orifices",
            "Absence of rigor mortis",
        ],
        "vaccination_required": "Anthrax Spore Vaccine (Sterne Strain)",
        "vaccination_due_rule": {
            "initial_age_months": 6,
            "booster_days": None,
            "recurrence": "Annual in endemic areas",
        },
        "prevention": [
            "Never open carcass",
            "Incinerate or deep-bury with quicklime",
            "Immediately notify veterinary authority",
        ],
        "advisory": (
            "Do NOT open carcass. Vaccinate surviving flock immediately. "
            "Penicillin treatment for febrile live animals. "
            "Farm personnel need medical evaluation."
        ),
    },
    {
        "animal": "Sheep",
        "disease": "Blackleg (Black Quarter)",
        "pathogen_type": "Clostridium chauvoei (Bacterial)",
        "zoonotic_risk": "None",
        "symptoms": [
            "Sudden fever and painful muscle swellings",
            "Crepitant crackle on limb muscles",
            "Rapid prostration and death within 24 hours",
        ],
        "vaccination_required": "BQ Vaccine or Multivalent Clostridial Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 3,
            "booster_days": None,
            "recurrence": "Annual pre-monsoon",
        },
        "prevention": [
            "Annual vaccination",
            "Avoid freshly excavated or flood-prone pastures",
        ],
        "advisory": (
            "High-dose Penicillin G IM if detected early. "
            "Prognosis is very poor once prostrated. Do NOT skin carcass."
        ),
    },
    {
        "animal": "Sheep",
        "disease": "Foot & Mouth Disease (FMD)",
        "pathogen_type": "Aphthovirus (Viral)",
        "zoonotic_risk": "Very Low",
        "symptoms": [
            "Fever and lameness in flock; less pronounced oral lesions than cattle",
            "Vesicles on interdigital spaces causing severe hoof disease",
            "Sudden death in suckling lambs from myocarditis",
        ],
        "vaccination_required": "FMD Polyvalent Small Ruminant Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 3,
            "booster_days": 30,
            "recurrence": "Bi-annual (every 6 months)",
        },
        "prevention": [
            "Flock vaccination before migratory movement (transhumance)",
            "Foot bath with 5% Formalin or 2% CuSO4 when entering new pastures",
            "Quarantine new additions for 21 days",
        ],
        "advisory": (
            "Separate sick sheep. Provide soft bedding. "
            "Treat foot lesions daily with antiseptic spray to prevent maggot strike (myiasis). "
            "Analgesics for pain. Recovery in 10–14 days."
        ),
    },
    {
        "animal": "Sheep",
        "disease": "Pneumonia / Respiratory Complex",
        "pathogen_type": "Mycoplasma ovipneumoniae, Pasteurella multocida (Bacterial)",
        "zoonotic_risk": "Low",
        "symptoms": [
            "Huddled appearance, drooping ears, reluctance to move",
            "Rapid abdominal breathing, wet cough",
            "Nasal crusting and ocular discharge",
            "Weight loss and poor fleece condition",
        ],
        "vaccination_required": "Pneumonia / Combined Respiratory Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 3,
            "booster_days": None,
            "recurrence": "Annual",
        },
        "prevention": [
            "Protect from dampness and chilling after shearing",
            "Avoid high stocking density in overnight pens",
            "Provide adequate nutrition especially vitamins A and E",
        ],
        "advisory": (
            "Long-acting Oxytetracycline 20 mg/kg IM (single dose). "
            "OR Tylosin 10 mg/kg IM twice daily for 3 days. "
            "Warm dry shelter; high-energy supplementary feed. "
            "Isolate to prevent spread within flock."
        ),
    },
    {
        "animal": "Sheep",
        "disease": "Lumpy Skin Disease (LSD)",
        "pathogen_type": "Capripoxvirus (Viral)",
        "zoonotic_risk": "None",
        "symptoms": [
            "Fever and skin nodules on head and body",
            "Lesions may ulcerate in severe cases",
            "Lameness and lymph node swelling",
        ],
        "vaccination_required": "Sheep Pox Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 3,
            "booster_days": None,
            "recurrence": "Annual",
        },
        "prevention": [
            "Annual sheep pox vaccination",
            "Vector control – fly and mosquito repellents",
            "Isolate sick animals from healthy flock",
        ],
        "advisory": (
            "Supportive care: antiseptic on skin lesions, antibiotic for secondary infections. "
            "Recovery in 3–6 weeks in most cases."
        ),
    },
    {
        "animal": "Sheep",
        "disease": "Enterotoxemia (Pulpy Kidney Disease)",
        "pathogen_type": "Clostridium perfringens Type D (Bacterial – Toxin)",
        "zoonotic_risk": "None",
        "symptoms": [
            "Sudden convulsive deaths in the fastest-growing, best-conditioned lambs",
            "Opisthotonos: head thrown backward toward spine in convulsion",
            "Frothing at mouth, teeth grinding, apparent blindness",
            "Green watery diarrhoea in sub-acute cases",
        ],
        "vaccination_required": "Enterotoxemia (ET) Vaccine (Clostridium Type D Toxoid)",
        "vaccination_due_rule": {
            "initial_age_months": 2,
            "booster_days": 14,
            "recurrence": "Annual before flush grazing / monsoon pasture access",
        },
        "prevention": [
            "Vaccinate ewes 4–6 weeks pre-lambing to provide colostral immunity to lambs",
            "Never allow sudden dietary shift from sparse to lush high-protein pasture",
            "Introduce grains or concentrates gradually over 2–3 weeks",
        ],
        "advisory": (
            "REDUCE high-energy concentrate feed immediately upon outbreak detection. "
            "Provide coarse dry roughage (straw) only for 48 hrs. "
            "ET antitoxin serum + Penicillin G IM in early cases may save the animal. "
            "Prognosis is poor once convulsions begin."
        ),
    },

    # ═══════════════════════════════════════════════════════════════════════
    # GOAT
    # ═══════════════════════════════════════════════════════════════════════
    {
        "animal": "Goat",
        "disease": "Anthrax",
        "pathogen_type": "Bacillus anthracis (Bacterial, Zoonotic)",
        "zoonotic_risk": "HIGH",
        "symptoms": [
            "Sudden collapse and rapid death",
            "Unclotted blood from nose, mouth, anus",
            "Rapid bloating post-death without rigor mortis",
        ],
        "vaccination_required": "Anthrax Spore Vaccine (Sterne Strain)",
        "vaccination_due_rule": {
            "initial_age_months": 6,
            "booster_days": None,
            "recurrence": "Annual in endemic areas",
        },
        "prevention": [
            "Do not open carcass",
            "Deep burial with lime or incineration",
            "Notify veterinary authority",
        ],
        "advisory": (
            "Quarantine farm. Vaccinate surviving goats immediately. "
            "High-dose Penicillin for febrile live animals. "
            "Handlers must use PPE and seek medical evaluation."
        ),
    },
    {
        "animal": "Goat",
        "disease": "Blackleg (Black Quarter)",
        "pathogen_type": "Clostridium chauvoei (Bacterial)",
        "zoonotic_risk": "None",
        "symptoms": [
            "Sudden fever, hot painful muscle swellings",
            "Crepitation in swollen muscles",
            "Rapid prostration and death",
        ],
        "vaccination_required": "BQ / Multivalent Clostridial Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 3,
            "booster_days": None,
            "recurrence": "Annual",
        },
        "prevention": [
            "Annual vaccination",
            "Avoid recently excavated or flood-prone grazing areas",
        ],
        "advisory": (
            "Penicillin G high dose IM if detected early. "
            "Prognosis is very poor once recumbent. "
            "Do not skin or open carcass."
        ),
    },
    {
        "animal": "Goat",
        "disease": "Foot & Mouth Disease (FMD)",
        "pathogen_type": "Aphthovirus (Viral)",
        "zoonotic_risk": "Very Low",
        "symptoms": [
            "Fever and lameness across the herd",
            "Interdigital vesicles and hoof wall separation",
            "Oral ulcers; sudden kid deaths from cardiac failure",
        ],
        "vaccination_required": "FMD Polyvalent Small Ruminant Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 3,
            "booster_days": 30,
            "recurrence": "Bi-annual",
        },
        "prevention": [
            "Regular bi-annual vaccination of entire herd",
            "Foot bath at farm entrance",
            "21-day quarantine for new additions",
        ],
        "advisory": (
            "Separate sick goats. Treat oral and hoof lesions with antiseptics. "
            "Analgesic for pain relief. Feed soft, palatable feed. Recovery 10–14 days."
        ),
    },
    {
        "animal": "Goat",
        "disease": "Lumpy Skin Disease (LSD)",
        "pathogen_type": "Capripoxvirus (Viral)",
        "zoonotic_risk": "None",
        "symptoms": [
            "High fever and hard skin nodules across body",
            "Lymph node swelling, milk drop",
            "Ulcerated nodules in severe cases",
        ],
        "vaccination_required": "Goat Pox Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 3,
            "booster_days": None,
            "recurrence": "Annual before insect vector season",
        },
        "prevention": [
            "Goat pox vaccination covers LSD protection",
            "Vector control – insecticide spray on animals twice weekly",
            "Isolate sick animals",
        ],
        "advisory": (
            "Supportive care: antibiotics for secondary infections, antiseptic on ulcers. "
            "Recovery in 3–6 weeks in most cases with supportive therapy."
        ),
    },
    {
        "animal": "Goat",
        "disease": "Pneumonia / Respiratory Complex",
        "pathogen_type": "Mycoplasma capricolum, Pasteurella multocida (Bacterial)",
        "zoonotic_risk": "Low",
        "symptoms": [
            "Rapid laboured breathing, open-mouth gasping",
            "Painful continuous coughing",
            "Nasal discharge and watery eyes",
            "Weight loss and poor body condition",
        ],
        "vaccination_required": "CCPP Inactivated Vaccine + Pneumonia Combined",
        "vaccination_due_rule": {
            "initial_age_months": 3,
            "booster_days": None,
            "recurrence": "Annual",
        },
        "prevention": [
            "Dry, well-ventilated raised slatted floor goat sheds",
            "Avoid overcrowding and dust exposure",
            "Provide adequate Vitamins A, D, E and Zinc supplementation",
        ],
        "advisory": (
            "Tylosin 10 mg/kg IM twice daily for 5 days. "
            "OR Enrofloxacin 5 mg/kg SC once daily for 5 days. "
            "Keep in warm, dry stall. High-energy palatable feed. "
            "Isolate from healthy animals immediately."
        ),
    },
    {
        "animal": "Goat",
        "disease": "Peste des Petits Ruminants (PPR / Goat Plague)",
        "pathogen_type": "Morbillivirus (Viral – related to rinderpest/measles)",
        "zoonotic_risk": "None",
        "symptoms": [
            "High fever (104–106°F) and profound depression",
            "Severe ulcerative necrotic stomatitis – white cheesy plaques in mouth with foul smell",
            "Thick crusts gluing eyelids shut; purulent nasal discharge blocking nostrils",
            "Severe profuse watery diarrhoea rapidly causing fatal dehydration",
            "Pneumonia from secondary bacterial infection in many animals",
        ],
        "vaccination_required": "PPR Live Attenuated Vaccine (Sungri 96 Strain – 1 ml SC)",
        "vaccination_due_rule": {
            "initial_age_months": 3,
            "booster_days": None,
            "recurrence": "Once every 3 years (provides life-long multi-year protective immunity)",
        },
        "prevention": [
            "Vaccinate all kids at 3–4 months of age",
            "30-day quarantine of all new goat additions",
            "Never bring animals from markets showing outbreak reports",
            "Clean and disinfect all water troughs and feed bunkers between batches",
        ],
        "advisory": (
            "Isolate affected goats immediately in separate clean shelter. "
            "Intensive supportive therapy: "
            "Oral Rehydration Salts (ORS) 2 litres 4× daily. "
            "Intravenous dextrose-saline 1–2 litres/day for severely dehydrated animals. "
            "B-complex vitamins IM once daily. "
            "Broad-spectrum antibiotic (Amoxicillin 15 mg/kg IM) for secondary pneumonia prevention. "
            "Antipyretic (Meloxicam 0.5 mg/kg) for fever and pain. "
            "Mortality is 50–80% in unvaccinated flocks; vaccination is the only real protection."
        ),
    },
    {
        "animal": "Goat",
        "disease": "Contagious Caprine Pleuropneumonia (CCPP)",
        "pathogen_type": "Mycoplasma capricolum subsp. capripneumoniae",
        "zoonotic_risk": "None",
        "symptoms": [
            "Extreme difficulty breathing with mouth open, tongue protruding, neck extended",
            "Loud painful cough; pleural friction sound on auscultation",
            "Frothy purulent bilateral nasal discharge",
            "Sudden high fever; complete anorexia",
            "Death within 3–5 days in untreated peracute cases",
        ],
        "vaccination_required": "CCPP Inactivated Vaccine",
        "vaccination_due_rule": {
            "initial_age_months": 3,
            "booster_days": None,
            "recurrence": "Annual vaccination of entire herd",
        },
        "prevention": [
            "Annual herd vaccination",
            "Raised slatted floor construction to eliminate dampness",
            "Well-ventilated barns with minimum 30 air changes per hour",
            "Strict quarantine of new additions for 30 days",
        ],
        "advisory": (
            "Tylosin (20 mg/kg IM) twice daily for 5–7 days, "
            "OR Enrofloxacin (5 mg/kg SC) once daily for 5–7 days. "
            "Anti-inflammatory (Flunixin 2 mg/kg IM) for fever and pleuritis pain. "
            "Supportive: warm shelter, force-feed electrolyte-glucose drench twice daily. "
            "Early treatment essential; mortality near 100% without treatment in peracute cases."
        ),
    },
    {
        "animal": "Goat",
        "disease": "Enterotoxemia (Pulpy Kidney Disease)",
        "pathogen_type": "Clostridium perfringens Type D (Bacterial – Toxin)",
        "zoonotic_risk": "None",
        "symptoms": [
            "Sudden death in the best-conditioned kids without prior signs",
            "Convulsions, opisthotonus and apparent blindness",
            "Profuse watery green diarrhoea in sub-acute cases",
            "Frothy bloat in the rumen on post-mortem",
        ],
        "vaccination_required": "Enterotoxemia (ET) Vaccine (Type D Toxoid)",
        "vaccination_due_rule": {
            "initial_age_months": 2,
            "booster_days": 14,
            "recurrence": "Annual before flush grazing season",
        },
        "prevention": [
            "Vaccinate pregnant does 4–6 weeks before kidding for colostral immunity",
            "No sudden dietary shift to lush or high-concentrate feed",
            "Introduce creep feed gradually over 10–14 days",
        ],
        "advisory": (
            "Remove all concentrated feed immediately. Provide only hay/straw. "
            "ET antitoxin serum (per label dose) + Penicillin G 22,000 IU/kg IM in early cases. "
            "Prognosis is poor once convulsions appear."
        ),
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# VACCINE RECURRENCE INFERENCE TABLE
# Maps vaccine types to their recurrence interval in days
# ─────────────────────────────────────────────────────────────────────────────
_VACCINE_RECURRENCE_DAYS: dict[str, int] = {
    "bi-annual":    180,    # FMD – every 6 months
    "fmd":          180,
    "annual":       365,    # Most vaccines
    "3 years":      1095,   # PPR – once every 3 years
    "ppr":          1095,
    "single":       99999,  # Brucellosis S19 – single lifetime dose
    "lifetime":     99999,
    "s19":          99999,
}


# ─────────────────────────────────────────────────────────────────────────────
# INDIVIDUAL ANIMAL RECORD MANAGER
# ─────────────────────────────────────────────────────────────────────────────
class LivestockRecordManager:
    """
    Manages per-animal vaccination history, calculates next due dates,
    and provides symptom-to-disease matching.
    """

    def __init__(self, db: list[dict] | None = None):
        self.db = db or LIVESTOCK_DISEASE_DB

    # ── Vaccine schedule ─────────────────────────────────────────────────────
    def get_all_vaccines_for_animal(self, animal_type: str) -> list[dict]:
        """Return all disease records for a given animal type (for schedule overview)."""
        return [r for r in self.db if r["animal"].lower() == animal_type.lower()]

    def infer_recurrence_days(self, vaccine_name: str, due_rule: dict) -> int:
        recurrence_text = (due_rule.get("recurrence") or "").lower()
        vn = vaccine_name.lower()
        for key, days in _VACCINE_RECURRENCE_DAYS.items():
            if key in recurrence_text or key in vn:
                return days
        return 365  # Default: annual

    def calculate_next_due(
        self,
        vaccine_name: str,
        due_rule: dict,
        last_vaccinated_date: str,  # YYYY-MM-DD
    ) -> dict:
        last_dt = datetime.strptime(last_vaccinated_date, "%Y-%m-%d")
        days = self.infer_recurrence_days(vaccine_name, due_rule)
        next_dt = last_dt + timedelta(days=days)
        remaining = (next_dt - datetime.now()).days

        if days >= 99999:
            status = "LIFETIME – No booster needed"
        elif remaining < 0:
            status = "OVERDUE"
        elif remaining <= 15:
            status = "DUE SOON"
        else:
            status = "UP TO DATE"

        return {
            "vaccine_name":     vaccine_name,
            "last_vaccinated":  last_vaccinated_date,
            "next_due_date":    next_dt.strftime("%Y-%m-%d"),
            "recurrence_days":  days,
            "days_remaining":   remaining,
            "status":           status,
        }

    def evaluate_animal_record(
        self,
        animal_id: str,
        animal_type: str,
        tag_number: str,
        age_months: int,
        vaccination_history: list[dict],  # [{"vaccine_name": ..., "date_administered": ...}]
    ) -> dict:
        """
        Evaluate a single animal's vaccine coverage and flag overdue / missing vaccines.
        """
        disease_records = self.get_all_vaccines_for_animal(animal_type)
        history_map = {
            item["vaccine_name"].lower(): item["date_administered"]
            for item in vaccination_history
        }

        vaccine_statuses = []
        urgent_alerts = []

        for record in disease_records:
            v_name = record["vaccination_required"]
            v_key = v_name.lower()
            due_rule = record["vaccination_due_rule"]
            min_age = due_rule.get("initial_age_months", 0)

            if age_months < min_age:
                vaccine_statuses.append({
                    "disease":      record["disease"],
                    "vaccine_name": v_name,
                    "status":       f"NOT YET DUE (min age {min_age} months)",
                    "next_due_date": f"When animal reaches {min_age} months old",
                })
                continue

            if v_key in history_map:
                calc = self.calculate_next_due(v_name, due_rule, history_map[v_key])
                calc["disease"] = record["disease"]
                vaccine_statuses.append(calc)
                if calc["status"] in ("OVERDUE", "DUE SOON"):
                    urgent_alerts.append(
                        f"[{calc['status']}] {v_name} for {record['disease']} "
                        f"– Due: {calc['next_due_date']}"
                    )
            else:
                vaccine_statuses.append({
                    "disease":      record["disease"],
                    "vaccine_name": v_name,
                    "status":       "NEVER VACCINATED",
                    "last_vaccinated": None,
                    "next_due_date": "IMMEDIATE",
                })
                urgent_alerts.append(
                    f"[NEVER VACCINATED] {v_name} ({record['disease']}) – administer immediately."
                )

        return {
            "animal_id":          animal_id,
            "tag_number":         tag_number,
            "animal_type":        animal_type,
            "age_months":         age_months,
            "total_vaccines_due": len(disease_records),
            "vaccine_statuses":   vaccine_statuses,
            "urgent_alerts":      urgent_alerts,
            "health_summary":     (
                "UP TO DATE" if not urgent_alerts
                else f"{len(urgent_alerts)} alert(s) need attention"
            ),
        }

    # ── Symptom matching ─────────────────────────────────────────────────────
    def match_symptoms(
        self,
        animal_type: str,
        observed_symptoms: list[str],
    ) -> list[dict]:
        """
        Match a farmer-described list of symptoms to known diseases.
        Returns ranked results by match confidence.
        """
        records = self.get_all_vaccines_for_animal(animal_type)
        results = []

        for record in records:
            corpus = " ".join(record["symptoms"]).lower()
            matched = [s for s in observed_symptoms if s.lower() in corpus]
            if not matched:
                continue
            confidence = round(len(matched) / len(observed_symptoms) * 100, 1)
            results.append({
                "disease":              record["disease"],
                "confidence_pct":       confidence,
                "matched_keywords":     matched,
                "total_keywords_given": len(observed_symptoms),
                "pathogen_type":        record["pathogen_type"],
                "zoonotic_risk":        record["zoonotic_risk"],
                "all_symptoms":         record["symptoms"],
                "first_aid_advisory":   record["advisory"],
                "prevention":           record["prevention"],
                "vaccination":          record["vaccination_required"],
            })

        results.sort(key=lambda x: x["confidence_pct"], reverse=True)
        return results
