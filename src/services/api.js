import { generateClientAiResponse } from './clientAi.js';
import { defaultVolunteersByEvent } from '../data/volunteersData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// On HTTPS deployments (like GitHub Pages), HTTP localhost backend cannot be reached (Mixed Content blocked)
const isHttpsWithHttpBackend =
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:' &&
  API_BASE_URL.startsWith('http://');

/**
 * Helper to handle fetch responses and errors
 */
async function request(endpoint, options = {}) {
  // If running on HTTPS with HTTP backend, fail immediately so offline fallbacks take over without 30s timeout
  if (isHttpsWithHttpBackend) {
    throw new Error('Backend server is offline or unreachable on HTTPS deployment.');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('clubops_auth_token') : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    signal: controller ? controller.signal : undefined,
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (timeoutId) clearTimeout(timeoutId);
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    
    return data;
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
    throw err;
  }
}

// ─── localStorage helpers ──────────────────────────────────────────────────

function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function lsGetObj(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}

function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

// ─── Events ───────────────────────────────────────────────────────────────

/**
 * Get all events
 */
export async function getEvents() {
  try {
    return await request('/events');
  } catch {
    const cached = lsGet('clubops_events_cache');
    if (cached.length > 0) return { success: true, data: cached };
    return { success: true, data: [] };
  }
}

/**
 * Get single event by ID
 */
export async function getEvent(id) {
  try {
    return await request(`/events/${id}`);
  } catch {
    const cached = lsGet('clubops_events_cache');
    const found = cached.find((e) => (e._id || e.id) === id);
    if (found) return { success: true, data: found };
    return { success: false, message: 'Event not found' };
  }
}

/**
 * Create a new event
 */
export async function createEvent(eventData) {
  try {
    return await request('/events', { method: 'POST', body: JSON.stringify(eventData) });
  } catch {
    const newEvent = {
      _id: genId('evt'),
      id: genId('evt'),
      ...eventData,
      createdAt: new Date().toISOString(),
    };
    const cached = lsGet('clubops_events_cache');
    cached.unshift(newEvent);
    lsSet('clubops_events_cache', cached);
    return { success: true, data: newEvent };
  }
}

/**
 * Update an existing event by ID
 */
export async function updateEvent(id, eventData) {
  try {
    return await request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(eventData) });
  } catch {
    const cached = lsGet('clubops_events_cache');
    const updated = cached.map((e) => ((e._id || e.id) === id ? { ...e, ...eventData } : e));
    lsSet('clubops_events_cache', updated);
    const found = updated.find((e) => (e._id || e.id) === id);
    return { success: true, data: found };
  }
}

/**
 * Delete an event by ID
 */
export async function deleteEvent(id) {
  try {
    return await request(`/events/${id}`, { method: 'DELETE' });
  } catch {
    const cached = lsGet('clubops_events_cache');
    lsSet('clubops_events_cache', cached.filter((e) => (e._id || e.id) !== id));
    return { success: true };
  }
}

// ─── Tasks ────────────────────────────────────────────────────────────────

export async function getTasksByEvent(eventId) {
  try {
    return await request(`/events/${eventId}/tasks`);
  } catch {
    return { success: true, data: lsGet(`clubops_tasks_${eventId}`) };
  }
}

export async function createTask(eventId, taskData) {
  try {
    return await request(`/events/${eventId}/tasks`, { method: 'POST', body: JSON.stringify(taskData) });
  } catch {
    const newTask = { _id: genId('task'), id: genId('task'), eventId, ...taskData, createdAt: new Date().toISOString() };
    const cached = lsGet(`clubops_tasks_${eventId}`);
    cached.push(newTask);
    lsSet(`clubops_tasks_${eventId}`, cached);
    return { success: true, data: newTask };
  }
}

export async function updateTask(taskId, taskData) {
  try {
    return await request(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(taskData) });
  } catch {
    // Update across all event task lists
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('clubops_tasks_')) {
        const tasks = lsGet(key);
        const updated = tasks.map((t) => ((t._id || t.id) === taskId ? { ...t, ...taskData } : t));
        if (updated.some((t) => (t._id || t.id) === taskId)) {
          lsSet(key, updated);
          const found = updated.find((t) => (t._id || t.id) === taskId);
          return { success: true, data: found };
        }
      }
    }
    return { success: true };
  }
}

export async function deleteTask(taskId) {
  try {
    return await request(`/tasks/${taskId}`, { method: 'DELETE' });
  } catch {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('clubops_tasks_')) {
        const tasks = lsGet(key);
        const filtered = tasks.filter((t) => (t._id || t.id) !== taskId);
        if (filtered.length !== tasks.length) {
          lsSet(key, filtered);
          break;
        }
      }
    }
    return { success: true };
  }
}

// ─── Meetings ─────────────────────────────────────────────────────────────

export async function getMeetingsByEvent(eventId) {
  try {
    return await request(`/events/${eventId}/meetings`);
  } catch {
    return { success: true, data: lsGet(`clubops_meetings_${eventId}`) };
  }
}

export async function getMeeting(meetingId) {
  try {
    return await request(`/meetings/${meetingId}`);
  } catch {
    return { success: false };
  }
}

export async function createMeeting(eventId, meetingData) {
  try {
    return await request(`/events/${eventId}/meetings`, { method: 'POST', body: JSON.stringify(meetingData) });
  } catch {
    const newMeeting = {
      _id: genId('meet'),
      id: genId('meet'),
      eventId,
      ...meetingData,
      createdAt: new Date().toISOString(),
    };
    const cached = lsGet(`clubops_meetings_${eventId}`);
    cached.unshift(newMeeting);
    lsSet(`clubops_meetings_${eventId}`, cached);
    return { success: true, data: newMeeting };
  }
}

export async function updateMeeting(meetingId, meetingData) {
  try {
    return await request(`/meetings/${meetingId}`, { method: 'PUT', body: JSON.stringify(meetingData) });
  } catch {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('clubops_meetings_')) {
        const meetings = lsGet(key);
        const updated = meetings.map((m) =>
          (m._id || m.id) === meetingId ? { ...m, ...meetingData } : m
        );
        if (updated.some((m) => (m._id || m.id) === meetingId)) {
          lsSet(key, updated);
          const found = updated.find((m) => (m._id || m.id) === meetingId);
          return { success: true, data: found };
        }
      }
    }
    return { success: true };
  }
}

export async function deleteMeeting(meetingId) {
  try {
    return await request(`/meetings/${meetingId}`, { method: 'DELETE' });
  } catch {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('clubops_meetings_')) {
        const meetings = lsGet(key);
        const filtered = meetings.filter((m) => (m._id || m.id) !== meetingId);
        if (filtered.length !== meetings.length) {
          lsSet(key, filtered);
          break;
        }
      }
    }
    return { success: true };
  }
}

// ─── AI ──────────────────────────────────────────────────────────────────

/**
 * Send message to ClubOps AI copilot
 */
export async function sendAiMessage(message, eventId, history = []) {
  try {
    const res = await request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, eventId, history }),
    });
    if (res && res.success) return res;
    throw new Error(res?.message || 'Invalid AI response');
  } catch (err) {
    console.warn('[AI Service] Backend offline, using client AI fallback:', err.message);
    return await generateClientAiResponse(message, eventId, history);
  }
}

/**
 * Get AI service configuration status
 */
export async function getAiStatus() {
  try {
    return await request('/ai/status');
  } catch {
    return { success: true, configured: true };
  }
}

// ─── Volunteers ───────────────────────────────────────────────────────────

export async function getVolunteersByEvent(eventId) {
  try {
    return await request(`/events/${eventId}/volunteers`);
  } catch {
    const cached = lsGet(`clubops_volunteers_${eventId}`);
    if (cached.length > 0) return { success: true, data: cached };
    // Use default volunteers for that event, or empty array
    const defs = defaultVolunteersByEvent[eventId] || [];
    return { success: true, data: defs };
  }
}

export async function getVolunteer(id) {
  try {
    return await request(`/volunteers/${id}`);
  } catch {
    return { success: false };
  }
}

export async function createVolunteer(eventId, volunteerData) {
  try {
    return await request(`/events/${eventId}/volunteers`, { method: 'POST', body: JSON.stringify(volunteerData) });
  } catch {
    const newVol = {
      _id: genId('vol'),
      id: genId('vol'),
      eventId,
      ...volunteerData,
      createdAt: new Date().toISOString(),
    };
    const cached = lsGet(`clubops_volunteers_${eventId}`);
    cached.push(newVol);
    lsSet(`clubops_volunteers_${eventId}`, cached);
    return { success: true, data: newVol };
  }
}

export async function updateVolunteer(id, volunteerData) {
  try {
    return await request(`/volunteers/${id}`, { method: 'PUT', body: JSON.stringify(volunteerData) });
  } catch {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('clubops_volunteers_')) {
        const vols = lsGet(key);
        const updated = vols.map((v) => ((v._id || v.id) === id ? { ...v, ...volunteerData } : v));
        if (updated.some((v) => (v._id || v.id) === id)) {
          lsSet(key, updated);
          const found = updated.find((v) => (v._id || v.id) === id);
          return { success: true, data: found };
        }
      }
    }
    return { success: true };
  }
}

export async function deleteVolunteer(id) {
  try {
    return await request(`/volunteers/${id}`, { method: 'DELETE' });
  } catch {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('clubops_volunteers_')) {
        const vols = lsGet(key);
        const filtered = vols.filter((v) => (v._id || v.id) !== id);
        if (filtered.length !== vols.length) {
          lsSet(key, filtered);
          break;
        }
      }
    }
    return { success: true };
  }
}

// ─── Documents ────────────────────────────────────────────────────────────

export async function getDocumentsByEvent(eventId) {
  try {
    return await request(`/events/${eventId}/documents`);
  } catch {
    return { success: true, data: lsGet(`clubops_documents_${eventId}`) };
  }
}

export async function getDocument(id) {
  try {
    return await request(`/documents/${id}`);
  } catch {
    return { success: false };
  }
}

export async function createDocument(eventId, docData) {
  try {
    return await request(`/events/${eventId}/documents`, { method: 'POST', body: JSON.stringify(docData) });
  } catch {
    const newDoc = {
      _id: genId('doc'),
      id: genId('doc'),
      eventId,
      ...docData,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const cached = lsGet(`clubops_documents_${eventId}`);
    cached.unshift(newDoc);
    lsSet(`clubops_documents_${eventId}`, cached);
    return { success: true, data: newDoc };
  }
}

export async function updateDocument(id, docData) {
  try {
    return await request(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(docData) });
  } catch {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('clubops_documents_')) {
        const docs = lsGet(key);
        const updated = docs.map((d) => ((d._id || d.id) === id ? { ...d, ...docData } : d));
        if (updated.some((d) => (d._id || d.id) === id)) {
          lsSet(key, updated);
          return { success: true, data: updated.find((d) => (d._id || d.id) === id) };
        }
      }
    }
    return { success: true };
  }
}

export async function deleteDocument(id) {
  try {
    return await request(`/documents/${id}`, { method: 'DELETE' });
  } catch {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('clubops_documents_')) {
        const docs = lsGet(key);
        const filtered = docs.filter((d) => (d._id || d.id) !== id);
        if (filtered.length !== docs.length) {
          lsSet(key, filtered);
          break;
        }
      }
    }
    return { success: true };
  }
}

// ─── Risks ────────────────────────────────────────────────────────────────

export async function getRisksByEvent(eventId) {
  try {
    return await request(`/events/${eventId}/risks`);
  } catch {
    return { success: true, data: lsGet(`clubops_risks_${eventId}`) };
  }
}

export async function getRisk(id) {
  try {
    return await request(`/risks/${id}`);
  } catch {
    return { success: false };
  }
}

export async function createRisk(eventId, riskData) {
  try {
    return await request(`/events/${eventId}/risks`, { method: 'POST', body: JSON.stringify(riskData) });
  } catch {
    const newRisk = {
      _id: genId('risk'),
      id: genId('risk'),
      eventId,
      ...riskData,
      createdAt: new Date().toISOString(),
    };
    const cached = lsGet(`clubops_risks_${eventId}`);
    cached.unshift(newRisk);
    lsSet(`clubops_risks_${eventId}`, cached);
    return { success: true, data: newRisk };
  }
}

export async function updateRisk(id, riskData) {
  try {
    return await request(`/risks/${id}`, { method: 'PUT', body: JSON.stringify(riskData) });
  } catch {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('clubops_risks_')) {
        const risks = lsGet(key);
        const updated = risks.map((r) => ((r._id || r.id) === id ? { ...r, ...riskData } : r));
        if (updated.some((r) => (r._id || r.id) === id)) {
          lsSet(key, updated);
          return { success: true, data: updated.find((r) => (r._id || r.id) === id) };
        }
      }
    }
    return { success: true };
  }
}

export async function deleteRisk(id) {
  try {
    return await request(`/risks/${id}`, { method: 'DELETE' });
  } catch {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('clubops_risks_')) {
        const risks = lsGet(key);
        const filtered = risks.filter((r) => (r._id || r.id) !== id);
        if (filtered.length !== risks.length) {
          lsSet(key, filtered);
          break;
        }
      }
    }
    return { success: true };
  }
}

// ─── Announcements ────────────────────────────────────────────────────────

export async function getAnnouncementsByEvent(eventId) {
  try {
    return await request(`/events/${eventId}/announcements`);
  } catch {
    return { success: true, data: lsGet(`clubops_announcements_${eventId}`) };
  }
}

export async function getAnnouncement(id) {
  try {
    return await request(`/announcements/${id}`);
  } catch {
    return { success: false };
  }
}

export async function createAnnouncement(eventId, announcementData) {
  try {
    return await request(`/events/${eventId}/announcements`, { method: 'POST', body: JSON.stringify(announcementData) });
  } catch {
    const newAnn = {
      _id: genId('ann'),
      id: genId('ann'),
      eventId,
      ...announcementData,
      postedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const cached = lsGet(`clubops_announcements_${eventId}`);
    cached.unshift(newAnn);
    lsSet(`clubops_announcements_${eventId}`, cached);
    return { success: true, data: newAnn };
  }
}

export async function updateAnnouncement(id, announcementData) {
  try {
    return await request(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(announcementData) });
  } catch {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('clubops_announcements_')) {
        const anns = lsGet(key);
        const updated = anns.map((a) => ((a._id || a.id) === id ? { ...a, ...announcementData } : a));
        if (updated.some((a) => (a._id || a.id) === id)) {
          lsSet(key, updated);
          return { success: true, data: updated.find((a) => (a._id || a.id) === id) };
        }
      }
    }
    return { success: true };
  }
}

export async function deleteAnnouncement(id) {
  try {
    return await request(`/announcements/${id}`, { method: 'DELETE' });
  } catch {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('clubops_announcements_')) {
        const anns = lsGet(key);
        const filtered = anns.filter((a) => (a._id || a.id) !== id);
        if (filtered.length !== anns.length) {
          lsSet(key, filtered);
          break;
        }
      }
    }
    return { success: true };
  }
}

// ─── Users ────────────────────────────────────────────────────────────────

export async function getUsers() {
  try { return await request('/users'); } catch { return { success: true, data: [] }; }
}

export async function getUser(id) {
  try { return await request(`/users/${id}`); } catch { return { success: false }; }
}

export async function createUser(userData) {
  return request('/users', { method: 'POST', body: JSON.stringify(userData) });
}

// ─── Authentication ───────────────────────────────────────────────────────

export async function registerUser(credentials) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(credentials) });
}

export async function loginUser(credentials) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
}

export async function getCurrentUser() {
  return request('/auth/me');
}

export async function googleAuthUser(payload = {}) {
  return request('/auth/google', { method: 'POST', body: JSON.stringify(payload) });
}

// ─── AI Action Execution ──────────────────────────────────────────────────

export async function executeAiAction(actionData) {
  try {
    return await request('/ai/execute-action', { method: 'POST', body: JSON.stringify(actionData) });
  } catch {
    const { type, payload = {}, eventId } = actionData;
    const localKey = type === 'CREATE_TASK' ? 'clubops_local_tasks'
                   : type === 'CREATE_RISK' ? 'clubops_local_risks'
                   : type === 'CREATE_MEETING' ? 'clubops_local_meetings'
                   : 'clubops_local_actions';
    const existing = lsGet(localKey);
    const newRecord = { ...payload, _id: genId('local'), id: genId('local'), eventId, createdAt: new Date().toISOString() };
    existing.push(newRecord);
    lsSet(localKey, existing);
    return { success: true, message: 'Action confirmed and saved.', data: newRecord };
  }
}
