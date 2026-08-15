/**
 * AI Crop Recommendation — Agro-Climatic Soil, Season & Weather Suitability Engine
 * with Immersive Botanical Hero Header, Auto-Recommendation on Load, and Direct Field Sowing.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cropApi, farmApi } from '../api/client';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

const SOILS = ['Loamy', 'Sandy Loam', 'Clay Loam', 'Black Soil', 'Alluvial', 'Red Loam'];
const SEASONS = ['Winter', 'Summer', 'Monsoon'];
const WATERS = ['Low', 'Medium', 'High'];
const REGIONS = [
  'North India (Punjab/Haryana)',
  'North India (Uttar Pradesh)',
  'South India (Karnataka)',
  'West India (Maharashtra/Vidarbha)',
  'East India (West Bengal)',
  'Central India (Madhya Pradesh)'
];

const CROP_ICON = {
  Potato: '🥔',
  Tomato: '🍅',
  Strawberry: '🍓',
  Corn: '🌽',
  Grape: '🍇',
  Orange: '🍊',
  Apple: '🍎',
  Peach: '🍑',
  Cherry: '🍒',
  Blueberry: '🫐',
  'Bell Pepper': '🫑',
  Soybean: '🫘',
  Squash: '🥝',
  Raspberry: '🍇',
  Wheat: '🌾',
  Peas: '🫛',
  Rice: '🌾',
  Cotton: '🌱',
  Sugarcane: '🎋',
  Mustard: '🌼',
  Gram: '🫘'
};

export default function CropRecommendation() {
  const navigate = useNavigate();
  const { profile, weather } = useApp() || {};
  const farm = profile?.farm;

  const [form, setForm] = useState({
    soil_type: farm?.soil_type || 'Sandy Loam',
    season: farm?.season || 'Winter',
    temperature_c: weather?.temperature_c || 26.8,
    rainfall_mm: 450,
    water_avail: farm?.water_avail || 'Medium',
    region: farm?.region || REGIONS[0],
    farm_area: farm?.total_area_acre || 5,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  // ── Plant in Field Modal State ──
  const [fields, setFields] = useState([]);
  const [plantModalCrop, setPlantModalCrop] = useState(null);
  const [plantMode, setPlantMode] = useState('existing'); // 'existing' | 'new'
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldArea, setNewFieldArea] = useState('2.5');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [variety, setVariety] = useState('Certified High-Yield Hybrid');
  const [planting, setPlanting] = useState(false);

  // Auto-fetch fields & initial AI recommendations on mount
  useEffect(() => {
    farmApi.getFields().then(res => {
      const flist = Array.isArray(res) ? res : (res.fields || []);
      setFields(flist);
      if (flist.length > 0) setSelectedFieldId(flist[0].id);
    }).catch(() => {});

    // Run initial recommendation with farm profile parameters
    cropApi.recommend(form)
      .then(setResult)
      .catch(e => setError(e.message || 'Recommendation failed'))
      .finally(() => setLoading(false));
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await cropApi.recommend(form);
      setResult(r);
      setShowConfig(false); // Collapse parameters to show results cleanly
    } catch (e) {
      setError(e.message || 'Crop recommendation failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const openPlantModal = (crop) => {
    setPlantModalCrop(crop);
    setVariety(crop.variety || 'Certified High-Yield Hybrid');
    setNewFieldName(`${crop.crop} Plot`);
    if (fields.length === 0) {
      setPlantMode('new');
    } else {
      setPlantMode('existing');
      setSelectedFieldId(fields[0].id);
    }
  };

  const confirmPlant = async (e) => {
    e.preventDefault();
    if (!plantModalCrop) return;
    setPlanting(true);
    try {
      if (plantMode === 'existing' && selectedFieldId) {
        await farmApi.updateField(selectedFieldId, {
          current_crop: plantModalCrop.crop,
          crop_name: plantModalCrop.crop,
          variety: variety || 'Certified High-Yield Hybrid',
          sowing_date: sowingDate,
          stage: 'Sowing / Seedling'
        });
      } else {
        await farmApi.addField({
          name: newFieldName || `${plantModalCrop.crop} Plot`,
          area_acre: parseFloat(newFieldArea) || 2.5,
          current_crop: plantModalCrop.crop,
          crop_name: plantModalCrop.crop,
          variety: variety || 'Certified High-Yield Hybrid',
          soil_type: form.soil_type || 'Loamy',
          sowing_date: sowingDate,
          stage: 'Sowing / Seedling'
        });
      }
      setPlantModalCrop(null);
      navigate('/crops');
    } catch (err) {
      alert('Failed to plant crop in field: ' + err.message);
    } finally {
      setPlanting(false);
    }
  };

  const rankBadges = [
    { label: '🥇 #1 Top Match', bg: 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)', color: '#854d0e', border: '#facc15' },
    { label: '🥈 #2 Recommended', bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', color: '#334155', border: '#cbd5e1' },
    { label: '🥉 #3 Alternative', bg: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)', color: '#9a3412', border: '#fdba74' },
  ];

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#f8fafc' }}>
        
        {/* ── 1. Unified Immersive Botanical Forest Hero Header ── */}
        <div style={{
          background: 'linear-gradient(160deg, #064e3b 0%, #047857 50%, #059669 100%)',
          color: '#fff',
          padding: '16px 20px 22px',
          flexShrink: 0,
          boxShadow: '0 8px 24px rgba(6,78,59,0.22)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient Graphic */}
          <div style={{
            position: 'absolute',
            right: -10,
            top: 15,
            fontSize: 130,
            opacity: 0.1,
            pointerEvents: 'none',
            lineHeight: 1,
            userSelect: 'none'
          }}>
            🌱
          </div>

          {/* Top Bar: Back Button, Title, ML Engine Badge */}
          <div className="flex fai fjb mb12">
            <div className="flex fai g10">
              <button
                className="back-btn"
                onClick={() => navigate(-1)}
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  borderColor: 'rgba(255,255,255,0.25)',
                  color: '#fff',
                  width: 36,
                  height: 36
                }}
              >
                ←
              </button>
              <div>
                <div style={{ fontSize: 20.5, fontWeight: 700, letterSpacing: '-0.3px' }}>
                  Crop Recommendations
                </div>
              </div>
            </div>

            <div style={{
              fontSize: 10,
              color: '#fff',
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '4px 10px',
              borderRadius: 99,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6ee7b7', boxShadow: '0 0 6px #6ee7b7' }} />
              ML Matcher
            </div>
          </div>

          {/* Headline & Description */}
          <div className="flex fai fjb mt4 mb14">
            <div style={{ maxWidth: '78%' }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: '#a7f3d0' }}>
                YIELD & SOWING SUITABILITY
              </div>
              <div style={{ fontSize: 23, fontWeight: 700, marginTop: 2, letterSpacing: '-0.4px', lineHeight: 1.2 }}>
                Optimal Sowing Matches
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 3, lineHeight: 1.4 }}>
                Precision-matched for soil texture, season & temperature.
              </div>
            </div>

            <div style={{
              width: 60,
              height: 60,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              boxShadow: '0 6px 18px rgba(0,0,0,0.1)'
            }}>
              🌱
            </div>
          </div>

          {/* 3 Parameter Summary Capsules */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: '6px 4px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: 9, fontWeight: 500, color: '#a7f3d0', textTransform: 'uppercase' }}>Soil Type</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginTop: 1 }}>{form.soil_type}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: '6px 4px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: 9, fontWeight: 500, color: '#a7f3d0', textTransform: 'uppercase' }}>Season</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginTop: 1 }}>{form.season}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: '6px 4px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: 9, fontWeight: 500, color: '#a7f3d0', textTransform: 'uppercase' }}>Water</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginTop: 1 }}>{form.water_avail}</div>
            </div>
          </div>
        </div>

        {/* ── 2. Scrollable Body ── */}
        <div className="scroll-area p20">
          
          {/* Toggle Parameter Customizer Button */}
          <div className="flex fai fjb mb12">
            <span className="section-label" style={{ margin: 0 }}>
              {showConfig ? 'CUSTOMIZE ENVIRONMENT' : 'TOP RECOMMENDED CROPS'}
            </span>
            <button
              type="button"
              onClick={() => setShowConfig(s => !s)}
              style={{
                background: showConfig ? '#e0f2fe' : '#f0fdf4',
                color: showConfig ? '#0369a1' : '#15803d',
                border: showConfig ? '1px solid #bae6fd' : '1px solid #bbf7d0',
                padding: '4px 10px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>{showConfig ? '✕ Close Filters' : '⚙️ Adjust Inputs'}</span>
            </button>
          </div>

          {/* Farm Conditions Configuration Widget (Collapsible / Expandable) */}
          {showConfig && (
            <div className="card mb16" style={{ borderRadius: 20, padding: '16px 18px', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              {/* Soil Type */}
              <div className="form-group mb12">
                <label className="form-label bold text-xs" style={{ color: 'var(--char-700)' }}>Soil Type</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {SOILS.map(s => {
                    const sel = form.soil_type === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, soil_type: s }))}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          border: sel ? 'none' : '1px solid #e2e8f0',
                          background: sel ? 'linear-gradient(135deg, #047857 0%, #059669 100%)' : '#f8fafc',
                          color: sel ? '#fff' : 'var(--char-700)',
                          boxShadow: sel ? '0 2px 8px rgba(4,120,87,0.25)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Season & Water Grid */}
              <div className="grid-2 mb12" style={{ gap: 10 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label bold text-xs" style={{ color: 'var(--char-700)' }}>Season</label>
                  <select className="form-select" value={form.season} onChange={set('season')}>
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label bold text-xs" style={{ color: 'var(--char-700)' }}>Water Availability</label>
                  <select className="form-select" value={form.water_avail} onChange={set('water_avail')}>
                    {WATERS.map(w => <option key={w} value={w}>{w} Water</option>)}
                  </select>
                </div>
              </div>

              {/* Climate Numbers Grid */}
              <div className="grid-3 mb12" style={{ gap: 8 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label bold text-xs" style={{ color: 'var(--char-700)' }}>Temp (°C)</label>
                  <input className="form-input" type="number" value={form.temperature_c} onChange={set('temperature_c')} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label bold text-xs" style={{ color: 'var(--char-700)' }}>Rain (mm)</label>
                  <input className="form-input" type="number" value={form.rainfall_mm} onChange={set('rainfall_mm')} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label bold text-xs" style={{ color: 'var(--char-700)' }}>Area (Ac)</label>
                  <input className="form-input" type="number" value={form.farm_area} onChange={set('farm_area')} />
                </div>
              </div>

              {/* Region Selector */}
              <div className="form-group mb12" style={{ margin: 0 }}>
                <label className="form-label bold text-xs" style={{ color: 'var(--char-700)' }}>Region</label>
                <select className="form-select" value={form.region} onChange={set('region')}>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Re-calculate Button */}
              <button
                className="btn btn-full btn-pill mt12"
                onClick={run}
                disabled={loading}
                style={{
                  padding: '11px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(5,150,105,0.25)'
                }}
              >
                {loading ? 'Re-calculating…' : '🌾 Update Recommendations'}
              </button>
            </div>
          )}

          {error && (
            <div className="alert-box alert-red mb14" style={{ borderRadius: 16 }}>
              <span>⚠️</span>
              <div className="text-sm">{error}</div>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && !result && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="spinner" style={{ margin: 'auto' }} />
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>Matching optimal crops for your soil & climate…</div>
            </div>
          )}

          {/* ── Results Feed ── */}
          {result && (
            <div>
              {result.top_crops?.map((crop, i) => {
                const badge = rankBadges[i] || rankBadges[0];
                const icon = CROP_ICON[crop.crop] || '🌱';

                return (
                  <div
                    key={i}
                    className="card mb14"
                    style={{
                      borderRadius: 22,
                      padding: '18px 20px',
                      background: '#fff',
                      border: i === 0 ? '2px solid #86efac' : '1px solid #e2e8f0',
                      boxShadow: i === 0 ? '0 8px 24px rgba(34,197,94,0.12)' : '0 3px 10px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div className="flex fai fjb mb12">
                      {/* Rank Chip */}
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`
                      }}>
                        {badge.label}
                      </div>

                      {/* Match Score Badge */}
                      <div style={{
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        borderRadius: 12,
                        padding: '4px 12px',
                        textAlign: 'right'
                      }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#15803d' }}>
                          {crop.score}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}> / 100 Match</span>
                      </div>
                    </div>

                    <div className="flex fai g12">
                      <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        flexShrink: 0
                      }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--char-800)' }}>
                          {crop.crop}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, fontWeight: 400 }}>
                          {crop.grade} Match · {crop.season || form.season} Season
                        </div>
                      </div>
                    </div>

                    {/* Metadata Tags */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                      {crop.water_requirement && (
                        <span className="badge badge-blue" style={{ fontSize: 11, fontWeight: 500 }}>
                          💧 {crop.water_requirement} Water
                        </span>
                      )}
                      {crop.crop_duration && (
                        <span className="badge badge-gray" style={{ fontSize: 11, fontWeight: 500 }}>
                          ⏱️ ~{crop.crop_duration} Days Cycle
                        </span>
                      )}
                      <span className="badge badge-green" style={{ fontSize: 11, fontWeight: 500 }}>
                        🌱 {form.soil_type} Soil
                      </span>
                    </div>

                    {/* Reasons Breakdown */}
                    {crop.reasons && crop.reasons.length > 0 && (
                      <div style={{
                        marginTop: 12,
                        padding: '12px 14px',
                        background: '#f0fdf4',
                        borderRadius: 14,
                        border: '1px solid #bbf7d0',
                        fontSize: 12,
                        color: 'var(--char-700)',
                        lineHeight: 1.5
                      }}>
                        <div style={{ color: '#15803d', marginBottom: 4, fontWeight: 600, fontSize: 11 }}>
                          💡 Why {crop.crop} is suitable:
                        </div>
                        {crop.reasons.slice(0, 2).map((r, rIdx) => (
                          <div key={rIdx} style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                            <span style={{ color: '#16a34a', fontWeight: 600 }}>✓</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Direct "Plant in Field" Action Button — Lush Emerald Theme */}
                    <button
                      type="button"
                      onClick={() => openPlantModal(crop)}
                      style={{
                        width: '100%',
                        marginTop: 14,
                        padding: '12px 18px',
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        color: '#fff',
                        border: 'none',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        boxShadow: '0 4px 14px rgba(5,150,105,0.28)'
                      }}
                    >
                      <span>🌱</span>
                      <span>Plant {crop.crop} in Field</span>
                    </button>
                  </div>
                );
              })}

              {/* Action Button to Field Hub */}
              <button
                className="btn btn-secondary btn-full btn-pill mb10"
                onClick={() => navigate('/crops')}
                style={{ padding: '12px 20px', fontWeight: 600, fontSize: 13 }}
              >
                🌾 Go to Active Fields & Calendar →
              </button>
            </div>
          )}

          {/* Generous bottom spacing so bottom nav never overlaps cards */}
          <div style={{ height: 32 }} />
        </div>

        {/* ── Plant in Field Modal Sheet ── */}
        {plantModalCrop && (
          <div className="modal-overlay" onClick={() => setPlantModalCrop(null)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto', borderRadius: 24 }}>
              <div className="flex fai fjb mb16">
                <div className="flex fai g10">
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24
                  }}>
                    {CROP_ICON[plantModalCrop.crop] || '🌱'}
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--char-800)' }}>
                      Plant {plantModalCrop.crop}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>
                      Assign recommended crop to your farm field
                    </div>
                  </div>
                </div>
                <button className="icon-btn" onClick={() => setPlantModalCrop(null)}>✕</button>
              </div>

              <form onSubmit={confirmPlant}>
                {/* Mode Selector Tabs */}
                <div style={{
                  display: 'flex',
                  background: '#f1f5f9',
                  borderRadius: 12,
                  padding: 3,
                  marginBottom: 16,
                  gap: 4
                }}>
                  <button
                    type="button"
                    onClick={() => setPlantMode('existing')}
                    disabled={fields.length === 0}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: fields.length > 0 ? 'pointer' : 'not-allowed',
                      background: plantMode === 'existing' ? '#fff' : 'transparent',
                      color: plantMode === 'existing' ? 'var(--green-800)' : 'var(--char-500)',
                      boxShadow: plantMode === 'existing' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      opacity: fields.length === 0 ? 0.5 : 1
                    }}
                  >
                    Select Existing Field ({fields.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlantMode('new')}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: plantMode === 'new' ? '#fff' : 'transparent',
                      color: plantMode === 'new' ? 'var(--green-800)' : 'var(--char-500)',
                      boxShadow: plantMode === 'new' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                    }}
                  >
                    ＋ Create New Field Plot
                  </button>
                </div>

                {plantMode === 'existing' ? (
                  <div className="form-group mb14">
                    <label className="form-label bold text-xs">Choose Field to Sow {plantModalCrop.crop} *</label>
                    <select
                      className="form-select"
                      required
                      value={selectedFieldId}
                      onChange={e => setSelectedFieldId(e.target.value)}
                      style={{ fontSize: 14, fontWeight: 600 }}
                    >
                      {fields.map(f => (
                        <option key={f.id} value={f.id}>
                          🌾 {f.name} — Current: {f.current_crop || f.crop_name || 'Empty'} ({f.area_acre || 2} Ac)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="form-group mb12">
                      <label className="form-label bold text-xs">New Field Name *</label>
                      <input
                        className="form-input"
                        required
                        value={newFieldName}
                        onChange={e => setNewFieldName(e.target.value)}
                        placeholder="e.g. North Acre Plot, East Field"
                      />
                    </div>
                    <div className="form-group mb12">
                      <label className="form-label bold text-xs">Area (Acres) *</label>
                      <input
                        className="form-input"
                        type="number"
                        step="0.5"
                        min="0.5"
                        required
                        value={newFieldArea}
                        onChange={e => setNewFieldArea(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Sowing Date & Variety */}
                <div className="flex g12 mb16">
                  <div className="form-group f1">
                    <label className="form-label bold text-xs">Sowing Date *</label>
                    <input
                      className="form-input"
                      type="date"
                      required
                      value={sowingDate}
                      onChange={e => setSowingDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group f1">
                    <label className="form-label bold text-xs">Seed Variety</label>
                    <input
                      className="form-input"
                      value={variety}
                      onChange={e => setVariety(e.target.value)}
                      placeholder="e.g. PBW-550 / Hybrid"
                    />
                  </div>
                </div>

                <div className="alert-box alert-green mb16" style={{ borderRadius: 14, fontSize: 12 }}>
                  <span>🗓️</span>
                  <div>
                    Your Day-by-Day irrigation and fertilization calendar will be initialized starting from Day 0 of sowing.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-full btn-pill"
                    disabled={planting}
                    style={{
                      padding: '12px 20px',
                      fontSize: 13,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      color: '#fff',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(5,150,105,0.28)'
                    }}
                  >
                    {planting ? 'Sowing Crop…' : `🌱 Confirm & Sow ${plantModalCrop.crop}`}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setPlantModalCrop(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}
