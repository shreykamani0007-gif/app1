const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to handle fetch responses and errors
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    
    return data;
  } catch (err) {
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
  return request('/events');
}

/**
 * Get single event by ID
 */
export async function getEvent(id) {
  return request(`/events/${id}`);
}

/**
 * Create a new event
 */
export async function createEvent(eventData) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
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
  return request(`/events/${eventId}/tasks`);
}

/**
 * Create a new task belonging to an event
 */
export async function createTask(eventId, taskData) {
  return request(`/events/${eventId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
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
  return request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, eventId, history }),
  });
}

/**
 * Get AI service configuration status
 */
export async function getAiStatus() {
  return request('/ai/status');
}

/**
 * Volunteers API
 */
export async function getVolunteersByEvent(eventId) {
  return request(`/events/${eventId}/volunteers`);
}

export async function getVolunteer(id) {
  return request(`/volunteers/${id}`);
}

export async function createVolunteer(eventId, volunteerData) {
  return request(`/events/${eventId}/volunteers`, {
    method: 'POST',
    body: JSON.stringify(volunteerData),
  });
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
  return request(`/events/${eventId}/risks`);
}

export async function getRisk(id) {
  return request(`/risks/${id}`);
}

export async function createRisk(eventId, riskData) {
  return request(`/events/${eventId}/risks`, {
    method: 'POST',
    body: JSON.stringify(riskData),
  });
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


