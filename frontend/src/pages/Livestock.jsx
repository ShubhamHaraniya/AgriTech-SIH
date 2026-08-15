/**
 * Livestock module — Dashboard, Add Animal Modal, Animal Profile with Health History,
 * ML Health Assessment with exact 24 symptoms & 5-6 ML classes,
 * ML Result & Clinical Advisory, Vaccination Tracker with Mark-Done & Schedule.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { livestockApi } from '../api/client';
import BottomNav from '../components/BottomNav';
import { userStore } from '../utils/userStore';

const SP_ICON = { Cow:'🐄', Buffalo:'🐃', Sheep:'🐑', Goat:'🐐', Pig:'🐷', Duck:'🦆', Poultry:'🐔', Ox:'🐂' };
const HEALTH_BADGE = {
  Healthy:           { cls:'badge-green', label:'Healthy' },
  Sick:              { cls:'badge-red',   label:'Sick' },
  'Under Treatment': { cls:'badge-amber', label:'Treatment' },
};

/* ─── Exact 24 Symptoms from Trained MLP Dataset ───────────────────────────── */
const ML_SYMPTOMS_CATEGORIES = [
  {
    cat: 'Mouth & Hoof Lesions',
    items: [
      'blisters on mouth', 'blisters on tongue', 'blisters on gums', 'blisters on hooves',
      'sores on mouth', 'sores on tongue', 'sores on gums', 'sores on hooves'
    ]
  },
  {
    cat: 'Locomotion & Mobility',
    items: [
      'difficulty walking', 'lameness', 'swelling in limb', 'swelling in extremities'
    ]
  },
  {
    cat: 'Systemic & General Health',
    items: [
      'loss of appetite', 'fatigue', 'depression', 'sweats', 'chills', 'painless lumps'
    ]
  },
  {
    cat: 'Respiratory & Sounds',
    items: [
      'shortness of breath', 'chest discomfort', 'crackling sound'
    ]
  },
  {
    cat: 'Swelling & Inflammation',
    items: [
      'swelling in abdomen', 'swelling in muscle', 'swelling in neck'
    ]
  }
];

/* ─── Dashboard ────────────────────────────────────────────────────────────── */
export function LivestockDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setL] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnimal, setNewAnimal] = useState({
    name: '',
    species: 'Cow',
    breed: 'Sahiwal',
    age_years: '3.0',
    weight_kg: '380',
    tag: 'TAG-' + Math.floor(100 + Math.random() * 900),
    health_status: 'Healthy',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setL(true);
    livestockApi.getAll().then(setData).catch(() => {}).finally(() => setL(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleAddAnimal = async (e) => {
    e.preventDefault();
    if (!newAnimal.name.trim()) return;
    setSubmitting(true);
    try {
      const isCustomMode = localStorage.getItem('agritech_is_custom') === 'true';
      const customRaw = localStorage.getItem('agritech_custom_animals');
      if (isCustomMode && customRaw) {
        const parsed = JSON.parse(customRaw);
        const added = {
          id: 'custom_' + Date.now(),
          name: newAnimal.name,
          species: newAnimal.species,
          breed: newAnimal.breed,
          tag: newAnimal.tag,
          age_years: parseFloat(newAnimal.age_years) || 2.0,
          weight_kg: parseFloat(newAnimal.weight_kg) || 250.0,
          health_status: newAnimal.health_status || 'Healthy',
          vaccination_alert: 'ok'
        };
        const updated = [...parsed, added];
        localStorage.setItem('agritech_custom_animals', JSON.stringify(updated));
        setShowAddModal(false);
        setNewAnimal({
          name: '',
          species: 'Cow',
          breed: 'Sahiwal',
          age_years: '3.0',
          weight_kg: '380',
          tag: 'TAG-' + Math.floor(100 + Math.random() * 900),
          health_status: 'Healthy',
        });
        setSubmitting(false);
        return;
      }

      await livestockApi.add({
        ...newAnimal,
        age_years: parseFloat(newAnimal.age_years) || 2.0,
        weight_kg: parseFloat(newAnimal.weight_kg) || 250.0,
      });
      setShowAddModal(false);
      setNewAnimal({
        name: '',
        species: 'Cow',
        breed: 'Sahiwal',
        age_years: '3.0',
        weight_kg: '380',
        tag: 'TAG-' + Math.floor(100 + Math.random() * 900),
        health_status: 'Healthy',
      });
      loadData();
    } catch (err) {
      alert('Failed to add animal: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const [selectedSpecies, setSelectedSpecies] = useState('All');
  const [showSpeciesMenu, setShowSpeciesMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeUser = userStore.getActiveUser();
  const animals = (data?.animals && Array.isArray(data.animals)) ? data.animals : (activeUser?.livestock || []);
  const by_sp = (data?.by_species && Object.keys(data.by_species).length > 0) ? data.by_species : {
    Cow: animals.filter(a => (a.species || '').toLowerCase() === 'cow').length,
    Buffalo: animals.filter(a => (a.species || '').toLowerCase() === 'buffalo').length,
    Sheep: animals.filter(a => (a.species || '').toLowerCase() === 'sheep').length,
    Goat: animals.filter(a => (a.species || '').toLowerCase() === 'goat').length,
  };
  const overdue  = animals.filter(a => a.vaccination_alert === 'overdue').length;
  const due_soon = animals.filter(a => a.vaccination_alert === 'due_soon').length;
  const sick     = animals.filter(a => a.health_status === 'Sick').length;
  const healthy  = animals.filter(a => a.health_status === 'Healthy').length;

  const filteredAnimals = animals.filter(a => {
    const matchSp = selectedSpecies === 'All' || a.species.toLowerCase() === selectedSpecies.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchQ = !q || (
      a.name.toLowerCase().includes(q) ||
      (a.tag && a.tag.toLowerCase().includes(q)) ||
      (a.breed && a.breed.toLowerCase().includes(q)) ||
      a.species.toLowerCase().includes(q)
    );
    return matchSp && matchQ;
  });

  return (
    <div className="app-shell"><div className="phone flex fdc" style={{ background: '#f8fafc' }}>
      
      {/* ── Single Immersive Midnight Slate & Amber Hero Header ── */}
      <div style={{
        background: 'linear-gradient(160deg, #090d16 0%, #0f172a 45%, #1e293b 100%)',
        color: '#fff',
        padding: '18px 20px 24px',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(15,23,42,0.35)',
        borderBottom: '1px solid rgba(245,158,11,0.15)'
      }}>
        {/* Subtle Watermark */}
        <div style={{
          position: 'absolute',
          right: -10,
          bottom: -15,
          fontSize: 130,
          opacity: 0.05,
          pointerEvents: 'none',
          lineHeight: 1,
          userSelect: 'none'
        }}>
          🐄
        </div>

        {/* Top Bar: Title & Single Register Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 20.5, fontWeight: 700, letterSpacing: '-0.3px', color: '#fff' }}>
              Livestock Hub
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(217,119,6,0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>＋</span>
            <span>Add Animal</span>
          </button>
        </div>

        {/* Live Herd Metric Display */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: '#f59e0b' }}>
            ACTIVE HERD STRENGTH
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 2, lineHeight: 1.15 }}>
            {data?.total || animals.length} Cattle & Herd
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
            Monitored across nutrition, lactation & clinical pathology
          </div>
        </div>

        {/* 3 Frosted Metric Capsules */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#86efac', textTransform: 'uppercase' }}>Healthy</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>{healthy || animals.length}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: sick > 0 ? '#fca5a5' : 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Clinical Alert</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: sick > 0 ? '#ef4444' : '#fff', marginTop: 2 }}>{sick}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: overdue > 0 ? '#fde047' : '#93c5fd', textTransform: 'uppercase' }}>Vaccines Due</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: overdue > 0 ? '#facc15' : '#fff', marginTop: 2 }}>{overdue + due_soon}</div>
          </div>
        </div>
      </div>

      <div className="scroll-area p20">
        
        {/* 2 High-Impact Action Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div
            onClick={() => navigate('/livestock/assess')}
            className="card"
            style={{
              borderRadius: 18,
              padding: '16px',
              background: '#fff',
              cursor: 'pointer',
              border: '1px solid #bbf7d0',
              boxShadow: '0 2px 10px rgba(34,197,94,0.06)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              marginBottom: 10
            }}>
              🔬
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--char-800)' }}>AI Health Check</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>24-Symptom Diagnostic</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#15803d', marginTop: 8 }}>Run Exam →</div>
          </div>

          <div
            onClick={() => navigate('/livestock/vaccination')}
            className="card"
            style={{
              borderRadius: 18,
              padding: '16px',
              background: '#fff',
              cursor: 'pointer',
              border: '1px solid #bae6fd',
              boxShadow: '0 2px 10px rgba(14,165,233,0.06)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              marginBottom: 10
            }}>
              💉
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--char-800)' }}>Vaccine Tracker</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Immunization Protocol</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0369a1', marginTop: 8 }}>View Tracker →</div>
          </div>
        </div>

        {/* Unified Search & Species Filter Bar */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, position: 'relative', zIndex: 20 }}>
          {/* Search Box */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            borderRadius: 14,
            padding: '2px 14px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            border: '1px solid #cbd5e1'
          }}>
            <span style={{ fontSize: 14, color: '#94a3b8', marginRight: 6 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, tag, breed…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 12,
                fontWeight: 500,
                width: '100%',
                padding: '8px 0',
                fontFamily: 'var(--font)',
                color: 'var(--char-800)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13, padding: 2 }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Species Filter Popover Button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowSpeciesMenu(s => !s)}
              style={{
                padding: '9px 12px',
                borderRadius: 14,
                background: '#fff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
              }}
            >
              <span>
                {selectedSpecies === 'All' ? '🐾' : selectedSpecies === 'Cow' ? '🐄' : selectedSpecies === 'Buffalo' ? '🐃' : selectedSpecies === 'Goat' ? '🐐' : '🐑'}
              </span>
              <span>{selectedSpecies === 'All' ? `All (${animals.length})` : selectedSpecies}</span>
              <span style={{ fontSize: 8, color: '#64748b', transform: showSpeciesMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </button>

            {showSpeciesMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowSpeciesMenu(false)} />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: 200,
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                  border: '1px solid #e2e8f0',
                  padding: 6,
                  zIndex: 40,
                  maxHeight: 260,
                  overflowY: 'auto'
                }}>
                  {[
                    { sp: 'All', icon: '🐾', label: `All Animals (${animals.length})` },
                    { sp: 'Cow', icon: '🐄', label: `Cow (${by_sp['Cow'] || 0})` },
                    { sp: 'Buffalo', icon: '🐃', label: `Buffalo (${by_sp['Buffalo'] || 0})` },
                    { sp: 'Goat', icon: '🐐', label: `Goat (${by_sp['Goat'] || 0})` },
                    { sp: 'Sheep', icon: '🐑', label: `Sheep (${by_sp['Sheep'] || 0})` },
                  ].map(item => {
                    const isSelected = selectedSpecies === item.sp;
                    return (
                      <div
                        key={item.sp}
                        onClick={() => {
                          setSelectedSpecies(item.sp);
                          setShowSpeciesMenu(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          cursor: 'pointer',
                          background: isSelected ? '#fef3c7' : 'transparent',
                          transition: 'all 0.12s ease'
                        }}
                        onMouseEnter={e => !isSelected && (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{item.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#92400e' : 'var(--char-800)' }}>
                            {item.label}
                          </span>
                        </div>
                        {isSelected && <span style={{ color: '#d97706', fontWeight: 800 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Animal List Feed Header */}
        <div className="flex fai fjb mb10">
          <div className="section-label" style={{ marginBottom: 0 }}>HERD REGISTRY ({filteredAnimals.length})</div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 20 }}><div className="spinner" style={{ margin: 'auto' }} /></div>}

        {filteredAnimals.map(a => {
          const hb = HEALTH_BADGE[a.health_status] || HEALTH_BADGE.Healthy;
          return (
            <div
              key={a.id}
              className="card mb12"
              style={{
                cursor: 'pointer',
                borderRadius: 18,
                padding: '16px 18px',
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
              onClick={() => navigate(`/livestock/${a.id}`)}
            >
              <div className="flex fai g12">
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  border: '1px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  flexShrink: 0
                }}>
                  {SP_ICON[a.species] || '🐾'}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div className="flex fai fjb">
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{a.name}</div>
                    <span className={`badge ${hb.cls}`} style={{ borderRadius: 99, fontSize: 11, fontWeight: 600, padding: '3px 10px' }}>
                      {hb.label}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: 500 }}>
                    {a.species} · {a.breed} · <span style={{ fontWeight: 600, color: '#0f172a', background: '#f1f5f9', padding: '1px 6px', borderRadius: 6, fontSize: 11 }}>{a.tag}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '2px 8px', fontWeight: 500 }}>
                      🎂 {a.age_years} yrs
                    </span>
                    <span style={{ fontSize: 10, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '2px 8px', fontWeight: 500 }}>
                      ⚖️ {a.weight_kg} kg
                    </span>
                    {a.vaccination_alert !== 'ok' && (
                      <span className={`badge ${a.vaccination_alert === 'overdue' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: 10, borderRadius: 8 }}>
                        {a.vaccination_alert === 'overdue' ? '💉 Overdue' : '💉 Due Soon'}
                      </span>
                    )}
                  </div>
                </div>

                <span style={{ color: '#cbd5e1', fontSize: 18, fontWeight: 600 }}>›</span>
              </div>
            </div>
          );
        })}

        {filteredAnimals.length === 0 && !loading && (
          <div className="card text-center p24" style={{ borderRadius: 20, background: '#fff' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🐄</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--char-800)' }}>No Animals Found</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              No animals registered under the selected species filter.
            </div>
          </div>
        )}
        <div style={{ height: 16 }} />
      </div>

      <BottomNav />

      {/* ── Add Animal Modal Sheet ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto', borderRadius: 24 }}>
            <div className="flex fai fjb mb16">
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--char-800)' }}>Register New Animal</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Add cattle or small ruminants to your digital herd register</div>
              </div>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddAnimal}>
              <div className="form-group mb12">
                <label className="form-label bold text-xs">Species *</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {['Cow', 'Buffalo', 'Goat', 'Sheep'].map(sp => {
                    const sel = newAnimal.species === sp;
                    return (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => setNewAnimal({ ...newAnimal, species: sp })}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: sel ? '#0f172a' : '#f8fafc',
                          color: sel ? '#fff' : '#475569',
                          border: sel ? 'none' : '1px solid #e2e8f0',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {SP_ICON[sp]} {sp}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group mb12">
                <label className="form-label bold text-xs">Animal Name / Identifier *</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. Gauri, Shyam, Lakshmi"
                  value={newAnimal.name}
                  onChange={e => setNewAnimal({ ...newAnimal, name: e.target.value })}
                />
              </div>

              <div className="flex g12 mb12">
                <div className="form-group f1">
                  <label className="form-label bold text-xs">Breed</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Sahiwal, Murrah"
                    value={newAnimal.breed}
                    onChange={e => setNewAnimal({ ...newAnimal, breed: e.target.value })}
                  />
                </div>
                <div className="form-group f1">
                  <label className="form-label bold text-xs">Ear Tag #</label>
                  <input
                    className="form-input"
                    value={newAnimal.tag}
                    onChange={e => setNewAnimal({ ...newAnimal, tag: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex g12 mb12">
                <div className="form-group f1">
                  <label className="form-label bold text-xs">Age (Years)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.5"
                    value={newAnimal.age_years}
                    onChange={e => setNewAnimal({ ...newAnimal, age_years: e.target.value })}
                  />
                </div>
                <div className="form-group f1">
                  <label className="form-label bold text-xs">Weight (kg)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={newAnimal.weight_kg}
                    onChange={e => setNewAnimal({ ...newAnimal, weight_kg: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group mb14">
                <label className="form-label bold text-xs">Clinical Health Status</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {['Healthy', 'Sick', 'Under Treatment'].map(st => {
                    const sel = newAnimal.health_status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewAnimal({ ...newAnimal, health_status: st })}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: sel ? (st === 'Healthy' ? '#15803d' : st === 'Sick' ? '#b91c1c' : '#d97706') : '#f8fafc',
                          color: sel ? '#fff' : '#475569',
                          border: sel ? 'none' : '1px solid #e2e8f0',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {st === 'Healthy' ? '● Healthy' : st === 'Sick' ? '⚠️ Sick' : '🩺 Under Treatment'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="alert-box alert-green mb16" style={{ borderRadius: 14, fontSize: 11 }}>
                <span>💉</span>
                <div>Standard core vaccination schedules (FMD, Blackleg, HS/PPR) will be scheduled automatically for this animal.</div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  className="btn btn-full btn-pill"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    padding: '12px 20px',
                    boxShadow: '0 4px 14px rgba(15,23,42,0.25)'
                  }}
                >
                  {submitting ? 'Registering…' : '🌿 Register Animal'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div></div>
  );
}

/* ─── Animal Profile with Detailed Health History & Vaccinations ────────────── */
export function AnimalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setL] = useState(true);
  const [tab, setTab] = useState('health'); // 'health' | 'vaccines'
  const [actionLoading, setActionLoading] = useState(false);

  const loadAnimal = () => {
    livestockApi.getOne(id)
      .then(res => {
        // Backend returns flat object — wrap it so component can use data.animal pattern
        if (res && res.id) {
          setData({ animal: res, vaccinations: res.vaccinations || [], recent_assessments: res.health_history || [] });
        } else {
          setData(res);
        }
      })
      .catch(() => {})
      .finally(() => setL(false));
  };

  useEffect(() => { loadAnimal(); }, [id]);

  const handleMarkDone = async (vacId) => {
    setActionLoading(true);
    try {
      await livestockApi.markVaccineDone(vacId);
      loadAnimal();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const a = data?.animal;
  const vaccs = data?.vaccinations || [];
  const assessments = data?.recent_assessments || [];
  const hb = HEALTH_BADGE[a?.health_status] || HEALTH_BADGE.Healthy;

  return (
    <div className="app-shell"><div className="phone flex fdc" style={{ background: '#f8fafc' }}>
      {/* Top Header — Warm Pastoral & Veterinary Slate Theme */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
        color: '#fff',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
        boxShadow: '0 4px 16px rgba(15,23,42,0.25)'
      }}>
        <button
          className="back-btn"
          onClick={() => navigate('/livestock')}
          style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20.5, fontWeight: 700, letterSpacing: '-0.3px' }}>{a?.name || 'Animal Profile'}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
            {a ? `${a.breed} • ${a.species} (${a.tag || 'Tag'})` : 'Clinical Veterinary Profile'}
          </div>
        </div>
        <button
          onClick={() => navigate('/livestock/assess', { state: { animalId: id, species: a?.species } })}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            border: 'none',
            color: '#fff',
            padding: '7px 12px',
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(217,119,6,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span>🔬</span> Check
        </button>
      </div>

      <div className="scroll-area p20">
        {loading && <div style={{ textAlign: 'center', padding: 24 }}><div className="spinner" style={{ margin: 'auto' }} /></div>}

        {a && (
          <>
            {/* Animal Hero Card — Warm Slate & Golden Amber */}
            <div className="card mb16" style={{
              borderRadius: 22,
              padding: '20px 22px',
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(15,23,42,0.22)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{
                position: 'absolute',
                right: 10,
                top: -8,
                fontSize: 110,
                opacity: 0.08,
                pointerEvents: 'none',
                lineHeight: 1,
                userSelect: 'none'
              }}>
                {SP_ICON[a.species] || '🐄'}
              </div>

              <div className="flex fai g14" style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  flexShrink: 0
                }}>
                  {SP_ICON[a.species] || '🐄'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex fai fjb">
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{a.name}</div>
                    <span style={{
                      background: a.health_status === 'Healthy' ? '#dcfce7' : '#fee2e2',
                      color: a.health_status === 'Healthy' ? '#15803d' : '#dc2626',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 99
                    }}>
                      {hb.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#f59e0b', marginTop: 2, fontWeight: 500 }}>
                    {a.breed} • {a.species}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: 400 }}>
                    🏷️ Tag: {a.tag} • ⏳ {a.age_years} yrs • ⚖️ {a.weight_kg} kg
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Health Check CTA — Warm Amber Gradient */}
            <button
              type="button"
              className="btn btn-full btn-pill mb16"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                fontSize: 13,
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(217,119,6,0.25)'
              }}
              onClick={() => navigate('/livestock/assess', { state: { animalId: id, species: a.species } })}
            >
              🔬 Run New ML Health Assessment
            </button>

            {/* Tabs: Health History vs Vaccinations */}
            <div className="tabs mb16">
              <button className={`tab ${tab === 'health' ? 'active' : ''}`} onClick={() => setTab('health')}>
                📋 Health History ({assessments.length})
              </button>
              <button className={`tab ${tab === 'vaccines' ? 'active' : ''}`} onClick={() => setTab('vaccines')}>
                💉 Vaccinations ({vaccs.length})
              </button>
            </div>

            {/* ── Tab 1: Detailed Health History ── */}
            {tab === 'health' && (
              <div>
                <div className="section-label">PAST CLINICAL ASSESSMENTS & RESULTS</div>
                {assessments.length === 0 ? (
                  <div className="card text-center p20" style={{ borderRadius: 20 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🩺</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>No health assessments recorded yet</div>
                    <div className="text-sm text-muted mt4">Run an AI health check to screen for FMD, Anthrax, Blackleg, Lumpy Virus, etc.</div>
                    <button
                      className="btn btn-secondary btn-pill mt12"
                      onClick={() => navigate('/livestock/assess', { state: { animalId: id, species: a.species } })}
                    >
                      Start Check
                    </button>
                  </div>
                ) : (
                  assessments.map((h, i) => {
                    const isHealthyCheck = (h.disease || '').toLowerCase().includes('healthy') || h.risk_level === 'Low';
                    const riskVal = h.risk_level || h.risk || (isHealthyCheck ? 'Low' : 'High');
                    const confVal = h.confidence ? Math.round(h.confidence * 100) : 92;
                    const dateLabel = h.assessed_at ? (typeof h.assessed_at === 'string' ? h.assessed_at.slice(0, 10) : 'Recent') : (h.date || 'Recent');
                    
                    const handleOpenResult = () => {
                      const resObj = h.raw_result || {
                        disease: h.disease || 'Clinical Assessment & Vital Check',
                        confidence: h.confidence || 0.92,
                        risk_level: riskVal,
                        matched_symptoms: h.symptoms || [],
                        temperature_f: h.temperature_f || 101.5,
                        probabilities: { [h.disease || 'Clinical Assessment']: confVal },
                        advisory: {
                          immediate_action: [
                            'Follow standard veterinary protocol and clinical observation',
                            'Administer prescribed supportive therapy and maintain clean hydration',
                            'Ensure proper barn ventilation, dry bedding, and sanitary conditions'
                          ],
                          treatment_plan: 'Veterinary observation and supportive care',
                          monitoring_period: '48 to 72 hours'
                        }
                      };
                      navigate('/livestock/result', { state: { result: resObj, animal: a } });
                    };

                    return (
                      <div
                        key={h.id || i}
                        className="card mb12"
                        style={{ borderRadius: 20, padding: '16px 18px', border: '1.5px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}
                        onClick={handleOpenResult}
                      >
                        <div className="flex fai fjb">
                          <div className="flex fai g10">
                            <span style={{ fontSize: 22 }}>🩺</span>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--char-800)' }}>
                                {h.disease || 'Health Assessment'}
                              </div>
                              <div className="text-xs text-muted mt2">Checked on {dateLabel}</div>
                            </div>
                          </div>
                          <span className={`badge ${riskVal === 'High' ? 'badge-red' : riskVal === 'Moderate' ? 'badge-amber' : 'badge-green'}`} style={{ borderRadius: 99 }}>
                            {riskVal} Risk
                          </span>
                        </div>

                        {/* Symptoms reported */}
                        {h.symptoms && h.symptoms.length > 0 && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                            {h.symptoms.map(s => (
                              <span key={s} className="badge badge-amber" style={{ fontSize: 10, borderRadius: 99 }}>{s}</span>
                            ))}
                          </div>
                        )}

                        <div className="flex fai fjb mt10 pt8" style={{ borderTop: '1px solid var(--char-100)' }}>
                          <div style={{ fontSize: 12, color: 'var(--green-700)', fontWeight: 700 }}>
                            AI Confidence: {confVal}%
                          </div>
                          <span style={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>View Full Result ›</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── Tab 2: Vaccinations & Mark as Done ── */}
            {tab === 'vaccines' && (
              <div>
                <div className="section-label">VACCINE PROTOCOL & STATUS</div>
                {vaccs.map(v => {
                  const isDone = v.status === 'Done';
                  return (
                    <div key={v.id} className="card mb10" style={{ borderRadius: 18, padding: '14px 16px' }}>
                      <div className="flex fai fjb">
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--char-800)' }}>{v.vaccine_name}</div>
                          <div className="text-sm text-muted mt2">
                            {isDone ? `Given on: ${v.given_on}` : `Next due: ${v.next_due || 'Pending'}`}
                          </div>
                        </div>
                        <span className={`badge ${isDone ? 'badge-green' : 'badge-amber'}`}>
                          {isDone ? '✓ Completed' : 'Pending'}
                        </span>
                      </div>

                      {!isDone && (
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm btn-pill"
                            disabled={actionLoading}
                            onClick={() => handleMarkDone(v.id)}
                            style={{ background: 'var(--green-50)', color: 'var(--green-800)', borderColor: 'var(--green-300)' }}
                          >
                            ✓ Mark as Executed / Done
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        <div style={{ height: 16 }} />
      </div>
      <BottomNav />
    </div></div>
  );
}

/* ─── ML Health Assessment with Exact 24 Symptoms ─────────────────────────── */
export function HealthAssessment() {
  const navigate = useNavigate();
  const location = useLocation();
  const initState = location.state || {};

  const [animals, setAnimals]  = useState([]);
  const [animalId, setAnimalId] = useState(initState.animalId || '');
  const [showAnimalPicker, setShowAnimalPicker] = useState(false);
  const [species, setSpecies]  = useState(initState.species || 'Cow');
  const [age,     setAge]      = useState('3.0');
  const [temp,    setTemp]     = useState('103.5');
  const [syms,    setSyms]     = useState([]);
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);
  const [loading, setL]        = useState(false);
  const [error,   setE]        = useState('');

  useEffect(() => {
    livestockApi.getAll().then(d => {
      const list = d.animals || [];
      setAnimals(list);
      if (!animalId && list.length > 0) {
        setAnimalId(list[0].id);
        setSpecies(list[0].species);
        setAge(String(list[0].age_years || '3.0'));
      }
    }).catch(() => {});
  }, []);

  const toggleSym = (s) => setSyms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const selAnimal = animals.find(a => a.id === animalId);
  useEffect(() => {
    if (selAnimal) {
      setSpecies(selAnimal.species);
      setAge(String(selAnimal.age_years || '3.0'));
    }
  }, [selAnimal]);

  const analyze = async () => {
    if (!animalId) { setE('Please select an animal.'); return; }
    if (!temp) { setE('Please enter current body temperature.'); return; }
    setL(true); setE('');
    try {
      const result = await livestockApi.assess({
        animal_id: animalId,
        age_years: parseFloat(age) || 2.5,
        temperature_f: parseFloat(temp) || 101.8,
        symptoms: syms,
      });
      navigate('/livestock/result', { state: { result, animal: selAnimal || { name: 'Animal', species } } });
    } catch (e) {
      setE(e.message || 'Health check failed');
    } finally {
      setL(false);
    }
  };

  const markHealthy = () => {
    setSyms([]);
    const defaultNormalTemp = species === 'Cow' || species === 'Buffalo' ? '101.8' : '102.5';
    setTemp(defaultNormalTemp);
  };

  return (
    <div className="app-shell"><div className="phone flex fdc" style={{ background: '#f8fafc' }}>
      
      {/* Top Header — Warm Pastoral & Veterinary Slate Theme */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
        color: '#fff',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
        boxShadow: '0 4px 16px rgba(15,23,42,0.25)'
      }}>
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20.5, fontWeight: 700, letterSpacing: '-0.3px' }}>Livestock Health Check</div>
        </div>
      </div>

      <div className="scroll-area p20">
        
        {/* Animal Select Card */}
        <div className="card mb14" style={{ borderRadius: 20, padding: '16px 18px', background: '#fff', position: 'relative', zIndex: 30 }}>
          <div className="form-group" style={{ margin: 0, position: 'relative' }}>
            <label className="form-label bold text-xs">Select Herd Animal *</label>
            <button
              type="button"
              onClick={() => setShowAnimalPicker(s => !s)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 14,
                background: '#f8fafc',
                color: 'var(--char-800)',
                border: '1px solid #cbd5e1',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <span style={{ fontSize: 18 }}>{SP_ICON[selAnimal?.species] || '🐾'}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selAnimal ? selAnimal.name : 'Choose Animal'}</span>
                {selAnimal && (
                  <span style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                    ({selAnimal.species} · {selAnimal.tag})
                  </span>
                )}
              </div>
              <span style={{ fontSize: 10, color: '#64748b', transform: showAnimalPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </button>

            {/* Custom Popover Dropdown Menu */}
            {showAnimalPicker && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowAnimalPicker(false)} />
                <div style={{
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
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 10px 4px', letterSpacing: 0.5 }}>
                    SELECT ANIMAL FROM HERD
                  </div>
                  {animals.map(a => {
                    const isSelected = a.id === animalId;
                    return (
                      <div
                        key={a.id}
                        onClick={() => {
                          setAnimalId(a.id);
                          setShowAnimalPicker(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 12,
                          cursor: 'pointer',
                          background: isSelected ? '#fef3c7' : 'transparent',
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
                            background: isSelected ? '#fde68a' : '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            flexShrink: 0
                          }}>
                            {SP_ICON[a.species] || '🐾'}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: isSelected ? '#92400e' : '#0f172a' }}>
                              {a.name}
                            </div>
                            <div style={{ fontSize: 11, color: isSelected ? '#b45309' : '#64748b', marginTop: 1, fontWeight: 500 }}>
                              {a.species} · {a.breed} · {a.tag}
                            </div>
                          </div>
                        </div>
                        {isSelected && <span style={{ color: '#d97706', fontWeight: 800 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="flex g12 mt12">
            <div className="form-group f1" style={{ margin: 0 }}>
              <label className="form-label bold text-xs">Age (Years)</label>
              <input
                className="form-input"
                type="number"
                step="0.5"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="e.g. 3.5"
              />
            </div>
            <div className="form-group f1" style={{ margin: 0 }}>
              <label className="form-label bold text-xs">Body Temp (°F) *</label>
              <input
                className="form-input"
                type="number"
                step="0.1"
                value={temp}
                onChange={e => setTemp(e.target.value)}
                placeholder="e.g. 101.8"
              />
            </div>
          </div>
        </div>

        {/* Quick Clear / Healthy Option Banner */}
        <div
          onClick={markHealthy}
          className="card mb14"
          style={{
            borderRadius: 18,
            padding: '12px 16px',
            background: syms.length === 0 ? '#f0fdf4' : '#fff',
            border: syms.length === 0 ? '2px solid #86efac' : '1px solid rgba(0,0,0,0.06)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: syms.length === 0 ? '0 4px 14px rgba(34,197,94,0.15)' : 'none',
            transition: 'all 0.18s ease'
          }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: syms.length === 0 ? '#22c55e' : '#f1f5f9',
            color: syms.length === 0 ? '#fff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 800,
            flexShrink: 0
          }}>
            {syms.length === 0 ? '✓' : '🛡️'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: syms.length === 0 ? '#15803d' : 'var(--char-800)' }}>
              No Symptoms — Animal Looks Healthy
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
              {syms.length === 0 ? 'Selected: Animal will be evaluated as 100% Healthy' : 'Tap here to clear all symptoms and record healthy vitals'}
            </div>
          </div>
        </div>

        {/* Primary Clinical Signs */}
        <div className="flex fai fjb mb8">
          <div className="section-label" style={{ marginBottom: 0 }}>OBSERVED CLINICAL SYMPTOMS ({syms.length})</div>
          {syms.length > 0 && (
            <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, cursor: 'pointer' }} onClick={() => setSyms([])}>
              Clear All
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { id: 'blisters on mouth', icon: '👄', title: 'Mouth Blisters', sub: 'Blisters / sores on tongue or mouth' },
            { id: 'sores on hooves', icon: '🦵', title: 'Hoof Sores', sub: 'Foot lesions & difficulty walking' },
            { id: 'swelling in abdomen', icon: '🩸', title: 'Abdomen Swelling', sub: 'Sudden swelling & chills' },
            { id: 'crackling sound', icon: '⚡', title: 'Crackling Muscle', sub: 'Crackling sound in swollen limbs' },
            { id: 'painless lumps', icon: '🔘', title: 'Painless Lumps', sub: 'Skin nodules & lumps' },
            { id: 'shortness of breath', icon: '🫁', title: 'Breath Distress', sub: 'Chest discomfort & rapid breath' },
          ].map(item => {
            const sel = syms.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSym(item.id)}
                style={{
                  padding: '14px 12px',
                  borderRadius: 18,
                  cursor: 'pointer',
                  border: sel ? '2px solid var(--green-800)' : '1px solid rgba(0,0,0,0.06)',
                  background: sel ? '#f0fdf4' : '#fff',
                  boxShadow: sel ? '0 4px 12px rgba(2,48,8,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.18s ease',
                }}
              >
                <div className="flex fai fjb mb6">
                  <span style={{ fontSize: 26 }}>{item.icon}</span>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: sel ? 'none' : '2px solid var(--char-300)',
                    background: sel ? 'var(--green-800)' : 'transparent',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                  }}>
                    {sel ? '✓' : ''}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: sel ? 'var(--green-900)' : 'var(--char-800)' }}>
                  {item.title}
                </div>
                <div className="text-xs text-muted mt2" style={{ lineHeight: 1.25 }}>
                  {item.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Expandable Additional Secondary Symptoms */}
        <div style={{ marginBottom: 14 }}>
          <button
            type="button"
            className="btn btn-outline btn-full btn-sm btn-pill"
            onClick={() => setShowAllSymptoms(!showAllSymptoms)}
            style={{ fontSize: 12 }}
          >
            {showAllSymptoms ? '▲ Hide Secondary Symptoms' : '▼ ＋ More Symptoms (Loss of appetite, Fatigue, etc.)'}
          </button>
        </div>

        {showAllSymptoms && (
          <div className="card mb14" style={{ borderRadius: 20, padding: '14px 16px', background: '#fff' }}>
            <div className="section-label mb8">ADDITIONAL CLINICAL SYMPTOMS</div>
            <div className="symptom-grid">
              {[
                'loss of appetite', 'fatigue', 'depression', 'sweats', 'chills',
                'difficulty walking', 'lameness', 'swelling in limb', 'swelling in extremities',
                'swelling in muscle', 'swelling in neck', 'sores on mouth', 'sores on tongue',
                'sores on gums', 'blisters on tongue', 'blisters on gums', 'blisters on hooves',
                'chest discomfort'
              ].map(s => {
                const sel = syms.includes(s);
                return (
                  <div
                    key={s}
                    className={`symptom-chip ${sel ? 'selected' : ''}`}
                    onClick={() => toggleSym(s)}
                  >
                    <div className="symptom-check">{sel ? '✓' : ''}</div>
                    <span style={{ fontSize: 11, textTransform: 'capitalize', fontWeight: sel ? 700 : 500 }}>
                      {s}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="alert-box alert-red mb10" style={{ borderRadius: 16 }}>
            <span>⚠️</span>
            <div className="text-sm">{error}</div>
          </div>
        )}

        <button
          className="btn btn-primary btn-full btn-pill mt10"
          onClick={analyze}
          disabled={loading}
          style={{ padding: '14px 20px', fontSize: 15, fontWeight: 800 }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }} />
              <span>Processing Health Assessment…</span>
            </>
          ) : syms.length === 0 ? (
            <span>🌿 Certify Animal as Healthy & Save</span>
          ) : (
            <span>🔬 Run AI Disease Diagnosis ({syms.length} Symptoms)</span>
          )}
        </button>
        <div style={{ height: 16 }} />
      </div>
    </div></div>
  );
}

/* ─── ML Result ────────────────────────────────────────────────────────────── */
export function LivestockResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result || {
    disease: 'Healthy & Optimal Vital Signs',
    confidence: 0.99,
    risk_level: 'Low',
    matched_symptoms: [],
    advisory: {
      immediate_action: [
        'Animal exhibits standard physiological vital signs',
        'Maintain clean dry barn bedding and fresh drinking water',
        'Adhere to scheduled herd vaccination timeline'
      ]
    }
  };
  const animal = location.state?.animal || { name: 'Herd Animal', species: 'Cow', tag: 'HERD' };

  const isHealthy = result.risk_level === 'Low' || (result.disease && result.disease.toLowerCase().includes('healthy'));
  const conf = Math.round((result.confidence || 0.99) * 100);
  const riskColor = { High: 'var(--red)', Moderate: 'var(--amber-dark)', Medium: 'var(--amber-dark)', Low: 'var(--green-600)' };
  const risk = result.risk_level || (isHealthy ? 'Low' : 'High');

  const circ = 2 * Math.PI * 34;
  const offset = circ - (circ * conf / 100);

  return (
    <div className="app-shell"><div className="phone flex fdc" style={{ background: '#f8fafc' }}>
      <div style={{
        background: isHealthy ? 'linear-gradient(160deg, #023008 0%, #15803d 100%)' : 'linear-gradient(160deg, #7f1d1d 0%, #991b1b 100%)',
        padding: '24px 20px 30px',
        color: '#fff',
        flexShrink: 0,
        position: 'relative',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }}>
        <button
          className="back-btn"
          onClick={() => navigate('/livestock')}
          style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
        >
          ←
        </button>
        
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <div style={{ fontSize: 48 }}>{isHealthy ? '🛡️' : '⚠️'}</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
            {result.disease || (isHealthy ? 'Healthy & Optimal Vital Signs' : 'Pathology Assessment')}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
            {animal.name} ({animal.species}) · Tag: {animal.tag || 'Herd Animal'}
          </div>
          <div style={{ marginTop: 10 }}>
            <span style={{
              background: isHealthy ? 'rgba(74,222,128,0.25)' : 'rgba(254,202,202,0.25)',
              border: `1px solid ${isHealthy ? 'rgba(74,222,128,0.5)' : 'rgba(254,202,202,0.5)'}`,
              padding: '5px 14px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 800
            }}>
              {isHealthy ? '🟢 Optimal Vitals (Low Risk)' : `🔴 ${risk} Severity Risk`} · {conf}% AI Confidence
            </span>
          </div>
        </div>
      </div>

      <div className="scroll-area p20">
        {/* Diagnosis + Confidence Ring */}
        <div className="card mb16 flex fai fjb" style={{ borderRadius: 22, padding: '18px 20px', background: '#fff' }}>
          <div style={{ flex: 1, paddingRight: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--char-800)' }}>
              {result.disease || 'Health Assessment'}
            </div>
            <div className="text-sm text-muted mt2">
              {isHealthy ? 'Standard Clinical Baseline' : 'Primary Diagnostic Match'}
            </div>
            <div style={{ marginTop: 8 }}>
              <span className={`badge ${isHealthy ? 'badge-green' : (risk === 'High' ? 'badge-red' : 'badge-amber')}`} style={{ borderRadius: 99, fontSize: 11, fontWeight: 800, padding: '3px 10px' }}>
                {isHealthy ? '✓ Healthy Condition' : `⚠️ ${risk} Clinical Risk`}
              </span>
            </div>
          </div>
          <div className="conf-ring">
            <svg width="84" height="84" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--char-100)" strokeWidth="7" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke={isHealthy ? '#16a34a' : (riskColor[risk] || 'var(--red)')}
                strokeWidth="7"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
            <div className="conf-ring-val" style={{ color: isHealthy ? '#16a34a' : (riskColor[risk] || 'var(--red)') }}>
              {conf}%
              <div className="conf-ring-lbl">Confidence</div>
            </div>
          </div>
        </div>

        {/* Symptoms submitted */}
        {(result.matched_symptoms || []).length > 0 && (
          <>
            <div className="section-label">OBSERVED SYMPTOMS CONFIRMED</div>
            <div className="card mb14" style={{ padding: '12px 14px', display: 'flex', flexWrap: 'wrap', gap: 8, borderRadius: 18 }}>
              {result.matched_symptoms.map(s => (
                <span key={s} className="badge badge-amber" style={{ borderRadius: 99, padding: '5px 12px' }}>{s}</span>
              ))}
            </div>
          </>
        )}

        {/* ML Model Softmax Probability Distribution */}
        {result.probabilities && Object.keys(result.probabilities).length > 0 && (
          <>
            <div className="section-label">ML NEURAL PROBABILITY BREAKDOWN</div>
            <div className="card mb14" style={{ padding: '14px 16px', borderRadius: 18 }}>
              {Object.entries(result.probabilities).map(([dis, prob]) => (
                <div key={dis} style={{ marginBottom: 10 }}>
                  <div className="flex fai fjb mb4">
                    <span style={{ fontSize: 13, fontWeight: 700, color: dis === result.disease ? 'var(--green-800)' : 'var(--char-700)' }}>
                      {dis === result.disease ? '🎯 ' : '• '}{dis}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: dis === result.disease ? 'var(--green-800)' : 'var(--char-500)' }}>
                      {prob}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${prob}%`,
                        background: dis === result.disease
                          ? 'linear-gradient(90deg, var(--green-600), var(--green-400))'
                          : 'var(--char-300)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Immediate First Aid Actions */}
        {result.advisory?.immediate_action?.length > 0 && (
          <>
            <div className="section-label">RECOMMENDED FIRST AID & ISOLATION ACTIONS</div>
            <div className="card mb14" style={{ padding: '14px 16px', borderRadius: 18 }}>
              {result.advisory.immediate_action.map((a, i) => (
                <div key={i} className="flex g10 mt4" style={{ padding: '6px 0', borderBottom: i < result.advisory.immediate_action.length - 1 ? '1px solid var(--char-100)' : 'none' }}>
                  <span style={{ fontSize: 16 }}>{i + 1}️⃣</span>
                  <span className="text-sm" style={{ lineHeight: 1.4, fontWeight: 500 }}>{a}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Clinical Treatment Protocol */}
        {result.advisory?.treatment && (
          <>
            <div className="section-label">CLINICAL TREATMENT & DRUG PROTOCOL</div>
            <div className="card mb14" style={{ padding: '14px 16px', borderRadius: 18, background: '#f8fafc', border: '1px solid #cbd5e1' }}>
              <div className="text-sm" style={{ lineHeight: 1.5, color: '#0f172a', fontWeight: 500 }}>
                {result.advisory.treatment}
              </div>
            </div>
          </>
        )}

        {/* Prevention & Biosecurity */}
        {result.advisory?.prevention && (
          <>
            <div className="section-label">PREVENTION & HERD BIOSECURITY</div>
            <div className="card mb14" style={{ padding: '14px 16px', borderRadius: 18 }}>
              <div className="text-sm" style={{ lineHeight: 1.5 }}>
                {Array.isArray(result.advisory.prevention) ? result.advisory.prevention.map((p, i) => (
                  <div key={i} style={{ padding: '4px 0' }}>• {p}</div>
                )) : result.advisory.prevention}
              </div>
            </div>
          </>
        )}

        {/* Recommended Prophylactic Vaccine */}
        {result.advisory?.vaccine_name && (
          <div className="card mb14" style={{ borderRadius: 18, border: '1.5px solid #86efac', background: '#f0fdf4', padding: '14px 16px' }}>
            <div className="section-label" style={{ color: '#166534' }}>RECOMMENDED PROPHYLACTIC VACCINE</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#15803d', marginTop: 4 }}>
              💉 {result.advisory.vaccine_name}
            </div>
          </div>
        )}

        {/* Auto-Scheduled Vaccination Banner */}
        {result.auto_vaccination_scheduled && result.vaccination_name && (
          <div style={{
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            border: '2px solid #86efac',
            borderRadius: 18,
            padding: '14px 16px',
            marginBottom: 14,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: 24 }}>💉</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#14532d', marginBottom: 3 }}>
                VACCINATION AUTO-SCHEDULED
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
                {result.vaccination_name}
              </div>
              <div style={{ fontSize: 12, color: '#15803d', marginTop: 3, fontWeight: 500 }}>
                📅 Due by: <strong>{result.vaccination_due_date}</strong> (within 7 days)
              </div>
              <div style={{ fontSize: 11, color: '#166534', marginTop: 2, opacity: 0.8 }}>
                Added to your Vaccination Schedule — check the Livestock tab to confirm.
              </div>
            </div>
          </div>
        )}

        <div className="alert-box alert-red mb14" style={{ borderRadius: 18 }}>
          <span>⚠️</span>
          <div className="text-xs">This is an AI-assisted clinical aid. Always consult a certified veterinarian before administering pharmaceuticals.</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary btn-pill" style={{ flex: 1 }} onClick={() => navigate('/livestock/advisory', { state: { disease: result.disease_key || result.disease, animal } })}>
            📋 Full Clinical Guide
          </button>
          <button className="btn btn-secondary btn-pill" style={{ flex: 1 }} onClick={() => navigate('/livestock/assess', { state: { animalId: animal.id, species: animal.species } })}>
            🔄 New Check
          </button>
        </div>
        <div style={{ height: 16 }} />
      </div>
    </div></div>
  );
}

/* ─── Veterinary Advisory ─────────────────────────────────────────────────── */
export function LivestockAdvisory() {
  const navigate = useNavigate();
  const location = useLocation();
  const disease = location.state?.disease || 'Foot & Mouth Disease';
  const animal = location.state?.animal || {};
  const [adv, setAdv] = useState(null);
  const [loading, setL] = useState(true);

  useEffect(() => {
    livestockApi.getAdvisory(animal.id || 'an1', disease)
      .then(setAdv)
      .catch(() => setAdv(null))
      .finally(() => setL(false));
  }, [disease]);

  return (
    <div className="app-shell"><div className="phone flex fdc">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="topbar-title">Clinical Advisory</div>
      </div>
      <div className="scroll-area p20">
        <div className="flex fai g12 mb16">
          <div style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
            🩺
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--char-800)' }}>{disease}</div>
            <div className="text-sm text-muted">{animal.species || 'Cattle / Small Ruminants'} Advisory</div>
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 24 }}><div className="spinner" style={{ margin: 'auto' }} /></div>}

        {!loading && adv && (
          <>
            {adv.advisory && (
              <div className="card mb14" style={{ borderRadius: 18 }}>
                <div className="section-label">CLINICAL TREATMENT & PROTOCOL</div>
                <div className="text-sm mt4" style={{ lineHeight: 1.5 }}>{adv.advisory}</div>
              </div>
            )}

            {adv.prevention && (
              <div className="card mb14" style={{ borderRadius: 18 }}>
                <div className="section-label">PREVENTION & BIOSECURITY</div>
                <div className="text-sm mt4" style={{ lineHeight: 1.5 }}>{Array.isArray(adv.prevention) ? adv.prevention.join(' • ') : adv.prevention}</div>
              </div>
            )}

            {adv.vaccination_required && (
              <div className="card mb14" style={{ borderRadius: 18, border: '1.5px solid var(--green-300)', background: 'var(--green-50)' }}>
                <div className="section-label" style={{ color: 'var(--green-800)' }}>RECOMMENDED VACCINE</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--green-800)' }}>💉 {adv.vaccination_required}</div>
              </div>
            )}
          </>
        )}

        <button className="btn btn-secondary btn-full btn-pill" onClick={() => navigate('/livestock')}>
          ← Back to Livestock Herd
        </button>
        <div style={{ height: 16 }} />
      </div>
    </div></div>
  );
}

/* ─── Vaccination Tracker with Herd Immunity & Filter Tabs ────────────────── */
export function VaccinationTracker() {
  const navigate = useNavigate();
  const [vaccs, setVaccs] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setL] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'done'
  const [showAddForm, setShowAddForm] = useState(false);
  const [boosterToast, setBoosterToast] = useState(null);
  const [form, setForm] = useState({
    animal_id: '', vaccine_name: '', next_due: '', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const loadVaccs = () => {
    setL(true);
    livestockApi.getVaccinations().then(setVaccs).catch(() => {}).finally(() => setL(false));
  };

  useEffect(() => {
    loadVaccs();
    livestockApi.getAll().then(d => setAnimals(Array.isArray(d) ? d : (d.animals || []))).catch(() => {});
  }, []);

  const handleMarkDone = async (vacId) => {
    setActionLoading(true);
    try {
      const res = await livestockApi.markVaccineDone(vacId);
      // Show booster confirmation toast
      if (res?.booster_scheduled) {
        setBoosterToast(res.booster_scheduled);
        setTimeout(() => setBoosterToast(null), 5000);
      }
      loadVaccs();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddVaccination = async (e) => {
    e.preventDefault();
    if (!form.animal_id || !form.vaccine_name || !form.next_due) {
      alert('Please fill Animal, Vaccine Name, and Due Date.');
      return;
    }
    setSubmitting(true);
    try {
      await livestockApi.addVaccination(form.animal_id, {
        vaccine_name: form.vaccine_name,
        next_due: form.next_due,
        status: 'Scheduled',
        notes: form.notes || null,
      });
      setForm({ animal_id: '', vaccine_name: '', next_due: '', notes: '' });
      setShowAddForm(false);
      loadVaccs();
    } catch (err) {
      alert('Failed to schedule: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const overdue = vaccs.filter(v => v.status === 'Overdue');
  const due = vaccs.filter(v => v.status === 'Due');
  const upcoming = vaccs.filter(v => v.status === 'Scheduled' || v.status === 'Pending');
  const done = vaccs.filter(v => v.status === 'Done');

  const pendingCount = overdue.length + due.length + upcoming.length;
  const doneCount = done.length;
  const totalCount = vaccs.length;
  const coveragePct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 100;

  const filteredVaccs = vaccs.filter(v => {
    if (filterTab === 'pending') return v.status !== 'Done';
    if (filterTab === 'done') return v.status === 'Done';
    return true;
  });

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#f8fafc' }}>
        
        {/* Top Header — Warm Pastoral & Veterinary Slate Theme */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
          color: '#fff',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
          boxShadow: '0 4px 16px rgba(15,23,42,0.25)'
        }}>
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20.5, fontWeight: 700, letterSpacing: '-0.3px' }}>Vaccination Tracker</div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.28)',
              borderRadius: 10,
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              padding: '7px 13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0
            }}
          >
            + Schedule
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="scroll-area p20">

          {/* Booster Confirmation Toast */}
          {boosterToast && (
            <div style={{
              position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
              background: '#0f172a', color: '#fff', borderRadius: 14, padding: '12px 18px',
              zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)', fontSize: 13, fontWeight: 600,
              maxWidth: 320, width: '90%'
            }}>
              <span style={{ fontSize: 20 }}>💉</span>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 2 }}>Annual Booster Scheduled!</div>
                <div style={{ opacity: 0.8, fontSize: 12 }}>
                  {boosterToast.vaccine_name} — due {boosterToast.next_due}
                </div>
              </div>
            </div>
          )}

          {/* ── Manual Schedule Vaccination Modal ── */}
          {showAddForm && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
              zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
            }} onClick={() => setShowAddForm(false)}>
              <div style={{
                background: '#fff', borderRadius: '24px 24px 0 0',
                padding: '24px 20px 32px', width: '100%', maxWidth: 420,
                boxShadow: '0 -8px 32px rgba(0,0,0,0.18)'
              }} onClick={e => e.stopPropagation()}>

                {/* Modal Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>💉 Schedule Vaccination</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Manually add a vaccine for any animal</div>
                  </div>
                  <button onClick={() => setShowAddForm(false)}
                    style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}
                  >✕</button>
                </div>

                <form onSubmit={handleAddVaccination}>

                  {/* Animal Picker */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                      SELECT ANIMAL *
                    </label>
                    <select
                      value={form.animal_id}
                      onChange={e => setForm(f => ({ ...f, animal_id: e.target.value }))}
                      required
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 12,
                        border: '1.5px solid #e2e8f0', fontSize: 14, background: '#f8fafc',
                        color: '#0f172a', fontWeight: 500
                      }}
                    >
                      <option value="">— Choose animal —</option>
                      {animals.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.species}) · {a.tag}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vaccine Name */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                      VACCINE NAME *
                    </label>
                    <input
                      list="vaccine-suggestions"
                      value={form.vaccine_name}
                      onChange={e => setForm(f => ({ ...f, vaccine_name: e.target.value }))}
                      placeholder="e.g. FMD Vaccine, Anthrax Spore Vaccine…"
                      required
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 12,
                        border: '1.5px solid #e2e8f0', fontSize: 14, background: '#f8fafc',
                        color: '#0f172a', boxSizing: 'border-box'
                      }}
                    />
                    <datalist id="vaccine-suggestions">
                      <option value="Foot & Mouth Disease (FMD) Vaccine" />
                      <option value="Blackleg (BQ) Vaccine" />
                      <option value="Hemorrhagic Septicemia (HS) Vaccine" />
                      <option value="Anthrax Spore Vaccine (Live)" />
                      <option value="Lumpy Skin Disease (Goat Pox) Vaccine" />
                      <option value="PPR (Peste des Petits Ruminants) Vaccine" />
                      <option value="Enterotoxemia (ET) Vaccine" />
                      <option value="Brucellosis (Brucella abortus S19) Vaccine" />
                    </datalist>
                  </div>

                  {/* Due Date */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                      DUE DATE *
                    </label>
                    <input
                      type="date"
                      value={form.next_due}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setForm(f => ({ ...f, next_due: e.target.value }))}
                      required
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 12,
                        border: '1.5px solid #e2e8f0', fontSize: 14, background: '#f8fafc',
                        color: '#0f172a', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Notes (optional) */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                      NOTES (optional)
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="e.g. Pre-monsoon prophylaxis, veterinarian Dr. Sharma…"
                      rows={2}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 12,
                        border: '1.5px solid #e2e8f0', fontSize: 13, background: '#f8fafc',
                        color: '#0f172a', resize: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '13px', borderRadius: 14,
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      color: '#fff', border: 'none', fontSize: 15, fontWeight: 700,
                      cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,23,42,0.25)'
                    }}
                  >
                    {submitting ? 'Scheduling…' : '💉 Schedule Vaccination'}
                  </button>
                </form>
              </div>
            </div>
          )}

          
          {/* Herd Immunity Coverage Hero Card — Warm Slate & Amber */}
          <div className="card mb16" style={{
            borderRadius: 22,
            padding: '22px 24px',
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(15,23,42,0.22)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{
              position: 'absolute',
              right: 12,
              top: -8,
              fontSize: 125,
              opacity: 0.08,
              pointerEvents: 'none',
              lineHeight: 1,
              userSelect: 'none'
            }}>
              💉
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: '#f59e0b' }}>
                HERD IMMUNIZATION STATUS
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, letterSpacing: '-0.4px', lineHeight: 1.2 }}>
                {coveragePct}% Immunized
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4, fontWeight: 400 }}>
                {doneCount} of {totalCount} total protocol vaccines completed
              </div>
            </div>

            {/* Mini Stat Pills */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '8px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>TOTAL</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{totalCount}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '8px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#fde047' }}>PENDING</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{pendingCount}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '8px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#86efac' }}>DONE</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{doneCount}</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.04)',
            borderRadius: 14,
            padding: 4,
            marginBottom: 16,
            gap: 4
          }}>
            {[
              { key: 'all', label: `All (${totalCount})` },
              { key: 'pending', label: `Pending (${pendingCount})` },
              { key: 'done', label: `Done (${doneCount})` }
            ].map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilterTab(t.key)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: filterTab === t.key ? '#0f172a' : 'transparent',
                  color: filterTab === t.key ? '#fff' : 'var(--char-600)',
                  boxShadow: filterTab === t.key ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div className="spinner" style={{ margin: 'auto' }} />
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>Loading immunization records…</div>
            </div>
          ) : (
            <>
              {filteredVaccs.length === 0 ? (
                <div className="card text-center p24" style={{ borderRadius: 20, background: '#fff' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--char-800)' }}>
                    {filterTab === 'pending' ? 'No Pending Vaccinations!' : 'No Records Found'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    {filterTab === 'pending'
                      ? 'All herd animals have completed their required vaccinations.'
                      : 'Add an animal to start tracking immunizations.'}
                  </div>
                </div>
              ) : (
                filteredVaccs.map(v => {
                  const isDone = v.status === 'Done';
                  const spIcon = SP_ICON[v.animal_species] || '🐾';

                  return (
                    <div
                      key={v.id}
                      className="card mb12"
                      style={{
                        borderRadius: 20,
                        padding: '16px 18px',
                        background: '#fff',
                        borderLeft: isDone ? '4px solid #22c55e' : '4px solid #f59e0b',
                        boxShadow: '0 3px 12px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div className="flex fai fjb">
                        <div className="flex fai g12">
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            background: isDone ? '#f0fdf4' : '#fffbeb',
                            border: `1px solid ${isDone ? '#bbf7d0' : '#fde68a'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            flexShrink: 0
                          }}>
                            {spIcon}
                          </div>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--char-800)' }}>
                              {v.vaccine_name}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                              <span className="bold" style={{ color: 'var(--char-700)' }}>{v.animal_name || 'Animal'}</span>
                              <span> ({v.animal_species || 'Livestock'})</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div style={{
                          padding: '6px 12px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 800,
                          background: isDone ? '#dcfce7' : '#fef3c7',
                          color: isDone ? '#15803d' : '#b45309',
                          border: `1px solid ${isDone ? '#86efac' : '#fcd34d'}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <span>{isDone ? '✓' : '⏱️'}</span>
                          <span>{isDone ? 'COMPLETED' : 'PENDING'}</span>
                        </div>
                      </div>

                      {/* Date details row */}
                      <div className="flex fai fjb mt12 pt10" style={{ borderTop: '1px solid #f1f5f9', fontSize: 12 }}>
                        <div style={{ color: isDone ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                          {isDone
                            ? `🗓️ Administered: ${v.given_on || 'Today'}`
                            : `📅 Scheduled: ${v.next_due || 'Immediate'}`}
                        </div>

                        {!isDone && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm btn-pill"
                            disabled={actionLoading}
                            onClick={() => handleMarkDone(v.id)}
                            style={{
                              background: '#f0fdf4',
                              color: '#15803d',
                              borderColor: '#86efac',
                              fontWeight: 800,
                              fontSize: 12,
                              padding: '5px 14px'
                            }}
                          >
                            ✓ Mark as Done
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          <div style={{ height: 20 }} />
        </div>
      </div>
    </div>
  );
}

