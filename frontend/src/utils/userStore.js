/**
 * Multi-User Isolated Storage Engine — v4
 * 4 Full-Fledged Production Farm Accounts:
 * 1. Punjab  — Arun Singh Dhaliwal  (arun.dhaliwal@agritech.in / 1234) — Large Commercial Farm
 * 2. Karnataka — Priya Venkataraman (priya.v@agritech.in / 1234)       — Medium Mixed Farm
 * 3. Assam   — Ibrahim Ali Sheikh    (ibrahim.sheikh@agritech.in / 1234) — Livestock-Focused Farm
 * 4. MP      — Kavita Patel          (kavita.patel@agritech.in / 1234)  — Crop-Diverse Farm
 */

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: generate sequential IDs
// ─────────────────────────────────────────────────────────────────────────────
const mkFields = (prefix, count, data) =>
  Array.from({ length: count }, (_, i) => ({ id: `fld_${prefix}_${i + 1}`, ...data[i] }));

const mkAnimals = (prefix, count, data) =>
  Array.from({ length: count }, (_, i) => ({ id: `${prefix}_an${i + 1}`, ...data[i] }));

// ─────────────────────────────────────────────────────────────────────────────
// USER 1 — ARUN SINGH DHALIWAL · Ludhiana, Punjab
// Large Commercial Farm: 18 fields · 32 animals · ₹4.8M revenue
// ─────────────────────────────────────────────────────────────────────────────
const ARUN_FIELDS = mkFields('pb', 18, [
  { name: 'North Block — Wheat (HD-3086)', area_acre: 4.5, soil_type: 'Clay Loam', current_crop: 'Wheat', sowing_date: '2026-11-05', irrigation: 'Canal', health: 'Excellent', prev_crop: 'Rice', yield_est_qtl: 52 },
  { name: 'North Block — Rice (PUSA Basmati 1121)', area_acre: 4.0, soil_type: 'Heavy Clay', current_crop: 'Rice', sowing_date: '2026-06-18', irrigation: 'Flood', health: 'Good', prev_crop: 'Wheat', yield_est_qtl: 48 },
  { name: 'South Block A — Maize (DKC 9108)', area_acre: 3.5, soil_type: 'Loamy Soil', current_crop: 'Maize', sowing_date: '2026-07-02', irrigation: 'Sprinkler', health: 'Excellent', prev_crop: 'Mustard', yield_est_qtl: 62 },
  { name: 'South Block B — Wheat (PBW-343)', area_acre: 3.5, soil_type: 'Clay Loam', current_crop: 'Wheat', sowing_date: '2026-11-08', irrigation: 'Canal', health: 'Good', prev_crop: 'Sunflower', yield_est_qtl: 48 },
  { name: 'East Paddock — Sugarcane (COJ-84)', area_acre: 5.0, soil_type: 'Sandy Clay', current_crop: 'Sugarcane', sowing_date: '2026-02-10', irrigation: 'Drip', health: 'Excellent', prev_crop: 'Potato', yield_est_qtl: 380 },
  { name: 'East Paddock B — Rice (PR-126)', area_acre: 3.0, soil_type: 'Heavy Clay', current_crop: 'Rice', sowing_date: '2026-06-25', irrigation: 'Flood', health: 'Good', prev_crop: 'Wheat', yield_est_qtl: 42 },
  { name: 'West Field — Cotton (BT Punjab 1)', area_acre: 3.0, soil_type: 'Sandy Loam', current_crop: 'Cotton', sowing_date: '2026-04-28', irrigation: 'Drip', health: 'Fair', prev_crop: 'Chickpea', yield_est_qtl: 22 },
  { name: 'West Field B — Mustard (GSL-1)', area_acre: 2.5, soil_type: 'Loamy Soil', current_crop: 'Mustard', sowing_date: '2026-10-20', irrigation: 'Borewell', health: 'Good', prev_crop: 'Maize', yield_est_qtl: 18 },
  { name: 'Central Patch — Potato (Kufri Pukhraj)', area_acre: 2.0, soil_type: 'Sandy Loam', current_crop: 'Potato', sowing_date: '2026-10-01', irrigation: 'Sprinkler', health: 'Excellent', prev_crop: 'Rice', yield_est_qtl: 190 },
  { name: 'Central Patch B — Onion (Nasik Red)', area_acre: 1.5, soil_type: 'Clay Loam', current_crop: 'Onion', sowing_date: '2026-11-01', irrigation: 'Drip', health: 'Good', prev_crop: 'Wheat', yield_est_qtl: 130 },
  { name: 'Orchard Row 1 — Kinnow (Punjab Kinnow)', area_acre: 2.0, soil_type: 'Sandy Loam', current_crop: 'Kinnow', sowing_date: '2022-01-15', irrigation: 'Drip', health: 'Excellent', prev_crop: 'Permanent', yield_est_qtl: 240 },
  { name: 'Orchard Row 2 — Guava (Allahabad Safeda)', area_acre: 1.5, soil_type: 'Sandy Loam', current_crop: 'Guava', sowing_date: '2021-03-10', irrigation: 'Drip', health: 'Good', prev_crop: 'Permanent', yield_est_qtl: 80 },
  { name: 'Nursery Block — Sunflower (KBSH-1)', area_acre: 1.5, soil_type: 'Loamy Soil', current_crop: 'Sunflower', sowing_date: '2026-07-15', irrigation: 'Sprinkler', health: 'Good', prev_crop: 'Wheat', yield_est_qtl: 14 },
  { name: 'River Edge — Chickpea (GNG-663)', area_acre: 2.0, soil_type: 'Sandy Clay', current_crop: 'Chickpea', sowing_date: '2026-10-28', irrigation: 'Borewell', health: 'Fair', prev_crop: 'Paddy', yield_est_qtl: 16 },
  { name: 'Greenhouse 1 — Tomato (Hybrid Rashmi)', area_acre: 0.5, soil_type: 'Potting Mix', current_crop: 'Tomato', sowing_date: '2026-08-05', irrigation: 'Drip', health: 'Excellent', prev_crop: 'Capsicum', yield_est_qtl: 45 },
  { name: 'Greenhouse 2 — Capsicum (Orobelle)', area_acre: 0.5, soil_type: 'Potting Mix', current_crop: 'Capsicum', sowing_date: '2026-08-10', irrigation: 'Drip', health: 'Good', prev_crop: 'Tomato', yield_est_qtl: 28 },
  { name: 'Fodder Plot — Maize Fodder (African Tall)', area_acre: 3.0, soil_type: 'Clay Loam', current_crop: 'Maize Fodder', sowing_date: '2026-07-20', irrigation: 'Canal', health: 'Excellent', prev_crop: 'Wheat', yield_est_qtl: 180 },
  { name: 'Fallow A — Toria (TL-15)', area_acre: 2.0, soil_type: 'Sandy Loam', current_crop: 'Toria', sowing_date: '2026-09-15', irrigation: 'Borewell', health: 'Good', prev_crop: 'Rice', yield_est_qtl: 10 },
]);

const ARUN_ANIMALS = mkAnimals('pb', 32, [
  { name: 'Raja', species: 'Cow', breed: 'Murrah Cross', tag: 'TAG-PB101', age_years: 5.0, weight_kg: 490, health_status: 'Healthy', milk_L_day: 18, vaccination_alert: 'ok' },
  { name: 'Rani', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-PB102', age_years: 4.0, weight_kg: 470, health_status: 'Healthy', milk_L_day: 22, vaccination_alert: 'ok' },
  { name: 'Shyama', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-PB103', age_years: 3.5, weight_kg: 450, health_status: 'Healthy', milk_L_day: 20, vaccination_alert: 'ok' },
  { name: 'Kamla', species: 'Cow', breed: 'Sahiwal', tag: 'TAG-PB104', age_years: 6.0, weight_kg: 440, health_status: 'Healthy', milk_L_day: 14, vaccination_alert: 'ok' },
  { name: 'Gori', species: 'Cow', breed: 'Sahiwal', tag: 'TAG-PB105', age_years: 4.5, weight_kg: 430, health_status: 'Healthy', milk_L_day: 13, vaccination_alert: 'due' },
  { name: 'Laxmi', species: 'Cow', breed: 'Jersey Cross', tag: 'TAG-PB106', age_years: 3.0, weight_kg: 410, health_status: 'Healthy', milk_L_day: 16, vaccination_alert: 'ok' },
  { name: 'Meera', species: 'Cow', breed: 'Jersey Cross', tag: 'TAG-PB107', age_years: 5.5, weight_kg: 420, health_status: 'Under Treatment', milk_L_day: 8, vaccination_alert: 'overdue' },
  { name: 'Sona', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-PB108', age_years: 2.5, weight_kg: 390, health_status: 'Healthy', milk_L_day: 19, vaccination_alert: 'ok' },
  { name: 'Tara', species: 'Cow', breed: 'Sahiwal', tag: 'TAG-PB109', age_years: 7.0, weight_kg: 460, health_status: 'Healthy', milk_L_day: 12, vaccination_alert: 'ok' },
  { name: 'Paro', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-PB110', age_years: 4.0, weight_kg: 480, health_status: 'Healthy', milk_L_day: 21, vaccination_alert: 'ok' },
  { name: 'Bhola', species: 'Buffalo', breed: 'Murrah', tag: 'TAG-PB201', age_years: 5.0, weight_kg: 560, health_status: 'Healthy', milk_L_day: 15, vaccination_alert: 'ok' },
  { name: 'Kali', species: 'Buffalo', breed: 'Murrah', tag: 'TAG-PB202', age_years: 4.0, weight_kg: 540, health_status: 'Healthy', milk_L_day: 14, vaccination_alert: 'ok' },
  { name: 'Nanda', species: 'Buffalo', breed: 'Murrah', tag: 'TAG-PB203', age_years: 6.0, weight_kg: 580, health_status: 'Healthy', milk_L_day: 13, vaccination_alert: 'due' },
  { name: 'Sapna', species: 'Buffalo', breed: 'Nili-Ravi', tag: 'TAG-PB204', age_years: 3.5, weight_kg: 520, health_status: 'Healthy', milk_L_day: 12, vaccination_alert: 'ok' },
  { name: 'Chamki', species: 'Buffalo', breed: 'Nili-Ravi', tag: 'TAG-PB205', age_years: 5.0, weight_kg: 550, health_status: 'Healthy', milk_L_day: 11, vaccination_alert: 'ok' },
  { name: 'Motia', species: 'Buffalo', breed: 'Surti', tag: 'TAG-PB206', age_years: 4.0, weight_kg: 510, health_status: 'Healthy', milk_L_day: 10, vaccination_alert: 'ok' },
  { name: 'Bullet', species: 'Ox', breed: 'Haryana Breed', tag: 'TAG-PB301', age_years: 6.0, weight_kg: 520, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Storm', species: 'Ox', breed: 'Haryana Breed', tag: 'TAG-PB302', age_years: 7.0, weight_kg: 540, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Bhoomi #1', species: 'Goat', breed: 'Beetal', tag: 'TAG-PB401', age_years: 2.0, weight_kg: 52, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Bhoomi #2', species: 'Goat', breed: 'Beetal', tag: 'TAG-PB402', age_years: 2.5, weight_kg: 55, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Bhoomi #3', species: 'Goat', breed: 'Beetal', tag: 'TAG-PB403', age_years: 1.5, weight_kg: 44, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Bhoomi #4', species: 'Goat', breed: 'Sirohi', tag: 'TAG-PB404', age_years: 3.0, weight_kg: 58, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Bhoomi #5', species: 'Goat', breed: 'Sirohi', tag: 'TAG-PB405', age_years: 2.0, weight_kg: 49, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Heifer #1', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-PB111', age_years: 1.0, weight_kg: 200, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Heifer #2', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-PB112', age_years: 1.5, weight_kg: 250, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Heifer #3', species: 'Cow', breed: 'Sahiwal', tag: 'TAG-PB113', age_years: 1.2, weight_kg: 220, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Calf #1', species: 'Cow', breed: 'Murrah Cross', tag: 'TAG-PB114', age_years: 0.5, weight_kg: 90, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Calf #2', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-PB115', age_years: 0.4, weight_kg: 78, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Bhura', species: 'Buffalo', breed: 'Murrah', tag: 'TAG-PB207', age_years: 1.0, weight_kg: 180, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Kesar', species: 'Buffalo', breed: 'Murrah', tag: 'TAG-PB208', age_years: 0.8, weight_kg: 150, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Sheep #1', species: 'Sheep', breed: 'Nali', tag: 'TAG-PB501', age_years: 2.0, weight_kg: 40, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Sheep #2', species: 'Sheep', breed: 'Nali', tag: 'TAG-PB502', age_years: 3.0, weight_kg: 44, health_status: 'Healthy', vaccination_alert: 'ok' },
]);

// ─────────────────────────────────────────────────────────────────────────────
// USER 2 — PRIYA VENKATARAMAN · Mysuru, Karnataka
// Medium Mixed Farm: 12 fields · 24 animals · ₹2.1M revenue
// ─────────────────────────────────────────────────────────────────────────────
const PRIYA_FIELDS = mkFields('ka', 12, [
  { name: 'Block 1 — Sugarcane (Co-86032)', area_acre: 3.0, soil_type: 'Red Laterite', current_crop: 'Sugarcane', sowing_date: '2026-01-20', irrigation: 'Drip', health: 'Excellent', prev_crop: 'Jowar', yield_est_qtl: 320 },
  { name: 'Block 2 — Ragi (MR-6)', area_acre: 2.5, soil_type: 'Sandy Clay', current_crop: 'Ragi', sowing_date: '2026-07-10', irrigation: 'Borewell', health: 'Good', prev_crop: 'Groundnut', yield_est_qtl: 28 },
  { name: 'Block 3 — Tomato (Arka Rakshak)', area_acre: 1.5, soil_type: 'Black Cotton Soil', current_crop: 'Tomato', sowing_date: '2026-08-01', irrigation: 'Drip', health: 'Excellent', prev_crop: 'Onion', yield_est_qtl: 80 },
  { name: 'Block 4 — Banana (Grand Nain)', area_acre: 2.0, soil_type: 'Alluvial Loam', current_crop: 'Banana', sowing_date: '2025-10-05', irrigation: 'Drip', health: 'Good', prev_crop: 'Permanent', yield_est_qtl: 220 },
  { name: 'Block 5 — Jowar / Sorghum (M-35-1)', area_acre: 2.0, soil_type: 'Black Cotton Soil', current_crop: 'Jowar', sowing_date: '2026-06-25', irrigation: 'Rain-fed', health: 'Fair', prev_crop: 'Cotton', yield_est_qtl: 22 },
  { name: 'Block 6 — Groundnut (TMV-7)', area_acre: 2.5, soil_type: 'Red Sandy', current_crop: 'Groundnut', sowing_date: '2026-07-05', irrigation: 'Borewell', health: 'Good', prev_crop: 'Ragi', yield_est_qtl: 18 },
  { name: 'Paddy Block — Paddy (BR-10)', area_acre: 3.0, soil_type: 'Clay Loam', current_crop: 'Paddy', sowing_date: '2026-07-01', irrigation: 'Canal', health: 'Good', prev_crop: 'Wheat', yield_est_qtl: 44 },
  { name: 'Vegetable Plot A — Beans (KDL-1)', area_acre: 1.0, soil_type: 'Sandy Loam', current_crop: 'Beans', sowing_date: '2026-08-10', irrigation: 'Drip', health: 'Excellent', prev_crop: 'Carrot', yield_est_qtl: 35 },
  { name: 'Vegetable Plot B — Brinjal (Arka Anand)', area_acre: 1.0, soil_type: 'Sandy Loam', current_crop: 'Brinjal', sowing_date: '2026-07-28', irrigation: 'Drip', health: 'Good', prev_crop: 'Tomato', yield_est_qtl: 28 },
  { name: 'Coconut Grove — Coconut (West Coast Tall)', area_acre: 2.0, soil_type: 'Laterite', current_crop: 'Coconut', sowing_date: '2015-03-10', irrigation: 'Drip', health: 'Excellent', prev_crop: 'Permanent', yield_est_qtl: 2400 },
  { name: 'Areca Patch — Areca Nut (Mangala)', area_acre: 1.5, soil_type: 'Laterite Loam', current_crop: 'Areca Nut', sowing_date: '2018-06-15', irrigation: 'Drip', health: 'Good', prev_crop: 'Permanent', yield_est_qtl: 12 },
  { name: 'Fodder — Napier Grass', area_acre: 1.5, soil_type: 'Clay Loam', current_crop: 'Napier Grass', sowing_date: '2025-06-01', irrigation: 'Canal', health: 'Excellent', prev_crop: 'Jowar', yield_est_qtl: 350 },
]);

const PRIYA_ANIMALS = mkAnimals('ka', 24, [
  { name: 'Surabhi', species: 'Cow', breed: 'Malnad Gidda', tag: 'TAG-KA101', age_years: 5.0, weight_kg: 280, health_status: 'Healthy', milk_L_day: 6, vaccination_alert: 'ok' },
  { name: 'Parvati', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-KA102', age_years: 4.0, weight_kg: 450, health_status: 'Healthy', milk_L_day: 18, vaccination_alert: 'ok' },
  { name: 'Saraswati', species: 'Cow', breed: 'Jersey Cross', tag: 'TAG-KA103', age_years: 3.5, weight_kg: 420, health_status: 'Healthy', milk_L_day: 15, vaccination_alert: 'due' },
  { name: 'Kaveri', species: 'Cow', breed: 'Hallikar', tag: 'TAG-KA104', age_years: 6.0, weight_kg: 350, health_status: 'Healthy', milk_L_day: 5, vaccination_alert: 'ok' },
  { name: 'Tungabhadra', species: 'Cow', breed: 'Amrit Mahal', tag: 'TAG-KA105', age_years: 4.5, weight_kg: 380, health_status: 'Healthy', milk_L_day: 7, vaccination_alert: 'ok' },
  { name: 'Netravati', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-KA106', age_years: 3.0, weight_kg: 440, health_status: 'Under Treatment', milk_L_day: 10, vaccination_alert: 'overdue' },
  { name: 'Mandakini', species: 'Buffalo', breed: 'Surti', tag: 'TAG-KA201', age_years: 4.0, weight_kg: 500, health_status: 'Healthy', milk_L_day: 10, vaccination_alert: 'ok' },
  { name: 'Alaknanda', species: 'Buffalo', breed: 'Murrah', tag: 'TAG-KA202', age_years: 5.0, weight_kg: 550, health_status: 'Healthy', milk_L_day: 12, vaccination_alert: 'ok' },
  { name: 'Godavari', species: 'Buffalo', breed: 'Surti', tag: 'TAG-KA203', age_years: 3.5, weight_kg: 490, health_status: 'Healthy', milk_L_day: 9, vaccination_alert: 'due' },
  { name: 'Krishna', species: 'Buffalo', breed: 'Jafrabadi', tag: 'TAG-KA204', age_years: 6.0, weight_kg: 580, health_status: 'Healthy', milk_L_day: 11, vaccination_alert: 'ok' },
  { name: 'Billy #1', species: 'Goat', breed: 'Osmanabadi', tag: 'TAG-KA301', age_years: 2.0, weight_kg: 45, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Billy #2', species: 'Goat', breed: 'Osmanabadi', tag: 'TAG-KA302', age_years: 3.0, weight_kg: 52, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Billy #3', species: 'Goat', breed: 'Sangamneri', tag: 'TAG-KA303', age_years: 2.5, weight_kg: 48, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Billy #4', species: 'Goat', breed: 'Sangamneri', tag: 'TAG-KA304', age_years: 1.5, weight_kg: 38, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Billy #5', species: 'Goat', breed: 'Osmanabadi', tag: 'TAG-KA305', age_years: 4.0, weight_kg: 56, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Nandu', species: 'Ox', breed: 'Hallikar', tag: 'TAG-KA401', age_years: 7.0, weight_kg: 480, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Basava', species: 'Ox', breed: 'Amrit Mahal', tag: 'TAG-KA402', age_years: 6.0, weight_kg: 510, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Calf KA1', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-KA107', age_years: 0.5, weight_kg: 95, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Calf KA2', species: 'Cow', breed: 'Jersey Cross', tag: 'TAG-KA108', age_years: 0.8, weight_kg: 120, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Duck #1', species: 'Duck', breed: 'Khaki Campbell', tag: 'TAG-KA501', age_years: 1.0, weight_kg: 2.2, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Duck #2', species: 'Duck', breed: 'Khaki Campbell', tag: 'TAG-KA502', age_years: 1.0, weight_kg: 2.1, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Duck #3', species: 'Duck', breed: 'Khaki Campbell', tag: 'TAG-KA503', age_years: 1.2, weight_kg: 2.3, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Duck #4', species: 'Duck', breed: 'Desi Duck', tag: 'TAG-KA504', age_years: 0.8, weight_kg: 1.9, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Duck #5', species: 'Duck', breed: 'Desi Duck', tag: 'TAG-KA505', age_years: 0.9, weight_kg: 2.0, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
]);

// ─────────────────────────────────────────────────────────────────────────────
// USER 3 — IBRAHIM ALI SHEIKH · Guwahati, Assam
// Livestock-Focused Farm: 5 fields · 45 animals · ₹1.8M revenue
// ─────────────────────────────────────────────────────────────────────────────
const IBRAHIM_FIELDS = mkFields('as', 5, [
  { name: 'Paddy Field — Joha Saul (Aromatic Rice)', area_acre: 4.0, soil_type: 'Clay Loam', current_crop: 'Rice', sowing_date: '2026-06-15', irrigation: 'Rain-fed + Bund', health: 'Good', prev_crop: 'Mustard', yield_est_qtl: 38 },
  { name: 'Mustard Block — Toria (B-9)', area_acre: 2.5, soil_type: 'Sandy Loam', current_crop: 'Mustard', sowing_date: '2026-10-10', irrigation: 'Borewell', health: 'Good', prev_crop: 'Rice', yield_est_qtl: 10 },
  { name: 'Vegetable Patch — Lau / Bottle Gourd', area_acre: 1.0, soil_type: 'Alluvial', current_crop: 'Bottle Gourd', sowing_date: '2026-07-20', irrigation: 'Drip', health: 'Excellent', prev_crop: 'Beans', yield_est_qtl: 40 },
  { name: 'Fodder A — Napier + Jowar Mix', area_acre: 3.0, soil_type: 'Clay Loam', current_crop: 'Napier Grass', sowing_date: '2025-05-10', irrigation: 'Canal', health: 'Excellent', prev_crop: 'Permanent', yield_est_qtl: 280 },
  { name: 'Fodder B — Oat Fodder (Kent)', area_acre: 2.0, soil_type: 'Sandy Clay', current_crop: 'Oat Fodder', sowing_date: '2026-10-01', irrigation: 'Borewell', health: 'Good', prev_crop: 'Paddy', yield_est_qtl: 120 },
]);

const IBRAHIM_ANIMALS = mkAnimals('as', 45, [
  { name: 'Jamuna', species: 'Cow', breed: 'Assam Hill Cattle', tag: 'TAG-AS101', age_years: 5.0, weight_kg: 260, health_status: 'Healthy', milk_L_day: 4, vaccination_alert: 'ok' },
  { name: 'Doli', species: 'Cow', breed: 'Assam Hill Cattle', tag: 'TAG-AS102', age_years: 4.0, weight_kg: 245, health_status: 'Healthy', milk_L_day: 5, vaccination_alert: 'ok' },
  { name: 'Rosy', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-AS103', age_years: 3.5, weight_kg: 420, health_status: 'Healthy', milk_L_day: 16, vaccination_alert: 'due' },
  { name: 'Moni', species: 'Cow', breed: 'Jersey Cross', tag: 'TAG-AS104', age_years: 4.5, weight_kg: 410, health_status: 'Healthy', milk_L_day: 14, vaccination_alert: 'ok' },
  { name: 'Puja', species: 'Cow', breed: 'Red Sindhi', tag: 'TAG-AS105', age_years: 6.0, weight_kg: 390, health_status: 'Healthy', milk_L_day: 9, vaccination_alert: 'ok' },
  { name: 'Lata', species: 'Cow', breed: 'Gir Crossbred', tag: 'TAG-AS106', age_years: 3.0, weight_kg: 400, health_status: 'Healthy', milk_L_day: 11, vaccination_alert: 'ok' },
  { name: 'Meena', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-AS107', age_years: 5.0, weight_kg: 455, health_status: 'Healthy', milk_L_day: 17, vaccination_alert: 'ok' },
  { name: 'Nitu', species: 'Cow', breed: 'Jersey Cross', tag: 'TAG-AS108', age_years: 4.0, weight_kg: 430, health_status: 'Under Treatment', milk_L_day: 6, vaccination_alert: 'overdue' },
  { name: 'Pari', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-AS109', age_years: 2.5, weight_kg: 370, health_status: 'Healthy', milk_L_day: 15, vaccination_alert: 'ok' },
  { name: 'Rina', species: 'Cow', breed: 'Sahiwal', tag: 'TAG-AS110', age_years: 5.5, weight_kg: 440, health_status: 'Healthy', milk_L_day: 12, vaccination_alert: 'ok' },
  { name: 'Sita', species: 'Cow', breed: 'Assam Hill Cattle', tag: 'TAG-AS111', age_years: 7.0, weight_kg: 270, health_status: 'Healthy', milk_L_day: 3, vaccination_alert: 'ok' },
  { name: 'Uma', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-AS112', age_years: 3.5, weight_kg: 460, health_status: 'Healthy', milk_L_day: 20, vaccination_alert: 'ok' },
  { name: 'Kamal', species: 'Buffalo', breed: 'Murrah', tag: 'TAG-AS201', age_years: 4.0, weight_kg: 530, health_status: 'Healthy', milk_L_day: 12, vaccination_alert: 'ok' },
  { name: 'Bela', species: 'Buffalo', breed: 'Murrah', tag: 'TAG-AS202', age_years: 5.0, weight_kg: 560, health_status: 'Healthy', milk_L_day: 13, vaccination_alert: 'ok' },
  { name: 'Chand', species: 'Buffalo', breed: 'Nili-Ravi', tag: 'TAG-AS203', age_years: 3.5, weight_kg: 510, health_status: 'Healthy', milk_L_day: 10, vaccination_alert: 'due' },
  { name: 'Heifer A1', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-AS113', age_years: 1.0, weight_kg: 180, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Heifer A2', species: 'Cow', breed: 'Jersey Cross', tag: 'TAG-AS114', age_years: 1.2, weight_kg: 200, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Heifer A3', species: 'Cow', breed: 'Sahiwal', tag: 'TAG-AS115', age_years: 1.5, weight_kg: 230, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Calf A1', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-AS116', age_years: 0.4, weight_kg: 75, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Calf A2', species: 'Cow', breed: 'Jersey Cross', tag: 'TAG-AS117', age_years: 0.5, weight_kg: 82, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Goat AS1', species: 'Goat', breed: 'Black Bengal', tag: 'TAG-AS301', age_years: 2.0, weight_kg: 22, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Goat AS2', species: 'Goat', breed: 'Black Bengal', tag: 'TAG-AS302', age_years: 2.5, weight_kg: 24, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Goat AS3', species: 'Goat', breed: 'Black Bengal', tag: 'TAG-AS303', age_years: 1.5, weight_kg: 18, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Goat AS4', species: 'Goat', breed: 'Black Bengal', tag: 'TAG-AS304', age_years: 3.0, weight_kg: 28, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Goat AS5', species: 'Goat', breed: 'Assam Goat', tag: 'TAG-AS305', age_years: 2.0, weight_kg: 20, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Goat AS6', species: 'Goat', breed: 'Assam Goat', tag: 'TAG-AS306', age_years: 1.0, weight_kg: 14, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Goat AS7', species: 'Goat', breed: 'Black Bengal', tag: 'TAG-AS307', age_years: 2.5, weight_kg: 25, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Goat AS8', species: 'Goat', breed: 'Assam Goat', tag: 'TAG-AS308', age_years: 3.5, weight_kg: 30, health_status: 'Healthy', vaccination_alert: 'due' },
  { name: 'Pig AS1', species: 'Pig', breed: 'Ghungroo', tag: 'TAG-AS601', age_years: 1.5, weight_kg: 65, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Pig AS2', species: 'Pig', breed: 'Ghungroo', tag: 'TAG-AS602', age_years: 2.0, weight_kg: 80, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Pig AS3', species: 'Pig', breed: 'Large White Yorkshire', tag: 'TAG-AS603', age_years: 1.0, weight_kg: 55, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Pig AS4', species: 'Pig', breed: 'Ghungroo', tag: 'TAG-AS604', age_years: 2.5, weight_kg: 90, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Duck AS1', species: 'Duck', breed: 'Khaki Campbell', tag: 'TAG-AS501', age_years: 1.0, weight_kg: 2.1, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Duck AS2', species: 'Duck', breed: 'Khaki Campbell', tag: 'TAG-AS502', age_years: 1.1, weight_kg: 2.2, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Duck AS3', species: 'Duck', breed: 'Desi Assam', tag: 'TAG-AS503', age_years: 0.9, weight_kg: 1.8, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Duck AS4', species: 'Duck', breed: 'Desi Assam', tag: 'TAG-AS504', age_years: 1.2, weight_kg: 2.0, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Duck AS5', species: 'Duck', breed: 'Khaki Campbell', tag: 'TAG-AS505', age_years: 0.8, weight_kg: 1.9, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Hen AS1', species: 'Poultry', breed: 'RIR (Desi Layer)', tag: 'TAG-AS701', age_years: 1.0, weight_kg: 1.8, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Hen AS2', species: 'Poultry', breed: 'RIR (Desi Layer)', tag: 'TAG-AS702', age_years: 1.0, weight_kg: 1.8, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Hen AS3', species: 'Poultry', breed: 'RIR (Desi Layer)', tag: 'TAG-AS703', age_years: 1.1, weight_kg: 1.9, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Hen AS4', species: 'Poultry', breed: 'Kadaknath', tag: 'TAG-AS704', age_years: 0.8, weight_kg: 1.5, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Hen AS5', species: 'Poultry', breed: 'Kadaknath', tag: 'TAG-AS705', age_years: 0.9, weight_kg: 1.6, health_status: 'Healthy', eggs_day: 1, vaccination_alert: 'ok' },
  { name: 'Sheep AS1', species: 'Sheep', breed: 'Assam Sheep', tag: 'TAG-AS801', age_years: 2.0, weight_kg: 32, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Sheep AS2', species: 'Sheep', breed: 'Assam Sheep', tag: 'TAG-AS802', age_years: 3.0, weight_kg: 38, health_status: 'Healthy', vaccination_alert: 'ok' },
]);

// ─────────────────────────────────────────────────────────────────────────────
// USER 4 — KAVITA PATEL · Indore, Madhya Pradesh
// Crop-Diverse Farm: 20 fields · 18 animals · ₹2.6M revenue
// ─────────────────────────────────────────────────────────────────────────────
const KAVITA_FIELDS = mkFields('mp', 20, [
  { name: 'Soybean Block A (JS-9305)', area_acre: 4.0, soil_type: 'Black Cotton Soil', current_crop: 'Soybean', sowing_date: '2026-06-25', irrigation: 'Rain-fed', health: 'Excellent', prev_crop: 'Wheat', yield_est_qtl: 24 },
  { name: 'Soybean Block B (NRC-7)', area_acre: 3.5, soil_type: 'Black Cotton Soil', current_crop: 'Soybean', sowing_date: '2026-06-28', irrigation: 'Sprinkler', health: 'Good', prev_crop: 'Chickpea', yield_est_qtl: 20 },
  { name: 'Cotton Field (Bunny BT)', area_acre: 3.0, soil_type: 'Medium Black', current_crop: 'Cotton', sowing_date: '2026-05-15', irrigation: 'Drip', health: 'Good', prev_crop: 'Soybean', yield_est_qtl: 18 },
  { name: 'Chickpea Block (JG-14)', area_acre: 3.5, soil_type: 'Clay Loam', current_crop: 'Chickpea', sowing_date: '2026-10-20', irrigation: 'Rain-fed', health: 'Good', prev_crop: 'Soybean', yield_est_qtl: 14 },
  { name: 'Wheat Block A (GW-496)', area_acre: 4.0, soil_type: 'Black Cotton Soil', current_crop: 'Wheat', sowing_date: '2026-11-15', irrigation: 'Canal', health: 'Excellent', prev_crop: 'Soybean', yield_est_qtl: 50 },
  { name: 'Wheat Block B (HD-2781)', area_acre: 3.0, soil_type: 'Clay Loam', current_crop: 'Wheat', sowing_date: '2026-11-20', irrigation: 'Borewell', health: 'Good', prev_crop: 'Cotton', yield_est_qtl: 44 },
  { name: 'Lentil / Masoor (IPL-406)', area_acre: 2.5, soil_type: 'Sandy Loam', current_crop: 'Lentil', sowing_date: '2026-10-25', irrigation: 'Rain-fed', health: 'Fair', prev_crop: 'Soybean', yield_est_qtl: 12 },
  { name: 'Onion Red (Phule Suvarna)', area_acre: 2.0, soil_type: 'Sandy Loam', current_crop: 'Onion', sowing_date: '2026-10-05', irrigation: 'Drip', health: 'Excellent', prev_crop: 'Garlic', yield_est_qtl: 140 },
  { name: 'Garlic (Godavari)', area_acre: 1.5, soil_type: 'Sandy Clay', current_crop: 'Garlic', sowing_date: '2026-10-10', irrigation: 'Drip', health: 'Good', prev_crop: 'Onion', yield_est_qtl: 60 },
  { name: 'Coriander / Dhaniya (RCr-41)', area_acre: 1.5, soil_type: 'Sandy Loam', current_crop: 'Coriander', sowing_date: '2026-10-15', irrigation: 'Sprinkler', health: 'Good', prev_crop: 'Wheat', yield_est_qtl: 8 },
  { name: 'Fenugreek / Methi (Pusa Early Bunching)', area_acre: 1.0, soil_type: 'Sandy Loam', current_crop: 'Fenugreek', sowing_date: '2026-10-20', irrigation: 'Sprinkler', health: 'Excellent', prev_crop: 'Moong', yield_est_qtl: 6 },
  { name: 'Maize Kharif (DHM-117)', area_acre: 3.0, soil_type: 'Clay Loam', current_crop: 'Maize', sowing_date: '2026-06-20', irrigation: 'Rain-fed', health: 'Good', prev_crop: 'Chickpea', yield_est_qtl: 45 },
  { name: 'Sorghum / Jowar (SPV-462)', area_acre: 2.5, soil_type: 'Black Cotton Soil', current_crop: 'Jowar', sowing_date: '2026-06-22', irrigation: 'Rain-fed', health: 'Good', prev_crop: 'Cotton', yield_est_qtl: 25 },
  { name: 'Turmeric (Rajendra Sonia)', area_acre: 1.5, soil_type: 'Sandy Clay Loam', current_crop: 'Turmeric', sowing_date: '2026-05-10', irrigation: 'Drip', health: 'Excellent', prev_crop: 'Soybean', yield_est_qtl: 150 },
  { name: 'Ginger (Suprabha)', area_acre: 1.0, soil_type: 'Sandy Loam', current_crop: 'Ginger', sowing_date: '2026-04-20', irrigation: 'Drip', health: 'Good', prev_crop: 'Maize', yield_est_qtl: 80 },
  { name: 'Black Gram / Urad (T-9)', area_acre: 2.0, soil_type: 'Sandy Loam', current_crop: 'Black Gram', sowing_date: '2026-07-05', irrigation: 'Rain-fed', health: 'Good', prev_crop: 'Wheat', yield_est_qtl: 10 },
  { name: 'Green Gram / Moong (PDM-11)', area_acre: 2.0, soil_type: 'Sandy Loam', current_crop: 'Green Gram', sowing_date: '2026-07-10', irrigation: 'Rain-fed', health: 'Fair', prev_crop: 'Wheat', yield_est_qtl: 8 },
  { name: 'Sesame / Til (RT-46)', area_acre: 1.5, soil_type: 'Sandy Loam', current_crop: 'Sesame', sowing_date: '2026-06-15', irrigation: 'Rain-fed', health: 'Good', prev_crop: 'Chickpea', yield_est_qtl: 5 },
  { name: 'Castor (GCH-4)', area_acre: 2.0, soil_type: 'Sandy Clay', current_crop: 'Castor', sowing_date: '2026-06-10', irrigation: 'Rain-fed', health: 'Good', prev_crop: 'Soybean', yield_est_qtl: 20 },
  { name: 'Fodder — Berseem + Oat Mix', area_acre: 2.0, soil_type: 'Clay Loam', current_crop: 'Berseem', sowing_date: '2026-10-01', irrigation: 'Canal', health: 'Excellent', prev_crop: 'Maize', yield_est_qtl: 180 },
]);

const KAVITA_ANIMALS = mkAnimals('mp', 18, [
  { name: 'Ganga', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-MP101', age_years: 4.5, weight_kg: 455, health_status: 'Healthy', milk_L_day: 18, vaccination_alert: 'ok' },
  { name: 'Yamuna', species: 'Cow', breed: 'Sahiwal', tag: 'TAG-MP102', age_years: 5.0, weight_kg: 430, health_status: 'Healthy', milk_L_day: 12, vaccination_alert: 'ok' },
  { name: 'Saraswati', species: 'Cow', breed: 'Gir Crossbred', tag: 'TAG-MP103', age_years: 3.5, weight_kg: 420, health_status: 'Healthy', milk_L_day: 10, vaccination_alert: 'due' },
  { name: 'Lakshmi', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-MP104', age_years: 4.0, weight_kg: 470, health_status: 'Healthy', milk_L_day: 20, vaccination_alert: 'ok' },
  { name: 'Kaveri', species: 'Buffalo', breed: 'Murrah', tag: 'TAG-MP201', age_years: 5.5, weight_kg: 560, health_status: 'Healthy', milk_L_day: 14, vaccination_alert: 'ok' },
  { name: 'Narmada', species: 'Buffalo', breed: 'Murrah', tag: 'TAG-MP202', age_years: 4.0, weight_kg: 540, health_status: 'Healthy', milk_L_day: 13, vaccination_alert: 'ok' },
  { name: 'Chambal', species: 'Buffalo', breed: 'Bhadawari', tag: 'TAG-MP203', age_years: 6.0, weight_kg: 490, health_status: 'Healthy', milk_L_day: 9, vaccination_alert: 'ok' },
  { name: 'Goat MP1', species: 'Goat', breed: 'Jakhrana', tag: 'TAG-MP301', age_years: 2.0, weight_kg: 50, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Goat MP2', species: 'Goat', breed: 'Jakhrana', tag: 'TAG-MP302', age_years: 3.0, weight_kg: 58, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Goat MP3', species: 'Goat', breed: 'Sirohi', tag: 'TAG-MP303', age_years: 2.5, weight_kg: 52, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Goat MP4', species: 'Goat', breed: 'Sirohi', tag: 'TAG-MP304', age_years: 1.5, weight_kg: 38, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Heifer MP1', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-MP105', age_years: 1.0, weight_kg: 190, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Heifer MP2', species: 'Cow', breed: 'Sahiwal', tag: 'TAG-MP106', age_years: 1.2, weight_kg: 210, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Calf MP1', species: 'Cow', breed: 'HF Crossbred', tag: 'TAG-MP107', age_years: 0.4, weight_kg: 72, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Sheep MP1', species: 'Sheep', breed: 'Manpuri', tag: 'TAG-MP401', age_years: 2.5, weight_kg: 36, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Sheep MP2', species: 'Sheep', breed: 'Manpuri', tag: 'TAG-MP402', age_years: 3.0, weight_kg: 40, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Sheep MP3', species: 'Sheep', breed: 'Manpuri', tag: 'TAG-MP403', age_years: 2.0, weight_kg: 33, health_status: 'Healthy', vaccination_alert: 'ok' },
  { name: 'Ox MP1', species: 'Ox', breed: 'Nimari', tag: 'TAG-MP501', age_years: 6.0, weight_kg: 500, health_status: 'Healthy', vaccination_alert: 'ok' },
]);

// ─────────────────────────────────────────────────────────────────────────────
// MASTER USER STORE — v4
// DB_KEY bumped to v4 → automatically clears old localStorage cache
// ─────────────────────────────────────────────────────────────────────────────
export const INITIAL_PRESET_USERS = {

  // ── USER 1: ARUN SINGH DHALIWAL — LARGE COMMERCIAL FARM ──
  user_arun_punjab: {
    id: 'user_arun_punjab',
    name: 'Arun Singh Dhaliwal',
    email: 'arun.dhaliwal@agritech.in',
    password: '1234',
    phone: '9814412234',
    location: 'Ludhiana, Punjab',
    region: 'North India (Punjab)',
    soil_type: 'Clay Loam',
    soil_ph: 7.6,
    total_area_acre: 52.0,
    language: 'Punjabi',
    avatar: '🌾',
    badge: 'Punjab Commercial Hub',
    farm_type: 'Large Commercial Farm',
    revenue_INR: 4800000,
    fields: ARUN_FIELDS,
    livestock: ARUN_ANIMALS,
  },

  // ── USER 2: PRIYA VENKATARAMAN — MEDIUM MIXED FARM ──
  user_priya_karnataka: {
    id: 'user_priya_karnataka',
    name: 'Priya Venkataraman',
    email: 'priya.v@agritech.in',
    password: '1234',
    phone: '9844421890',
    location: 'Mysuru, Karnataka',
    region: 'South India (Karnataka)',
    soil_type: 'Red Laterite + Black Cotton',
    soil_ph: 6.5,
    total_area_acre: 23.5,
    language: 'Kannada',
    avatar: '🌿',
    badge: 'Karnataka Mixed Farm',
    farm_type: 'Medium Mixed Farm',
    revenue_INR: 2100000,
    fields: PRIYA_FIELDS,
    livestock: PRIYA_ANIMALS,
  },

  // ── USER 3: IBRAHIM ALI SHEIKH — LIVESTOCK-FOCUSED FARM ──
  user_ibrahim_assam: {
    id: 'user_ibrahim_assam',
    name: 'Ibrahim Ali Sheikh',
    email: 'ibrahim.sheikh@agritech.in',
    password: '1234',
    phone: '9435188876',
    location: 'Guwahati, Assam',
    region: 'Northeast India (Assam)',
    soil_type: 'Alluvial Clay',
    soil_ph: 5.8,
    total_area_acre: 12.5,
    language: 'Assamese',
    avatar: '🐄',
    badge: 'Assam Livestock Hub',
    farm_type: 'Livestock-Focused Farm',
    revenue_INR: 1800000,
    fields: IBRAHIM_FIELDS,
    livestock: IBRAHIM_ANIMALS,
  },

  // ── USER 4: KAVITA PATEL — CROP-DIVERSE FARM ──
  user_kavita_mp: {
    id: 'user_kavita_mp',
    name: 'Kavita Patel',
    email: 'kavita.patel@agritech.in',
    password: '1234',
    phone: '9826611022',
    location: 'Indore, Madhya Pradesh',
    region: 'Central India (MP)',
    soil_type: 'Black Cotton Soil',
    soil_ph: 7.2,
    total_area_acre: 48.0,
    language: 'Hindi',
    avatar: '🌱',
    badge: 'MP Crop Diversity Farm',
    farm_type: 'Crop-Diverse Farm',
    revenue_INR: 2600000,
    fields: KAVITA_FIELDS,
    livestock: KAVITA_ANIMALS,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// localStorage keys — bumped to v4 to force clear old cached data
// ─────────────────────────────────────────────────────────────────────────────
const DB_KEY = 'agritech_users_directory_v4';
const ACTIVE_KEY = 'agritech_active_user_id';

// Clean up old cache keys from previous versions
['agritech_users_directory_v3', 'agritech_users_directory_v2', 'agritech_users_directory_v1', 'agritech_users_directory'].forEach(oldKey => {
  try { localStorage.removeItem(oldKey); } catch (_) {}
});

export const userStore = {
  getUsers: () => {
    try {
      const raw = localStorage.getItem(DB_KEY);
      let users = raw ? JSON.parse(raw) : {};

      // Ensure all 4 master presets always exist with fresh data
      Object.keys(INITIAL_PRESET_USERS).forEach(k => {
        if (!users[k]) {
          users[k] = INITIAL_PRESET_USERS[k];
        }
      });

      // Remove any old preset user IDs that no longer exist
      ['shubham_gujarat', 'ramesh_jodhpur', 'amit_delhi'].forEach(oldId => {
        delete users[oldId];
      });

      return users;
    } catch {
      return { ...INITIAL_PRESET_USERS };
    }
  },

  getActiveUser: () => {
    try {
      const activeId = localStorage.getItem(ACTIVE_KEY);
      const users = userStore.getUsers();

      // If stored active ID is an old preset, reset to user 1
      const validId = activeId && users[activeId] ? activeId : null;
      if (validId) return users[validId];

      // Default to first preset (Arun Punjab)
      return users.user_arun_punjab || Object.values(users)[0] || null;
    } catch {
      return INITIAL_PRESET_USERS.user_arun_punjab;
    }
  },

  setActiveUser: (userId) => {
    localStorage.setItem(ACTIVE_KEY, userId);
    localStorage.setItem('agritech_auth', 'true');
  },

  saveUser: (userObj) => {
    try {
      const users = userStore.getUsers();
      const id = userObj.id || ('user_' + Date.now());
      const completeUser = {
        ...userObj,
        id,
        updated_at: Date.now()
      };
      users[id] = completeUser;
      localStorage.setItem(DB_KEY, JSON.stringify(users));
      localStorage.setItem(ACTIVE_KEY, id);
      localStorage.setItem('agritech_auth', 'true');
      return completeUser;
    } catch (e) {
      console.error('Failed to save user:', e);
      return userObj;
    }
  },

  updateActiveProfile: (patch) => {
    try {
      const active = userStore.getActiveUser();
      if (!active) return null;
      const users = userStore.getUsers();
      const updated = {
        ...active,
        ...patch,
        updated_at: Date.now()
      };
      users[active.id] = updated;
      localStorage.setItem(DB_KEY, JSON.stringify(users));
      return updated;
    } catch (e) {
      console.error('Failed to update active profile in userStore:', e);
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem(ACTIVE_KEY);
    localStorage.removeItem('agritech_auth');
    localStorage.removeItem('agritech_profile');
  }
};
