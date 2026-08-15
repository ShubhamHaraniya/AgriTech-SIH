/**
 * Home — Farm Command Center (Executive Dashboard)
 * World-Class Agricultural Mobile UX:
 * - Signature Emerald & Jade Gradient Hero
 * - Glassmorphic Live Weather Radar Capsule
 * - High-Impact 2x2 AI Intelligence Deck
 * - Centerpiece Active Field Lifecycle Showcase with Dropdown Switcher
 * - Farm Health Telemetry Overview & Real-Time Activity Feed
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { notifApi, historyApi, livestockApi, farmApi, cropApi } from '../api/client';
import BottomNav from '../components/BottomNav';
import { userStore } from '../utils/userStore';

const WEATHER_ICON = {
  clear: '☀️', sunny: '☀️', cloudy: '⛅', clouds: '⛅',
  rain: '🌧️', drizzle: '🌦️', thunderstorm: '⛈️', snow: '❄️', mist: '🌫️', fog: '🌫️',
};

function wIcon(cond = '') {
  const k = (cond || '').toLowerCase();
  return WEATHER_ICON[Object.keys(WEATHER_ICON).find(x => k.includes(x))] || '🌤️';
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '🌅 Good Morning';
  if (hour < 17) return '☀️ Good Afternoon';
  return '🌙 Good Evening';
}

function getCropIcon(crop = '') {
  const c = (crop || '').toLowerCase();
  if (c.includes('wheat')) return '🌾';
  if (c.includes('tomato')) return '🍅';
  if (c.includes('onion')) return '🧅';
  if (c.includes('rice') || c.includes('paddy')) return '🌾';
  if (c.includes('cotton')) return '🌱';
  if (c.includes('mustard')) return '🌼';
  if (c.includes('potato')) return '🥔';
  if (c.includes('corn') || c.includes('maize')) return '🌽';
  if (c.includes('sugarcane')) return '🎋';
  return '🌱';
}

export default function Home() {
  const navigate = useNavigate();
  const { profile, weather } = useApp() || {};
  const [notifs, setNotifs] = useState([]);
  const [history, setHistory] = useState([]);
  const [animals, setAnimals] = useState(null);
  const [cropsList, setCropsList] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [primaryActivity, setPrimaryActivity] = useState(null);
  const [showFieldPicker, setShowFieldPicker] = useState(false);

  useEffect(() => {
    notifApi.getAll().then(d => setNotifs(Array.isArray(d) ? d : [])).catch(() => {});
    historyApi.getAll().then(d => setHistory(Array.isArray(d) ? d.slice(0, 4) : [])).catch(() => {});
    livestockApi.getAll().then(setAnimals).catch(() => {});
    farmApi.getFields().then(d => {
      const list = Array.isArray(d) ? d : [];
      setCropsList(list);
      if (list.length > 0) {
        setSelectedFieldId(list[0].id);
        cropApi.getActivity(list[0].id).then(setPrimaryActivity).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const urgent = notifs.filter(n => n && n.priority === 'urgent' && !n.is_read);
  const action = notifs.filter(n => n && n.priority === 'action' && !n.is_read);

  const currentActiveUser = userStore.getActiveUser();
  const farmer = currentActiveUser ? {
    name: currentActiveUser.name,
    location: currentActiveUser.location,
    phone: currentActiveUser.phone
  } : profile?.farmer;
  const farm   = profile?.farm;

  const userAnimals = currentActiveUser?.livestock ? currentActiveUser.livestock : (animals?.animals || []);
  const totalAnimals = currentActiveUser?.livestock ? currentActiveUser.livestock.length : (animals?.total || 18);
  const sickAnimals  = userAnimals.filter(a => a.health_status === 'Sick').length;

  const userFields = (currentActiveUser?.fields && currentActiveUser.fields.length > 0) ? currentActiveUser.fields : (cropsList.length > 0 ? cropsList : []);
  const totalAcreage = userFields.reduce((sum, f) => sum + (parseFloat(f.area_acre) || 0), 0);
  const primaryCrop  = (userFields.length > 0 && selectedFieldId
    ? userFields.find(f => f.id === selectedFieldId) || userFields[0]
    : userFields[0]) || { name: 'Main Plot', current_crop: 'Wheat', area_acre: 3.0 };

  const das = primaryActivity?.days_after_sowing ?? (primaryCrop?.sowing_date
    ? Math.max(0, Math.floor((Date.now() - new Date(primaryCrop.sowing_date)) / 86400000))
    : 0);
  const totalCycle = primaryActivity?.total_days || 120;
  const pct = Math.max(0, Math.min(100, Math.round((das / totalCycle) * 100)));
  const currentStage = primaryActivity?.current_stage || primaryActivity?.stage || (das === 0 ? 'Seedling / Sowing Phase' : 'Vegetative Growth Phase');

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#f8fafc' }}>
        
        {/* ── 1. Signature Emerald & Jade Hero Header ── */}
        <div style={{
          background: 'linear-gradient(155deg, #064e3b 0%, #047857 55%, #059669 100%)',
          color: '#fff',
          padding: '22px 20px 24px',
          flexShrink: 0,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          boxShadow: '0 8px 28px rgba(6,78,59,0.25)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 10
        }}>
          {/* Subtle Aesthetic Watermark */}
          <div style={{
            position: 'absolute',
            right: -12,
            top: -24,
            fontSize: 160,
            opacity: 0.07,
            pointerEvents: 'none',
            lineHeight: 1,
            userSelect: 'none'
          }}>
            🌾
          </div>

          {/* Top User Bar */}
          <div className="flex fai fjb mb16" style={{ position: 'relative', zIndex: 2 }}>
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
                fontSize: 26,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                👨‍🌾
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: '#a7f3d0' }}>
                  {getGreeting()} · {farmer?.location ? `📍 ${farmer.location}` : '📍 Jodhpur, Rajasthan'}
                </div>
                <div style={{ fontSize: 20.5, fontWeight: 700, marginTop: 1, letterSpacing: '-0.3px', color: '#fff' }}>
                  {farmer?.name || 'Ramesh Kumar'}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/notifications')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              🔔
              {(urgent.length + action.length) > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 7,
                  right: 7,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: '2px solid #064e3b'
                }} />
              )}
            </button>
          </div>

          {/* Glassmorphic Weather & Micro-Climate Radar Capsule */}
          <div
            onClick={() => navigate('/weather')}
            style={{
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 20,
              padding: '14px 16px',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 2,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex fai fjb mb8">
              <div className="flex fai g10">
                <span style={{ fontSize: 32, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}>
                  {wIcon(weather?.condition || 'sunny')}
                </span>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, color: '#fff' }}>
                    {weather?.temperature_c ?? 28}°C
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginTop: 2 }}>
                    {weather?.condition || 'Sunny & Clear'} · {farm?.name || 'Green Valley Farm'}
                  </div>
                </div>
              </div>

              <span style={{
                background: 'rgba(255,255,255,0.22)',
                border: '1px solid rgba(255,255,255,0.35)',
                color: '#fff',
                padding: '3px 9px',
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}>
                🟢 Live Radar
              </span>
            </div>

            <div style={{
              display: 'flex',
              gap: 6,
              marginTop: 8,
              paddingTop: 8,
              borderTop: '1px solid rgba(255,255,255,0.16)'
            }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.14)', borderRadius: 10, padding: '6px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>HUMIDITY</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginTop: 1 }}>💧 {weather?.humidity_pct ?? 52}%</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.14)', borderRadius: 10, padding: '6px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>RAIN RISK</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginTop: 1 }}>🌧️ {weather?.rain_probability ?? 0}%</div>
              </div>
              <div style={{ flex: 1.2, background: 'rgba(0,0,0,0.14)', borderRadius: 10, padding: '6px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>SPRAYING</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#a7f3d0', marginTop: 1 }}>✅ Optimal</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Scrollable Body Content ── */}
        <div className="scroll-area p20" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* 2. High-Impact 2×2 AI Quick Action Deck */}
          <div>
            <div className="flex fai fjb mb10">
              <div className="section-label" style={{ marginBottom: 0 }}>AI TOOLS & OPERATIONS</div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: 99, border: '1px solid #a7f3d0' }}>
                4 Smart Modules
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              
              {/* Tool 1: AI Disease Scanner */}
              <div
                onClick={() => navigate('/scanner')}
                className="card"
                style={{
                  borderRadius: 20,
                  padding: '16px 14px',
                  background: 'linear-gradient(155deg, #ffffff 0%, #fffaf3 100%)',
                  cursor: 'pointer',
                  border: '1.5px solid #fed7aa',
                  boxShadow: '0 4px 16px rgba(249,115,22,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.18s ease'
                }}
              >
                <div>
                  <div className="flex fai fjb mb10">
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                      border: '1.5px solid #fdba74',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      boxShadow: '0 4px 10px rgba(249,115,22,0.12)'
                    }}>
                      🔬
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#ea580c', background: '#fff7ed', padding: '2px 6px', borderRadius: 6, border: '1px solid #fdba74' }}>
                      Neural AI
                    </span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.2px' }}>Leaf Scanner</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>38+ Plant Pathogens</div>
                </div>
                <div style={{
                  marginTop: 14,
                  padding: '6px 10px',
                  borderRadius: 10,
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#c2410c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>Scan Leaf</span>
                  <span>→</span>
                </div>
              </div>

              {/* Tool 2: AI Crop Advisor */}
              <div
                onClick={() => navigate('/crops/recommend')}
                className="card"
                style={{
                  borderRadius: 20,
                  padding: '16px 14px',
                  background: 'linear-gradient(155deg, #ffffff 0%, #f6fdf9 100%)',
                  cursor: 'pointer',
                  border: '1.5px solid #bbf7d0',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.18s ease'
                }}
              >
                <div>
                  <div className="flex fai fjb mb10">
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                      border: '1.5px solid #86efac',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      boxShadow: '0 4px 10px rgba(16,185,129,0.12)'
                    }}>
                      🌾
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#15803d', background: '#ecfdf5', padding: '2px 6px', borderRadius: 6, border: '1px solid #86efac' }}>
                      Agronomy
                    </span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.2px' }}>Crop Advisor</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>Soil & Season Fit</div>
                </div>
                <div style={{
                  marginTop: 14,
                  padding: '6px 10px',
                  borderRadius: 10,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>Recommend</span>
                  <span>→</span>
                </div>
              </div>

              {/* Tool 3: Digital Livestock Hub */}
              <div
                onClick={() => navigate('/livestock')}
                className="card"
                style={{
                  borderRadius: 20,
                  padding: '16px 14px',
                  background: 'linear-gradient(155deg, #ffffff 0%, #f5fbff 100%)',
                  cursor: 'pointer',
                  border: '1.5px solid #bae6fd',
                  boxShadow: '0 4px 16px rgba(14,165,233,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.18s ease'
                }}
              >
                <div>
                  <div className="flex fai fjb mb10">
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      border: '1.5px solid #7dd3fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      boxShadow: '0 4px 10px rgba(14,165,233,0.12)'
                    }}>
                      🐄
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#0369a1', background: '#f0f9ff', padding: '2px 6px', borderRadius: 6, border: '1px solid #7dd3fc' }}>
                      Clinical
                    </span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.2px' }}>Livestock Hub</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>Herd & Diagnostics</div>
                </div>
                <div style={{
                  marginTop: 14,
                  padding: '6px 10px',
                  borderRadius: 10,
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>Check Herd</span>
                  <span>→</span>
                </div>
              </div>

              {/* Tool 4: Farm Expense Ledger */}
              <div
                onClick={() => navigate('/expenses')}
                className="card"
                style={{
                  borderRadius: 20,
                  padding: '16px 14px',
                  background: 'linear-gradient(155deg, #ffffff 0%, #faf8ff 100%)',
                  cursor: 'pointer',
                  border: '1.5px solid #e9d5ff',
                  boxShadow: '0 4px 16px rgba(168,85,247,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.18s ease'
                }}
              >
                <div>
                  <div className="flex fai fjb mb10">
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                      border: '1.5px solid #d8b4fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      boxShadow: '0 4px 10px rgba(168,85,247,0.12)'
                    }}>
                      💰
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#7e22ce', background: '#faf5ff', padding: '2px 6px', borderRadius: 6, border: '1px solid #d8b4fe' }}>
                      Ledger
                    </span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.2px' }}>Farm Expenses</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>Ledger & Outlay</div>
                </div>
                <div style={{
                  marginTop: 14,
                  padding: '6px 10px',
                  borderRadius: 10,
                  background: '#faf5ff',
                  border: '1px solid #e9d5ff',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#9333ea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>View Ledger</span>
                  <span>→</span>
                </div>
              </div>

            </div>
          </div>

          {/* 3. Centerpiece Active Field & Crop Growth Stage */}
          <div
            onClick={() => navigate('/crops')}
            className="card"
            style={{
              borderRadius: 22,
              padding: '18px 20px',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 6px 22px rgba(6,78,59,0.06)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div className="flex fai fjb mb10">
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#064e3b' }}>
                ACTIVE CROP FIELD
              </div>
              <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '3px 9px' }}>
                ● Active Growth
              </span>
            </div>

            {/* Field Dropdown & Add Button Row */}
            {cropsList.length > 0 && (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, zIndex: 20 }} onClick={e => e.stopPropagation()}>
                <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                  <button
                    type="button"
                    onClick={() => setShowFieldPicker(s => !s)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 12,
                      background: '#f8fafc',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      minWidth: 0
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
                      <span style={{ flexShrink: 0 }}>🌾</span>
                      <span style={{ fontWeight: 700, color: '#064e3b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {primaryCrop?.name || 'Field'}
                      </span>
                      <span style={{ color: '#64748b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ({primaryCrop?.area_acre || 2} Ac)
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
                          background: '#fff',
                          borderRadius: 16,
                          boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                          border: '1px solid #e2e8f0',
                          padding: 6,
                          zIndex: 50,
                          maxHeight: 240,
                          overflowY: 'auto'
                        }}
                      >
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 10px 4px', letterSpacing: 0.5 }}>
                          SWITCH ACTIVE PLOT
                        </div>
                        {cropsList.map(f => {
                          const fCrop = f.current_crop || f.crop_name || 'Crop';
                          const isSelected = f.id === selectedFieldId;

                          return (
                            <div
                              key={f.id}
                              onClick={() => {
                                setSelectedFieldId(f.id);
                                cropApi.getActivity(f.id).then(setPrimaryActivity).catch(() => {});
                                setShowFieldPicker(false);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '9px 12px',
                                borderRadius: 12,
                                cursor: 'pointer',
                                background: isSelected ? '#f0fdf4' : 'transparent',
                                transition: 'all 0.12s ease'
                              }}
                              onMouseEnter={e => !isSelected && (e.currentTarget.style.background = '#f8fafc')}
                              onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16 }}>🌾</span>
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: isSelected ? 700 : 600, color: isSelected ? '#064e3b' : '#0f172a' }}>
                                    {f.name}
                                  </div>
                                  <div style={{ fontSize: 10, color: '#64748b' }}>
                                    {fCrop} · {f.area_acre || 2} Acres
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <span style={{ color: '#16a34a', fontWeight: 800, fontSize: 13 }}>✓</span>
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
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    boxShadow: '0 2px 8px rgba(6,78,59,0.22)',
                    flexShrink: 0
                  }}
                >
                  <span>＋</span>
                  <span>Add</span>
                </button>
              </div>
            )}

            <div className="flex fai g14 mt6">
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                border: '1.5px solid #86efac',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(34,197,94,0.1)'
              }}>
                {getCropIcon(primaryCrop?.current_crop || primaryCrop?.crop_name || 'Wheat')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.2px' }}>
                  {primaryCrop?.current_crop || primaryCrop?.crop_name || 'Wheat'} {primaryCrop?.variety ? `(${primaryCrop.variety})` : ''}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: 500 }}>
                  {currentStage} · {primaryCrop?.area_acre || 3.0} Acres ({primaryCrop?.soil_type || 'Loamy'} Soil)
                </div>
              </div>
              <span style={{ color: '#94a3b8', fontSize: 18, fontWeight: 600 }}>›</span>
            </div>

            {/* Growth Progress Bar */}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              <div className="flex fai fjb mb6" style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
                <span>Day {das} of ~{totalCycle} Days</span>
                <span style={{ color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
                  {pct}% Completed
                </span>
              </div>
              <div className="progress-bar" style={{ height: 7, borderRadius: 99, background: '#f1f5f9' }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #047857 0%, #10b981 100%)', borderRadius: 99 }} />
              </div>

              {/* 3 Quick Farm Shortcuts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 12 }} onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => navigate('/calendar')}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 12,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}
                >
                  <span>🗓️</span> Schedule
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/scanner')}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 12,
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#c2410c',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}
                >
                  <span>🔬</span> AI Scan
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/crops')}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 12,
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#15803d',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}
                >
                  <span>🌱</span> Field Hub
                </button>
              </div>
            </div>
          </div>

          {/* 4. Farm Health Telemetry Metric Overview */}
          <div>
            <div className="section-label" style={{ marginBottom: 8 }}>FARM HEALTH OVERVIEW</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              
              <div
                onClick={() => navigate('/crops')}
                className="card"
                style={{
                  borderRadius: 18,
                  padding: '14px 10px',
                  textAlign: 'center',
                  background: 'linear-gradient(155deg, #ffffff 0%, #f6fdf9 100%)',
                  border: '1.5px solid #bbf7d0',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.05)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>ACTIVE FIELDS</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#064e3b', marginTop: 3 }}>
                  {userFields.length} {userFields.length === 1 ? 'Plot' : 'Plots'}
                </div>
                <div style={{ fontSize: 10, color: '#15803d', fontWeight: 600, marginTop: 2 }}>{totalAcreage > 0 ? `${totalAcreage.toFixed(1)} Ac Total` : `${primaryCrop?.area_acre || 3.0} Acres`}</div>
              </div>

              <div
                onClick={() => navigate('/livestock')}
                className="card"
                style={{
                  borderRadius: 18,
                  padding: '14px 10px',
                  textAlign: 'center',
                  background: 'linear-gradient(155deg, #ffffff 0%, #f5fbff 100%)',
                  border: '1.5px solid #bae6fd',
                  boxShadow: '0 2px 8px rgba(14,165,233,0.05)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>HERD STATUS</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: sickAnimals > 0 ? '#ef4444' : '#0284c7', marginTop: 3 }}>
                  {totalAnimals} Head
                </div>
                <div style={{ fontSize: 10, color: sickAnimals > 0 ? '#ef4444' : '#0284c7', fontWeight: 600, marginTop: 2 }}>
                  {sickAnimals > 0 ? `⚠️ ${sickAnimals} Alert` : '✅ 100% Healthy'}
                </div>
              </div>

              <div
                onClick={() => navigate('/scanner')}
                className="card"
                style={{
                  borderRadius: 18,
                  padding: '14px 10px',
                  textAlign: 'center',
                  background: 'linear-gradient(155deg, #ffffff 0%, #fffaf3 100%)',
                  border: '1.5px solid #fed7aa',
                  boxShadow: '0 2px 8px rgba(249,115,22,0.05)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>BIO-RISK</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ea580c', marginTop: 3 }}>
                  Low Risk
                </div>
                <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>Surveillance OK</div>
              </div>

            </div>
          </div>

          {/* 5. Recent Farm Activity Feed */}
          <div>
            <div className="flex fai fjb mb8">
              <div className="section-label" style={{ marginBottom: 0 }}>RECENT FARM ACTIVITY</div>
              <span className="cat-link" style={{ fontSize: 12, fontWeight: 700, color: '#047857', cursor: 'pointer' }} onClick={() => navigate('/history')}>
                Full History ›
              </span>
            </div>

            <div className="card" style={{ padding: '6px 16px', borderRadius: 20, background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              {history.length === 0 && (
                <div className="text-sm text-muted text-center p16">No recent activity recorded</div>
              )}
              {history.map((h, i) => (
                <div
                  key={h?.id || i}
                  style={{
                    padding: '13px 0',
                    borderBottom: i < history.length - 1 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/history')}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    background: h?.entry_type === 'Crop' ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : h?.entry_type === 'Animal' ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' : h?.entry_type === 'Scan' ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' : '#f8fafc',
                    border: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0
                  }}>
                    {h?.entry_type === 'Crop' ? '🌱' : h?.entry_type === 'Animal' ? '🐄' : h?.entry_type === 'Expense' ? '₹' : h?.entry_type === 'Scan' ? '🔬' : '📋'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {h?.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1, fontWeight: 500 }}>
                      {h?.date} · {h?.detail ? h.detail.slice(0, 42) + '…' : h?.entry_type}
                    </div>
                  </div>
                  <span style={{ color: '#cbd5e1', fontSize: 16, fontWeight: 600 }}>›</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 16 }} />
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
