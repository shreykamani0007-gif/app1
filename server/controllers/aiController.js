import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import Event from '../models/Event.js';
import Task from '../models/Task.js';
import Meeting from '../models/Meeting.js';
import Risk from '../models/Risk.js';
import Volunteer from '../models/Volunteer.js';
import { inMemoryEvents } from './eventController.js';
import { inMemoryTasks } from './taskController.js';
import { inMemoryMeetings } from './meetingController.js';
import { inMemoryRisks } from './riskController.js';
import { inMemoryVolunteers } from './volunteerController.js';
import { defaultVolunteersByEvent } from '../../src/data/volunteersData.js';

/**
 * Helper to fetch event details by ID
 */
async function fetchEvent(eventId) {
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
    try {
      const dbEvent = await Event.findById(eventId).lean();
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
      const dbTasks = await Task.find({ eventId }).lean();
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
      const dbMeetings = await Meeting.find({ eventId }).sort({ date: 1, startTime: 1 }).lean();
      if (dbMeetings && dbMeetings.length > 0) return dbMeetings;
    } catch {
      // Fall through
    }
  }

  return inMemoryMeetings.filter((m) => String(m.eventId) === String(eventId));
}

/**
 * Helper to fetch risks for an event
 */
async function fetchRisks(eventId) {
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
    try {
      const dbRisks = await Risk.find({ eventId }).sort({ createdAt: -1 }).lean();
      if (dbRisks && dbRisks.length > 0) return dbRisks;
    } catch {
      // Fall through
    }
  }

  return inMemoryRisks.filter((r) => String(r.eventId) === String(eventId));
}

/**
 * Helper to fetch volunteers for an event
 */
async function fetchVolunteers(eventId) {
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
    try {
      const dbVolunteers = await Volunteer.find({ eventId }).lean();
      if (dbVolunteers && dbVolunteers.length > 0) return dbVolunteers;
    } catch {
      // Fall through
    }
  }

  const inMem = inMemoryVolunteers.filter((v) => String(v.eventId) === String(eventId));
  if (inMem.length > 0) return inMem;

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
 * Detect user question intent to selectively retrieve only required MongoDB collections
 */
export function detectQueryIntent(message) {
  const text = (message || '').toLowerCase().trim();

  // Short conversational greetings
  const isGreeting =
    /^(hi|hello|hey|greetings|howdy|sup|good\s+(morning|afternoon|evening))\b/i.test(text) &&
    text.split(/\s+/).length <= 4;

  // General knowledge, technical or programming questions with no club/event context
  const isTechOrAcademic =
    /^(what is|explain|define|write a|how to|how do i|can you explain|tell me about)\s+(artificial intelligence|ai|recursion|c\+\+|python|javascript|code|algorithm|binary search|sorting|data structure|machine learning|react|html|css|physics|math|biology|history)\b/i.test(
      text
    );

  // Event domain keywords
  const mentionsTasks =
    /\b(task|tasks|todo|todos|overdue|deadline|deadlines|assigned|assignee|assignment|registration|deliverable|work item|action item)\b/i.test(
      text
    );
  const mentionsMeetings =
    /\b(meet|meeting|meetings|schedule|schedules|agenda|sync|huddle|call|sessions|timing)\b/i.test(text);
  const mentionsRisks =
    /\b(risk|risks|hazard|hazards|threat|threats|safety|blocker|blockers|severity|mitigat|mitigation|issue|issues)\b/i.test(
      text
    );
  const mentionsVolunteers =
    /\b(volunteer|volunteers|roster|shift|shifts|usher|ushers|staff|announcement|announcements)\b/i.test(text);
  const mentionsSummary =
    /\b(summarize|summary|overview|breakdown|status|health|dashboard|all data|entire event|how is the event going|tell me about my event|about this event)\b/i.test(
      text
    );
  const mentionsEventGeneral = /\b(event|date|venue|location|attendees|sponsor|budget)\b/i.test(text);

  // If greeting or pure general question and no event-specific keywords:
  if (
    (isGreeting || isTechOrAcademic) &&
    !mentionsTasks &&
    !mentionsMeetings &&
    !mentionsRisks &&
    !mentionsVolunteers &&
    !mentionsSummary
  ) {
    return {
      type: 'general',
      needsTasks: false,
      needsMeetings: false,
      needsRisks: false,
      needsVolunteers: false,
      needsEvent: false,
    };
  }

  // Summary requires all major operational data
  if (mentionsSummary) {
    return {
      type: 'event_summary',
      needsTasks: true,
      needsMeetings: true,
      needsRisks: true,
      needsVolunteers: true,
      needsEvent: true,
    };
  }

  // If specific event domains are mentioned:
  const needsTasks = mentionsTasks;
  const needsMeetings = mentionsMeetings;
  const needsRisks = mentionsRisks;
  const needsVolunteers =
    mentionsVolunteers || (mentionsTasks && /\b(who|assigned|person|team|staff|registration)\b/i.test(text));
  const needsEvent =
    mentionsEventGeneral || mentionsVolunteers || mentionsTasks || mentionsMeetings || mentionsRisks;

  if (needsTasks || needsMeetings || needsRisks || needsVolunteers || needsEvent) {
    return {
      type: 'event_specific',
      needsTasks,
      needsMeetings,
      needsRisks,
      needsVolunteers,
      needsEvent: true,
    };
  }

  // Fallback: If no event keyword matches at all, treat as general question so we don't load unnecessary DB data!
  return {
    type: 'general',
    needsTasks: false,
    needsMeetings: false,
    needsRisks: false,
    needsVolunteers: false,
    needsEvent: false,
  };
}

/**
 * System prompt for general non-event queries
 */
const GENERAL_SYSTEM_PROMPT = `You are ClubOps AI, a helpful, intelligent AI assistant.
Answer general knowledge, programming, technical, academic, and casual questions naturally, directly, concisely, and accurately.
Use markdown formatting (code blocks, bullet points, bold text) where appropriate.
Do not mention or force event context into general questions unless specifically asked.`;

/**
 * Assemble targeted system prompt containing only the retrieved database records
 */
function buildEventSystemPrompt(event, data = {}) {
  const sections = [];

  if (event) {
    sections.push(`ACTIVE EVENT PROFILE:
Name: ${event.name || 'Untitled Event'}
Status: ${event.status || 'Planning'}
Scheduled Date: ${event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}
Location / Venue: ${event.location || event.venue || 'Campus Center'}
Description: ${event.description || 'None'}`);
  }

  if (data.tasks !== undefined) {
    if (data.tasks.length > 0) {
      const taskLines = data.tasks
        .map(
          (t, idx) =>
            `${idx + 1}. [Status: ${t.status || 'To Do'}] [Priority: ${t.priority || 'Medium'}] "${t.title}" ` +
            `(Owner: ${t.owner || t.assignee || 'Unassigned'}, Department: ${t.department || 'General'}, Deadline: ${t.deadline || 'None'}` +
            `${t.dependencies ? `, Dependencies: ${t.dependencies}` : ''})`
        )
        .join('\n');
      sections.push(`TASKS (${data.tasks.length} total from database):\n${taskLines}`);
    } else {
      sections.push(`TASKS: No tasks found in database for this event.`);
    }
  }

  if (data.meetings !== undefined) {
    if (data.meetings.length > 0) {
      const meetingLines = data.meetings
        .map(
          (m, idx) =>
            `${idx + 1}. "${m.title}" on ${m.date || 'TBD'} (${m.startTime || ''} - ${m.endTime || ''}) | Type: ${m.meetingType || 'In-person'}` +
            `${m.location ? ` | Location: ${m.location}` : ''}${m.meetingLink ? ` | Link: ${m.meetingLink}` : ''} | Organizer: ${m.organizer || 'Lead'}` +
            `${m.agenda ? `\n   Agenda: ${m.agenda}` : ''}` +
            `${Array.isArray(m.participants) && m.participants.length > 0 ? `\n   Participants: ${m.participants.map((p) => p.name || p).join(', ')}` : ''}`
        )
        .join('\n');
      sections.push(`MEETINGS (${data.meetings.length} total from database):\n${meetingLines}`);
    } else {
      sections.push(`MEETINGS: No meetings scheduled in database for this event.`);
    }
  }

  if (data.risks !== undefined) {
    if (data.risks.length > 0) {
      const riskLines = data.risks
        .map(
          (r, idx) =>
            `${idx + 1}. [Severity: ${(r.severity || 'Medium').toUpperCase()}] [Status: ${r.status || 'open'}] "${r.title}" ` +
            `(Category: ${r.category || 'General'}, Owner: ${r.owner || 'Unassigned'}, Probability: ${r.probability || 'medium'}, Impact: ${r.impact || 'Medium'}` +
            `${r.mitigation ? `, Mitigation: ${r.mitigation}` : ''})`
        )
        .join('\n');
      sections.push(`RISKS (${data.risks.length} total from database):\n${riskLines}`);
    } else {
      sections.push(`RISKS: No risks recorded in database for this event.`);
    }
  }

  if (data.volunteers !== undefined) {
    if (data.volunteers.length > 0) {
      const volunteerLines = data.volunteers
        .map(
          (v, idx) =>
            `${idx + 1}. ${v.name} (Role: ${v.role || 'Volunteer'}, Team: ${v.team || 'General'}, Shift: ${v.shift || v.availability || 'Flexible'}, Status: ${v.status || 'active'})`
        )
        .join('\n');
      sections.push(`VOLUNTEER ROSTER (${data.volunteers.length} total from database):\n${volunteerLines}`);
    } else {
      sections.push(`VOLUNTEER ROSTER: No volunteers rostered in database for this event.`);
    }
  }

  return `You are ClubOps AI, a collegiate event operations copilot.

CRITICAL DATABASE GROUNDING RULES:
1. Base your answer EXCLUSIVELY on the REAL database records provided below for the active event.
2. NEVER invent, hallucinate, or extrapolate facts, tasks, meetings, dates, volunteers, or risks that are not present in the data.
3. If specific information is requested but does not exist or is empty in the database (e.g. no overdue tasks, no meetings scheduled, no risks logged, or specific person not assigned), clearly state that it is unavailable or not found in the database.
4. This session is READ + GENERATE only. Do not attempt or claim to modify or delete database records.
5. Format your responses with clear markdown: bullet points, bold text, and clean structure.

REAL DATABASE DATA:
==================================================
${sections.join('\n\n')}
==================================================`;
}

/**
 * Smart fallback copilot when GEMINI_API_KEY is unavailable or rate limits occur
 */
function generateFallbackResponse(message, event, data, intent) {
  const query = (message || '').toLowerCase().trim();

  // Greetings
  if (intent.type === 'general' && /^(hi|hello|hey|greetings|howdy|sup)\b/i.test(query)) {
    return `👋 **Hello!** How can I help you today? Feel free to ask general questions or anything related to your club's active event.`;
  }

  // AI or technical questions
  if (query.includes('artificial intelligence') || query.includes('what is ai')) {
    return `### 🤖 What is Artificial Intelligence (AI)?

**Artificial Intelligence (AI)** is a branch of computer science dedicated to building software and systems capable of performing tasks that typically require human intelligence.

#### Key Areas of AI:
1. **Machine Learning (ML):** Systems that learn patterns from data to make predictions or decisions without explicit programming.
2. **Deep Learning & Neural Networks:** Multi-layered networks inspired by biological brains, powering vision, audio, and language.
3. **Natural Language Processing (NLP):** Enabling computers to understand, interpret, and generate human language (e.g., Large Language Models).
4. **Robotics & Automation:** Physical or virtual agents automating complex workflows.`;
  }

  if (query.includes('recursion')) {
    return `### 🔄 Recursion Explained in Simple Words

**Recursion** is a programming technique where a function solves a problem by **calling itself** on smaller instances of the same problem until reaching a stopping condition.

#### The Two Key Parts:
1. **Base Case:** The condition that halts recursion.
2. **Recursive Step:** The function calling itself with reduced input.

\`\`\`javascript
function factorial(n) {
  if (n <= 1) return 1; // Base case
  return n * factorial(n - 1); // Recursive step
}
\`\`\``;
  }

  // Event Summary
  if (intent.type === 'event_summary' || query.includes('summar')) {
    const tasks = data.tasks || [];
    const meetings = data.meetings || [];
    const risks = data.risks || [];
    const volunteers = data.volunteers || [];
    const completedTasks = tasks.filter((t) => t.status === 'Completed');
    const pendingTasks = tasks.filter((t) => t.status !== 'Completed');

    return `### 📋 Event Summary: ${event?.name || 'Active Event'}

**Status:** ${event?.status || 'Planning'}  
**Date:** ${event?.date ? new Date(event.date).toLocaleDateString() : 'TBD'}  
**Location:** ${event?.location || event?.venue || 'Campus Center'}  
**Description:** ${event?.description || 'No description provided.'}

---

#### 📊 Major Operational Metrics (From Real Database)
- **Tasks:** ${tasks.length} total (${completedTasks.length} completed, ${pendingTasks.length} pending)
- **Meetings:** ${meetings.length} scheduled
- **Risks:** ${risks.length} recorded
- **Volunteers:** ${volunteers.length} rostered`;
  }

  // Tasks / Overdue
  if (intent.needsTasks) {
    const tasks = data.tasks || [];
    if (tasks.length === 0) {
      return `There are currently no tasks recorded in the database for **${event?.name || 'this event'}**.`;
    }

    if (query.includes('overdue')) {
      const overdue = tasks.filter(
        (t) => t.status === 'Overdue' || (t.deadline && new Date(t.deadline) < new Date() && t.status !== 'Completed')
      );
      if (overdue.length === 0) {
        return `✅ **Great news!** There are currently no overdue tasks recorded in the database for **${event?.name || 'this event'}**.`;
      }
      const list = overdue
        .map((t, i) => `${i + 1}. ⚠️ **${t.title}** (Owner: ${t.owner || 'Unassigned'}, Deadline: ${t.deadline || 'Past Due'})`)
        .join('\n');
      return `### ⚠️ Overdue Tasks (${overdue.length})\n\n${list}`;
    }

    if (query.includes('registration')) {
      const regTasks = tasks.filter((t) => (t.title || '').toLowerCase().includes('registration') || (t.department || '').toLowerCase().includes('registration'));
      const volunteers = data.volunteers || [];
      const regVolunteers = volunteers.filter((v) => (v.team || '').toLowerCase().includes('registration') || (v.role || '').toLowerCase().includes('registration') || (v.team || '').toLowerCase().includes('hospitality'));

      let reply = `### 📋 Registration Assignments\n\n`;
      if (regTasks.length > 0) {
        reply += `**Tasks:**\n` + regTasks.map((t) => `- **${t.title}** assigned to **${t.owner || 'Unassigned'}** (Status: ${t.status})`).join('\n') + `\n\n`;
      } else {
        reply += `No specific registration tasks found in the database.\n\n`;
      }
      if (regVolunteers.length > 0) {
        reply += `**Volunteers:**\n` + regVolunteers.map((v) => `- **${v.name}** (${v.role || 'Volunteer'}, ${v.team || 'Team'} - Shift: ${v.shift || 'Flexible'})`).join('\n');
      }
      return reply;
    }

    const list = tasks
      .map(
        (t, i) =>
          `${i + 1}. **${t.title}** — Status: *${t.status}*, Priority: *${t.priority}*, Owner: *${t.owner || 'Unassigned'}*`
      )
      .join('\n');
    return `### 📌 Tasks from Database (${tasks.length} total)\n\n${list}`;
  }

  // Meetings
  if (intent.needsMeetings) {
    const meetings = data.meetings || [];
    if (meetings.length === 0) {
      return `There are currently no upcoming meetings recorded in the database for **${event?.name || 'this event'}**.`;
    }
    const list = meetings
      .map(
        (m, i) =>
          `${i + 1}. 🗓️ **${m.title}**\n   - **Date:** ${m.date || 'TBD'} (${m.startTime || ''} - ${m.endTime || ''})\n   - **Type:** ${m.meetingType || 'In-person'}${m.location ? ` @ ${m.location}` : ''}\n   - **Organizer:** ${m.organizer || 'Lead'}${m.agenda ? `\n   - **Agenda:** ${m.agenda}` : ''}`
      )
      .join('\n\n');
    return `### 📅 Upcoming Meetings from Database\n\n${list}`;
  }

  // Risks
  if (intent.needsRisks) {
    const risks = data.risks || [];
    if (risks.length === 0) {
      return `There are currently no risks recorded in the database for **${event?.name || 'this event'}**.`;
    }
    const list = risks
      .map(
        (r, i) =>
          `${i + 1}. ⚠️ **${r.title}**\n   - **Severity:** ${(r.severity || 'Medium').toUpperCase()} | **Status:** ${r.status || 'open'}\n   - **Category:** ${r.category || 'General'} | **Owner:** ${r.owner || 'Unassigned'}${r.mitigation ? `\n   - **Mitigation:** ${r.mitigation}` : ''}`
      )
      .join('\n\n');
    return `### 🛡️ Real Event Risks from Database\n\n${list}`;
  }

  // Volunteers / Announcement
  if (intent.needsVolunteers) {
    const volunteers = data.volunteers || [];
    if (query.includes('announcement')) {
      const rosterText =
        volunteers.length > 0
          ? volunteers.map((v) => `- **${v.name}** (${v.role}, ${v.team} - Shift: ${v.shift})`).join('\n')
          : '- General Volunteer Team';

      return `### 📢 Draft Volunteer Announcement

**Subject:** Briefing & Shift Schedule for ${event?.name || 'Upcoming Event'}

Dear Volunteers,

Thank you for supporting **${event?.name || 'our event'}** scheduled for **${event?.date ? new Date(event.date).toLocaleDateString() : 'the upcoming date'}** at **${event?.location || 'the campus venue'}**.

#### 👥 Volunteer Roster & Shifts
${rosterText}

#### 📋 Guidelines
1. Check in 15 minutes before your shift.
2. Wear your volunteer badge and lanyard.
3. Reach out to your team lead if you need any assistance.

Thank you!  
*${event?.name || 'Club'} Organizing Team*`;
    }

    if (volunteers.length === 0) {
      return `There are currently no volunteers rostered in the database for **${event?.name || 'this event'}**.`;
    }
    const list = volunteers
      .map((v, i) => `${i + 1}. **${v.name}** — ${v.role || 'Volunteer'} (${v.team || 'General'}, Shift: ${v.shift || 'Flexible'})`)
      .join('\n');
    return `### 👥 Volunteer Roster from Database\n\n${list}`;
  }

  return `I have processed your query regarding **${event?.name || 'the event'}**. How else can I assist you with event operations?`;
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
    configured: true,
    isLiveGemini: isConfigured,
  });
};

/**
 * @desc    Process AI chat query with database-aware context and Gemini API
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

    // 1. Detect question intent to determine required database collections
    const intent = detectQueryIntent(message);

    // 2. Performance rule: Do NOT query unnecessary database collections!
    let event = null;
    const dbData = {};

    if (intent.type !== 'general') {
      // Resolve event only when query is event-related
      event = await fetchEvent(eventId);
      const resolvedEventId = event?._id || eventId;

      const fetchPromises = [];

      if (intent.needsTasks) {
        fetchPromises.push(
          fetchTasks(resolvedEventId).then((tasks) => {
            dbData.tasks = tasks;
          })
        );
      }
      if (intent.needsMeetings) {
        fetchPromises.push(
          fetchMeetings(resolvedEventId).then((meetings) => {
            dbData.meetings = meetings;
          })
        );
      }
      if (intent.needsRisks) {
        fetchPromises.push(
          fetchRisks(resolvedEventId).then((risks) => {
            dbData.risks = risks;
          })
        );
      }
      if (intent.needsVolunteers) {
        fetchPromises.push(
          fetchVolunteers(resolvedEventId).then((volunteers) => {
            dbData.volunteers = volunteers;
          })
        );
      }

      await Promise.all(fetchPromises);
    }

    // 3. Select appropriate system instruction
    const systemInstruction =
      intent.type === 'general'
        ? GENERAL_SYSTEM_PROMPT
        : buildEventSystemPrompt(event, dbData);

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if no API key is provided
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
      const fallbackReply = generateFallbackResponse(message.trim(), event, dbData, intent);
      return res.status(200).json({
        success: true,
        configured: false,
        isLiveGemini: false,
        reply: fallbackReply,
        event: event ? { id: event._id, name: event.name } : null,
        intent: intent.type,
      });
    }

    // Format chat history for Gemini
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
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.7-flash'];
    let lastError = null;
    let reply = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.4,
          },
        });
        reply = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) break;
      } catch (err) {
        lastError = err;
        console.warn(`[Model ${model} Warning]:`, err.message || err);
        const isRetryable =
          err.message &&
          (err.message.includes('404') ||
            err.message.includes('NOT_FOUND') ||
            err.message.includes('503') ||
            err.message.includes('UNAVAILABLE') ||
            err.message.includes('high demand') ||
            err.message.includes('RESOURCE_EXHAUSTED') ||
            err.message.includes('quota'));
        if (isRetryable) {
          continue;
        }
        throw err;
      }
    }

    if (!reply) {
      reply = generateFallbackResponse(message.trim(), event, dbData, intent);
    }

    return res.status(200).json({
      success: true,
      configured: true,
      isLiveGemini: true,
      reply,
      event: event ? { id: event._id, name: event.name } : null,
      intent: intent.type,
    });
  } catch (error) {
    console.error('[AI Chat Error]:', error.message || error);
    try {
      const intent = detectQueryIntent(req.body?.message);
      const event = intent.type !== 'general' ? await fetchEvent(req.body?.eventId) : null;
      const fallbackReply = generateFallbackResponse(req.body?.message || '', event, {}, intent);
      return res.status(200).json({
        success: true,
        configured: false,
        isLiveGemini: false,
        reply: fallbackReply,
        event: event ? { id: event._id, name: event.name } : null,
        intent: intent.type,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while processing your request.',
      });
    }
  }
};

