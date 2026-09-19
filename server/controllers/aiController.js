import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import Event from '../models/Event.js';
import Task from '../models/Task.js';
import Meeting from '../models/Meeting.js';
import { inMemoryEvents } from './eventController.js';
import { inMemoryTasks } from './taskController.js';
import { inMemoryMeetings } from './meetingController.js';
import { defaultVolunteersByEvent } from '../../src/data/volunteersData.js';

/**
 * Helper to fetch event details by ID
 */
async function fetchEvent(eventId) {
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
    try {
      const dbEvent = await Event.findById(eventId);
      if (dbEvent) return dbEvent;
    } catch {
      // Fall through to in-memory
    }
  }

  const memEvent = inMemoryEvents.find((e) => String(e._id) === String(eventId) || e.name === eventId);
  return memEvent || inMemoryEvents[0];
}

/**
 * Helper to fetch tasks for an event
 */
async function fetchTasks(eventId) {
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
    try {
      const dbTasks = await Task.find({ eventId });
      if (dbTasks && dbTasks.length > 0) return dbTasks;
    } catch {
      // Fall through
    }
  }

  return inMemoryTasks.filter((t) => String(t.eventId) === String(eventId));
}

/**
 * Helper to fetch meetings for an event
 */
async function fetchMeetings(eventId) {
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
    try {
      const dbMeetings = await Meeting.find({ eventId });
      if (dbMeetings && dbMeetings.length > 0) return dbMeetings;
    } catch {
      // Fall through
    }
  }

  return inMemoryMeetings.filter((m) => String(m.eventId) === String(eventId));
}

/**
 * Helper to fetch volunteers for an event
 */
function fetchVolunteers(eventId) {
  if (defaultVolunteersByEvent && defaultVolunteersByEvent[eventId]) {
    return defaultVolunteersByEvent[eventId];
  }

  const allKeys = Object.keys(defaultVolunteersByEvent || {});
  if (allKeys.length > 0) {
    return defaultVolunteersByEvent[allKeys[0]] || [];
  }
  return [];
}

/**
 * Assemble balanced system prompt that separates general queries from event operations
 */
function buildSystemPrompt(event, tasks, meetings, volunteers) {
  const taskSummary = tasks.length > 0
    ? tasks.map((t, idx) => 
        `${idx + 1}. [Status: ${t.status || 'To Do'}] [Priority: ${t.priority || 'Medium'}] ${t.title}` +
        ` (Owner: ${t.owner || 'Unassigned'}, Dept: ${t.department || 'General'}, Deadline: ${t.deadline || 'None'}` +
        `${t.dependencies ? `, Dependencies: ${t.dependencies}` : ''})`
      ).join('\n')
    : 'No active tasks logged yet.';

  const meetingSummary = meetings.length > 0
    ? meetings.map((m, idx) => 
        `${idx + 1}. "${m.title}" on ${m.date || 'TBD'} (${m.startTime || ''} - ${m.endTime || ''})` +
        ` | Type: ${m.meetingType || 'In-person'}` +
        `${m.location ? ` | Location: ${m.location}` : ''}` +
        `${m.meetingLink ? ` | Link: ${m.meetingLink}` : ''}` +
        ` | Organizer: ${m.organizer || 'Lead'}` +
        `${m.agenda ? `\n   Agenda: ${m.agenda}` : ''}` +
        `${Array.isArray(m.participants) && m.participants.length > 0 ? `\n   Participants: ${m.participants.map(p => p.name || p).join(', ')}` : ''}`
      ).join('\n')
    : 'No meetings scheduled yet.';

  const volunteerSummary = volunteers.length > 0
    ? volunteers.map((v, idx) => 
        `${idx + 1}. ${v.name} (${v.role || 'Volunteer'}, Team: ${v.team || 'General'}, Shift: ${v.shift || 'Flexible'}, Status: ${v.status || 'Active'})`
      ).join('\n')
    : 'No volunteers rostered yet.';

  return `You are ClubOps AI, a helpful, intelligent AI assistant and collegiate event operations copilot.

CORE BEHAVIOR RULES:
1. Natural Direct Answers:
   - Answer the user's actual question directly, naturally, and accurately.
   - If the user says "Hi", "Hello", or casual greetings, reply politely and concisely (e.g. "Hi! How can I help you today?"). Do NOT dump an unprompted event briefing or mention the event unless asked.
   - If the user asks a general knowledge, programming, technical, or academic question (e.g., "What is artificial intelligence?", "Explain recursion in simple words", "Write a C++ binary search program"), give a standard, complete, and accurate answer like a normal AI assistant. Do NOT force event context into unrelated questions.
2. Event-Related Queries:
   - When the user specifically asks about the club, the event, tasks, deadlines, meetings, volunteers, logistics, announcements, or schedules, use the Active Event Operations Data below to provide concrete, accurate, and tailored answers.
   - Reference real task titles, owners, deadlines, meeting agendas, and volunteer names from the data when relevant.
3. Tone:
   - Clear, concise, helpful, and professional. Use markdown formatting (bullet points, bold text, code blocks) appropriately.

ACTIVE EVENT OPERATIONS DATA (Use ONLY when the user's query relates to club/event operations):
==================================================
Active Event: ${event.name}
Status: ${event.status || 'Planning'}
Scheduled Date: ${event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}
Location: ${event.location || 'Campus Center'}
Description: ${event.description || ''}

TASKS (${tasks.length} total):
${taskSummary}

MEETINGS (${meetings.length} total):
${meetingSummary}

VOLUNTEER ROSTER (${volunteers.length} total):
${volunteerSummary}
==================================================`;
}

/**
 * @desc    Get AI configuration status
 * @route   GET /api/ai/status
 * @access  Public
 */
export const getAiStatus = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = Boolean(apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '');

  return res.status(200).json({
    success: true,
    configured: isConfigured,
  });
};

/**
 * @desc    Process AI chat query with Gemini API
 * @route   POST /api/ai/chat
 * @access  Public
 */
export const handleAiChat = async (req, res) => {
  try {
    const { message, eventId, history } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
      return res.status(503).json({
        success: false,
        configured: false,
        message: 'AI service is not configured. Please configure GEMINI_API_KEY in the backend .env file.',
      });
    }

    // Resolve event details and operational datasets
    const event = await fetchEvent(eventId);
    const resolvedEventId = event._id || eventId;
    const [tasks, meetings] = await Promise.all([
      fetchTasks(resolvedEventId),
      fetchMeetings(resolvedEventId),
    ]);
    const volunteers = fetchVolunteers(resolvedEventId);

    const systemInstruction = buildSystemPrompt(event, tasks, meetings, volunteers);

    const contents = [];
    if (Array.isArray(history)) {
      for (const item of history) {
        if (item.role && item.content) {
          contents.push({
            role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.content }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    // Primary models with fallback candidates across separate quota tiers
    const candidateModels = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.7-flash'];
    let lastError = null;
    let reply = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        reply = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) break;
      } catch (err) {
        lastError = err;
        console.warn(`[Model ${model} Warning]:`, err.message || err);
        const isRetryable = err.message && (
          err.message.includes('404') ||
          err.message.includes('NOT_FOUND') ||
          err.message.includes('503') ||
          err.message.includes('UNAVAILABLE') ||
          err.message.includes('high demand') ||
          err.message.includes('RESOURCE_EXHAUSTED') ||
          err.message.includes('quota')
        );
        if (isRetryable) {
          continue;
        }
        throw err;
      }
    }

    if (!reply) {
      throw lastError || new Error('No response was generated by the AI model.');
    }

    return res.status(200).json({
      success: true,
      configured: true,
      reply,
      event: {
        id: event._id,
        name: event.name,
      },
    });
  } catch (error) {
    console.error('[AI Chat Error]:', error.message || error);
    const errMsg = error.message || '';
    if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
      return res.status(429).json({
        success: false,
        message: 'Gemini free-tier request rate limit reached. Please wait a moment and try again.',
      });
    }
    return res.status(500).json({
      success: false,
      message: errMsg || 'An error occurred while communicating with Gemini API.',
    });
  }
};
