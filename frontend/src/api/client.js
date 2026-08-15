/**
 * API client — thin fetch wrapper with multi-user isolation header (X-User-Id).
 * All React components import from here.
 */
import { userStore } from '../utils/userStore';

const BASE = '/api';

let _isOnline = true;
export const isOnline = () => _isOnline;

window.addEventListener('online',  () => { _isOnline = true; });
window.addEventListener('offline', () => { _isOnline = false; });

async function request(method, path, body, isFormData = false) {
  const opts = { method, headers: {} };
  
  // Attach active authenticated user ID to scope all database operations
  const activeUser = userStore.getActiveUser();
  if (activeUser && activeUser.id) {
    opts.headers['X-User-Id'] = activeUser.id;
  }

  if (body && !isFormData) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (body && isFormData) {
    opts.body = body; // FormData
  }

  try {
    const res = await fetch(`${BASE}${path}`, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (e) {
    if (e instanceof TypeError) {
      _isOnline = false;
      throw new Error('Backend offline — check that the FastAPI server is running.');
    }
    throw e;
  }
}

export const api = {
  get:    (path)          => request('GET',    path),
  post:   (path, body)    => request('POST',   path, body),
  put:    (path, body)    => request('PUT',    path, body),
  delete: (path)          => request('DELETE', path),
  upload: (path, formData)=> request('POST',   path, formData, true),
};

// ── Convenience wrappers ───────────────────────────────────────────────────────
export const farmApi = {
  getProfile:     ()       => api.get('/farm/profile'),
  updateProfile:  (data)   => api.put('/farm/profile', data),
  getSoil:        ()       => api.get('/farm/soil'),
  updateSoil:     (data)   => api.put('/farm/soil', data),
  getFields:      ()       => api.get('/farm/fields'),
  addField:       (data)   => api.post('/farm/fields', data),
  createField:    (data)   => api.post('/farm/fields', data),
  getField:       (id)     => api.get(`/farm/fields/${id}`),
  updateField:    (id,d)   => api.put(`/farm/fields/${id}`, d),
  deleteField:    (id)     => api.delete(`/farm/fields/${id}`),
};

export const cropApi = {
  recommend:      (req)     => api.post('/crops/recommend', req),
  getActivity:    (fieldId) => api.get(`/crops/${fieldId}/activity`),
  activityManual: (req)     => api.post('/crops/activity', req),
  predictDisease: (formData)=> api.upload('/crops/disease/predict', formData),
  getAdvisory:    (disease) => api.get(`/crops/disease/advisory/${encodeURIComponent(disease)}`),
};

export const weatherApi = {
  get:            (city)    => api.get(city ? `/weather?city=${encodeURIComponent(city)}` : '/weather'),
  getAdvisory:    (city)    => api.get(city ? `/weather/advisory?city=${encodeURIComponent(city)}` : '/weather/advisory'),
};

export const livestockApi = {
  getAll:         ()        => api.get('/livestock'),
  add:            (data)    => api.post('/livestock', data),
  getOne:         (id)      => api.get(`/livestock/${id}`),
  assess:         (req)     => api.post('/livestock/assess', req),
  getAdvisory:    (id,dis)  => api.get(`/livestock/${id}/advisory/${encodeURIComponent(dis)}`),
  getVaccinations:()        => api.get('/livestock/vaccinations/all'),
  markVaccineDone:(vacId)   => api.put(`/livestock/vaccinations/${vacId}/done`, {}),
  addVaccination: (anId,d)  => api.post(`/livestock/${anId}/vaccinations`, d),
};

export const expenseApi = {
  getAll:   () => api.get('/expenses'),
  add:      (d)=> api.post('/expenses', d),
};

export const historyApi = {
  getAll:   (entryType) => api.get(entryType ? `/history?entry_type=${entryType}` : '/history'),
  add:      (d)         => api.post('/history', d),
};

export const notifApi = {
  getAll:   ()  => api.get('/notifications'),
  markRead: (id)=> api.post(`/notifications/${id}/read`, {}),
  markAll:  ()  => api.post('/notifications/read-all', {}),
};
