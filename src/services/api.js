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

/**
 * Health check endpoint
 */
export async function checkHealth() {
  return request('/health');
}

/**
 * Get all events
 */
export async function getEvents() {
  try {
    return await request('/events');
  } catch (err) {
    try {
      const cached = JSON.parse(localStorage.getItem('clubops_events_cache') || '[]');
      if (cached.length > 0) return { success: true, data: cached };
    } catch {}
    return { success: true, data: [] };
  }
}

/**
 * Get single event by ID
 */
export async function getEvent(id) {
  try {
    return await request(`/events/${id}`);
  } catch (err) {
    try {
      const cached = JSON.parse(localStorage.getItem('clubops_events_cache') || '[]');
      const found = cached.find((e) => (e._id || e.id) === id);
      if (found) return { success: true, data: found };
    } catch {}
    throw err;
  }
}

/**
 * Create a new event
 */
export async function createEvent(eventData) {
  try {
    return await request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  } catch (err) {
    console.warn('[API] createEvent offline fallback:', err.message);
    const newEvent = {
      _id: 'evt_' + Date.now(),
      id: 'evt_' + Date.now(),
      ...eventData,
      createdAt: new Date().toISOString(),
    };
    try {
      const cached = JSON.parse(localStorage.getItem('clubops_events_cache') || '[]');
      cached.unshift(newEvent);
      localStorage.setItem('clubops_events_cache', JSON.stringify(cached));
    } catch {}
    return { success: true, data: newEvent };
  }
}

/**
 * Update an existing event by ID
 */
export async function updateEvent(id, eventData) {
  return request(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  });
}

/**
 * Delete an event by ID
 */
export async function deleteEvent(id) {
  return request(`/events/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get all tasks belonging to an event
 */
export async function getTasksByEvent(eventId) {
  try {
    return await request(`/events/${eventId}/tasks`);
  } catch (err) {
    try {
      const cached = JSON.parse(localStorage.getItem(`clubops_tasks_${eventId}`) || '[]');
      return { success: true, data: cached };
    } catch {}
    return { success: true, data: [] };
  }
}

/**
 * Create a new task belonging to an event
 */
export async function createTask(eventId, taskData) {
  try {
    return await request(`/events/${eventId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  } catch (err) {
    console.warn('[API] createTask offline fallback:', err.message);
    const newTask = {
      _id: 'task_' + Date.now() + Math.random().toString(36).substr(2, 4),
      id: 'task_' + Date.now() + Math.random().toString(36).substr(2, 4),
      eventId,
      ...taskData,
      createdAt: new Date().toISOString(),
    };
    try {
      const cached = JSON.parse(localStorage.getItem(`clubops_tasks_${eventId}`) || '[]');
      cached.push(newTask);
      localStorage.setItem(`clubops_tasks_${eventId}`, JSON.stringify(cached));
    } catch {}
    return { success: true, data: newTask };
  }
}

/**
 * Update a task by ID
 */
export async function updateTask(taskId, taskData) {
  return request(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
}

/**
 * Delete a task by ID
 */
export async function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

/**
 * Get all meetings belonging to an event
 */
export async function getMeetingsByEvent(eventId) {
  return request(`/events/${eventId}/meetings`);
}

/**
 * Get single meeting by ID
 */
export async function getMeeting(meetingId) {
  return request(`/meetings/${meetingId}`);
}

/**
 * Create a new meeting for an event
 */
export async function createMeeting(eventId, meetingData) {
  return request(`/events/${eventId}/meetings`, {
    method: 'POST',
    body: JSON.stringify(meetingData),
  });
}

/**
 * Update a meeting by ID
 */
export async function updateMeeting(meetingId, meetingData) {
  return request(`/meetings/${meetingId}`, {
    method: 'PUT',
    body: JSON.stringify(meetingData),
  });
}

/**
 * Delete a meeting by ID
 */
export async function deleteMeeting(meetingId) {
  return request(`/meetings/${meetingId}`, {
    method: 'DELETE',
  });
}

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

/**
 * Volunteers API
 */
export async function getVolunteersByEvent(eventId) {
  try {
    return await request(`/events/${eventId}/volunteers`);
  } catch (err) {
    try {
      const cached = JSON.parse(localStorage.getItem(`clubops_volunteers_${eventId}`) || '[]');
      if (cached.length > 0) return { success: true, data: cached };
    } catch {}
    const defs = defaultVolunteersByEvent[eventId] || defaultVolunteersByEvent['evt_innovatex_2026'] || [];
    return { success: true, data: defs };
  }
}

export async function getVolunteer(id) {
  return request(`/volunteers/${id}`);
}

export async function createVolunteer(eventId, volunteerData) {
  try {
    return await request(`/events/${eventId}/volunteers`, {
      method: 'POST',
      body: JSON.stringify(volunteerData),
    });
  } catch (err) {
    console.warn('[API] createVolunteer offline fallback:', err.message);
    const newVol = {
      _id: 'vol_' + Date.now() + Math.random().toString(36).substr(2, 4),
      id: 'vol_' + Date.now() + Math.random().toString(36).substr(2, 4),
      eventId,
      ...volunteerData,
      createdAt: new Date().toISOString(),
    };
    try {
      const cached = JSON.parse(localStorage.getItem(`clubops_volunteers_${eventId}`) || '[]');
      cached.push(newVol);
      localStorage.setItem(`clubops_volunteers_${eventId}`, JSON.stringify(cached));
    } catch {}
    return { success: true, data: newVol };
  }
}

export async function updateVolunteer(id, volunteerData) {
  return request(`/volunteers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(volunteerData),
  });
}

export async function deleteVolunteer(id) {
  return request(`/volunteers/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Documents API
 */
export async function getDocumentsByEvent(eventId) {
  return request(`/events/${eventId}/documents`);
}

export async function getDocument(id) {
  return request(`/documents/${id}`);
}

export async function createDocument(eventId, docData) {
  return request(`/events/${eventId}/documents`, {
    method: 'POST',
    body: JSON.stringify(docData),
  });
}

export async function updateDocument(id, docData) {
  return request(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(docData),
  });
}

export async function deleteDocument(id) {
  return request(`/documents/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Risks API
 */
export async function getRisksByEvent(eventId) {
  try {
    return await request(`/events/${eventId}/risks`);
  } catch (err) {
    try {
      const cached = JSON.parse(localStorage.getItem(`clubops_risks_${eventId}`) || '[]');
      return { success: true, data: cached };
    } catch {}
    return { success: true, data: [] };
  }
}

export async function getRisk(id) {
  return request(`/risks/${id}`);
}

export async function createRisk(eventId, riskData) {
  try {
    return await request(`/events/${eventId}/risks`, {
      method: 'POST',
      body: JSON.stringify(riskData),
    });
  } catch (err) {
    console.warn('[API] createRisk offline fallback:', err.message);
    const newRisk = {
      _id: 'risk_' + Date.now() + Math.random().toString(36).substr(2, 4),
      id: 'risk_' + Date.now() + Math.random().toString(36).substr(2, 4),
      eventId,
      ...riskData,
      createdAt: new Date().toISOString(),
    };
    try {
      const cached = JSON.parse(localStorage.getItem(`clubops_risks_${eventId}`) || '[]');
      cached.push(newRisk);
      localStorage.setItem(`clubops_risks_${eventId}`, JSON.stringify(cached));
    } catch {}
    return { success: true, data: newRisk };
  }
}

export async function updateRisk(id, riskData) {
  return request(`/risks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(riskData),
  });
}

export async function deleteRisk(id) {
  return request(`/risks/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Announcements API
 */
export async function getAnnouncementsByEvent(eventId) {
  return request(`/events/${eventId}/announcements`);
}

export async function getAnnouncement(id) {
  return request(`/announcements/${id}`);
}

export async function createAnnouncement(eventId, announcementData) {
  return request(`/events/${eventId}/announcements`, {
    method: 'POST',
    body: JSON.stringify(announcementData),
  });
}

export async function updateAnnouncement(id, announcementData) {
  return request(`/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(announcementData),
  });
}

export async function deleteAnnouncement(id) {
  return request(`/announcements/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Users API
 */
export async function getUsers() {
  return request('/users');
}

export async function getUser(id) {
  return request(`/users/${id}`);
}

export async function createUser(userData) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * Authentication API
 */
export async function registerUser(credentials) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function loginUser(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
export async function getCurrentUser() {
  return request('/auth/me');
}

export async function googleAuthUser(payload = {}) {
  return request('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * AI Action Execution API
 */
export async function executeAiAction(actionData) {
  try {
    return await request('/ai/execute-action', {
      method: 'POST',
      body: JSON.stringify(actionData),
    });
  } catch (err) {
    console.warn('[AI Action] Backend unreachable, saving locally:', err.message);
    const { type, payload = {}, eventId } = actionData;
    const localKey = type === 'CREATE_TASK' ? 'clubops_local_tasks'
                   : type === 'CREATE_RISK' ? 'clubops_local_risks'
                   : type === 'CREATE_MEETING' ? 'clubops_local_meetings'
                   : 'clubops_local_actions';
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    const newRecord = { ...payload, _id: `local_${Date.now()}`, id: `local_${Date.now()}`, eventId, createdAt: new Date().toISOString() };
    existing.push(newRecord);
    localStorage.setItem(localKey, JSON.stringify(existing));
    return { success: true, message: 'Action confirmed and saved.', data: newRecord };
  }
}

