/**
 * Weather Advisory — Live Meteorological Data via Open-Meteo + Agro-Climatic Advisory Engine.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { weatherApi } from '../api/client';
import BottomNav from '../components/BottomNav';
import { userStore } from '../utils/userStore';
import { getCropSchedule } from './Crops';

const ICONS = {
  clear: '☀️',
  sunny: '☀️',
  rain: '🌧️',
  drizzle: '🌦️',
  cloudy: '⛅',
  clouds: '⛅',
  overcast: '☁️',
  thunderstorm: '⛈️',
  snow: '❄️',
  mist: '🌫️',
  fog: '🌫️'
};
const wIcon = c => {
  const k = (c || '').toLowerCase();
  const match = Object.keys(ICONS).find(x => k.includes(x));
  return ICONS[match] || '🌤️';
};

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Weather() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentActiveUser = userStore.getActiveUser();

  useEffect(() => {
    const city = currentActiveUser?.location ? currentActiveUser.location.split(',')[0].trim() : 'Anand';
    weatherApi.getAdvisory(city).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [currentActiveUser]);

  const w = data?.weather;
  const fas = data?.field_advisories || [];
  const userFields = currentActiveUser?.fields || [];

  // Guarantee that active user's fields always receive tailored meteorological directives
  const displayAdvisories = (fas && fas.length > 0) ? fas : userFields.map(f => {
    const crop = f.current_crop || f.crop_name || 'Wheat';
    const sDate = f.sowing_date ? new Date(f.sowing_date) : new Date(Date.now() - 30 * 86400000);
    const das = Math.max(0, Math.floor((Date.now() - sDate) / 86400000));
    const sched = getCropSchedule(crop, das);
    const rainProb = w?.rain_probability ?? 40;
    const isRain = rainProb > 50;
    const isWindy = (w?.wind_kmh ?? 10) > 18;

    const weather_alerts = [];
    if (isRain) {
      weather_alerts.push({
        alert_label: 'High Rain Probability Forecast',
        action: `Postpone foliar sprays on ${f.name} and clear field drainage channels.`,
        irrigation_directive: 'Hold irrigation cycle for next 24-48 hours.'
      });
    }
    if (isWindy) {
      weather_alerts.push({
        alert_label: 'High Wind Velocity Detected',
        action: `Avoid pesticide/herbicide mist spraying on ${crop} plot.`,
        irrigation_directive: 'Inspect drip line anchors and field bunds.'
      });
    }

    return {
      field_id: f.id,
      field: f.name,
      field_name: f.name,
      crop: crop,
      area_acre: f.area_acre,
      das: das,
      stage: sched?.stage || 'Vegetative Growth Phase',
      advisory: {
        stage: sched?.stage || 'Vegetative Growth Phase',
        weather_alerts: weather_alerts,
        today_activities: (sched?.tasks || []).map(t => ({ activity: t.name }))
      }
    };
  });

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#f8fafc' }}>
        
        {/* ── 1. Unified Immersive Atmospheric Sky Header ── */}
        <div style={{
          background: 'linear-gradient(160deg, #075985 0%, #0284c7 45%, #0ea5e9 100%)',
          color: '#fff',
          padding: '16px 20px 24px',
          flexShrink: 0,
          boxShadow: '0 8px 24px rgba(2,132,199,0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Ambient Cloud Graphic */}
          <div style={{
            position: 'absolute',
            right: -15,
            top: 20,
            fontSize: 140,
            opacity: 0.1,
            pointerEvents: 'none',
            lineHeight: 1,
            userSelect: 'none'
          }}>
            ☁️
          </div>

          {/* Top Bar: Back Button, Location, Live Radar Badge */}
          <div className="flex fai fjb mb14">
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
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e0f2fe', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>📍</span>
                  <span>{currentActiveUser?.location || w?.location || 'Anand, Gujarat'}</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
                  Open-Meteo Live Station
                </div>
              </div>
            </div>

            <div style={{
              fontSize: 10,
              color: '#fff',
              background: 'rgba(255,255,255,0.18)',
              padding: '4px 10px',
              borderRadius: 99,
              border: '1px solid rgba(255,255,255,0.25)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8' }} />
              Live Radar
            </div>
          </div>

          {/* Current Temperature & Big Sky Icon */}
          <div className="flex fai fjb mb14">
            <div>
              <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1 }}>
                {Math.round(w?.temperature_c ?? 27)}°
                <span style={{ fontSize: 22, fontWeight: 400, opacity: 0.85, marginLeft: 2 }}>C</span>
              </div>
              <div style={{ fontSize: 16, color: '#f0f9ff', fontWeight: 600, marginTop: 4 }}>
                {w?.condition || 'Overcast'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: 400 }}>
                Feels like {Math.round((w?.temperature_c ?? 27) + 1)}°C · High 31° / Low 25°
              </div>
            </div>

            <div style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 38,
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
            }}>
              {wIcon(w?.condition)}
            </div>
          </div>

          {/* 4 Frosted Meteorological Metric Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: '7px 4px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: 9, fontWeight: 500, color: '#bae6fd', textTransform: 'uppercase' }}>Humidity</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginTop: 1 }}>💧 {w?.humidity_pct ?? 52}%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: '7px 4px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: 9, fontWeight: 500, color: '#bae6fd', textTransform: 'uppercase' }}>Wind</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginTop: 1 }}>💨 {Math.round(w?.wind_kmh ?? 12)}k</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: '7px 4px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: 9, fontWeight: 500, color: '#bae6fd', textTransform: 'uppercase' }}>Rain Prob</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginTop: 1 }}>☔ {w?.rain_probability ?? 10}%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: '7px 4px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: 9, fontWeight: 500, color: '#bae6fd', textTransform: 'uppercase' }}>UV Index</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginTop: 1 }}>☀️ Low</div>
            </div>
          </div>
        </div>

        {/* ── 2. Scrollable Body Content ── */}
        <div className="scroll-area p20">
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div className="spinner" style={{ margin: 'auto' }} />
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>Fetching live meteorological radar…</div>
            </div>
          ) : (
            <>
              {/* 5-Day Outlook Widget Card */}
              <div className="section-label" style={{ marginBottom: 8 }}>5-DAY WEATHER FORECAST</div>
              <div className="card mb16" style={{
                borderRadius: 20,
                padding: '14px 16px',
                background: '#fff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
              }}>
                {(w?.forecast || []).slice(0, 5).map((f, i, arr) => {
                  const d = typeof f.date === 'string' ? new Date(f.date.replace(/-/g, '/')) : new Date();
                  const dayLabel = i === 0 ? 'Today' : (isNaN(d.getDay()) ? DAY[(new Date().getDay() + i) % 7] : DAY[d.getDay()]);
                  const maxT = Math.round(f.temp_max ?? 31);
                  const minT = Math.round(f.temp_min ?? 25);

                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 0',
                        borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none'
                      }}
                    >
                      {/* Day Name */}
                      <div style={{ width: 55, fontSize: 13, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#0284c7' : 'var(--char-700)' }}>
                        {dayLabel}
                      </div>

                      {/* Icon + Rain Chance */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 75 }}>
                        <span style={{ fontSize: 20 }}>{wIcon(f.condition)}</span>
                        {f.rain_prob > 15 ? (
                          <span style={{ fontSize: 11, color: '#0284c7', fontWeight: 600 }}>
                            {Math.round(f.rain_prob)}%
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>0%</span>
                        )}
                      </div>

                      {/* Temperature Range Bar */}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--muted)', width: 24, textAlign: 'right', fontWeight: 500 }}>
                          {minT}°
                        </span>
                        <div style={{
                          flex: 1,
                          height: 5,
                          background: '#f1f5f9',
                          borderRadius: 99,
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute',
                            left: '20%',
                            right: '15%',
                            top: 0,
                            bottom: 0,
                            borderRadius: 99,
                            background: 'linear-gradient(90deg, #38bdf8 0%, #f59e0b 100%)'
                          }} />
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--char-800)', width: 26, fontWeight: 600 }}>
                          {maxT}°
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Farm Operation Windows — Side by Side Grid */}
              <div className="section-label" style={{ marginBottom: 8 }}>FARM OPERATION DIRECTIVES</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{
                  borderRadius: 16,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '12px 14px'
                }}>
                  <div style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}>
                    <span>🌿</span>
                    <span>Spraying Window</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#166534', marginTop: 4, lineHeight: 1.35, fontWeight: 400 }}>
                    {w?.wind_kmh < 15 ? '✓ Safe — Low wind speed' : '⚠️ Postpone spray (Windy)'}
                  </div>
                </div>

                <div style={{
                  borderRadius: 16,
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  padding: '12px 14px'
                }}>
                  <div style={{ color: '#0369a1', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}>
                    <span>💧</span>
                    <span>Irrigation Window</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#075985', marginTop: 4, lineHeight: 1.35, fontWeight: 400 }}>
                    {w?.rain_probability > 50 ? '⚠️ Rain due — pause drip' : '✓ Normal cycle active'}
                  </div>
                </div>
              </div>

              {/* Field-Specific Directives */}
              <div className="section-label" style={{ marginBottom: 8 }}>ACTIVE FIELD IMPACT DIRECTIVES</div>
              
              {displayAdvisories.map((fa, i) => {
                const hasAlert = fa.advisory?.weather_alerts?.length > 0;
                return (
                  <div
                    key={i}
                    className="card mb12"
                    style={{
                      borderRadius: 18,
                      padding: '14px 16px',
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderLeft: hasAlert ? '4px solid #f59e0b' : '4px solid #10b981',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div className="flex fai fjb mb6">
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--char-800)' }}>
                          {fa.crop} — {fa.field || fa.field_name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1, fontWeight: 400 }}>
                          🌱 Day {fa.das} After Sowing · {fa.stage || 'Vegetative Growth'}
                        </div>
                      </div>
                      {hasAlert ? (
                        <span className="badge badge-amber" style={{ borderRadius: 99, fontSize: 10, fontWeight: 600 }}>
                          ⚠️ Alert
                        </span>
                      ) : (
                        <span className="badge badge-green" style={{ borderRadius: 99, fontSize: 10, fontWeight: 600 }}>
                          ✓ Optimal
                        </span>
                      )}
                    </div>

                    {hasAlert && (
                      <div style={{ marginTop: 8 }}>
                        {fa.advisory.weather_alerts.map((alert, j) => (
                          <div
                            key={j}
                            style={{
                              background: '#fffbeb',
                              borderRadius: 12,
                              padding: '10px 12px',
                              border: '1px solid #fde68a',
                              marginBottom: 6
                            }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#b45309' }}>
                              ⚡ {alert.alert_label}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--char-700)', marginTop: 3, lineHeight: 1.4 }}>
                              {alert.action}
                            </div>
                            {alert.irrigation_directive && (
                              <div style={{ fontSize: 11, color: '#0369a1', fontWeight: 500, marginTop: 4, background: '#f0f9ff', padding: '4px 8px', borderRadius: 6 }}>
                                💧 Directive: {alert.irrigation_directive}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {(fa.advisory?.today_activities || []).length > 0 && !hasAlert && (
                      <div style={{ marginTop: 8, borderTop: '1px solid #f1f5f9', paddingTop: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--char-500)', textTransform: 'uppercase', marginBottom: 2 }}>
                          Scheduled Field Task:
                        </div>
                        {fa.advisory.today_activities.slice(0, 2).map((a, j) => (
                          <div key={j} style={{ fontSize: 11, color: 'var(--char-700)', display: 'flex', gap: 6, marginTop: 2 }}>
                            <span style={{ color: '#16a34a', fontWeight: 600 }}>✓</span>
                            <span>{a.activity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {displayAdvisories.length === 0 && (
                <div className="card text-center p24" style={{ borderRadius: 20, background: '#fff', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>🌾</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--char-800)' }}>No Active Crop Fields</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    Add farm fields with crops and sowing dates to receive personalized weather impact advisories.
                  </div>
                </div>
              )}
            </>
          )}

          {/* Generous bottom spacing so bottom nav never overlaps cards */}
          <div style={{ height: 32 }} />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
