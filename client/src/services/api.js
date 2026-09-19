/**
 * API client service for ClubOps AI backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('[API Service] Backend not reachable yet:', error.message);
    return { status: 'offline', error: error.message };
  }
}
