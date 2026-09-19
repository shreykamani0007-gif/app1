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

  // Schedule creation workflow intent
  const isScheduleCreation = /\b(design|create|make|plan|build|draft)\s+(an?\s+)?(event\s+)?schedule\b|\b(event\s+schedule\s+creation|schedule\s+for\s+my\s+event|schedule\s+an?\s+event|schedule\s+planner)\b/i.test(text);
  if (isScheduleCreation) {
    return {
      type: 'schedule_creation',
      needsTasks: false,
      needsMeetings: false,
      needsRisks: false,
      needsVolunteers: false,
      needsEvent: false,
    };
  }

  // Action intents: create task, assign task, create risk, schedule meeting, draft announcement
  const isCreateTask = /\b(create|add|make|set up|open)\s+(a\s+)?([a-z0-9\s_-]+?\s+)?(task|todo|to-do|action item)\b/i.test(text);
  const isAssignTask = /\b(assign|allocate|give)\s+(the\s+)?([a-z0-9\s_-]+)?\s*(task|todo)\s+to\s+([a-z0-9\s_-]+)/i.test(text) || /\bassign\s+([a-z0-9\s_-]+)\s+to\b/i.test(text);
  const isCreateRisk = /\b(create|add|log|record|flag|identify)\s+(a\s+)?([a-z0-9\s_-]+?\s+)?risk\b/i.test(text);
  const isCreateMeeting = /\b(schedule|create|set up|plan|arrange)\s+(a\s+)?([a-z0-9\s_-]+?\s+)?(meeting|sync|huddle|call)\b/i.test(text);
  const isDraftAnnouncement = /\b(draft|create|prepare|write)\s+(an?\s+)?([a-z0-9\s_-]+?\s+)?(announcement|broadcast|notice|reminder)\b/i.test(text);

  if (isCreateTask || isAssignTask || isCreateRisk || isCreateMeeting || isDraftAnnouncement) {
    let actionType = 'CREATE_TASK';
    if (isAssignTask) actionType = 'ASSIGN_TASK';
    else if (isCreateRisk) actionType = 'CREATE_RISK';
    else if (isCreateMeeting) actionType = 'CREATE_MEETING';
    else if (isDraftAnnouncement) actionType = 'DRAFT_ANNOUNCEMENT';

    return {
      type: 'event_action',
      actionType,
      needsTasks: true,
      needsMeetings: isCreateMeeting,
      needsRisks: isCreateRisk,
      needsVolunteers: isDraftAnnouncement || isAssignTask,
      needsEvent: true,
    };
  }

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

CRITICAL DATABASE GROUNDING & ACTION PROTOCOL:
1. Base your answer EXCLUSIVELY on the REAL database records provided below for the active event.
2. NEVER invent or hallucinate facts, tasks, meetings, dates, volunteers, or risks that are not present in the data.
3. If specific information is requested but does not exist in the database, clearly state that it is unavailable.
4. ACTION PROPOSALS & WORKFLOWS:
When the user asks to create a task, assign a task, update a task, create a risk, schedule a meeting, or draft an announcement:
- Propose the action, but NEVER claim that the action was already saved or executed.
- Request explicit user review and confirmation.
- Output a single structured action block in this EXACT format at the very end of your response:
\`\`\`action
{
  "type": "CREATE_TASK" | "UPDATE_TASK" | "ASSIGN_TASK" | "CREATE_RISK" | "CREATE_MEETING" | "DRAFT_ANNOUNCEMENT",
  "payload": { ... }
}
\`\`\`
Payload specifications:
- CREATE_TASK: { "title": string, "priority": "Low"|"Medium"|"High"|"Urgent", "deadline": string, "department": string, "status": "In Progress"|"To Do" }
- ASSIGN_TASK: { "taskTitle": string, "assignee": string }
- CREATE_RISK: { "title": string, "severity": "low"|"medium"|"high"|"critical"|"urgent", "probability": "low"|"medium"|"high", "category": string, "impact": "Medium" }
- CREATE_MEETING: { "title": string, "date": "YYYY-MM-DD", "startTime": "05:00 PM", "endTime": "06:00 PM", "meetingType": "In-person"|"Online"|"Hybrid", "location": string, "agenda": string }
- DRAFT_ANNOUNCEMENT: { "title": string, "body": string, "audience": "All Volunteers", "status": "Draft" }

5. Format responses with clear markdown: bullet points, bold text, and clean structure.

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

  // Action intents fallback
  if (intent.type === 'event_action') {
    const actType = intent.actionType;
    if (actType === 'CREATE_TASK') {
      const isHigh = /\bhigh\s+priority\b/i.test(query);
      const isUrgent = /\burgent\b/i.test(query);
      const priority = isUrgent ? 'Urgent' : isHigh ? 'High' : 'Medium';
      const deadlineMatch = query.match(/\bby\s+([a-z0-9\s,]+?)(?:\.|$)/i);
      const deadline = deadlineMatch ? deadlineMatch[1].trim() : 'October 20';
      let title = query
        .replace(/^(please\s+)?(can you\s+)?(create|add|make|set up)\s+(a\s+)?(high\s+priority\s+|urgent\s+)?task\s+(to\s+|for\s+)?/i, '')
        .replace(/\s+by\s+[a-z0-9\s,]+(?:\.|$)/i, '')
        .replace(/[.]+$/, '')
        .trim();
      if (!title) title = 'Volunteer registration';
      title = title.charAt(0).toUpperCase() + title.slice(1);

      return `I have prepared a new task **"${title}"** with **${priority}** priority for **${event?.name || 'the active event'}**. Please review the details below and confirm to save it to the database.
\`\`\`action
{
  "type": "CREATE_TASK",
  "payload": {
    "title": "${title}",
    "priority": "${priority}",
    "deadline": "${deadline}",
    "department": "${/auditorium|venue|stage/i.test(title) ? 'Logistics' : 'General'}",
    "status": "In Progress"
  }
}
\`\`\``;
    }

    if (actType === 'ASSIGN_TASK') {
      const toMatch = query.match(/\bto\s+([A-Za-z\s]+?)(?:\.|$)/i);
      const assignee = toMatch ? toMatch[1].trim() : 'Rahul';
      const taskTitle = query.includes('auditorium') ? 'Arrange auditorium' : 'Volunteer registration';

      return `I have prepared an assignment proposal for **${taskTitle}** to assign it to **${assignee}**. Please review and confirm below.
\`\`\`action
{
  "type": "ASSIGN_TASK",
  "payload": {
    "taskTitle": "${taskTitle}",
    "assignee": "${assignee}"
  }
}
\`\`\``;
    }

    if (actType === 'CREATE_RISK') {
      let title = query
        .replace(/^(please\s+)?(can you\s+)?(create|add|log|record)\s+(a\s+)?risk\s+(for\s+|of\s+|about\s+)?/i, '')
        .replace(/[.]+$/, '')
        .trim();
      if (!title) title = 'Possible auditorium delay';
      title = title.charAt(0).toUpperCase() + title.slice(1);

      return `I have prepared a new operational risk entry for **"${title}"** in **${event?.name || 'the active event'}**. Please review the parameters and confirm to record it in the database.
\`\`\`action
{
  "type": "CREATE_RISK",
  "payload": {
    "title": "${title}",
    "severity": "medium",
    "probability": "medium",
    "category": "Venue & Logistics",
    "impact": "Medium",
    "mitigation": "Establish backup venue timeline and buffer slots."
  }
}
\`\`\``;
    }

    if (actType === 'CREATE_MEETING') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      return `I have scheduled a proposal for the **Logistics Coordination Sync** for tomorrow at **5:00 PM**. Please review the details below and confirm to save it to the calendar.
\`\`\`action
{
  "type": "CREATE_MEETING",
  "payload": {
    "title": "Logistics Coordination Sync",
    "date": "${dateStr}",
    "startTime": "05:00 PM",
    "endTime": "06:00 PM",
    "meetingType": "In-person",
    "location": "Auditorium Control Room",
    "agenda": "Review equipment setup, volunteer deployment, and safety readiness."
  }
}
\`\`\``;
    }

    if (actType === 'DRAFT_ANNOUNCEMENT') {
      return `I have prepared a draft announcement for volunteers regarding early arrival. As required by protocol, this is created as a **Draft** only and will not be broadcast until you review and publish it.
\`\`\`action
{
  "type": "DRAFT_ANNOUNCEMENT",
  "payload": {
    "title": "Volunteer Reminder: Early Arrival for Briefing",
    "body": "Hello volunteers! Please remember to report to the registration desk 45 minutes prior to event start for badge distribution and briefing. Thank you!",
    "audience": "All Volunteers",
    "status": "Draft"
  }
}
\`\`\``;
    }
  }

  // Schedule creation workflow
  if (intent.type === 'schedule_creation') {
    return "Sure! I'll help you create the event schedule. Let's start with the basics.\n\nWhat is the name of the event?";
  }

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
 * Parse structured action proposals from Gemini response or user intent
 */
export function parseActionProposal(replyText, userMessage, event) {
  let cleanReply = (replyText || '').trim();
  let action = null;

  // 1. Check if response contains an ```action ... ``` code block
  const actionBlockRegex = /```(?:action|json)?\s*(\{[\s\S]*?"type"\s*:\s*"(?:CREATE_TASK|UPDATE_TASK|ASSIGN_TASK|CREATE_RISK|CREATE_MEETING|DRAFT_ANNOUNCEMENT)"[\s\S]*?\})\s*```/i;
  const match = cleanReply.match(actionBlockRegex);

  if (match && match[1]) {
    try {
      action = JSON.parse(match[1]);
      // Cleanly remove action code block from chat text
      cleanReply = cleanReply.replace(match[0], '').trim();
    } catch (e) {
      console.warn('[Action Parse Warning]:', e.message);
    }
  }

  // 2. If no action block found in reply, inspect user's message to build the proposal
  if (!action && userMessage) {
    const text = userMessage.trim();

    // A. Create task
    if (/\b(create|add|make|set up)\s+(a\s+)?([a-z0-9\s_-]+?\s+)?(task|to-do|todo)\b/i.test(text)) {
      const isHigh = /\bhigh\s+priority\b/i.test(text);
      const isUrgent = /\burgent\b/i.test(text);
      const priority = isUrgent ? 'Urgent' : isHigh ? 'High' : 'Medium';

      const deadlineMatch = text.match(/\bby\s+([a-z0-9\s,]+?)(?:\.|$)/i);
      const deadline = deadlineMatch ? deadlineMatch[1].trim() : 'October 20';

      let title = text
        .replace(/^(please\s+)?(can you\s+)?(create|add|make|set up)\s+(a\s+)?([a-z0-9\s_-]+?\s+)?task\s+(to\s+|for\s+)?/i, '')
        .replace(/\s+by\s+[a-z0-9\s,]+(?:\.|$)/i, '')
        .replace(/[.]+$/, '')
        .trim();
      if (!title) title = 'Volunteer registration';
      title = title.charAt(0).toUpperCase() + title.slice(1);

      action = {
        type: 'CREATE_TASK',
        payload: {
          title,
          priority,
          deadline,
          status: 'In Progress',
          department: /auditorium|venue|stage/i.test(title) ? 'Logistics' : /registration/i.test(title) ? 'Registration' : 'General',
        },
      };

      if (!cleanReply || cleanReply.length < 20) {
        cleanReply = `I have prepared a proposal to create this task for **${event?.name || 'the active event'}**. Please review the details below and confirm to save it to the database.`;
      }
    }

    // B. Assign task
    else if (/\bassign\b/i.test(text) && /\bto\b/i.test(text)) {
      const toMatch = text.match(/\bto\s+([A-Za-z\s]+?)(?:\.|$)/i);
      const assignee = toMatch ? toMatch[1].trim() : 'Rahul';
      const taskTitle = text.toLowerCase().includes('auditorium') ? 'Arrange auditorium' : 'Volunteer registration';

      action = {
        type: 'ASSIGN_TASK',
        payload: {
          taskTitle,
          assignee,
        },
      };

      if (!cleanReply || cleanReply.length < 20) {
        cleanReply = `I have prepared an assignment proposal for **${taskTitle}** to assign it to **${assignee}**. Please review and confirm below.`;
      }
    }

    // C. Create risk
    else if (/\b(create|add|log|record)\s+(a\s+)?([a-z0-9\s_-]+?\s+)?risk\b/i.test(text)) {
      let title = text
        .replace(/^(please\s+)?(can you\s+)?(create|add|log|record)\s+(a\s+)?([a-z0-9\s_-]+?\s+)?risk\s+(for\s+|of\s+|about\s+)?/i, '')
        .replace(/[.]+$/, '')
        .trim();
      if (!title) title = 'Possible auditorium delay';
      title = title.charAt(0).toUpperCase() + title.slice(1);

      action = {
        type: 'CREATE_RISK',
        payload: {
          title,
          severity: /high|critical/i.test(text) ? 'high' : 'medium',
          probability: 'medium',
          category: /auditorium|venue/i.test(title) ? 'Venue & Logistics' : 'Operational',
          impact: 'Medium',
          mitigation: 'Establish backup timeline and reserve standby slots.',
        },
      };

      if (!cleanReply || cleanReply.length < 20) {
        cleanReply = `I have logged an operational risk entry for **"${title}"** in **${event?.name || 'the active event'}**. Please review and confirm to record it in the database.`;
      }
    }

    // D. Create meeting
    else if (/\b(schedule|create|set up|plan|arrange)\s+(a\s+)?([a-z0-9\s_-]+?\s+)?(meeting|sync|huddle|call)\b/i.test(text)) {
      const timeMatch = text.match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      const startTime = timeMatch ? timeMatch[1].trim().toUpperCase() : '05:00 PM';

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      let title = 'Logistics Coordination Sync';
      if (/volunteer/i.test(text)) title = 'Volunteer Orientation Sync';

      action = {
        type: 'CREATE_MEETING',
        payload: {
          title,
          date: dateStr,
          startTime: startTime.includes('M') ? startTime : `${startTime} PM`,
          endTime: '06:00 PM',
          meetingType: 'In-person',
          location: 'Auditorium Control Room',
          agenda: 'Review equipment setup, volunteer deployment, and safety readiness.',
        },
      };

      if (!cleanReply || cleanReply.length < 20) {
        cleanReply = `I have scheduled a proposal for the **${title}** for tomorrow at ${action.payload.startTime}. Please confirm to save it to the calendar.`;
      }
    }

    // E. Draft announcement
    else if (/\b(draft|create|prepare|write)\s+(an?\s+)?([a-z0-9\s_-]+?\s+)?(announcement|broadcast|notice|reminder)\b/i.test(text)) {
      action = {
        type: 'DRAFT_ANNOUNCEMENT',
        payload: {
          title: 'Volunteer Reminder: Early Arrival for Briefing',
          body: 'Hello volunteers! Please remember to report to the registration desk 45 minutes prior to doors opening for badge distribution and briefing. Thank you for your commitment!',
          audience: 'All Volunteers',
          status: 'Draft',
        },
      };

      if (!cleanReply || cleanReply.length < 20) {
        cleanReply = `I have prepared a draft announcement for volunteers. As required by protocol, this is created as a **Draft** only and will not be broadcast until you review and publish it.`;
      }
    }
  }

  // Bind active event details
  if (action) {
    action.id = `act_${Date.now()}`;
    action.eventId = event?._id || 'evt_default';
    action.eventName = event?.name || 'Active Event';
  }

  return { cleanReply, action };
}

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

    // If user triggers the schedule creation workflow
    if (intent.type === 'schedule_creation') {
      return res.status(200).json({
        success: true,
        configured: true,
        reply: "Sure! I'll help you create the event schedule. Let's start with the basics.\n\nWhat is the name of the event?",
        action: null,
        event: null,
        intent: 'schedule_creation',
      });
    }

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
      const { cleanReply, action } = parseActionProposal(fallbackReply, message.trim(), event);

      return res.status(200).json({
        success: true,
        configured: false,
        isLiveGemini: false,
        reply: cleanReply,
        action: action || null,
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

    const { cleanReply, action } = parseActionProposal(reply, message.trim(), event);

    return res.status(200).json({
      success: true,
      configured: true,
      isLiveGemini: true,
      reply: cleanReply,
      action: action || null,
      event: event ? { id: event._id, name: event.name } : null,
      intent: intent.type,
    });
  } catch (error) {
    console.error('[AI Chat Error]:', error.message || error);
    try {
      const intent = detectQueryIntent(req.body?.message);
      const event = intent.type !== 'general' ? await fetchEvent(req.body?.eventId) : null;
      const fallbackReply = generateFallbackResponse(req.body?.message || '', event, {}, intent);
      const { cleanReply, action } = parseActionProposal(fallbackReply, req.body?.message || '', event);

      return res.status(200).json({
        success: true,
        configured: false,
        isLiveGemini: false,
        reply: cleanReply,
        action: action || null,
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

