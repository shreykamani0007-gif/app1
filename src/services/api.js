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
