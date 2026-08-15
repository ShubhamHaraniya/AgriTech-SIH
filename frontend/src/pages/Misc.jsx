/** Farm History, Expenses, Notifications, More/Profile */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyApi, expenseApi, notifApi, farmApi } from '../api/client';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import { userStore } from '../utils/userStore';

/* ─── Farm History ─────────────────────────────────────────────────────────── */
export function FarmHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('All');
  const [l, setL] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [logForm, setLogForm] = useState({
    entry_type: 'Crop',
    title: '',
    detail: '',
  });
  const [savingLog, setSavingLog] = useState(false);

  const TYPES = ['All', 'Crop', 'Animal', 'Expense', 'Scan', 'Vaccine'];
  const ICONS = { Crop: '🌱', Animal: '🐄', Expense: '💰', Scan: '🔬', Vaccine: '💉', default: '📋' };
  const COLORS = {
    Crop: '#ecfdf5',
    Animal: '#fffbeb',
    Expense: '#faf5ff',
    Scan: '#f0f9ff',
    Vaccine: '#fff1f2',
    default: '#f8fafc'
  };
  const BORDER_ACCENT = {
    Crop: '#10b981',
    Animal: '#f59e0b',
    Expense: '#a855f7',
    Scan: '#0ea5e9',
    Vaccine: '#f43f5e',
    default: '#94a3b8'
  };

  useEffect(() => {
    const type = filter === 'All' ? null : filter;
    setL(true);
    historyApi.getAll(type).then(setHistory).catch(() => {}).finally(() => setL(false));
  }, [filter]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!logForm.title.trim()) return;
    setSavingLog(true);
    try {
      await historyApi.add({
        entry_type: logForm.entry_type,
        title: logForm.title.trim(),
        detail: logForm.detail.trim(),
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddModal(false);
      setLogForm({ entry_type: 'Crop', title: '', detail: '' });
      const type = filter === 'All' ? null : filter;
      historyApi.getAll(type).then(setHistory).catch(() => {});
    } catch (err) {
      alert('Could not save log: ' + (err.message || 'Error'));
    } finally {
      setSavingLog(false);
    }
  };

  // Counts for hero stats
  const cropCount = history.filter(h => h.entry_type === 'Crop').length;
  const animalCount = history.filter(h => h.entry_type === 'Animal' || h.entry_type === 'Vaccine').length;
  const scanCount = history.filter(h => h.entry_type === 'Scan').length;

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#f8fafc' }}>
        
        {/* Top Header — Clean Slate & Mint Theme */}
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
            <div style={{ fontSize: 20.5, fontWeight: 700, letterSpacing: '-0.3px' }}>Farm Activity Log</div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="scroll-area p20">
          
          {/* Farm Audit Summary Hero Card — Clean Slate & Emerald */}
          <div className="card mb16" style={{
            borderRadius: 24,
            padding: '22px 24px',
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(15,23,42,0.25)',
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
              📋
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: '#10b981' }}>
                FARM AUDIT & TIMELINE
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                {history.length} Activities Logged
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4, fontWeight: 400 }}>
                Recorded across season lifecycle · 2026
              </div>
            </div>

            {/* Stat Counters */}
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#86efac' }}>CROPS</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>{cropCount}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#fef08a' }}>HERD</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>{animalCount}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#93c5fd' }}>AI SCANS</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>{scanCount}</div>
              </div>
            </div>
          </div>

          {/* Activity Category Filter & Add Log Action */}
          <div style={{ position: 'relative', marginBottom: 14, zIndex: 20 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>LOG CATEGORY & RECORDING</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Custom Category Dropdown Popover */}
              <div style={{ position: 'relative', flex: 1 }}>
                <button
                  type="button"
                  onClick={() => setShowFilterDropdown(s => !s)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: '#fff',
                    color: 'var(--char-800)',
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <span>{ICONS[filter] || '📋'}</span>
                    <span>{filter === 'All' ? `All Categories (${history.length})` : `${filter} Activities`}</span>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--muted)', transform: showFilterDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    ▼
                  </span>
                </button>

                {showFilterDropdown && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowFilterDropdown(false)} />
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      right: 0,
                      background: '#fff',
                      borderRadius: 16,
                      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                      padding: 6,
                      zIndex: 40,
                      maxHeight: 260,
                      overflowY: 'auto'
                    }}>
                      {TYPES.map(t => {
                        const isSelected = filter === t;
                        const label = t === 'All' ? `All Categories (${history.length})` : `${t} Activities`;
                        return (
                          <div
                            key={t}
                            onClick={() => {
                              setFilter(t);
                              setShowFilterDropdown(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '9px 12px',
                              borderRadius: 10,
                              cursor: 'pointer',
                              background: isSelected ? '#f1f5f9' : 'transparent',
                              transition: 'all 0.12s ease'
                            }}
                            onMouseEnter={e => !isSelected && (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>{ICONS[t] || '📋'}</span>
                              <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: 'var(--char-800)' }}>
                                {label}
                              </span>
                            </div>
                            {isSelected && <span style={{ color: '#0f172a', fontWeight: 800 }}>✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Log Activity Action Button */}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                style={{
                  flexShrink: 0,
                  padding: '10px 16px',
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 800,
                  background: 'var(--green-800)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 3px 10px rgba(2,48,8,0.2)'
                }}
              >
                <span>＋</span>
                <span>Log Activity</span>
              </button>
            </div>
          </div>

          {/* Timeline Feed */}
          {l ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div className="spinner" style={{ margin: 'auto' }} />
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>Loading timeline events…</div>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 8 }}>
              
              {/* Vertical connector line */}
              {history.length > 0 && (
                <div style={{
                  position: 'absolute',
                  left: 27,
                  top: 20,
                  bottom: 20,
                  width: 2,
                  background: 'linear-gradient(to bottom, #86efac, #cbd5e1)',
                  zIndex: 0
                }} />
              )}

              {history.map((h, idx) => {
                const icon = ICONS[h.entry_type] || ICONS.default;
                const bg = COLORS[h.entry_type] || COLORS.default;
                const borderAccent = BORDER_ACCENT[h.entry_type] || BORDER_ACCENT.default;

                return (
                  <div key={h.id || idx} style={{ display: 'flex', gap: 14, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                    
                    {/* Timeline Node Icon */}
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: bg,
                      border: `2px solid ${borderAccent}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                      {icon}
                    </div>

                    {/* Timeline Content Card */}
                    <div
                      className="card"
                      style={{
                        flex: 1,
                        borderRadius: 18,
                        padding: '14px 16px',
                        background: '#fff',
                        borderLeft: `3.5px solid ${borderAccent}`,
                        boxShadow: '0 3px 12px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div className="flex fai fjb">
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--char-800)' }}>
                          {h.title}
                        </div>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 99,
                          background: bg,
                          color: borderAccent,
                          border: `1px solid ${borderAccent}30`,
                          textTransform: 'uppercase'
                        }}>
                          {h.entry_type || 'Activity'}
                        </span>
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                        🗓️ {h.date}
                      </div>

                      {h.detail && (
                        <div style={{
                          fontSize: 12,
                          color: 'var(--char-700)',
                          marginTop: 8,
                          lineHeight: 1.45,
                          background: '#f8fafc',
                          padding: '8px 12px',
                          borderRadius: 12,
                          border: '1px solid #f1f5f9'
                        }}>
                          {h.detail}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {history.length === 0 && (
                <div className="card text-center p24" style={{ borderRadius: 20, background: '#fff' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--char-800)' }}>No Activities Found</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    Actions taken across crops, livestock, scans, and expenses will be chronologically logged here.
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ height: 20 }} />
        </div>

        {/* ── Add Custom Activity Log Modal ── */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="flex fai fjb mb16">
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--char-800)' }}>📋 Record Farm Activity</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    Log an agronomic, livestock, or operational event to the farm audit trail
                  </div>
                </div>
                <button className="icon-btn" onClick={() => setShowAddModal(false)}>✕</button>
              </div>

              <form onSubmit={handleAddLog}>
                <div className="form-group mb12">
                  <label className="form-label bold text-xs">Activity Category</label>
                  <select
                    className="form-select"
                    value={logForm.entry_type}
                    onChange={e => setLogForm({ ...logForm, entry_type: e.target.value })}
                  >
                    <option value="Crop">🌱 Crop Operation (Sowing, Irrigation, Spray)</option>
                    <option value="Animal">🐄 Livestock & Herd Management</option>
                    <option value="Vaccine">💉 Animal Vaccination / Treatment</option>
                    <option value="Expense">💰 Farm Purchase / Expense</option>
                    <option value="Scan">🔬 AI Diagnostic / Soil Test</option>
                    <option value="General">📋 General Farm Maintenance</option>
                  </select>
                </div>

                <div className="form-group mb12">
                  <label className="form-label bold text-xs">Activity Summary / Title</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    placeholder="e.g. 1st Irrigation completed in Field A"
                    value={logForm.title}
                    onChange={e => setLogForm({ ...logForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group mb16">
                  <label className="form-label bold text-xs">Details & Observations (Optional)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="e.g. Applied 30 kg Urea alongside CRI watering. Soil moisture adequate."
                    value={logForm.detail}
                    onChange={e => setLogForm({ ...logForm, detail: e.target.value })}
                  />
                </div>

                <div className="flex fai g8 mb16" style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: 16 }}>🗓️</span>
                  <div style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>
                    <b>Log Timestamp:</b> Automatically logged for Today ({new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}).
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" disabled={savingLog} className="btn btn-primary btn-full btn-pill" style={{ padding: '12px 16px', fontSize: 14, fontWeight: 800 }}>
                    {savingLog ? 'Saving…' : '💾 Save Activity Log'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
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

/* ─── Expenses ─────────────────────────────────────────────────────────────── */
export function Expenses() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [catFilter, setCatFilter] = useState('All');
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [form, setForm] = useState({
    category: 'Fertilizer',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [l, setL] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const CATS = ['Seeds', 'Fertilizer', 'Labour', 'Veterinary', 'Irrigation', 'Equipment', 'Other'];
  const CAT_ICON = { Seeds: '🌱', Fertilizer: '🧪', Labour: '👷', Veterinary: '🩺', Irrigation: '💧', Equipment: '🔧', Other: '📦' };
  const CAT_COLOR = {
    Seeds: '#ecfdf5',
    Fertilizer: '#f0fdf4',
    Labour: '#faf5ff',
    Veterinary: '#fff1f2',
    Irrigation: '#f0f9ff',
    Equipment: '#fffbeb',
    Other: '#f8fafc'
  };
  const CAT_ACCENT = {
    Seeds: '#10b981',
    Fertilizer: '#16a34a',
    Labour: '#a855f7',
    Veterinary: '#f43f5e',
    Irrigation: '#0284c7',
    Equipment: '#d97706',
    Other: '#64748b'
  };

  const load = () => {
    setL(true);
    expenseApi.getAll().then(setData).catch(() => {}).finally(() => setL(false));
  };
  useEffect(load, []);

  const submit = async (e) => {
    if (e) e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }
    setSubmitting(true);
    try {
      await expenseApi.add({
        category: form.category,
        amount: amt,
        description: form.description.trim() || form.category,
        date: form.date || new Date().toISOString().split('T')[0],
      });
      setShowAdd(false);
      setForm({
        category: 'Fertilizer',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      load();
    } catch (err) {
      alert('Failed to save expense: ' + (err.message || 'Error occurred'));
    } finally {
      setSubmitting(false);
    }
  };

  const items = data?.items || [];
  const total = data?.total || 0;
  const bycat = data?.by_category || {};

  // Find top spending category
  let topCat = '-';
  let topAmt = 0;
  Object.entries(bycat).forEach(([c, a]) => {
    if (a > topAmt) {
      topAmt = a;
      topCat = c;
    }
  });

  const filteredItems = items.filter(item => {
    if (catFilter === 'All') return true;
    return item.category === catFilter;
  });

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#f8fafc' }}>
        
        {/* Top Navigation Bar — Clean Slate & Mint Theme (Matching Audit Log) */}
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
            <div style={{ fontSize: 20.5, fontWeight: 700, letterSpacing: '-0.3px' }}>Farm Expense Ledger</div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              padding: '6px 12px',
              borderRadius: 99,
              background: 'rgba(255,255,255,0.16)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
            }}
          >
            ＋ Add
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="scroll-area p20">
          
          {/* Total Expense Hero Card — Clean Slate & Mint */}
          <div className="card mb16" style={{
            borderRadius: 22,
            padding: '22px 24px',
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(15,23,42,0.25)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{
              position: 'absolute',
              right: 12,
              top: -10,
              fontSize: 130,
              opacity: 0.08,
              fontWeight: 700,
              color: '#94a3b8',
              pointerEvents: 'none',
              lineHeight: 1,
              userSelect: 'none'
            }}>
              ₹
            </div>
            
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: '#10b981' }}>
                SEASON PRODUCTION OUTLAY
              </div>
              <div style={{ fontSize: 34, fontWeight: 700, marginTop: 4, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
                ₹{total.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4, fontWeight: 400 }}>
                Cumulative inputs & operational expenses · 2026
              </div>
            </div>

            {/* Mini Outlay Breakdown Pills */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '8px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: '#86efac', textTransform: 'uppercase' }}>Top Outlay</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {topCat}
                </div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '8px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: '#fef08a', textTransform: 'uppercase' }}>Transactions</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 1 }}>{items.length}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '8px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: '#93c5fd', textTransform: 'uppercase' }}>Categories</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 1 }}>{Object.keys(bycat).length}</div>
              </div>
            </div>
          </div>

          {/* Quick Add Button — Slate Theme */}
          <button
            type="button"
            className="btn btn-full btn-pill mb16"
            style={{
              padding: '12px 20px',
              fontSize: 13,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 4px 14px rgba(15,23,42,0.25)'
            }}
            onClick={() => setShowAdd(true)}
          >
            ＋ Record New Expense Entry
          </button>

          {/* Category Breakdown Card */}
          <div className="section-label">EXPENDITURE BY CATEGORY</div>
          <div className="card mb16" style={{ padding: '16px 18px', borderRadius: 20, background: '#fff', border: '1px solid #e2e8f0' }}>
            {Object.entries(bycat).map(([cat, amount], i, arr) => {
              const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
              const accent = CAT_ACCENT[cat] || 'var(--green-600)';

              return (
                <div
                  key={cat}
                  style={{
                    padding: '10px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}
                >
                  <div className="flex fai fjb mb6">
                    <div className="flex fai g10">
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        background: CAT_COLOR[cat] || '#f8fafc',
                        border: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0
                      }}>
                        {CAT_ICON[cat] || '📦'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--char-800)' }}>{cat}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>{pct}% of season total</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--char-800)' }}>
                        ₹{amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Styled Progress Bar */}
                  <div className="progress-bar" style={{ height: 6, background: '#f1f5f9', borderRadius: 99 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: accent,
                        borderRadius: 99
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {Object.keys(bycat).length === 0 && (
              <div className="text-sm text-muted text-center p12">No category expenses recorded yet.</div>
            )}
          </div>

          {/* Category Filter Dropdown & Add Expense Action */}
          <div style={{ position: 'relative', marginBottom: 14, zIndex: 20 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>EXPENSE CATEGORY & LEDGER</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Custom Category Dropdown Popover */}
              <div style={{ position: 'relative', flex: 1 }}>
                <button
                  type="button"
                  onClick={() => setShowCatDropdown(s => !s)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: '#fff',
                    color: 'var(--char-800)',
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <span>{CAT_ICON[catFilter] || '💰'}</span>
                    <span>{catFilter === 'All' ? `All Outlays (${filteredItems.length})` : catFilter}</span>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--muted)', transform: showCatDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    ▼
                  </span>
                </button>

                {showCatDropdown && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setShowCatDropdown(false)} />
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      right: 0,
                      background: '#fff',
                      borderRadius: 16,
                      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                      padding: 6,
                      zIndex: 40,
                      maxHeight: 260,
                      overflowY: 'auto'
                    }}>
                      <div
                        onClick={() => {
                          setCatFilter('All');
                          setShowCatDropdown(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          cursor: 'pointer',
                          background: catFilter === 'All' ? '#f1f5f9' : 'transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>💰</span>
                          <span style={{ fontSize: 13, fontWeight: catFilter === 'All' ? 700 : 500, color: 'var(--char-800)' }}>
                            All Outlays ({items.length})
                          </span>
                        </div>
                        {catFilter === 'All' && <span style={{ color: '#0f172a', fontWeight: 800 }}>✓</span>}
                      </div>

                      {Object.keys(bycat).map(c => {
                        const isSelected = catFilter === c;
                        return (
                          <div
                            key={c}
                            onClick={() => {
                              setCatFilter(c);
                              setShowCatDropdown(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '9px 12px',
                              borderRadius: 10,
                              cursor: 'pointer',
                              background: isSelected ? '#f1f5f9' : 'transparent',
                              transition: 'all 0.12s ease'
                            }}
                            onMouseEnter={e => !isSelected && (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>{CAT_ICON[c] || '📦'}</span>
                              <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: 'var(--char-800)' }}>
                                {c}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>
                                ₹{(bycat[c] || 0).toLocaleString('en-IN')}
                              </span>
                              {isSelected && <span style={{ color: '#0f172a', fontWeight: 800 }}>✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Add Expense Action Button — Slate Theme */}
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                style={{
                  flexShrink: 0,
                  padding: '10px 16px',
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 3px 10px rgba(15,23,42,0.25)'
                }}
              >
                <span>＋</span>
                <span>Record Expense</span>
              </button>
            </div>
          </div>

          {/* Transaction List */}
          {l && (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div className="spinner" style={{ margin: 'auto' }} />
            </div>
          )}

          {!l && filteredItems.map(e => (
            <div
              key={e.id}
              className="card mb10 flex fai g12"
              style={{
                padding: '14px 16px',
                borderRadius: 18,
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: CAT_COLOR[e.category] || '#f8fafc',
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0
              }}>
                {CAT_ICON[e.category] || '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--char-800)' }}>
                  {e.description || e.category}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  <span style={{ color: 'var(--char-600)', fontWeight: 500 }}>{e.category}</span> · 🗓️ {e.date}
                </div>
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#dc2626',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '4px 10px',
                borderRadius: 99,
                flexShrink: 0
              }}>
                -₹{e.amount.toLocaleString('en-IN')}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && !l && (
            <div className="card text-center p20" style={{ borderRadius: 18, background: '#fff' }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>🧾</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--char-700)' }}>No transactions found</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Record an expense to see it in your ledger.</div>
            </div>
          )}

          <div style={{ height: 20 }} />
        </div>

        {/* ── Add Expense Popup Modal ── */}
        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto', borderRadius: 24 }}>
              <div className="flex fai fjb mb16">
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--char-800)' }}>Record Expense</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Add fertilizer, seeds, labour or veterinary costs</div>
                </div>
                <button className="icon-btn" onClick={() => setShowAdd(false)}>✕</button>
              </div>

              <form onSubmit={submit}>
                <div className="form-group mb12">
                  <label className="form-label bold text-xs">Expense Category *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {CATS.map(c => {
                      const sel = form.category === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, category: c }))}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: sel ? '#0f172a' : '#f8fafc',
                            color: sel ? '#fff' : 'var(--char-700)',
                            border: sel ? 'none' : '1px solid rgba(0,0,0,0.08)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {CAT_ICON[c]} {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex g12 mb12">
                  <div className="form-group f1">
                    <label className="form-label bold text-xs">Amount (₹) *</label>
                    <input
                      className="form-input"
                      type="number"
                      step="1"
                      min="1"
                      required
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="e.g. 2500"
                      autoFocus
                      style={{ fontSize: 15, fontWeight: 600 }}
                    />
                  </div>
                  <div className="form-group f1">
                    <label className="form-label bold text-xs">Date *</label>
                    <input
                      className="form-input"
                      type="date"
                      required
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group mb16">
                  <label className="form-label bold text-xs">Description / Items Purchased</label>
                  <input
                    className="form-input"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="e.g. Urea fertilizer 50kg bag, tractor diesel"
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-full btn-pill"
                    disabled={submitting}
                    style={{
                      fontWeight: 600,
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      color: '#fff',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(15,23,42,0.25)'
                    }}
                  >
                    {submitting ? 'Saving…' : '💰 Save Expense Entry'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowAdd(false)}
                  >
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

/* ─── Notifications ────────────────────────────────────────────────────────── */
export function Notifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [l, setL] = useState(true);

  const load = () => notifApi.getAll().then(setNotifs).catch(()=>{}).finally(()=>setL(false));
  useEffect(()=>{ load(); },[]);

  const markRead = async (id) => {
    await notifApi.markRead(id).catch(()=>{});
    setNotifs(n=>n.map(x=>x.id===id?{...x,is_read:true}:x));
  };

  const markAll = async () => {
    await notifApi.markAll().catch(()=>{});
    setNotifs(n=>n.map(x=>({...x,is_read:true})));
  };

  const urgent  = notifs.filter(n=>n.priority==='urgent');
  const action  = notifs.filter(n=>n.priority==='action');
  const info    = notifs.filter(n=>n.priority==='info');
  const unreadCount = notifs.filter(n => !n.is_read).length;

  const renderGroup = (label, items, icon, bg, border) => items.length > 0 && (
    <div style={{ marginBottom: 16 }}>
      <div className="section-label" style={{ marginBottom: 8 }}>{label}</div>
      {items.map(n=>(
        <div key={n.id} className="card mb8" style={{
          opacity: n.is_read ? 0.75 : 1,
          border: n.is_read ? '1px solid #e2e8f0' : border,
          background: n.is_read ? '#fff' : bg,
          borderRadius: 18,
          padding: '14px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          transition: 'all .2s ease',
          cursor: 'pointer'
        }}
          onClick={()=>markRead(n.id)}>
          <div className="flex fai g12">
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
              background: 'rgba(255,255,255,0.85)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: n.is_read ? 700 : 900, color: 'var(--char-800)' }}>{n.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
              <div style={{ fontSize: 10, color: 'var(--char-400)', fontWeight: 700, marginTop: 4 }}>
                🗓️ {n.created_at ? new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
              </div>
            </div>
            {!n.is_read && (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 6px #16a34a' }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#f8fafc' }}>
        {/* Top Header */}
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
            <div style={{ fontSize: 17, fontWeight: 800 }}>Notification Center</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
              {unreadCount > 0 ? `${unreadCount} Unread Alerts` : 'All Alerts Caught Up'}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAll}
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#fff',
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '6px 12px',
                borderRadius: 99,
                cursor: 'pointer'
              }}
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="scroll-area p20">
          {l && <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: 'auto' }} /></div>}
          {!l && notifs.length === 0 && (
            <div className="card text-center p24" style={{ borderRadius: 20, background: '#fff' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔔</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--char-800)' }}>No New Notifications</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                Weather advisories and animal health alerts will appear here.
              </div>
            </div>
          )}
          {renderGroup('🚨 URGENT ADVISORIES', urgent, '🚨', '#fef2f2', '1.5px solid #f87171')}
          {renderGroup('⚠️ ACTION REQUIRED', action, '⚠️', '#fffbeb', '1.5px solid #fde68a')}
          {renderGroup('ℹ️ FARM INFORMATIONAL', info, 'ℹ️', '#f0fdf4', '1.5px solid #86efac')}
          <div style={{ height: 16 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── More / Farm Services & Settings Hub ────────────────────────────────── */
export function More() {
  const navigate = useNavigate();
  const { profile, logout, refreshProfile, refreshWeather } = useApp() || {};
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSchemesModal, setShowSchemesModal] = useState(false);
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [isEditingSoil, setIsEditingSoil] = useState(false);
  const [soilLoading, setSoilLoading] = useState(false);
  const [savingSoil, setSavingSoil] = useState(false);
  const [soilData, setSoilData] = useState(null);
  const [soilForm, setSoilForm] = useState({
    soil_type: 'Clay Loam',
    soil_ph: 6.8,
    n_value: 185,
    p_value: 24,
    k_value: 290,
    organic_carbon: 0.65,
    zinc_ppm: 0.9
  });
  const [showLangModal, setShowLangModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(() => localStorage.getItem('agritech_server_url') || 'http://172.31.96.243:8000');
  const [selectedLang, setSelectedLang] = useState('English');
  const [fields, setFields] = useState([]);
  const [profileForm, setProfileForm] = useState({
    name: '',
    location: '',
    phone: '',
    soil_type: 'Loamy'
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const loadSoil = async () => {
    setSoilLoading(true);
    try {
      const data = await farmApi.getSoil();
      setSoilData(data);
      setSoilForm({
        soil_type: data.soil_type || 'Clay Loam',
        soil_ph: data.soil_ph || 6.8,
        n_value: data.n_value || 185,
        p_value: data.p_value || 24,
        k_value: data.k_value || 290,
        organic_carbon: data.organic_carbon || 0.65,
        zinc_ppm: data.zinc_ppm || 0.9
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSoilLoading(false);
    }
  };

  const handleSaveSoil = async (e) => {
    e.preventDefault();
    setSavingSoil(true);
    try {
      const updated = await farmApi.updateSoil({
        soil_type: soilForm.soil_type,
        soil_ph: parseFloat(soilForm.soil_ph),
        n_value: parseFloat(soilForm.n_value),
        p_value: parseFloat(soilForm.p_value),
        k_value: parseFloat(soilForm.k_value),
        organic_carbon: parseFloat(soilForm.organic_carbon),
        zinc_ppm: parseFloat(soilForm.zinc_ppm)
      });
      setSoilData(updated);
      setIsEditingSoil(false);
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      alert('Could not update soil report: ' + err.message);
    } finally {
      setSavingSoil(false);
    }
  };

  useEffect(() => {
    farmApi.getFields().then(fs => setFields(Array.isArray(fs) ? fs : [])).catch(() => {});
  }, []);

  const currentActiveUser = userStore.getActiveUser();
  const farmer = currentActiveUser ? {
    name: currentActiveUser.name,
    location: currentActiveUser.location,
    phone: currentActiveUser.phone
  } : profile?.farmer;
  const farm   = currentActiveUser ? {
    soil_type: currentActiveUser.soil_type || 'Loamy Soil',
    total_area_acre: currentActiveUser.total_area_acre || 4.0
  } : profile?.farm;

  const totalAcreage = currentActiveUser?.total_area_acre || (fields.length > 0
    ? fields.reduce((sum, f) => sum + (parseFloat(f.area_acre) || 0), 0)
    : (farm?.total_area_acre || 5));

  const handleOpenEdit = () => {
    setProfileForm({
      name: farmer?.name || 'Farmer Name',
      location: farmer?.location || 'Location',
      phone: farmer?.phone || '+91 98765 43210',
      soil_type: farm?.soil_type || 'Loamy Soil'
    });
    setShowEditProfile(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      // 1. Update backend database
      await farmApi.updateProfile({
        farmer_name: profileForm.name,
        location: profileForm.location,
        phone: profileForm.phone,
        soil_type: profileForm.soil_type
      });

      // 2. Persist to active user in userStore (localStorage)
      userStore.updateActiveProfile({
        name: profileForm.name,
        location: profileForm.location,
        phone: profileForm.phone,
        soil_type: profileForm.soil_type
      });

      // 3. Refresh App Context (updates profile & weather for new location)
      if (refreshProfile) await refreshProfile();
      if (refreshWeather) await refreshWeather();

      setShowEditProfile(false);
    } catch (err) {
      alert('Could not update profile: ' + (err.message || 'Error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    if (logout) logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const handleSaveServerUrl = (e) => {
    e.preventDefault();
    const clean = serverUrlInput.trim().replace(/\/+$/, '');
    localStorage.setItem('agritech_server_url', clean);
    setShowServerModal(false);
    window.location.reload();
  };

  const MENU_SECTIONS = [
    {
      title: 'FARM FINANCE & AGRONOMIC SERVICES',
      items: [
        { icon: '💰', label: 'Farm Expense Ledger', sub: 'Production costs, category breakdown & budget', path: '/expenses', grad: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', badge: 'Ledger' },
        { icon: '📜', label: 'Government Subsidies & Schemes', sub: 'PM-KISAN, PMFBY, KCC & subsidy eligibility', action: () => setShowSchemesModal(true), grad: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', badge: 'Active' },
        { icon: '🧪', label: 'Soil Health & Nutrient Report', sub: `NPK analysis, pH ${soilData?.soil_ph || farm?.soil_ph || '6.8'} & fertilizer guidelines`, action: () => { setShowSoilModal(true); loadSoil(); }, grad: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', badge: soilData?.soil_ph_rating || 'Optimal' },
        { icon: '📋', label: 'Farm Activity Audit Trail', sub: 'Chronological events & operation milestones', path: '/history', grad: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' },
      ]
    },
    {
      title: 'PREFERENCES & ASSISTANCE',
      items: [
        { icon: '🌐', label: 'Language / भाषा', sub: `${selectedLang} · Tap to switch language`, action: () => setShowLangModal(true), grad: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', badge: selectedLang },
        { icon: '⚙️', label: 'Backend Server Connection', sub: localStorage.getItem('agritech_server_url') || 'http://172.31.96.243:8000 · Live ML & Database', action: () => setShowServerModal(true), grad: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', badge: 'Connected' },
        { icon: '🔔', label: 'Notification Center', sub: 'Critical weather, crop & livestock alerts', path: '/notifications', grad: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' },
        { icon: '📞', label: 'Kisan Call Center & Help', sub: 'Toll-free 1800-180-1551 & agronomist helpline', action: () => setShowHelpModal(true), grad: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' },
      ]
    }
  ];

  return (
    <div className="app-shell">
      <div className="phone flex fdc" style={{ background: '#f8fafc', position: 'relative' }}>
        
        {/* ── Top Header (Emerald Theme) ── */}
        <div style={{
          background: 'linear-gradient(155deg, #064e3b 0%, #047857 55%, #059669 100%)',
          color: '#fff',
          padding: '16px 20px',
          flexShrink: 0,
          boxShadow: '0 4px 20px rgba(6,78,59,0.25)',
          borderBottom: '1px solid rgba(255,255,255,0.12)'
        }}>
          <div style={{ fontSize: 20.5, fontWeight: 700, letterSpacing: '-0.3px', color: '#fff' }}>
            Farm Services & Settings
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="scroll-area p20" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Farmer Profile Card */}
          <div className="card" style={{
            borderRadius: 20,
            padding: '16px 18px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(6,78,59,0.06)'
          }}>
            <div className="flex fai fjb">
              <div className="flex fai g12">
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  background: '#ecfdf5',
                  border: '1.5px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26
                }}>
                  👨‍🌾
                </div>
                <div>
                  <div className="flex fai g6">
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                      {farmer?.name || 'Ramesh Kumar'}
                    </div>
                    <span style={{
                      background: '#dcfce7',
                      border: '1px solid #86efac',
                      color: '#15803d',
                      padding: '1px 6px',
                      borderRadius: 99,
                      fontSize: 9,
                      fontWeight: 700
                    }}>
                      ✓ Verified
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    📍 {farmer?.location || 'Jodhpur, Rajasthan'} · {totalAcreage} Ac ({farm?.soil_type || 'Loamy'})
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenEdit}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  padding: '6px 12px',
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ✏️ Edit
              </button>
            </div>
          </div>

          {/* Grouped Inset Menu Sections */}
          {MENU_SECTIONS.map(({ title, items }) => (
            <div key={title}>
              <div className="section-label" style={{ marginBottom: 8 }}>{title}</div>
              <div className="card" style={{ padding: '4px', borderRadius: 18, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
                {items.map((item, idx) => (
                  <div key={item.label}>
                    {idx > 0 && <div className="divider" style={{ margin: '0 14px' }} />}
                    <div
                      className="flex fai g12"
                      style={{
                        padding: '13px 14px',
                        cursor: 'pointer',
                        borderRadius: 14,
                        transition: 'all 0.12s ease'
                      }}
                      onClick={() => item.action ? item.action() : navigate(item.path)}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: item.grad,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="flex fai g6">
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                            {item.label}
                          </div>
                          {item.badge && (
                            <span style={{
                              fontSize: 9,
                              fontWeight: 600,
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '1px 6px',
                              borderRadius: 6
                            }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 1, fontWeight: 400 }}>
                          {item.sub}
                        </div>
                      </div>
                      <span style={{ color: '#cbd5e1', fontSize: 16, fontWeight: 600 }}>›</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Sign Out Button */}
          <div style={{ marginTop: 6, marginBottom: 8 }}>
            <button
              className="btn btn-full btn-pill"
              style={{
                padding: '12px 20px',
                fontSize: 13,
                fontWeight: 600,
                background: '#fff',
                color: '#ef4444',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 1px 4px rgba(239,68,68,0.05)'
              }}
              onClick={() => setShowLogoutConfirm(true)}
            >
              <span>🚪</span> Sign Out / Switch Farm
            </button>
          </div>

          <div style={{ textAlign: 'center', paddingBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>AgriTech India • Smart Farming Suite</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>SIH 2026 Innovation · Version 1.0.0</div>
          </div>
        </div>

        <BottomNav />

        {/* ── Edit Profile Modal ── */}
        {showEditProfile && (
          <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ borderRadius: 24 }}>
              <div className="flex fai fjb mb16">
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Edit Farm Profile</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Update farmer registration and soil type</div>
                </div>
                <button className="icon-btn" onClick={() => setShowEditProfile(false)}>✕</button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="form-group mb12">
                  <label className="form-label bold text-xs">Farmer Full Name *</label>
                  <input
                    className="form-input"
                    required
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group mb12">
                  <label className="form-label bold text-xs">Farm Location / District *</label>
                  <input
                    className="form-input"
                    required
                    value={profileForm.location}
                    onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                  />
                </div>

                <div className="form-group mb12">
                  <label className="form-label bold text-xs">Contact Phone</label>
                  <input
                    className="form-input"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group mb16">
                  <label className="form-label bold text-xs">Primary Soil Type</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                    {['Loamy', 'Clay', 'Sandy', 'Black', 'Red'].map(s => {
                      const sel = profileForm.soil_type === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, soil_type: s })}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: sel ? '#0f172a' : '#f8fafc',
                            color: sel ? '#fff' : '#475569',
                            border: sel ? 'none' : '1px solid #e2e8f0'
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-full btn-pill"
                    disabled={savingProfile}
                    style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600,
                      padding: '12px 20px'
                    }}
                  >
                    {savingProfile ? 'Saving…' : 'Save Profile'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowEditProfile(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Government Schemes Modal ── */}
        {showSchemesModal && (
          <div className="modal-overlay" onClick={() => setShowSchemesModal(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto', borderRadius: 24 }}>
              <div className="flex fai fjb mb16">
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Government Schemes & Subsidies</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Active central & state agricultural benefit programs</div>
                </div>
                <button className="icon-btn" onClick={() => setShowSchemesModal(false)}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  {
                    title: 'PM-KISAN Samman Nidhi',
                    benefit: '₹6,000 / year direct income support in 3 equal installments',
                    status: 'Active · Enrolled',
                    statusCls: 'badge-green',
                    tag: 'Direct Income'
                  },
                  {
                    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
                    benefit: 'Comprehensive crop insurance coverage against natural calamity yield loss',
                    status: 'Kharif 2026 Eligible',
                    statusCls: 'badge-blue',
                    tag: 'Crop Insurance'
                  },
                  {
                    title: 'Kisan Credit Card (KCC)',
                    benefit: 'Concessional institutional credit at 4% interest subvention rate',
                    status: 'Available',
                    statusCls: 'badge-amber',
                    tag: 'Credit / Loan'
                  },
                  {
                    title: 'Micro Irrigation Subsidy (PMKSY)',
                    benefit: 'Up to 55% subsidy on Drip & Sprinkler irrigation installation',
                    status: 'Application Open',
                    statusCls: 'badge-green',
                    tag: 'Irrigation'
                  }
                ].map(sch => (
                  <div key={sch.title} className="card" style={{ padding: '14px 16px', borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="flex fai fjb">
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{sch.title}</div>
                      <span className={`badge ${sch.statusCls}`} style={{ fontSize: 10, borderRadius: 99 }}>{sch.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 4, lineHeight: 1.4 }}>{sch.benefit}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-full btn-pill mt16"
                onClick={() => setShowSchemesModal(false)}
                style={{ background: '#0f172a', color: '#fff', padding: '12px 20px', border: 'none', fontWeight: 600 }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ── Soil Health Card Modal (Editable) ── */}
        {showSoilModal && (
          <div className="modal-overlay" onClick={() => { setShowSoilModal(false); setIsEditingSoil(false); }}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxHeight: '88vh', overflowY: 'auto', borderRadius: 24, padding: '20px 22px' }}>
              <div className="flex fai fjb mb14">
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>🧪 Soil Health Report Card</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    {isEditingSoil ? 'Edit soil laboratory metrics & NPK levels' : 'Laboratory chemical composition & NPK balance'}
                  </div>
                </div>
                <div className="flex fai g8">
                  <button
                    type="button"
                    onClick={() => setIsEditingSoil(!isEditingSoil)}
                    style={{
                      background: isEditingSoil ? '#f1f5f9' : '#f0fdf4',
                      color: isEditingSoil ? '#475569' : '#15803d',
                      border: `1.5px solid ${isEditingSoil ? '#cbd5e1' : '#86efac'}`,
                      borderRadius: 10,
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isEditingSoil ? 'View Report' : '✏️ Edit Report'}
                  </button>
                  <button className="icon-btn" onClick={() => { setShowSoilModal(false); setIsEditingSoil(false); }}>✕</button>
                </div>
              </div>

              {soilLoading ? (
                <div style={{ textAlign: 'center', padding: 30 }}>
                  <div className="spinner" style={{ margin: 'auto' }} />
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Loading soil laboratory records…</div>
                </div>
              ) : isEditingSoil ? (
                /* ── EDIT MODE FORM ── */
                <form onSubmit={handleSaveSoil}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        SOIL pH (0 - 14) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="3.0"
                        max="10.0"
                        value={soilForm.soil_ph}
                        onChange={e => setSoilForm(f => ({ ...f, soil_ph: e.target.value }))}
                        required
                        style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: 14, fontWeight: 600 }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        ORGANIC CARBON (%)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.1"
                        max="5.0"
                        value={soilForm.organic_carbon}
                        onChange={e => setSoilForm(f => ({ ...f, organic_carbon: e.target.value }))}
                        style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: 14, fontWeight: 600 }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      SOIL TYPE
                    </label>
                    <select
                      value={soilForm.soil_type}
                      onChange={e => setSoilForm(f => ({ ...f, soil_type: e.target.value }))}
                      style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: 13, fontWeight: 600, background: '#f8fafc' }}
                    >
                      <option value="Clay Loam">Clay Loam</option>
                      <option value="Loamy Soil">Loamy Soil</option>
                      <option value="Sandy Loam">Sandy Loam</option>
                      <option value="Black Cotton Soil">Black Cotton Soil</option>
                      <option value="Red Laterite Soil">Red Laterite Soil</option>
                      <option value="Alluvial Clay">Alluvial Clay</option>
                      <option value="Heavy Clay">Heavy Clay</option>
                    </select>
                  </div>

                  {/* NPK Values Grid */}
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                      PRIMARY & SECONDARY NUTRIENTS
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>
                          Nitrogen (N) kg/ha
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={soilForm.n_value}
                          onChange={e => setSoilForm(f => ({ ...f, n_value: e.target.value }))}
                          required
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, fontWeight: 600 }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>
                          Phosphorus (P) kg/ha
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={soilForm.p_value}
                          onChange={e => setSoilForm(f => ({ ...f, p_value: e.target.value }))}
                          required
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, fontWeight: 600 }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>
                          Potassium (K) kg/ha
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={soilForm.k_value}
                          onChange={e => setSoilForm(f => ({ ...f, k_value: e.target.value }))}
                          required
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, fontWeight: 600 }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>
                          Zinc (Zn) ppm
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={soilForm.zinc_ppm}
                          onChange={e => setSoilForm(f => ({ ...f, zinc_ppm: e.target.value }))}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13, fontWeight: 600 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="submit"
                      disabled={savingSoil}
                      className="btn btn-full btn-pill"
                      style={{
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: '#fff', padding: '12px 18px', border: 'none', fontWeight: 700, flex: 2
                      }}
                    >
                      {savingSoil ? 'Saving…' : '💾 Save Soil Report'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingSoil(false)}
                      className="btn btn-ghost"
                      style={{ flex: 1, borderRadius: 999 }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* ── VIEW MODE ── */
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <div style={{
                      background: (soilData?.soil_ph || 6.8) >= 6 && (soilData?.soil_ph || 6.8) <= 7.5 ? '#f0fdf4' : '#fffbeb',
                      padding: '12px', borderRadius: 14,
                      border: `1px solid ${(soilData?.soil_ph || 6.8) >= 6 && (soilData?.soil_ph || 6.8) <= 7.5 ? '#bbf7d0' : '#fde68a'}`
                    }}>
                      <div style={{ fontSize: 10, color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>SOIL pH RATING</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#15803d', marginTop: 2 }}>
                        {soilData?.soil_ph || soilForm.soil_ph} <span style={{ fontSize: 12, fontWeight: 600 }}>({soilData?.soil_ph_rating || 'Optimal'})</span>
                      </div>
                    </div>

                    <div style={{ background: '#eff6ff', padding: '12px', borderRadius: 14, border: '1px solid #bfdbfe' }}>
                      <div style={{ fontSize: 10, color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>ORGANIC CARBON</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#1d4ed8', marginTop: 2 }}>
                        {soilData?.organic_carbon || soilForm.organic_carbon}% <span style={{ fontSize: 12, fontWeight: 600 }}>(Medium)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
                    Nutrient Assay ({soilData?.soil_type || soilForm.soil_type})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      {
                        nutrient: 'Nitrogen (N)',
                        val: `${soilData?.n_value || soilForm.n_value} kg/ha`,
                        rating: soilData?.n_rating || ((soilForm.n_value >= 200) ? 'Optimal' : 'Low'),
                        color: (soilData?.n_value || soilForm.n_value) < 200 ? '#f59e0b' : '#10b981'
                      },
                      {
                        nutrient: 'Phosphorus (P)',
                        val: `${soilData?.p_value || soilForm.p_value} kg/ha`,
                        rating: soilData?.p_rating || ((soilForm.p_value >= 20) ? 'Optimal' : 'Low'),
                        color: (soilData?.p_value || soilForm.p_value) < 20 ? '#f59e0b' : '#10b981'
                      },
                      {
                        nutrient: 'Potassium (K)',
                        val: `${soilData?.k_value || soilForm.k_value} kg/ha`,
                        rating: soilData?.k_rating || ((soilForm.k_value >= 150) ? 'Optimal' : 'Low'),
                        color: (soilData?.k_value || soilForm.k_value) < 150 ? '#f59e0b' : '#10b981'
                      },
                      {
                        nutrient: 'Zinc (Zn)',
                        val: `${soilData?.zinc_ppm || soilForm.zinc_ppm} ppm`,
                        rating: 'Adequate',
                        color: '#10b981'
                      },
                    ].map(n => (
                      <div key={n.nutrient} className="flex fai fjb" style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{n.nutrient}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{n.val}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: n.color, background: '#fff', border: '1px solid #e2e8f0', padding: '3px 9px', borderRadius: 8 }}>
                          {n.rating}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Fertilizer Advisory */}
                  <div className="alert-box alert-green mt14" style={{ borderRadius: 14, fontSize: 11, lineHeight: 1.4 }}>
                    <span>💡</span>
                    <div>
                      {soilData?.advisory?.length > 0
                        ? soilData.advisory.map((adv, idx) => <div key={idx} style={{ marginBottom: idx < soilData.advisory.length - 1 ? 4 : 0 }}>• {adv}</div>)
                        : 'Maintain balanced basal compost application during seedbed preparation.'}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-full btn-pill mt14"
                    onClick={() => setShowSoilModal(false)}
                    style={{ background: '#0f172a', color: '#fff', padding: '12px 20px', border: 'none', fontWeight: 600 }}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Language Selection Modal ── */}
        {showLangModal && (
          <div className="modal-overlay" onClick={() => setShowLangModal(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ borderRadius: 24 }}>
              <div className="flex fai fjb mb16">
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Select App Language</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Choose your preferred regional language</div>
                </div>
                <button className="icon-btn" onClick={() => setShowLangModal(false)}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { lang: 'English', native: 'English' },
                  { lang: 'Hindi', native: 'हिन्दी' },
                  { lang: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
                  { lang: 'Gujarati', native: 'ગુજરાતી' },
                  { lang: 'Marathi', native: 'मराठी' },
                ].map(l => {
                  const isSel = selectedLang === l.lang;
                  return (
                    <div
                      key={l.lang}
                      onClick={() => {
                        setSelectedLang(l.lang);
                        setShowLangModal(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 14,
                        cursor: 'pointer',
                        background: isSel ? '#f0fdf4' : '#f8fafc',
                        border: isSel ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: isSel ? 700 : 500, color: isSel ? '#15803d' : '#0f172a' }}>
                          {l.native}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{l.lang}</div>
                      </div>
                      {isSel && <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Kisan Helpline Modal ── */}
        {showHelpModal && (
          <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ borderRadius: 24 }}>
              <div className="flex fai fjb mb16">
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Agronomist & Farmer Support</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Govt Kisan Call Center & Agricultural Experts</div>
                </div>
                <button className="icon-btn" onClick={() => setShowHelpModal(false)}>✕</button>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: '16px', textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>📞</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>TOLL-FREE KISAN CALL CENTER</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#15803d', marginTop: 2 }}>1800-180-1551</div>
                <div style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>Operates 6:00 AM to 10:00 PM daily in 22 regional languages</div>
              </div>

              <div className="alert-box alert-blue mb14" style={{ borderRadius: 14, fontSize: 11 }}>
                <span>💬</span>
                <div>For immediate crop pathology guidance, use the <strong>AI Crop Vision Scanner</strong> or consult your local Krishi Vigyan Kendra (KVK).</div>
              </div>

              <button
                type="button"
                className="btn btn-full btn-pill"
                onClick={() => setShowHelpModal(false)}
                style={{ background: '#0f172a', color: '#fff', padding: '12px 20px', border: 'none', fontWeight: 600 }}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ── Logout Confirmation Modal ── */}
        {showLogoutConfirm && (
          <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ borderRadius: 24 }}>
              <div style={{ textAlign: 'center', padding: '10px 0 16px' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🚪</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Sign Out from AgriTech?</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  You will need to re-verify your farm profile upon signing in again.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-full btn-pill"
                  style={{ background: '#ef4444', color: '#fff', border: 'none', fontWeight: 600, padding: '12px 20px' }}
                  onClick={handleLogout}
                >
                  Yes, Sign Out
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Backend Server Endpoint Modal ── */}
        {showServerModal && (
          <div className="modal-overlay" onClick={() => setShowServerModal(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ borderRadius: 24, maxWidth: 440 }}>
              <div className="flex fai fjb mb16">
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>⚙️ Backend Server Link</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    Connect your mobile app to your laptop or cloud API
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowServerModal(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: 99, width: 32, height: 32, cursor: 'pointer', fontSize: 14 }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveServerUrl}>
                <div className="form-group mb16">
                  <label className="form-label bold text-xs">FastAPI Server URL</label>
                  <input
                    className="form-input"
                    type="url"
                    required
                    value={serverUrlInput}
                    onChange={e => setServerUrlInput(e.target.value)}
                    placeholder="http://172.31.96.243:8000"
                    style={{ fontSize: 13, fontFamily: 'monospace' }}
                  />
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, lineHeight: 1.4 }}>
                    💡 <strong>Local Wi-Fi:</strong> <code>http://172.31.96.243:8000</code><br/>
                    ☁️ <strong>Cloud Host:</strong> <code>https://agritech-api.onrender.com</code>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-full btn-pill"
                    style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', fontWeight: 600, padding: '12px 20px' }}
                  >
                    Save & Reconnect
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setServerUrlInput('http://172.31.96.243:8000');
                      localStorage.removeItem('agritech_server_url');
                      setShowServerModal(false);
                      window.location.reload();
                    }}
                  >
                    Reset
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
