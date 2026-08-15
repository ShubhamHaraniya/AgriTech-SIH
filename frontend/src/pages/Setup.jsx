/**
 * Setup Wizard — 4-step: Farmer → Farm → Fields → Livestock
 * Allows every user to register with their own unique profile and separate isolated database.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmApi } from '../api/client';
import { useApp } from '../context/AppContext';
import { userStore } from '../utils/userStore';

const SOILS    = ['Loamy', 'Sandy Loam', 'Clay Loam', 'Black Soil', 'Alluvial', 'Red Loam'];
const WATERS   = ['Low', 'Medium', 'High'];
const IRRIGATE = ['Borewell', 'Canal', 'Drip', 'Rainfed'];
const SEASONS  = ['Summer', 'Winter', 'Monsoon'];
const REGIONS  = [
  'North India (Punjab/Haryana)', 'North India (Uttar Pradesh)',
  'North India (Rajasthan)', 'North India (Himachal Pradesh)',
  'South India (Karnataka)', 'South India (Tamil Nadu)',
  'East India (West Bengal)', 'West India (Maharashtra/Gujarat)',
  'Central India (Madhya Pradesh)'
];
const LANGS    = ['English', 'Hindi', 'Punjabi', 'Telugu', 'Tamil', 'Bengali', 'Gujarati', 'Marathi'];

function SetupHeader({ step, back, title, sub }) {
  const segs = [1, 2, 3, 4];
  return (
    <div style={{
      background: 'linear-gradient(155deg, #064e3b 0%, #047857 55%, #059669 100%)',
      padding: '20px 20px 22px',
      flexShrink: 0,
      color: '#fff',
      boxShadow: '0 4px 18px rgba(6,78,59,0.25)'
    }}>
      <div className="flex fai fjb mb12">
        {back ? (
          <button className="back-btn" style={{ background: 'rgba(255,255,255,.18)', borderColor: 'rgba(255,255,255,.25)', color: '#fff', width: 36, height: 36 }} onClick={back}>
            ←
          </button>
        ) : (
          <div className="flex fai g8" style={{ color: '#fff' }}>
            <span style={{ fontSize: 22 }}>🌾</span>
            <b style={{ fontSize: 17, letterSpacing: '-0.3px' }}>AgriTech Setup</b>
          </div>
        )}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', fontWeight: 700 }}>
          Step {step} of 4
        </div>
      </div>

      {/* Progress track */}
      <div className="flex g4 mb12">
        {segs.map(s => (
          <div key={s} style={{
            flex: 1,
            height: 4,
            borderRadius: 99,
            background: s < step ? '#ffffff' : s === step ? '#86efac' : 'rgba(255,255,255,.3)',
            transition: 'background .3s ease'
          }} />
        ))}
      </div>
      <div style={{ fontSize: 20.5, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>{title}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function FarmerStep({ draft, updateDraft, onNext }) {
  const [form, setForm] = useState({
    name: draft.name || '',
    phone: draft.phone || '',
    email: draft.email || '',
    password: draft.password || '',
    location: draft.location || '',
    language: draft.language || 'English'
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Please enter your Farmer / Farm Owner Name');
      return;
    }
    const updated = {
      ...draft,
      name: form.name.trim(),
      phone: form.phone.trim() || '9876543210',
      email: form.email.trim() || `${form.name.toLowerCase().replace(/\s+/g, '')}@agritech.in`,
      password: form.password || '1234',
      location: form.location.trim() || 'Pune, Maharashtra',
      language: form.language
    };
    updateDraft(updated);
    onNext();
  };

  return (
    <form className="scroll-area p20" onSubmit={submit}>
      <div className="form-group mb12">
        <label className="form-label bold text-xs">Farmer / Owner Name *</label>
        <input
          className="form-input"
          required
          placeholder="e.g. Shubham Haraniya"
          value={form.name}
          onChange={set('name')}
        />
      </div>

      <div className="flex g10 mb12">
        <div className="form-group f1" style={{ margin: 0 }}>
          <label className="form-label bold text-xs">Mobile Number *</label>
          <input
            className="form-input"
            type="tel"
            required
            placeholder="e.g. 9876543210"
            value={form.phone}
            onChange={set('phone')}
          />
        </div>
        <div className="form-group f1" style={{ margin: 0 }}>
          <label className="form-label bold text-xs">Password / PIN</label>
          <input
            className="form-input"
            type="password"
            placeholder="e.g. 1234"
            value={form.password}
            onChange={set('password')}
          />
        </div>
      </div>

      <div className="form-group mb12">
        <label className="form-label bold text-xs">Email Address (Optional)</label>
        <input
          className="form-input"
          type="email"
          placeholder="e.g. shubham@farm.in"
          value={form.email}
          onChange={set('email')}
        />
      </div>

      <div className="form-group mb12">
        <label className="form-label bold text-xs">Village / District / Location *</label>
        <input
          className="form-input"
          required
          placeholder="e.g. Anand, Gujarat"
          value={form.location}
          onChange={set('location')}
        />
      </div>

      <div className="form-group mb16">
        <label className="form-label bold text-xs">Preferred Regional Language</label>
        <select className="form-select" value={form.language} onChange={set('language')}>
          {LANGS.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

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
        Continue to Farm Details →
      </button>
    </form>
  );
}

function FarmStep({ draft, updateDraft, onNext }) {
  const [form, setForm] = useState({
    total_area_acre: draft.total_area_acre || 4.5,
    soil_type: draft.soil_type || 'Loamy Soil',
    soil_ph: draft.soil_ph || 6.8,
    water_avail: draft.water_avail || 'Medium',
    irrigation_type: draft.irrigation_type || 'Borewell',
    season: draft.season || 'Winter',
    region: draft.region || REGIONS[0]
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    updateDraft({
      ...draft,
      total_area_acre: parseFloat(form.total_area_acre) || 5.0,
      soil_type: form.soil_type,
      soil_ph: parseFloat(form.soil_ph) || 6.8,
      water_avail: form.water_avail,
      irrigation_type: form.irrigation_type,
      season: form.season,
      region: form.region
    });
    onNext();
  };

  return (
    <form className="scroll-area p20" onSubmit={submit}>
      <div className="flex g12 mb12">
        <div className="form-group f1" style={{ margin: 0 }}>
          <label className="form-label bold text-xs">Farm Area (Acres) *</label>
          <input
            className="form-input"
            type="number"
            step="0.1"
            min="0.1"
            required
            value={form.total_area_acre}
            onChange={set('total_area_acre')}
          />
        </div>
        <div className="form-group f1" style={{ margin: 0 }}>
          <label className="form-label bold text-xs">Soil pH</label>
          <input
            className="form-input"
            type="number"
            step="0.1"
            value={form.soil_ph}
            onChange={set('soil_ph')}
          />
        </div>
      </div>

      <div className="form-group mb12">
        <label className="form-label bold text-xs">Primary Soil Type</label>
        <select className="form-select" value={form.soil_type} onChange={set('soil_type')}>
          {SOILS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="form-group mb12">
        <label className="form-label bold text-xs">Water Availability</label>
        <select className="form-select" value={form.water_avail} onChange={set('water_avail')}>
          {WATERS.map(w => <option key={w}>{w}</option>)}
        </select>
      </div>

      <div className="form-group mb12">
        <label className="form-label bold text-xs">Primary Irrigation Source</label>
        <select className="form-select" value={form.irrigation_type} onChange={set('irrigation_type')}>
          {IRRIGATE.map(i => <option key={i}>{i}</option>)}
        </select>
      </div>

      <div className="form-group mb12">
        <label className="form-label bold text-xs">Current Agronomic Season</label>
        <select className="form-select" value={form.season} onChange={set('season')}>
          {SEASONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="form-group mb16">
        <label className="form-label bold text-xs">Agro-Climatic Region</label>
        <select className="form-select" value={form.region} onChange={set('region')}>
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

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
        Continue to Field Setup →
      </button>
      <div style={{ height: 20 }} />
    </form>
  );
}

function FieldsStep({ draft, updateDraft, onNext }) {
  const [fields, setFields] = useState(draft.fields || [
    { id: 'fld_1', name: 'Plot 1 - Main Field', area_acre: 2.5, soil_type: 'Loamy Soil', current_crop: 'Wheat', sowing_date: new Date().toISOString().split('T')[0] },
    { id: 'fld_2', name: 'Plot 2 - North Plot', area_acre: 2.0, soil_type: 'Black Soil', current_crop: 'Tomato', sowing_date: new Date().toISOString().split('T')[0] },
  ]);

  const set = (i, k) => e => {
    setFields(f => f.map((x, j) => j === i ? { ...x, [k]: e.target.value } : x));
  };

  const addField = () => setFields(f => [
    ...f,
    { id: `fld_${f.length + 1}`, name: `Plot ${f.length + 1}`, area_acre: 1.5, soil_type: 'Loamy Soil', current_crop: 'Maize', sowing_date: new Date().toISOString().split('T')[0] }
  ]);

  const submit = (e) => {
    e.preventDefault();
    updateDraft({
      ...draft,
      fields
    });
    onNext();
  };

  return (
    <form className="scroll-area p20" onSubmit={submit}>
      {fields.map((fld, i) => (
        <div key={i} className="card mb14" style={{ borderRadius: 18, border: '1.5px solid #e2e8f0', padding: '16px' }}>
          <div className="flex fai fjb mb10">
            <b style={{ color: '#064e3b', fontSize: 14 }}>{fld.name}</b>
            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '2px 8px' }}>
              Active Plot
            </span>
          </div>
          <div className="flex g12 mb10">
            <div className="form-group f1" style={{ margin: 0 }}>
              <label className="form-label bold text-xs">Area (Acres)</label>
              <input className="form-input" type="number" step="0.1" value={fld.area_acre} onChange={set(i, 'area_acre')} />
            </div>
            <div className="form-group f1" style={{ margin: 0 }}>
              <label className="form-label bold text-xs">Soil Type</label>
              <select className="form-select" value={fld.soil_type} onChange={set(i, 'soil_type')}>
                {SOILS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group mb10">
            <label className="form-label bold text-xs">Current Crop</label>
            <input className="form-input" value={fld.current_crop} onChange={set(i, 'current_crop')} placeholder="e.g. Wheat, Cotton, Tomato" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label bold text-xs">Sowing Date</label>
            <input className="form-input" type="date" value={fld.sowing_date} onChange={set(i, 'sowing_date')} />
          </div>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-full btn-pill mb12"
        onClick={addField}
        style={{ background: '#f8fafc', color: '#064e3b', border: '1.5px dashed #86efac', padding: '10px' }}
      >
        ＋ Add Another Field Plot
      </button>

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
        Continue to Herd Summary →
      </button>
      <div style={{ height: 20 }} />
    </form>
  );
}

function LivestockStep({ draft }) {
  const navigate = useNavigate();
  const { login } = useApp() || {};
  const [counts, setCounts] = useState({ Cow: 1, Buffalo: 0, Sheep: 0, Goat: 0 });
  const adj = (sp, d) => setCounts(c => ({ ...c, [sp]: Math.max(0, c[sp] + d) }));
  const icons = { Cow: '🐄', Buffalo: '🐃', Sheep: '🐑', Goat: '🐐' };

  const finish = async () => {
    const customAnimals = [];
    const breedMap = { Cow: 'Gir / Sahiwal', Buffalo: 'Murrah', Sheep: 'Marwari', Goat: 'Beetal' };
    const weightMap = { Cow: 380, Buffalo: 450, Sheep: 45, Goat: 40 };

    Object.entries(counts).forEach(([sp, n]) => {
      for (let i = 1; i <= n; i++) {
        customAnimals.push({
          id: `custom_${sp.toLowerCase()}_${i}`,
          name: `${sp} #${i}`,
          species: sp,
          breed: breedMap[sp] || 'Indigenous',
          tag: `TAG-${sp.substring(0, 2).toUpperCase()}${100 + i}`,
          age_years: 3.0,
          weight_kg: weightMap[sp] || 100,
          health_status: 'Healthy',
          vaccination_alert: 'ok'
        });
      }
    });

    const fullUser = {
      ...draft,
      livestock_counts: counts,
      livestock: customAnimals
    };

    const saved = userStore.saveUser(fullUser);
    if (login) await login(saved.id);

    try {
      await farmApi.updateProfile({
        farmer_name: saved.name,
        phone: saved.phone,
        location: saved.location
      });
    } catch {}

    navigate('/home');
  };

  return (
    <div className="scroll-area p20">
      <p className="text-sm text-muted mb16" style={{ color: '#64748b' }}>
        Specify the exact animal headcount on your farm. Only the animals you add here will appear in your herd registry.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(counts).map(([sp, n]) => (
          <div key={sp} className="card flex fai fjb" style={{ borderRadius: 18, padding: '14px 16px', border: '1.5px solid #e2e8f0' }}>
            <div className="flex fai g14">
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                background: '#f0fdf4',
                border: '1px solid #bbf7d0'
              }}>
                {icons[sp]}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{sp}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{n} animal{n !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <div className="flex fai g8">
              <button
                type="button"
                onClick={() => adj(sp, -1)}
                style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', fontSize: 18, cursor: 'pointer', border: '1px solid #cbd5e1', color: '#0f172a' }}
              >
                −
              </button>
              <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                {n}
              </span>
              <button
                type="button"
                onClick={() => adj(sp, +1)}
                style={{ width: 34, height: 34, borderRadius: '50%', background: '#ecfdf5', color: '#064e3b', fontSize: 18, cursor: 'pointer', border: '1px solid #86efac', fontWeight: 700 }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-full btn-pill mt16"
        onClick={finish}
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 55%, #059669 100%)',
          color: '#fff',
          border: 'none',
          padding: '14px 20px',
          fontSize: 14,
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(6,78,59,0.28)'
        }}
      >
        🌿 Launch Farm Command Center →
      </button>
      <div style={{ height: 20 }} />
    </div>
  );
}

export default function Setup() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    language: 'English',
    total_area_acre: 4.0,
    soil_type: 'Loamy Soil',
    fields: [],
    livestock: []
  });

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const headers = [
    { title: 'Create Farmer Profile', sub: 'Step 1 — Tell us about yourself' },
    { title: 'Farm Specifications',  sub: 'Step 2 — Land, soil & climate zone' },
    { title: 'Field & Crop Registry', sub: 'Step 3 — Add your active plots' },
    { title: 'Livestock Herd Summary', sub: 'Step 4 — Track animal headcount' },
  ];

  return (
    <div className="app-shell">
      <div className="phone" style={{ display: 'flex', flexDirection: 'column' }}>
        <SetupHeader step={step} back={step > 1 ? back : null} title={headers[step - 1].title} sub={headers[step - 1].sub} />
        {step === 1 && <FarmerStep draft={draft} updateDraft={setDraft} onNext={next} />}
        {step === 2 && <FarmStep   draft={draft} updateDraft={setDraft} onNext={next} onBack={back} />}
        {step === 3 && <FieldsStep draft={draft} updateDraft={setDraft} onNext={next} onBack={back} />}
        {step === 4 && <LivestockStep draft={draft} onNext={next} onBack={back} />}
      </div>
    </div>
  );
}
