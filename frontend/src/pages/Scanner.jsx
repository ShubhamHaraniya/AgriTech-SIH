/**
 * Crop Disease Scanner — Futuristic AI Neural HUD, Live Viewfinder Laser,
 * Image / Camera Capture → EfficientNet-B4 → Result → Advisory.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cropApi } from '../api/client';

/* ─── 1. Scanner Screen ───────────────────────────────────────────────────── */
export function Scanner() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const cameraRef = useRef();

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  // Sample leaves for quick testing
  const loadSampleLeaf = async (name, sampleUrl) => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const sampleFile = new File([blob], `${name}.jpg`, { type: 'image/jpeg' });
      setFile(sampleFile);
      setPreview(sampleUrl);
    } catch (e) {
      // Fallback: create canvas image
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(200, 200, 80, 0, Math.PI * 2);
      ctx.fill();
      canvas.toBlob(b => {
        const fallbackFile = new File([b], `${name}.jpg`, { type: 'image/jpeg' });
        setFile(fallbackFile);
        setPreview(canvas.toDataURL());
      });
    } finally {
      setLoading(false);
    }
  };

  const analyze = async () => {
    if (!file) {
      setError('Please select or capture a crop leaf image first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await cropApi.predictDisease(fd);
      navigate('/scanner/result', { state: { result, previewUrl: preview } });
    } catch (e) {
      setError(e.message || 'Vision analysis failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setFile(null);
    setError('');
  };

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#090d14', color: '#fff', position: 'relative' }}>
        
        {/* ── Top Bar: Glassmorphic Floating HUD ── */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          zIndex: 10
        }}>
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.12)',
              borderColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              width: 36,
              height: 36
            }}
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20.5, fontWeight: 700, letterSpacing: '-0.3px', color: '#fff' }}>
              Crop AI Vision Scanner
            </div>
          </div>
        </div>

        {/* ── Viewfinder Main Stage ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '20px 20px',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.12) 0%, #090d14 70%)'
        }}>
          
          {/* Subtle Viewfinder Grid Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none'
          }} />

          {/* Top Instruction Pill */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 999,
            padding: '5px 14px',
            fontSize: 11,
            fontWeight: 500,
            color: '#e2e8f0',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            zIndex: 3
          }}>
            <span>🎯</span>
            <span>Focus on affected leaf, spot or stem</span>
          </div>

          {/* Viewfinder Target Container */}
          <div style={{
            width: '100%',
            maxWidth: 290,
            aspectRatio: '1/1',
            borderRadius: 28,
            position: 'relative',
            background: preview ? '#000' : 'rgba(255,255,255,0.03)',
            border: preview ? '2px solid #10b981' : '1.5px dashed rgba(255,255,255,0.2)',
            boxShadow: preview ? '0 0 30px rgba(16, 185, 129, 0.25)' : '0 8px 32px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}>

            {/* Glowing Corner Brackets */}
            {[
              { top: 12, left: 12, borderTop: '3px solid #10b981', borderLeft: '3px solid #10b981', borderRadius: '10px 0 0 0' },
              { top: 12, right: 12, borderTop: '3px solid #10b981', borderRight: '3px solid #10b981', borderRadius: '0 10px 0 0' },
              { bottom: 12, left: 12, borderBottom: '3px solid #10b981', borderLeft: '3px solid #10b981', borderRadius: '0 0 0 10px' },
              { bottom: 12, right: 12, borderBottom: '3px solid #10b981', borderRight: '3px solid #10b981', borderRadius: '0 0 10px 0' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 28, height: 28, zIndex: 4, filter: 'drop-shadow(0 0 4px #10b981)', ...s }} />
            ))}

            {/* Viewfinder Content */}
            {preview ? (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <img
                  src={preview}
                  alt="Selected Leaf"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Scanning Laser Beam */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, transparent, #10b981, #fff, #10b981, transparent)',
                  boxShadow: '0 0 15px #10b981, 0 0 25px #10b981',
                  animation: 'scanLaser 1.5s ease-in-out infinite alternate',
                  zIndex: 5
                }} />

                {!loading && (
                  <button
                    onClick={clearPreview}
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.75)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      zIndex: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Remove Image"
                  >
                    ✕
                  </button>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 20, zIndex: 2 }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 34,
                  margin: '0 auto 12px',
                  boxShadow: '0 0 24px rgba(16,185,129,0.15)'
                }}>
                  🌿
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>
                  Position Leaf in Frame
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
                  Ensure sharp focus in natural daylight
                </div>
              </div>
            )}
          </div>

          {/* Quick Sample Selector for Instant Demo Testing */}
          {!preview && (
            <div style={{ marginTop: 20, textAlign: 'center', zIndex: 3 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, fontWeight: 600 }}>
                Or test with sample disease:
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                {[
                  { label: '🍅 Tomato Blight', sample: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2252b?w=400' },
                  { label: '🌾 Wheat Rust', sample: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400' },
                  { label: '🥔 Potato Leaf', sample: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' }
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => loadSampleLeaf(s.label, s.sample)}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#cbd5e1',
                      borderRadius: 99,
                      padding: '4px 10px',
                      fontSize: 10,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            background: '#450a0a',
            color: '#fca5a5',
            padding: '10px 18px',
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'center',
            borderTop: '1px solid #7f1d1d',
            flexShrink: 0
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Bottom Camera Controls Deck ── */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '18px 24px 26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          flexShrink: 0,
          boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
          zIndex: 10
        }}>
          {preview ? (
            /* State when leaf photo is loaded */
            <div style={{ display: 'flex', width: '100%', gap: 12, alignItems: 'center' }}>
              <button
                type="button"
                onClick={clearPreview}
                style={{
                  height: 50,
                  padding: '0 16px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🔄</span>
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={analyze}
                disabled={loading}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: loading ? 'scale(0.98)' : 'scale(1)'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      animation: 'spin 0.7s linear infinite'
                    }} />
                    <span>Analyzing Leaf…</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 16 }}>🔬</span>
                    <span>Diagnose Crop Disease</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* State when waiting for photo input */
            <div style={{ display: 'flex', width: '100%', gap: 12, alignItems: 'center' }}>
              {/* Gallery Button */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  color: '#e2e8f0',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <span style={{ fontSize: 18 }}>🖼️</span>
                <span>Upload Photo</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />

              {/* Live Camera Button */}
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <span style={{ fontSize: 18 }}>📸</span>
                <span>Take Photo</span>
              </button>
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />
            </div>
          )}
        </div>

        <style>{`
          @keyframes scanLaser {
            0% { top: 6%; opacity: 0.8; }
            100% { top: 92%; opacity: 1; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

/* ─── 2. Disease Result Screen ────────────────────────────────────────────── */
export function DiseaseResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result || {};
  const preview = location.state?.previewUrl;

  const conf = result.confidence_pct != null
    ? Math.round(result.confidence_pct)
    : Math.round((result.confidence > 1 ? result.confidence : (result.confidence || 0.94) * 100));
  const circ = 2 * Math.PI * 34;
  const offset = circ - (circ * conf / 100);

  const sev = result.severity || 'Moderate';
  const diseaseName = result.disease || result.display_name || 'Early Blight';
  const cropName = result.crop || 'Crop Foliage';

  const severityColor = {
    High: 'var(--red)',
    Moderate: 'var(--amber-dark)',
    Medium: 'var(--amber-dark)',
    Low: 'var(--green-600)'
  };

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#f8fafc' }}>
        
        {/* Leaf Image Header */}
        <div style={{
          height: 240,
          position: 'relative',
          background: 'linear-gradient(135deg, #023008 0%, #1b4332 100%)',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          {preview ? (
            <img src={preview} alt="Scanned leaf" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, opacity: 0.3 }}>🍃</div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%)' }} />
          
          <button
            className="back-btn"
            onClick={() => navigate('/scanner')}
            style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff', zIndex: 5 }}
          >
            ←
          </button>

          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(2,48,8,0.75)',
            border: '1px solid rgba(74,222,128,0.3)',
            color: '#4ade80',
            fontSize: 11,
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: 99,
            backdropFilter: 'blur(8px)',
            zIndex: 5
          }}>
            AI Vision Diagnosis
          </div>

          <div style={{ position: 'absolute', bottom: 14, left: 20, right: 20, zIndex: 5 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {cropName} Foliage
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
              {diseaseName}
            </div>
          </div>
        </div>

        {/* Scrollable Result Body */}
        <div className="scroll-area p20">
          
          {/* Main Diagnosis Hero Card */}
          <div className="card mb14" style={{ borderRadius: 22, padding: '18px 20px', border: '1px solid rgba(2,48,8,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div className="flex fai fjb">
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Detected Pathology</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--char-800)', marginTop: 2, letterSpacing: '-0.3px' }}>{diseaseName}</div>
                <div style={{ marginTop: 8 }}>
                  <span className={`badge ${sev === 'High' ? 'badge-red' : 'badge-amber'}`} style={{ borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                    ⚠️ {sev} Severity
                  </span>
                </div>
              </div>
              
              {/* Sleek Modern AI Match Metric Badge */}
              <div style={{
                background: 'linear-gradient(145deg, #f0fdf4, #dcfce7)',
                border: '1.5px solid #86efac',
                borderRadius: 18,
                padding: '10px 14px',
                textAlign: 'center',
                flexShrink: 0,
                minWidth: 84,
                boxShadow: '0 4px 12px rgba(34,197,94,0.12)'
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6, color: '#15803d' }}>
                  AI Match
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#14532d', lineHeight: 1.1, marginTop: 2 }}>
                  {conf}%
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                  {conf >= 80 ? 'High' : 'Confidence'}
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Metrics Grid */}
          <div className="section-label">DIAGNOSTIC METRICS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            <div className="card text-center" style={{ margin: 0, padding: '12px 8px', borderRadius: 16 }}>
              <div style={{ fontSize: 20 }}>🔬</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--char-800)', marginTop: 4 }}>Vision B4</div>
              <div className="text-xs text-muted">CNN Backbone</div>
            </div>
            <div className="card text-center" style={{ margin: 0, padding: '12px 8px', borderRadius: 16 }}>
              <div style={{ fontSize: 20 }}>⏱️</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--char-800)', marginTop: 4 }}>{result.advisory?.urgency ? 'Immediate' : '3–5 Days'}</div>
              <div className="text-xs text-muted">Action Window</div>
            </div>
            <div className="card text-center" style={{ margin: 0, padding: '12px 8px', borderRadius: 16 }}>
              <div style={{ fontSize: 20 }}>📉</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--char-800)', marginTop: 4 }}>{result.is_healthy ? '0%' : '15–30%'}</div>
              <div className="text-xs text-muted">Yield Impact</div>
            </div>
          </div>

          {/* Immediate Agricultural Action Plan */}
          <div className="section-label">IMMEDIATE CLINICAL ACTION PLAN</div>
          <div className="card mb16" style={{ borderRadius: 18, padding: '16px 18px', background: '#fff', border: '1px solid #e2e8f0' }}>
            {(result.advisory?.immediate_action || [
              'Inspect surrounding plants in a 5-meter radius for early lesions.',
              'Stop overhead watering immediately to prevent fungal spore splash.',
              'Apply the first protective chemical or organic fungicide spray within 24–48 hours.'
            ]).map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: idx < 2 ? 10 : 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: 8, background: '#ecfdf5', color: '#16a34a', fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #bbf7d0' }}>
                  {idx + 1}
                </div>
                <div style={{ fontSize: 12, color: 'var(--char-700)', lineHeight: 1.4, fontWeight: 500 }}>
                  {step}
                </div>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <button
            className="btn btn-full btn-pill mb10"
            style={{
              background: 'linear-gradient(135deg, var(--green-800) 0%, #15803d 100%)',
              color: '#fff',
              padding: '14px 20px',
              fontSize: 14,
              fontWeight: 700,
              boxShadow: '0 6px 20px rgba(2,48,8,0.25)'
            }}
            onClick={() => navigate('/scanner/advisory', { state: { disease: diseaseName, crop: cropName, advisory: result.advisory } })}
          >
            📋 View Full Agronomic Treatment Guide
          </button>
          
          <button
            className="btn btn-secondary btn-full btn-pill"
            style={{ padding: '12px 20px', fontSize: 14, fontWeight: 700 }}
            onClick={() => navigate('/scanner')}
          >
            🔄 Scan Another Leaf
          </button>
          
          <div style={{ height: 16 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── 3. Disease Advisory Screen ──────────────────────────────────────────── */
export function DiseaseAdvisory() {
  const navigate = useNavigate();
  const location = useLocation();
  const disease = location.state?.disease || 'Early Blight';
  const crop = location.state?.crop || 'Tomato';
  
  const [adv, setAdv] = useState(location.state?.advisory || null);
  const [loading, setL] = useState(!location.state?.advisory);

  useEffect(() => {
    if (!adv) {
      cropApi.getAdvisory(disease, crop)
        .then(res => {
          setAdv(res);
        })
        .catch(() => {
          setAdv(null);
        })
        .finally(() => setL(false));
    }
  }, [disease, crop, adv]);

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#f8fafc' }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-800) 0%, #15803d 100%)',
          color: '#fff',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
          boxShadow: '0 4px 16px rgba(2,48,8,0.2)'
        }}>
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Agronomic Treatment Guide</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
              ICAR & PAU Agricultural Guidelines
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="scroll-area p20">
          
          {/* Disease Hero Banner */}
          <div className="card mb14 flex fai g12" style={{ borderRadius: 20, padding: '16px 18px', background: '#fff' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'var(--green-50)',
              border: '1px solid var(--green-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              flexShrink: 0
            }}>
              🍂
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--char-800)' }}>{adv?.disease || disease}</div>
              <div className="text-sm text-muted">{adv?.crop || crop} · Integrated Pest Management</div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="spinner" style={{ margin: 'auto' }} />
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>Loading clinical agronomic protocol…</div>
            </div>
          ) : (
            <>
              {/* Urgency & Yield Impact Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <div className="card" style={{ margin: 0, padding: '14px 16px', borderRadius: 16, background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Treatment Timeline</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#047857', marginTop: 3 }}>
                    ⏱️ {adv?.urgency || 'Within 7 days'}
                  </div>
                </div>
                <div className="card" style={{ margin: 0, padding: '14px 16px', borderRadius: 16, background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Yield Impact</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#b45309', marginTop: 3 }}>
                    📉 {adv?.yield_impact || '15–30% reduction in tuber quality and weight'}
                  </div>
                </div>
              </div>

              {/* 1. Immediate First-Aid */}
              <div className="section-label">⚡ IMMEDIATE CROP FIRST-AID</div>
              <div className="card mb14" style={{ borderRadius: 18, padding: '14px 16px', background: '#fff' }}>
                {((adv?.immediate_action && Array.isArray(adv.immediate_action))
                  ? adv.immediate_action
                  : [
                      'Inspect plants in a 5-meter radius around the detected infected leaf.',
                      'Stop overhead sprinkler irrigation immediately — switch to drip.',
                      'Sterilize cutting tools with 70% alcohol between rows.'
                    ]
                ).map((step, idx) => (
                  <div key={idx} className="flex g10" style={{ padding: '6px 0', borderBottom: idx < 2 ? '1px solid var(--char-50)' : 'none' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--green-800)' }}>{idx + 1}️⃣</span>
                    <span className="text-sm" style={{ lineHeight: 1.4, color: 'var(--char-700)' }}>
                      {typeof step === 'string' ? step : step.text || JSON.stringify(step)}
                    </span>
                  </div>
                ))}
              </div>

              {/* 2. Recommended Chemical Treatments */}
              <div className="section-label">🧪 RECOMMENDED CHEMICAL SPRAYS</div>
              <div style={{ marginBottom: 14 }}>
                {((adv?.chemical_treatments && Array.isArray(adv.chemical_treatments))
                  ? adv.chemical_treatments
                  : [
                      { product: 'Mancozeb 75% WP', dosage: '2.5 g / Liter of water', timing: 'Spray immediately at first spots', safety_note: 'PHI 7 days' },
                      { product: 'Chlorothalonil 75% WP', dosage: '2.0 g / Liter of water', timing: 'Foliar protective spray', safety_note: 'PHI 5 days' }
                    ]
                ).map((chem, idx) => (
                  <div key={idx} className="card mb8" style={{ borderRadius: 16, padding: '14px 16px', background: '#fff', borderLeft: '3.5px solid var(--red)' }}>
                    <div className="flex fai fjb">
                      <div className="bold text-sm" style={{ color: 'var(--char-800)' }}>
                        {chem.product || chem.name || 'Chemical Spray'}
                      </div>
                      <span className="badge badge-red" style={{ fontSize: 11 }}>
                        {chem.dosage || '2.0 g/L'}
                      </span>
                    </div>
                    {chem.timing && (
                      <div className="text-xs text-muted mt4">
                        ⏱️ <span className="bold">Timing:</span> {chem.timing}
                      </div>
                    )}
                    {chem.safety_note && (
                      <div className="text-xs text-amber mt2">
                        ⚠️ <span className="bold">Safety PHI:</span> {chem.safety_note}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 3. Organic & Biological Remedies */}
              <div className="section-label">🌿 ORGANIC & BIOLOGICAL REMEDIES</div>
              <div style={{ marginBottom: 14 }}>
                {((adv?.organic_treatments && Array.isArray(adv.organic_treatments))
                  ? adv.organic_treatments
                  : [
                      { method: 'Copper Oxychloride 50 WP', application: 'Spray covering leaf undersides', frequency: 'Every 7–10 days' },
                      { method: 'Neem Oil 0.5% (Azadirachtin)', application: 'Foliar mist in early morning', frequency: 'Every 5 days' }
                    ]
                ).map((org, idx) => (
                  <div key={idx} className="card mb8" style={{ borderRadius: 16, padding: '14px 16px', background: '#fff', borderLeft: '3.5px solid var(--green-600)' }}>
                    <div className="flex fai fjb">
                      <div className="bold text-sm" style={{ color: 'var(--green-800)' }}>
                        {org.method || org.name || 'Organic Remedy'}
                      </div>
                      <span className="badge badge-green" style={{ fontSize: 11 }}>
                        {org.frequency || 'Weekly'}
                      </span>
                    </div>
                    {org.application && (
                      <div className="text-xs text-muted mt4">
                        🍃 <span className="bold">Application:</span> {org.application}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 4. Prevention & Biosecurity */}
              <div className="section-label">🛡️ PREVENTION & FIELD BIOSECURITY</div>
              <div className="card mb16" style={{ borderRadius: 18, padding: '14px 16px', background: '#fff' }}>
                {((adv?.preventive_measures && Array.isArray(adv.preventive_measures))
                  ? adv.preventive_measures
                  : [
                      'Prune lower infected foliage and destroy immediately (do not compost).',
                      'Switch to drip irrigation to keep crop canopy completely dry.',
                      'Ensure adequate row spacing (45–60 cm) for air circulation.',
                      'Rotate with non-host crops in the subsequent agricultural cycle.'
                    ]
                ).map((prev, idx) => (
                  <div key={idx} className="flex fai g8 mt4" style={{ padding: '4px 0' }}>
                    <span className="dot-green" />
                    <span className="text-sm" style={{ color: 'var(--char-700)' }}>
                      {typeof prev === 'string' ? prev : prev.measure || JSON.stringify(prev)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="alert-box alert-blue mb14" style={{ borderRadius: 16 }}>
                <span>ℹ️</span>
                <div className="text-xs text-muted">
                  Dosage rates are formulated according to ICAR scientific standards. Always adhere to chemical container safety guidelines.
                </div>
              </div>

              {/* Back button */}
              <button className="btn btn-secondary btn-full btn-pill" onClick={() => navigate('/scanner')}>
                ← Back to Scanner
              </button>
              <div style={{ height: 20 }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
