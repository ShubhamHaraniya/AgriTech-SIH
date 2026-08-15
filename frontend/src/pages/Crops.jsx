/**
 * Crops — Crop Management & Agronomic Field Advisory Hub
 * Supports full CRUD (Add, Edit, Delete) for farm fields,
 * and comprehensive agronomic calendar schedules for ALL major crops:
 * Wheat, Tomato, Rice/Paddy, Cotton, Maize, Mustard, Potato, Onion, Sugarcane, Soybean, Chilli.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmApi, cropApi } from '../api/client';
import BottomNav from '../components/BottomNav';
import { userStore } from '../utils/userStore';

const CROP_ICON = {
  wheat: '🌾', tomato: '🍅', rice: '🌾', paddy: '🌾', cotton: '🌱',
  maize: '🌽', corn: '🌽', sugarcane: '🎋', mustard: '🌼', potato: '🥔',
  soybean: '🫘', groundnut: '🥜', onion: '🧅', chilli: '🌶️', gram: '🫘'
};

function getCropIcon(name = '') {
  const k = (name || '').toLowerCase();
  const match = Object.keys(CROP_ICON).find(x => k.includes(x));
  return CROP_ICON[match] || '🌱';
}

const CROP_STAGES = {
  wheat: ['Germination', 'CRI Stage', 'Tillering', 'Jointing', 'Heading', 'Harvest'],
  tomato: ['Transplanting', 'Vegetative', 'Flowering', 'Fruit Set', 'Ripening', 'Harvest'],
  rice: ['Nursery', 'Transplanting', 'Tillering', 'Panicle', 'Flowering', 'Harvest'],
  paddy: ['Nursery', 'Transplanting', 'Tillering', 'Panicle', 'Flowering', 'Harvest'],
  cotton: ['Emergence', 'Square Form', 'Flowering', 'Boll Dev', 'Boll Burst', 'Picking'],
  maize: ['Seedling', 'Knee-High', 'Tasseling', 'Silking', 'Grain Fill', 'Harvest'],
  mustard: ['Seedling', 'Rosette', 'Branching', 'Flowering', 'Pod Dev', 'Harvest'],
  potato: ['Sprouting', 'Vegetative', 'Tuber Init', 'Tuber Bulk', 'Maturation', 'Digging'],
  onion: ['Seedling', 'Vegetative', 'Bulb Init', 'Bulb Bulk', 'Neck Fall', 'Harvest'],
  sugarcane: ['Germination', 'Tillering', 'Elongation', 'Grand Growth', 'Maturity', 'Harvest'],
  soybean: ['Emergence', 'Vegetative', 'Flowering', 'Pod Fill', 'Maturity', 'Harvest'],
  groundnut: ['Seedling', 'Vegetative', 'Flowering', 'Pegging', 'Pod Bulk', 'Harvest'],
  chilli: ['Transplant', 'Vegetative', 'Flowering', 'Fruit Set', 'Harvest', 'Picking'],
  default: ['Sowing', 'Vegetative', 'Flowering', 'Maturity', 'Harvest']
};

/* ─── Universal Crop Stage Schedules for Calendar ─────────────────────────── */
const STAGE_SCHEDULES = {
  wheat: [
    { maxDas: 20, stage: 'CRI & Early Growth (Day 0–20)', tasks: [
      { type: 'field', title: 'First Irrigation at CRI Stage', desc: 'Critical crown root irrigation 20–25 DAS to stimulate root anchoring.' },
      { type: 'fert', title: 'Urea Top Dressing (30 kg/Ac)', desc: 'Apply 1st split of nitrogen alongside first irrigation.' },
      { type: 'prot', title: 'Weed Emergence Inspection', desc: 'Check for Phalaris minor and broadleaf weed emergence in field.' }
    ]},
    { maxDas: 45, stage: 'Tillering & Vegetative Growth (Day 21–45)', tasks: [
      { type: 'field', title: 'Intercultural Hoeing & De-weeding', desc: 'Light weeding between rows to improve soil aeration.' },
      { type: 'fert', title: 'Zinc Sulphate + Urea Spray', desc: 'Foliar micronutrient spray (0.5% ZnSO4 + 2% Urea) to enhance tillers.' },
      { type: 'water', title: '2nd Scheduled Irrigation', desc: 'Provide adequate moisture for active tillering flush.' }
    ]},
    { maxDas: 70, stage: 'Jointing & Stem Elongation (Day 46–70)', tasks: [
      { type: 'water', title: '3rd Irrigation at Late Jointing', desc: 'Crucial watering to support rapid stem extension and spike development.' },
      { type: 'prot', title: 'Yellow / Stripe Rust Surveillance', desc: 'Inspect underside of lower leaves for yellow pustules; spray Propiconazole if noticed.' }
    ]},
    { maxDas: 90, stage: 'Booting & Flowering Stage (Day 71–90)', tasks: [
      { type: 'water', title: '4th Irrigation during Spikelet Formation', desc: 'Avoid dry spells to prevent spikelet sterility.' },
      { type: 'prot', title: 'Aphid & Head Blight Deterrence', desc: 'Monitor earheads during calm morning hours.' }
    ]},
    { maxDas: 110, stage: 'Grain Filling & Milk Stage (Day 91–110)', tasks: [
      { type: 'water', title: 'Light Irrigation at Dough Stage', desc: 'Light watering on non-windy days to avoid crop lodging.' },
      { type: 'fert', title: '0:0:50 Potassium Sulphate Spray', desc: 'Improves grain weight, luster, and test weight.' }
    ]},
    { maxDas: 999, stage: 'Maturity & Harvesting (Day 111+)', tasks: [
      { type: 'field', title: 'Pre-Harvest Moisture Check', desc: 'Stop watering 10–14 days prior. Harvest when grains are golden hard (< 14% moisture).' },
      { type: 'field', title: 'Combine Harvesting & Threshing', desc: 'Thresh and store grain in dry, aerated storage bins.' }
    ]}
  ],
  tomato: [
    { maxDas: 15, stage: 'Transplanting & Rooting (Day 0–15)', tasks: [
      { type: 'water', title: 'Light Daily Drip Irrigation', desc: 'Keep root zone moist to minimize transplant shock.' },
      { type: 'prot', title: 'Root Dip with Trichoderma', desc: 'Prevent collar rot and early damping-off fungi.' }
    ]},
    { maxDas: 35, stage: 'Vegetative Growth & Staking (Day 16–35)', tasks: [
      { type: 'field', title: 'Erect Staking & Trellis Support', desc: 'Tie main vines with twine to keep foliage off wet soil.' },
      { type: 'fert', title: 'NPK 19:19:19 Fertigation', desc: 'Apply balanced soluble fertilizer weekly through drip lines.' }
    ]},
    { maxDas: 55, stage: 'Flowering & Fruit Setting (Day 36–55)', tasks: [
      { type: 'fert', title: 'Boron & Calcium Nitrate Spray', desc: 'Prevent blossom end rot and promote dense fruit set.' },
      { type: 'prot', title: 'Fruit Borer & Whitefly Surveillance', desc: 'Install yellow sticky traps and pheromone traps.' }
    ]},
    { maxDas: 80, stage: 'Fruit Development & Sizing (Day 56–80)', tasks: [
      { type: 'fert', title: 'Potassium Sulphate (0:0:50)', desc: 'Boost fruit size, firmness, and uniform color.' },
      { type: 'water', title: 'Even Moisture Regulation', desc: 'Avoid alternate wet/dry cycles to eliminate fruit cracking.' }
    ]},
    { maxDas: 999, stage: 'Ripening & Periodic Harvesting (Day 81+)', tasks: [
      { type: 'field', title: 'Morning Fruit Picking', desc: 'Harvest firm pink/red fruits in cool morning hours every 3 days.' },
      { type: 'prot', title: 'Post-Harvest Sorting & Crating', desc: 'Grade fruits by size and discard damaged specimens.' }
    ]}
  ],
  rice: [
    { maxDas: 20, stage: 'Transplanting & Root Establishment (Day 0–20)', tasks: [
      { type: 'water', title: 'Shallow Standing Water (2–3 cm)', desc: 'Maintain shallow water layer to prevent seedling lodging.' },
      { type: 'fert', title: 'Basal DAP & Zinc Application', desc: 'Apply Zinc Sulphate @ 10 kg/Ac to avoid Khaira disease.' }
    ]},
    { maxDas: 45, stage: 'Active Tillering Phase (Day 21–45)', tasks: [
      { type: 'fert', title: '1st Split Urea Top Dressing', desc: 'Broadcast Urea @ 30 kg/Ac into saturated soil.' },
      { type: 'prot', title: 'Stem Borer & Leaf Folder Monitoring', desc: 'Check for dead hearts in central tillers.' }
    ]},
    { maxDas: 75, stage: 'Panicle Initiation & Booting (Day 46–75)', tasks: [
      { type: 'water', title: 'Maintain 5 cm Water Level', desc: 'Critical water requirement during panicle formation.' },
      { type: 'fert', title: 'Potash (MOP) Top Dressing', desc: 'Apply Muriate of Potash to strengthen panicles.' }
    ]},
    { maxDas: 100, stage: 'Flowering & Grain Milk Stage (Day 76–100)', tasks: [
      { type: 'prot', title: 'Rice Blast & Sheath Blight Protection', desc: 'Foliar spray of Tricyclazole if humidity is high.' },
      { type: 'water', title: 'Intermittent Wetting & Drying', desc: 'Aerate soil periodically to prevent root decay.' }
    ]},
    { maxDas: 999, stage: 'Grain Hardening & Harvesting (Day 101+)', tasks: [
      { type: 'field', title: 'Drain Field 10 Days Before Harvest', desc: 'Allow field to dry for easy mechanical harvesting.' },
      { type: 'field', title: 'Combine Harvesting at 85% Golden Grains', desc: 'Harvest and dry grains to 12–14% moisture.' }
    ]}
  ],
  cotton: [
    { maxDas: 25, stage: 'Seedling & Emergence (Day 0–25)', tasks: [
      { type: 'field', title: 'Gap Filling & Thinning', desc: 'Maintain 1 plant per hill for optimal canopy development.' },
      { type: 'prot', title: 'Sucking Pest Scouting (Jassids/Thrips)', desc: 'Inspect bottom leaves; use neem oil if thresholds exceeded.' }
    ]},
    { maxDas: 55, stage: 'Square Formation & Branching (Day 26–55)', tasks: [
      { type: 'fert', title: 'Urea + Magnesium Sulphate Top Dressing', desc: 'Prevent leaf reddening and support square retention.' },
      { type: 'field', title: 'Earthing Up & Weed Removal', desc: 'Ridge soil around roots before heavy monsoons.' }
    ]},
    { maxDas: 90, stage: 'Peak Flowering & Early Boll Dev (Day 56–90)', tasks: [
      { type: 'fert', title: 'Planofix (NAA) / Boron Spray', desc: 'Prevent flower and square shedding.' },
      { type: 'prot', title: 'Pink Bollworm Surveillance', desc: 'Deploy pheromone traps @ 5 traps/acre.' }
    ]},
    { maxDas: 130, stage: 'Boll Maturation & Bursting (Day 91–130)', tasks: [
      { type: 'water', title: 'Regulated Light Irrigation', desc: 'Prevent premature boll drop while promoting fiber elongation.' },
      { type: 'fert', title: '0:0:50 Potassium Spray', desc: 'Improves boll size and fiber strength.' }
    ]},
    { maxDas: 999, stage: 'Periodic Cotton Picking (Day 131+)', tasks: [
      { type: 'field', title: 'Clean Cotton Picking', desc: 'Pick clean, fully opened bolls in dry sunny weather; avoid bract trash.' }
    ]}
  ],
  onion: [
    { maxDas: 25, stage: 'Transplanting & Rooting (Day 0–25)', tasks: [
      { type: 'water', title: 'Frequent Light Sprinkler/Drip Irrigation', desc: 'Establish shallow fibrous root system.' },
      { type: 'fert', title: 'Basal Nitrogen & Sulphur', desc: 'Apply Sulphur @ 15 kg/Ac for pungent, firm bulbs.' }
    ]},
    { maxDas: 60, stage: 'Vegetative Foliage Growth (Day 26–60)', tasks: [
      { type: 'fert', title: '19:19:19 Soluble Fertigation', desc: 'Encourage 10–12 healthy green leaves per plant.' },
      { type: 'prot', title: 'Thrips & Purple Blotch Inspection', desc: 'Spray Mancozeb + sticky agent for leaf blotch.' }
    ]},
    { maxDas: 95, stage: 'Bulb Initiation & Enlargement (Day 61–95)', tasks: [
      { type: 'fert', title: '0:52:34 & 0:0:50 High Potash Feed', desc: 'Direct energy into rapid bulb swelling.' },
      { type: 'water', title: 'Even Moisture Schedule', desc: 'Avoid dry spells to prevent split bulbs.' }
    ]},
    { maxDas: 999, stage: 'Neck Fall & Curing (Day 96+)', tasks: [
      { type: 'field', title: 'Withhold Irrigation at 50% Neck Fall', desc: 'Stop watering 15 days prior to prevent bulb rot.' },
      { type: 'field', title: 'Harvesting & Field Curing', desc: 'Uproot bulbs and sun-cure foliage for 4–5 days.' }
    ]}
  ],
  potato: [
    { maxDas: 25, stage: 'Sprouting & Emergence (Day 0–25)', tasks: [
      { type: 'water', title: 'First Light Irrigation', desc: 'Ensure moisture reaches seed tubers without waterlogging.' },
      { type: 'field', title: 'First Earthing-Up (Ridging)', desc: 'Build loose ridges around emerging stems.' }
    ]},
    { maxDas: 55, stage: 'Stolon & Tuber Initiation (Day 26–55)', tasks: [
      { type: 'fert', title: 'Top Dress Urea & MOP', desc: 'Supply nitrogen and potassium to swelling stolons.' },
      { type: 'prot', title: 'Late Blight Preventive Spray', desc: 'Apply prophylactic Mancozeb/Cymoxanil in cloudy humid weather.' }
    ]},
    { maxDas: 80, stage: 'Tuber Bulking Phase (Day 56–80)', tasks: [
      { type: 'water', title: 'Consistent Ridge Moisture', desc: 'Keep ridges moist to maximize tuber weight and size.' },
      { type: 'fert', title: 'Potassium Nitrate (13:0:45) Foliar', desc: 'Accelerates starch transfer into tubers.' }
    ]},
    { maxDas: 999, stage: 'Dehaulming & Harvest (Day 81+)', tasks: [
      { type: 'field', title: 'Dehaulming (Cut Vines 10 Days Prior)', desc: 'Toughens potato skins before mechanical digging.' },
      { type: 'field', title: 'Tuber Digging & Curing', desc: 'Harvest in shade and cure tubers at 15°C for skin setting.' }
    ]}
  ],
  maize: [
    { maxDas: 25, stage: 'Knee-High Stage (Day 0–25)', tasks: [
      { type: 'fert', title: 'Urea Top Dressing at Knee-High', desc: 'Apply 35 kg Urea/Ac around root base.' },
      { type: 'prot', title: 'Fall Armyworm (FAW) Scouting', desc: 'Inspect whorl leaves for pinholes and sawdust frass.' }
    ]},
    { maxDas: 55, stage: 'Tasseling & Silking (Day 26–55)', tasks: [
      { type: 'water', title: 'Critical Tasseling Irrigation', desc: 'Moisture stress now reduces kernel count by up to 50%.' },
      { type: 'fert', title: 'Boron Micronutrient Foliar Spray', desc: 'Promotes complete pollination across ear rows.' }
    ]},
    { maxDas: 85, stage: 'Grain Filling & Dough Stage (Day 56–85)', tasks: [
      { type: 'water', title: 'Moisture Maintenance during Cob Fill', desc: 'Prevent premature drying of ear silks.' },
      { type: 'prot', title: 'Cob Borer & Stem Rot Deterrence', desc: 'Check husk tightness.' }
    ]},
    { maxDas: 999, stage: 'Black Layer & Harvest (Day 86+)', tasks: [
      { type: 'field', title: 'Cob Harvesting at Black Layer', desc: 'Harvest when husks turn straw brown and dry.' }
    ]}
  ],
  mustard: [
    { maxDas: 25, stage: 'Seedling & Rosette Phase (Day 0–25)', tasks: [
      { type: 'field', title: 'Thinning to 15 cm Spacing', desc: 'Maintain single healthy seedling per spot.' },
      { type: 'fert', title: 'Urea + Sulphur Application', desc: 'Sulphur increases mustard seed oil content.' }
    ]},
    { maxDas: 55, stage: 'Branching & Flowering (Day 26–55)', tasks: [
      { type: 'water', title: 'First Irrigation at Flowering Initiation', desc: 'Provide moisture before yellow blooms open.' },
      { type: 'prot', title: 'Mustard Aphid Surveillance', desc: 'Check top shoots; spray Dimethoate if aphids cluster.' }
    ]},
    { maxDas: 85, stage: 'Siliqua (Pod) Formation (Day 56–85)', tasks: [
      { type: 'water', title: 'Second Irrigation at Pod Filling', desc: 'Crucial for plumper seeds.' },
      { type: 'prot', title: 'White Rust & Alternaria Check', desc: 'Inspect leaves for chalky white pustules.' }
    ]},
    { maxDas: 999, stage: 'Pod Maturity & Harvesting (Day 86+)', tasks: [
      { type: 'field', title: 'Morning Harvest to Prevent Shattering', desc: 'Harvest when 75% of pods turn golden brown.' }
    ]}
  ]
};

export function getCropSchedule(cropName = '', das = 0) {
  const k = (cropName || '').toLowerCase();
  let scheduleKey = Object.keys(STAGE_SCHEDULES).find(s => k.includes(s));
  if (!scheduleKey) {
    if (k.includes('paddy')) scheduleKey = 'rice';
    else if (k.includes('corn')) scheduleKey = 'maize';
    else if (k.includes('groundnut') || k.includes('soybean')) scheduleKey = 'cotton';
    else if (k.includes('chilli') || k.includes('pepper')) scheduleKey = 'tomato';
    else scheduleKey = 'wheat';
  }
  const stages = STAGE_SCHEDULES[scheduleKey] || STAGE_SCHEDULES.wheat;
  return stages.find(s => das <= s.maxDas) || stages[stages.length - 1];
}

/* ─── Main Field Detail Component ──────────────────────────────────────────── */
export function FieldDetail() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [active, setActive] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Custom Field Dropdown Popover
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);

  // Add Field Modal
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldForm, setNewFieldForm] = useState({
    name: '',
    crop_name: 'Wheat',
    variety: '',
    area_acre: '2.0',
    soil_type: 'Loamy',
    sowing_date: new Date().toISOString().split('T')[0]
  });

  // Edit Field Modal
  const [showEditField, setShowEditField] = useState(false);
  const [editFieldForm, setEditFieldForm] = useState({
    name: '',
    crop_name: 'Wheat',
    variety: '',
    area_acre: '2.0',
    soil_type: 'Loamy',
    sowing_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const currentActiveUser = userStore.getActiveUser();
    if (currentActiveUser && currentActiveUser.fields && currentActiveUser.fields.length > 0) {
      setFields(currentActiveUser.fields);
      setActive(currentActiveUser.fields[0]);
      loadActivity(currentActiveUser.fields[0]);
      setLoading(false);
      return;
    }
    farmApi.getFields().then(fs => {
      const list = Array.isArray(fs) ? fs : [];
      setFields(list);
      if (list.length > 0) {
        setActive(list[0]);
        loadActivity(list[0]);
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const loadActivity = async (field) => {
    if (!field) return;
    setLoading(true);
    try {
      const a = await cropApi.getActivity(field.id);
      setActivity(a);
    } catch {}
    setLoading(false);
  };

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newFieldForm.name.trim()) return;
    try {
      const created = await farmApi.addField({
        name: newFieldForm.name.trim(),
        current_crop: newFieldForm.crop_name,
        crop_name: newFieldForm.crop_name,
        variety: newFieldForm.variety || '',
        area_acre: parseFloat(newFieldForm.area_acre) || 2.0,
        soil_type: newFieldForm.soil_type,
        sowing_date: newFieldForm.sowing_date
      });
      const updated = [...fields, created];
      setFields(updated);
      setActive(created);
      loadActivity(created);
      const cu = userStore.getActiveUser();
      if (cu) {
        userStore.saveUser({ ...cu, fields: updated });
      }
      setShowAddField(false);
      setNewFieldForm({
        name: '',
        crop_name: 'Wheat',
        variety: '',
        area_acre: '2.0',
        soil_type: 'Loamy',
        sowing_date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      alert('Could not add field: ' + (err.message || 'Error'));
    }
  };

  const handleUpdateField = async (e) => {
    e.preventDefault();
    if (!active?.id || !editFieldForm.name.trim()) return;
    try {
      const updated = await farmApi.updateField(active.id, {
        name: editFieldForm.name.trim(),
        current_crop: editFieldForm.crop_name,
        crop_name: editFieldForm.crop_name,
        variety: editFieldForm.variety || '',
        area_acre: parseFloat(editFieldForm.area_acre) || 2.0,
        soil_type: editFieldForm.soil_type,
        sowing_date: editFieldForm.sowing_date
      });
      const list = fields.map(f => f.id === active.id ? updated : f);
      setFields(list);
      setActive(updated);
      loadActivity(updated);
      const cu = userStore.getActiveUser();
      if (cu) {
        userStore.saveUser({ ...cu, fields: list });
      }
      setShowEditField(false);
    } catch (err) {
      alert('Could not update field: ' + (err.message || 'Error'));
    }
  };

  const handleDeleteField = async () => {
    if (!active?.id) return;
    if (!window.confirm(`Are you sure you want to delete ${active.name} (${cropName})?`)) return;
    try {
      await farmApi.deleteField(active.id);
      const remaining = fields.filter(f => f.id !== active.id);
      setFields(remaining);
      const cu = userStore.getActiveUser();
      if (cu) {
        userStore.saveUser({ ...cu, fields: remaining });
      }
      if (remaining.length > 0) {
        setActive(remaining[0]);
        loadActivity(remaining[0]);
      } else {
        setActive(null);
      }
    } catch (err) {
      alert('Could not delete field: ' + (err.message || 'Error'));
    }
  };

  const cropName = active?.current_crop || active?.crop_name || 'Wheat';
  const cropIcon = getCropIcon(cropName);

  const das = activity?.days_after_sowing ?? (active?.sowing_date
    ? Math.max(0, Math.floor((Date.now() - new Date(active.sowing_date)) / 86400000))
    : 0);

  const totalCycle = activity?.total_days || (cropName.toLowerCase().includes('tomato') ? 90 : 120);
  const pct = Math.max(0, Math.min(100, Math.round((das / totalCycle) * 100)));

  const stagesList = CROP_STAGES[cropName.toLowerCase()] || CROP_STAGES.default;
  const currentStageIdx = Math.min(stagesList.length - 1, Math.floor((pct / 100) * stagesList.length));
  const activeCropSchedule = getCropSchedule(cropName, das);
  const currentStage = activity?.stage && !activity.stage.toLowerCase().includes('generic')
    ? activity.stage
    : `${stagesList[currentStageIdx]} Stage`;

  const routine = activity?.routine_tasks || (activeCropSchedule ? {
    field_activity: activeCropSchedule.tasks.find(t => t.type === 'field')?.title,
    fertilizer: activeCropSchedule.tasks.find(t => t.type === 'fert')?.title,
    irrigation: activeCropSchedule.tasks.find(t => t.type === 'water')?.title,
    standard_action: activeCropSchedule.tasks.find(t => t.type === 'prot')?.desc
  } : null);

  const weatherOverride = activity?.weather_override;
  const hasWeatherAlert = weatherOverride && weatherOverride.alert && weatherOverride.alert !== 'Normal Conditions';

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#f8fafc' }}>
        
        {/* ── 1. Top Executive Header (Vibrant Emerald & Jade Theme) ── */}
        <div style={{
          background: 'linear-gradient(155deg, #064e3b 0%, #047857 55%, #059669 100%)',
          color: '#fff',
          padding: '16px 20px 16px',
          flexShrink: 0,
          boxShadow: '0 4px 20px rgba(6,78,59,0.25)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          position: 'relative',
          zIndex: 30
        }}>
          {/* Title Row */}
          <div className="flex fai fjb mb12">
            <div className="flex fai g10">
              <button
                className="back-btn"
                onClick={() => navigate('/home')}
                style={{ background: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff', width: 36, height: 36 }}
              >
                ←
              </button>
              <div style={{ fontSize: 20.5, fontWeight: 700, letterSpacing: '-0.3px', color: '#fff' }}>
                Crop Management
              </div>
            </div>

            <div className="flex fai g6">
              <button
                type="button"
                onClick={() => navigate('/crops/recommend')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Advisor
              </button>
              <button
                type="button"
                onClick={() => setShowAddField(true)}
                style={{
                  background: '#ffffff',
                  border: 'none',
                  color: '#064e3b',
                  padding: '6px 12px',
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                }}
              >
                ＋ Add Field
              </button>
            </div>
          </div>

          {/* Integrated Plot Dropdown Switcher */}
          {fields.length > 0 && (
            <div style={{ position: 'relative', zIndex: 40 }}>
              <button
                type="button"
                onClick={() => setShowFieldDropdown(s => !s)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: 14,
                  background: '#ffffff',
                  color: '#0f172a',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.12)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  <span style={{ fontSize: 16 }}>{cropIcon}</span>
                  <span style={{ fontWeight: 700, color: '#064e3b' }}>{active?.name || 'Field'}</span>
                  <span style={{ color: '#475569', fontWeight: 500 }}>: {cropName} ({active?.area_acre || 2} Ac)</span>
                </div>
                <span style={{ fontSize: 9, color: '#064e3b', transform: showFieldDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 4 }}>
                  ▼
                </span>
              </button>

              {/* Custom Popover Dropdown Menu */}
              {showFieldDropdown && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                    onClick={() => setShowFieldDropdown(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      color: '#0f172a',
                      borderRadius: 18,
                      boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                      border: '1px solid #e2e8f0',
                      padding: 6,
                      zIndex: 50,
                      maxHeight: 260,
                      overflowY: 'auto'
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 10px 4px', letterSpacing: 0.5 }}>
                      SWITCH FARM PLOT
                    </div>
                    {fields.map(f => {
                      const fCrop = f.current_crop || f.crop_name || 'Crop';
                      const fIcon = getCropIcon(fCrop);
                      const isSelected = f.id === active?.id;

                      return (
                        <div
                          key={f.id}
                          onClick={() => {
                            setActive(f);
                            loadActivity(f);
                            setShowFieldDropdown(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: 12,
                            cursor: 'pointer',
                            background: isSelected ? '#f0fdf4' : 'transparent',
                            transition: 'all 0.12s ease'
                          }}
                          onMouseEnter={e => !isSelected && (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: isSelected ? '#dcfce7' : '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 18,
                              flexShrink: 0
                            }}>
                              {fIcon}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: isSelected ? '#064e3b' : '#0f172a' }}>
                                {f.name}
                              </div>
                              <div style={{ fontSize: 11, color: isSelected ? '#047857' : '#64748b', marginTop: 1, fontWeight: 500 }}>
                                {fCrop} · {f.area_acre || 2} Acres
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <span style={{ color: '#16a34a', fontWeight: 800, fontSize: 14 }}>✓</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Main Scroll Area ── */}
        <div className="scroll-area p20" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {active ? (
            <>
              {/* 1. Luxury Active Crop Showcase Card (Emerald & Teal Jade Gradient) */}
              <div className="card" style={{
                borderRadius: 22,
                padding: '18px 20px',
                background: 'linear-gradient(145deg, #064e3b 0%, #047857 50%, #0d9488 100%)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 8px 24px rgba(6,78,59,0.22)'
              }}>
                <div className="flex fai fjb">
                  <div className="flex fai g12">
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.18)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      {cropIcon}
                    </div>
                    <div>
                      <div className="flex fai g6">
                        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px', color: '#fff' }}>
                          {cropName}
                        </div>
                        {active?.variety && (
                          <span style={{ fontSize: 11, color: '#a7f3d0', fontWeight: 600 }}>
                            ({active.variety})
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                        📍 {active?.name || 'Field'} · {active?.area_acre || 2.0} Acres · {active?.soil_type || 'Loamy'} Soil
                      </div>
                    </div>
                  </div>

                  <span style={{
                    background: 'rgba(255,255,255,0.22)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 600
                  }}>
                    ● In Sowing
                  </span>
                </div>

                {/* 3 Metric Capsules */}
                <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '8px 6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#a7f3d0', textTransform: 'uppercase' }}>Days Elapsed</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>Day {das}</div>
                  </div>
                  <div style={{ flex: 1.3, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '8px 6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#a7f3d0', textTransform: 'uppercase' }}>Growth Stage</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentStage.split(' ')[0]}
                    </div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '8px 6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#a7f3d0', textTransform: 'uppercase' }}>Crop Vigor</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>Optimal</div>
                  </div>
                </div>

                {/* Edit & Delete Action Row */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditFieldForm({
                        name: active?.name || '',
                        crop_name: active?.current_crop || active?.crop_name || 'Wheat',
                        variety: active?.variety || '',
                        area_acre: active?.area_acre || '2.0',
                        soil_type: active?.soil_type || 'Loamy',
                        sowing_date: active?.sowing_date || new Date().toISOString().split('T')[0]
                      });
                      setShowEditField(true);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.16)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#fff',
                      padding: '5px 12px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>✏️</span> Edit Plot
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteField}
                    style={{
                      background: 'rgba(239,68,68,0.25)',
                      border: '1px solid rgba(239,68,68,0.4)',
                      color: '#fca5a5',
                      padding: '5px 12px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>🗑️</span> Delete Plot
                  </button>
                </div>
              </div>

              {/* 2. Crop Growth Lifecycle Progress Card */}
              <div className="card" style={{ borderRadius: 20, padding: '16px 18px', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div className="flex fai fjb mb6">
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#064e3b' }}>
                      {currentStage}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                      Day {das} of ~{totalCycle} days lifecycle · {Math.max(0, totalCycle - das)} days to harvest
                    </div>
                  </div>
                  <span className="badge badge-green" style={{ borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '3px 8px' }}>
                    {pct}% Complete
                  </span>
                </div>

                {/* Stepper Nodes */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    left: 8,
                    right: 8,
                    height: 3,
                    background: '#e2e8f0',
                    zIndex: 1
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(currentStageIdx / (stagesList.length - 1)) * 100}%`,
                      background: '#10b981',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>

                  {stagesList.map((stg, i) => {
                    const isPassed = i < currentStageIdx;
                    const isCurrent = i === currentStageIdx;
                    return (
                      <div key={stg} style={{ zIndex: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: isCurrent ? '#064e3b' : isPassed ? '#10b981' : '#fff',
                          border: isCurrent ? '2.5px solid #86efac' : isPassed ? 'none' : '2px solid #cbd5e1',
                          color: isPassed || isCurrent ? '#fff' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          boxShadow: isCurrent ? '0 0 0 3px rgba(16,185,129,0.25)' : 'none'
                        }}>
                          {isPassed ? '✓' : i + 1}
                        </div>
                        <div style={{
                          fontSize: 9,
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? '#064e3b' : '#64748b',
                          marginTop: 4,
                          maxWidth: 46,
                          lineHeight: 1.15
                        }}>
                          {stg}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Live Agro-Meteorological Impact Directive */}
              {weatherOverride && (
                <div
                  className="card"
                  style={{
                    borderRadius: 20,
                    padding: '15px 16px',
                    background: hasWeatherAlert ? '#fffbeb' : '#f0fdf4',
                    border: hasWeatherAlert ? '1.5px solid #fde68a' : '1.5px solid #bbf7d0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div className="flex fai g10 mb6">
                    <span style={{ fontSize: 22 }}>{hasWeatherAlert ? '⚠️' : '🌦️'}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: hasWeatherAlert ? '#92400e' : '#14532d' }}>
                        {weatherOverride.alert || 'Weather Impact Assessment'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Live meteorological forecast integration</div>
                    </div>
                  </div>

                  {weatherOverride.immediate_action && (
                    <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.4, marginTop: 4, fontWeight: 500 }}>
                      {weatherOverride.immediate_action}
                    </div>
                  )}

                  {weatherOverride.irrigation_directive && (
                    <div style={{ fontSize: 12, background: 'rgba(255,255,255,0.8)', padding: '8px 10px', borderRadius: 10, marginTop: 8, border: '1px solid rgba(0,0,0,0.05)' }}>
                      💧 <b>Irrigation Directive:</b> {weatherOverride.irrigation_directive}
                    </div>
                  )}

                  {weatherOverride.protective_measure && (
                    <div style={{ fontSize: 12, background: 'rgba(255,255,255,0.8)', padding: '8px 10px', borderRadius: 10, marginTop: 6, border: '1px solid rgba(0,0,0,0.05)' }}>
                      🛡️ <b>Protective Measure:</b> {weatherOverride.protective_measure}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Dataset-Powered Agronomic Field Activities */}
              <div>
                <div className="section-label" style={{ marginBottom: 8 }}>SCHEDULED FIELD OPERATIONS</div>
                
                {routine ? (
                  <div className="card" style={{ padding: '4px 16px', borderRadius: 20, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    
                    {/* Field Activity */}
                    {routine.field_activity && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                          🌾
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Field Operation
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2, lineHeight: 1.35 }}>
                            {routine.field_activity}
                          </div>
                        </div>
                        <span className="badge badge-green" style={{ borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                          Active
                        </span>
                      </div>
                    )}

                    {/* Fertilizer */}
                    {routine.fertilizer && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                          🧪
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Fertilizer & Nutrients
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2, lineHeight: 1.35 }}>
                            {routine.fertilizer}
                          </div>
                        </div>
                        <span className="badge badge-amber" style={{ borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                          Nutrient
                        </span>
                      </div>
                    )}

                    {/* Irrigation */}
                    {routine.irrigation && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                          💧
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Irrigation Management
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2, lineHeight: 1.35 }}>
                            {routine.irrigation}
                          </div>
                        </div>
                        <span className="badge badge-blue" style={{ borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                          Water
                        </span>
                      </div>
                    )}

                    {/* Standard Protective Action */}
                    {routine.standard_action && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                          🛡️
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Crop Protection Guideline
                          </div>
                          <div style={{ fontSize: 12, color: '#334155', marginTop: 2, lineHeight: 1.4 }}>
                            {routine.standard_action}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  !loading && (
                    <div className="card text-center p20" style={{ borderRadius: 20, background: '#fff' }}>
                      <div className="text-sm text-muted">Select an active field above to view real-time stage tasks.</div>
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="card text-center p24" style={{ borderRadius: 20, background: '#fff' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🌱</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--char-800)' }}>No Fields Registered</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, marginBottom: 16 }}>
                Add your first farm field or plot to begin precision crop monitoring.
              </div>
              <button
                type="button"
                className="btn btn-primary btn-pill"
                onClick={() => setShowAddField(true)}
              >
                ＋ Add First Field
              </button>
            </div>
          )}

          {/* 5. Quick Action Dock */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-full btn-pill"
              onClick={() => navigate('/calendar')}
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: '13px 14px',
                background: '#ffffff',
                color: '#064e3b',
                border: '1.5px solid #a7f3d0',
                boxShadow: '0 2px 8px rgba(6,78,59,0.08)'
              }}
            >
              📅 Calendar
            </button>
            <button
              type="button"
              className="btn btn-full btn-pill"
              onClick={() => navigate('/scanner')}
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: '13px 14px',
                background: 'linear-gradient(135deg, #064e3b 0%, #047857 55%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 14px rgba(6,78,59,0.25)'
              }}
            >
              🔬 Leaf Scanner
            </button>
          </div>

          <div style={{ height: 16 }} />
        </div>

        <BottomNav />

        {/* ── Add New Field Modal Sheet ── */}
        {showAddField && (
          <div className="modal-overlay" onClick={() => setShowAddField(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="flex fai fjb mb16">
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--char-800)' }}>🌱 Add New Farm Field</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    Register a new plot or field for crop lifecycle & advisory tracking
                  </div>
                </div>
                <button className="icon-btn" onClick={() => setShowAddField(false)}>✕</button>
              </div>

              <form onSubmit={handleAddField}>
                <div className="form-group mb12">
                  <label className="form-label bold text-xs">Field Identifier / Name</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    placeholder="e.g. Field C, North Orchard, Plot 3"
                    value={newFieldForm.name}
                    onChange={e => setNewFieldForm({ ...newFieldForm, name: e.target.value })}
                  />
                </div>

                <div className="flex g12 mb12">
                  <div className="form-group f1" style={{ margin: 0 }}>
                    <label className="form-label bold text-xs">Crop Sown</label>
                    <select
                      className="form-select"
                      value={newFieldForm.crop_name}
                      onChange={e => setNewFieldForm({ ...newFieldForm, crop_name: e.target.value })}
                    >
                      <option value="Wheat">🌾 Wheat</option>
                      <option value="Tomato">🍅 Tomato</option>
                      <option value="Rice">🌾 Rice / Paddy</option>
                      <option value="Cotton">🌱 Cotton</option>
                      <option value="Maize">🌽 Maize / Corn</option>
                      <option value="Mustard">🌼 Mustard</option>
                      <option value="Potato">🥔 Potato</option>
                      <option value="Soybean">🫘 Soybean</option>
                      <option value="Groundnut">🥜 Groundnut</option>
                      <option value="Sugarcane">🎋 Sugarcane</option>
                      <option value="Onion">🧅 Onion</option>
                      <option value="Chilli">🌶️ Chilli</option>
                    </select>
                  </div>
                  <div className="form-group f1" style={{ margin: 0 }}>
                    <label className="form-label bold text-xs">Variety (Optional)</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. PBW 550, Basmati"
                      value={newFieldForm.variety}
                      onChange={e => setNewFieldForm({ ...newFieldForm, variety: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex g12 mb12">
                  <div className="form-group f1" style={{ margin: 0 }}>
                    <label className="form-label bold text-xs">Area (Acres)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      placeholder="e.g. 2.5"
                      value={newFieldForm.area_acre}
                      onChange={e => setNewFieldForm({ ...newFieldForm, area_acre: e.target.value })}
                    />
                  </div>
                  <div className="form-group f1" style={{ margin: 0 }}>
                    <label className="form-label bold text-xs">Soil Type</label>
                    <select
                      className="form-select"
                      value={newFieldForm.soil_type}
                      onChange={e => setNewFieldForm({ ...newFieldForm, soil_type: e.target.value })}
                    >
                      <option value="Loamy">Loamy Soil</option>
                      <option value="Alluvial">Alluvial Soil</option>
                      <option value="Clayey">Clayey Soil</option>
                      <option value="Black">Black Cotton Soil</option>
                      <option value="Sandy">Sandy Loam</option>
                      <option value="Red">Red Soil</option>
                    </select>
                  </div>
                </div>

                <div className="flex fai g8 mb16" style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: 18 }}>🗓️</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#166534' }}>
                      Sowing Date: Automatically Calculated
                    </div>
                    <div style={{ fontSize: 11, color: '#15803d', marginTop: 1 }}>
                      Registered as Today ({new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}) · Starts at Day 0 (Fresh Sowing)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-full btn-pill"
                    style={{
                      background: 'linear-gradient(135deg, #064e3b 0%, #047857 55%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '13px 18px',
                      fontSize: 14,
                      fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(6,78,59,0.28)'
                    }}
                  >
                    🌱 Register Field
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddField(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Edit Field Modal Sheet ── */}
        {showEditField && (
          <div className="modal-overlay" onClick={() => setShowEditField(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="flex fai fjb mb16">
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--char-800)' }}>✏️ Edit Field Details</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    Update parameters for {active?.name || 'Field'}
                  </div>
                </div>
                <button className="icon-btn" onClick={() => setShowEditField(false)}>✕</button>
              </div>

              <form onSubmit={handleUpdateField}>
                <div className="form-group mb12">
                  <label className="form-label bold text-xs">Field Identifier / Name</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    value={editFieldForm.name}
                    onChange={e => setEditFieldForm({ ...editFieldForm, name: e.target.value })}
                  />
                </div>

                <div className="flex g12 mb12">
                  <div className="form-group f1" style={{ margin: 0 }}>
                    <label className="form-label bold text-xs">Crop Sown</label>
                    <select
                      className="form-select"
                      value={editFieldForm.crop_name}
                      onChange={e => setEditFieldForm({ ...editFieldForm, crop_name: e.target.value })}
                    >
                      <option value="Wheat">🌾 Wheat</option>
                      <option value="Tomato">🍅 Tomato</option>
                      <option value="Rice">🌾 Rice / Paddy</option>
                      <option value="Cotton">🌱 Cotton</option>
                      <option value="Maize">🌽 Maize / Corn</option>
                      <option value="Mustard">🌼 Mustard</option>
                      <option value="Potato">🥔 Potato</option>
                      <option value="Soybean">🫘 Soybean</option>
                      <option value="Groundnut">🥜 Groundnut</option>
                      <option value="Sugarcane">🎋 Sugarcane</option>
                      <option value="Onion">🧅 Onion</option>
                      <option value="Chilli">🌶️ Chilli</option>
                    </select>
                  </div>
                  <div className="form-group f1" style={{ margin: 0 }}>
                    <label className="form-label bold text-xs">Variety (Optional)</label>
                    <input
                      className="form-input"
                      type="text"
                      value={editFieldForm.variety}
                      onChange={e => setEditFieldForm({ ...editFieldForm, variety: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex g12 mb12">
                  <div className="form-group f1" style={{ margin: 0 }}>
                    <label className="form-label bold text-xs">Area (Acres)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={editFieldForm.area_acre}
                      onChange={e => setEditFieldForm({ ...editFieldForm, area_acre: e.target.value })}
                    />
                  </div>
                  <div className="form-group f1" style={{ margin: 0 }}>
                    <label className="form-label bold text-xs">Soil Type</label>
                    <select
                      className="form-select"
                      value={editFieldForm.soil_type}
                      onChange={e => setEditFieldForm({ ...editFieldForm, soil_type: e.target.value })}
                    >
                      <option value="Loamy">Loamy Soil</option>
                      <option value="Alluvial">Alluvial Soil</option>
                      <option value="Clayey">Clayey Soil</option>
                      <option value="Black">Black Cotton Soil</option>
                      <option value="Sandy">Sandy Loam</option>
                      <option value="Red">Red Soil</option>
                    </select>
                  </div>
                </div>

                <div className="form-group mb16">
                  <label className="form-label bold text-xs">Sowing / Planting Date</label>
                  <input
                    className="form-input"
                    type="date"
                    required
                    value={editFieldForm.sowing_date}
                    onChange={e => setEditFieldForm({ ...editFieldForm, sowing_date: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-full btn-pill"
                    style={{
                      background: 'linear-gradient(135deg, #064e3b 0%, #047857 55%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '13px 18px',
                      fontSize: 14,
                      fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(6,78,59,0.28)'
                    }}
                  >
                    💾 Save Changes
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowEditField(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Crop Activity Calendar ──────────────────────────────────────────────── */
export function CropCalendar() {
  const navigate = useNavigate();
  const currentActiveUser = userStore.getActiveUser();
  const initialFields = (currentActiveUser?.fields && currentActiveUser.fields.length > 0) ? currentActiveUser.fields : [];
  const [fields, setFields] = useState(initialFields);
  const [active, setActive] = useState(initialFields.length > 0 ? initialFields[0] : null);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [completedTasks, setCompletedTasks] = useState({});

  useEffect(() => {
    const cu = userStore.getActiveUser();
    if (cu && cu.fields && cu.fields.length > 0) {
      setFields(cu.fields);
      setActive(prev => prev || cu.fields[0]);
    }
    farmApi.getFields().then(fs => {
      const list = Array.isArray(fs) ? fs : [];
      if (list.length > 0) {
        setFields(list);
        setActive(prev => prev || list[0]);
      }
    }).catch(() => {});
  }, []);

  const today = new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('en', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = (firstDay + 6) % 7;

  const cropName = (active?.current_crop || active?.crop_name || 'Wheat').toLowerCase();
  const cropIcon = getCropIcon(cropName);

  // Exact local date parsing (avoids timezone shift bugs)
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
    const parts = String(dateStr).split('T')[0].split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  // Authoritative sowing date from active field (or fallback to 1 Aug 2026 if not set)
  const sowingDate = parseLocalDate(active?.sowing_date) || new Date(2026, 7, 1);
  const selectedDateObj = new Date(year, month, selectedDay);
  const dasOnSelectedDay = Math.max(0, Math.floor((selectedDateObj - sowingDate) / 86400000));

  // Current today DAS
  const currentTodayDas = Math.max(0, Math.floor((today - sowingDate) / 86400000));

  // Universal dynamic schedule computation for ALL crops
  const currentStageSchedule = getCropSchedule(cropName, dasOnSelectedDay);

  const prevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDay(now.getDate());
  };

  const toggleTask = (taskKey) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskKey]: !prev[taskKey]
    }));
  };

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#f8fafc' }}>
        
        {/* Top Header — Deep Teal & Emerald Agenda Theme */}
        <div style={{
          background: 'linear-gradient(135deg, #044e3b 0%, #065f46 60%, #0f766e 100%)',
          color: '#fff',
          padding: '16px 18px 18px',
          flexShrink: 0,
          borderBottomLeftRadius: 26,
          borderBottomRightRadius: 26,
          boxShadow: '0 6px 20px rgba(4,78,59,0.25)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div className="flex fai fjb">
            <div className="flex fai g10">
              <button
                className="back-btn"
                onClick={() => navigate(-1)}
                style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
              >
                ←
              </button>
              <div>
                <div style={{ fontSize: 20.5, fontWeight: 700, letterSpacing: '-0.3px' }}>Crop Activity Calendar</div>
              </div>
            </div>

            <button
              onClick={() => navigate('/crops')}
              style={{
                background: '#fff',
                border: 'none',
                color: '#065f46',
                padding: '6px 12px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              Field Hub
            </button>
          </div>

          {/* Integrated Field Dropdown Popover */}
          {fields.length > 0 && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, zIndex: 20 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                <button
                  type="button"
                  onClick={() => setShowFieldPicker(s => !s)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 999,
                    background: '#fff',
                    color: 'var(--char-800)',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    transition: 'all 0.15s ease',
                    minWidth: 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{cropIcon}</span>
                    <span style={{ fontWeight: 700, color: '#064e3b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {active?.name || 'Field'}
                    </span>
                    <span style={{ color: '#475569', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      ({active?.area_acre || 2} Ac)
                    </span>
                  </div>
                  <span style={{ fontSize: 9, color: '#064e3b', transform: showFieldPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 6, flexShrink: 0 }}>
                    ▼
                  </span>
                </button>

                {/* Custom Popover Dropdown Menu */}
                {showFieldPicker && (
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                      onClick={() => setShowFieldPicker(false)}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        background: '#ffffff',
                        color: '#0f172a',
                        borderRadius: 18,
                        boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                        border: '1px solid #e2e8f0',
                        padding: 6,
                        zIndex: 50,
                        maxHeight: 260,
                        overflowY: 'auto'
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 10px 4px', letterSpacing: 0.5 }}>
                        SWITCH SCHEDULE PLOT
                      </div>
                      {fields.map(f => {
                        const fCrop = f.current_crop || f.crop_name || 'Crop';
                        const fIcon = getCropIcon(fCrop);
                        const isSelected = f.id === active?.id;

                        return (
                          <div
                            key={f.id}
                            onClick={() => {
                              setActive(f);
                              setShowFieldPicker(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              borderRadius: 12,
                              cursor: 'pointer',
                              background: isSelected ? '#f0fdf4' : 'transparent',
                              transition: 'all 0.12s ease'
                            }}
                            onMouseEnter={e => !isSelected && (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: isSelected ? '#dcfce7' : '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18,
                                flexShrink: 0
                              }}>
                                {fIcon}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: isSelected ? '#064e3b' : '#0f172a' }}>
                                  {f.name}
                                </div>
                                <div style={{ fontSize: 11, color: isSelected ? '#047857' : '#64748b', marginTop: 1, fontWeight: 500 }}>
                                  {fCrop} · {f.area_acre || 2} Acres
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <span style={{ color: '#059669', fontWeight: 800, fontSize: 14 }}>✓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate('/crops')}
                style={{
                  flexShrink: 0,
                  padding: '8px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.18)',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>＋</span>
                <span>Add</span>
              </button>
            </div>
          )}
        </div>

        <div className="scroll-area p20" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Calendar Card with Month Navigator */}
          <div className="card" style={{ borderRadius: 22, padding: '18px 16px', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 3px 12px rgba(0,0,0,0.03)' }}>
            
            {/* Month Changer Bar */}
            <div className="flex fai fjb mb12">
              <div className="flex fai g8">
                <button
                  type="button"
                  onClick={prevMonth}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: 'var(--char-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="Previous Month"
                >
                  ‹
                </button>
                <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--char-800)' }}>
                  {monthName}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: 'var(--char-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="Next Month"
                >
                  ›
                </button>
              </div>

              <div className="flex fai g6">
                <button
                  type="button"
                  onClick={jumpToToday}
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: 'var(--green-800)',
                    padding: '4px 10px',
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Today
                </button>
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <div>
                {cropIcon} <strong style={{ color: 'var(--char-800)' }}>{active?.name || 'Field'}</strong>: {active?.current_crop || 'Wheat'} · Sown {active?.sowing_date || '2026-11-05'}
              </div>
              {viewDate < new Date(sowingDate.getFullYear(), sowingDate.getMonth(), 1) && (
                <button
                  type="button"
                  onClick={() => {
                    setViewDate(new Date(sowingDate.getFullYear(), sowingDate.getMonth(), 1));
                    setSelectedDay(sowingDate.getDate());
                  }}
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#047857',
                    padding: '2px 8px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Jump to Sowing ({sowingDate.toLocaleString('en', { month: 'short', year: 'numeric' })}) →
                </button>
              )}
            </div>

            {/* Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, textAlign: 'center' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} style={{ fontSize: 11, fontWeight: 800, color: 'var(--char-400)', padding: '4px 0', textTransform: 'uppercase' }}>
                  {d}
                </div>
              ))}
              {Array(blanks).fill(null).map((_, i) => <div key={`b${i}`} />)}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const d = i + 1;
                const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = d === selectedDay;
                const cellDate = new Date(year, month, d);
                const cellDas = Math.floor((cellDate - sowingDate) / 86400000);
                const isAfterSowing = cellDas >= 0;
                // Pre-sowing has land prep tasks every 5 days or today; after sowing has growth tasks every 3 days or today
                const hasTask = isAfterSowing ? (cellDas % 3 === 0 || isToday) : (d % 5 === 0 || isToday);
                return (
                  <div
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 14,
                      fontSize: 13,
                      fontWeight: isSelected || isToday ? 900 : 500,
                      cursor: 'pointer',
                      background: isSelected ? 'var(--green-800)' : isToday ? '#f0fdf4' : 'transparent',
                      color: isSelected ? '#fff' : isToday ? 'var(--green-800)' : 'var(--char-700)',
                      border: isToday && !isSelected ? '1.5px solid #86efac' : 'none',
                      boxShadow: isSelected ? '0 3px 10px rgba(2,48,8,0.25)' : 'none',
                      transition: 'all .15s ease',
                      position: 'relative'
                    }}
                  >
                    <span>{d}</span>
                    {hasTask && (
                      <span style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: isSelected ? '#86efac' : isAfterSowing ? '#16a34a' : '#f59e0b',
                        marginTop: 2
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Agenda & Stage Tasks */}
          <div>
            <div className="flex fai fjb mb8">
              <div className="section-label" style={{ margin: 0 }}>
                {selectedDateObj < sowingDate
                  ? `PRE-SOWING OPERATIONS (${Math.ceil((sowingDate - selectedDateObj) / 86400000)} DAYS UNTIL SOWING)`
                  : selectedDay === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                    ? `TODAY'S OPERATIONS (DAY ${dasOnSelectedDay} DAS)`
                    : `SCHEDULE FOR ${selectedDay} ${monthName} (DAY ${dasOnSelectedDay} DAS)`
                }
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: selectedDateObj < sowingDate ? '#d97706' : 'var(--green-800)' }}>
                {selectedDateObj < sowingDate
                  ? '● Pre-Sowing Prep'
                  : selectedDay === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                    ? '● Live Today'
                    : `${selectedDay} ${monthName}`
                }
              </span>
            </div>

            {/* Current Stage Capsule Card */}
            <div className="card mb10" style={{ padding: '12px 16px', borderRadius: 16, background: selectedDateObj < sowingDate ? '#fffbeb' : '#f0fdf4', border: selectedDateObj < sowingDate ? '1px solid #fde68a' : '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: selectedDateObj < sowingDate ? '#b45309' : '#166534', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {selectedDateObj < sowingDate ? 'Field Lifecycle Status' : 'Crop Growth Phase on this Day'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: selectedDateObj < sowingDate ? '#92400e' : '#14532d', marginTop: 2 }}>
                🌱 {selectedDateObj < sowingDate ? `Pre-Sowing & Seedbed Preparation (Sowing: ${sowingDate.toLocaleDateString()})` : currentStageSchedule.stage}
              </div>
            </div>

            <div className="card" style={{ padding: '6px 16px', borderRadius: 20, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              {(selectedDateObj < sowingDate ? [
                { type: 'field', title: 'Deep Summer Ploughing & Stubble Clearing', desc: 'Expose soil pathogens, weed seeds, and insect larvae to sun solarization.' },
                { type: 'fert', title: 'Basal FYM / Compost Soil Enrichment', desc: 'Incorporate 4–5 tonnes/Ac well-decomposed manure into soil during primary tillage.' },
                { type: 'prot', title: 'Certified Seed Procurement & Fungicide Dressing', desc: 'Treat certified seed with Carbendazim / Thiram @ 2 g/kg seed to prevent seed-borne smuts and bunts.' },
                { type: 'water', title: 'Pre-Sowing Irrigation (Rauni / Paleva)', desc: 'Provide heavy pre-sowing watering 7–10 days before sowing for optimal seedbed moisture.' }
              ] : currentStageSchedule.tasks).map((task, idx) => {
                const taskKey = `${active?.id || 'field'}_${year}_${month}_${selectedDay}_${idx}`;
                const isDone = completedTasks[taskKey];
                const icon = task.type === 'water' ? '💧' : task.type === 'fert' ? '🧪' : task.type === 'prot' ? '🛡️' : '🌾';
                const bg = task.type === 'water' ? '#f0f9ff' : task.type === 'fert' ? '#fff7ed' : task.type === 'prot' ? '#faf5ff' : '#f0fdf4';
                return (
                  <div
                    key={taskKey}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 0',
                      borderBottom: idx < (selectedDateObj < sowingDate ? 4 : currentStageSchedule.tasks.length) - 1 ? '1px solid #f1f5f9' : 'none'
                    }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: isDone ? 'var(--muted)' : 'var(--char-800)', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, lineHeight: 1.35 }}>
                        {task.desc}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTask(taskKey)}
                      style={{
                        background: isDone ? '#dcfce7' : '#f1f5f9',
                        border: 'none',
                        color: isDone ? '#15803d' : 'var(--char-600)',
                        borderRadius: 99,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      {isDone ? '✓ Done' : 'Mark Done'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ height: 16 }} />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
