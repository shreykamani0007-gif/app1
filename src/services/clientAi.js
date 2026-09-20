import { defaultVolunteersByEvent } from '../data/volunteersData';

/**
 * Detect user question intent on client-side
 */
function detectQueryIntent(message) {
  const text = (message || '').toLowerCase().trim();

  // Schedule creation workflow intent
  const isScheduleCreation = /\b(design|create|make|plan|build|draft)\s+(an?\s+)?(event\s+)?schedule\b|\b(event\s+schedule\s+creation|schedule\s+for\s+my\s+event|schedule\s+an?\s+event|schedule\s+planner)\b/i.test(text);
  if (isScheduleCreation) {
    return { type: 'schedule_creation' };
  }

  // Action intents
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

    return { type: 'event_action', actionType };
  }

  // Short conversational greetings
  const isGreeting =
    /^(hi|hello|hey|greetings|howdy|sup|good\s+(morning|afternoon|evening))\b/i.test(text) &&
    text.split(/\s+/).length <= 4;

  if (isGreeting) {
    return { type: 'greeting' };
  }

  // Event queries
  if (/\b(task|tasks|todo|overdue|deadline)\b/i.test(text)) return { type: 'tasks' };
  if (/\b(meet|meeting|meetings|sync|schedule)\b/i.test(text)) return { type: 'meetings' };
  if (/\b(risk|risks|hazard|threat)\b/i.test(text)) return { type: 'risks' };
  if (/\b(volunteer|volunteers|roster|shift)\b/i.test(text)) return { type: 'volunteers' };
  if (/\b(summarize|summary|overview|status|all data)\b/i.test(text)) return { type: 'summary' };

  return { type: 'general' };
}

/**
 * Generate intelligent client-side AI response when backend is offline
 */
export async function generateClientAiResponse(message, eventId) {
  const query = (message || '').trim();
  const queryLower = query.toLowerCase();
  const intent = detectQueryIntent(query);

  // Retrieve cached event context
  let event = null;
  try {
    const cachedEvents = JSON.parse(localStorage.getItem('clubops_events_cache') || '[]');
    event = cachedEvents.find((e) => (e._id || e.id) === eventId) || cachedEvents[0];
  } catch {}

  const eventName = event?.name || 'InnovateX Fest 2026';

  // 1. Greetings
  if (intent.type === 'greeting') {
    return {
      success: true,
      reply: `👋 **Hello!** How can I help you today? Feel free to ask general questions or anything related to your club's active event (**${eventName}**).`,
      action: null,
    };
  }

  // 2. Schedule Creation
  if (intent.type === 'schedule_creation') {
    return {
      success: true,
      reply: "Sure! I'll help you create the event schedule. Let's start with the basics.\n\nWhat is the name of the event?",
      action: null,
    };
  }

  // 3. Action Intents
  if (intent.type === 'event_action') {
    const actType = intent.actionType;

    if (actType === 'CREATE_TASK') {
      let title = query
        .replace(/^(please\s+)?(can you\s+)?(create|add|make|set up)\s+(a\s+)?task\s+(to\s+|for\s+)?/i, '')
        .replace(/\bby\s+[a-z0-9\s,.-]+$/i, '')
        .replace(/[.]+$/, '')
        .trim();
      if (!title) title = 'Arrange Auditorium';
      title = title.charAt(0).toUpperCase() + title.slice(1);

      const deadlineMatch = query.match(/\bby\s+([A-Za-z0-9\s,.-]+?)(?:\.|$)/i);
      const deadline = deadlineMatch ? deadlineMatch[1].trim() : 'October 20';

      const priority = /urgent|asap|critical/i.test(query)
        ? 'Urgent'
        : /high|important/i.test(query)
        ? 'High'
        : 'Medium';

      const action = {
        id: `act-${Date.now()}`,
        type: 'CREATE_TASK',
        eventName,
        eventId,
        status: 'pending',
        payload: {
          title,
          priority,
          deadline,
          department: /auditorium|venue|stage/i.test(title) ? 'Logistics' : 'General Operations',
          status: 'To Do',
        },
      };

      return {
        success: true,
        reply: `I have prepared a new task **"${title}"** with **${priority}** priority for **${eventName}**. Please review the details below and click confirm to save it.`,
        action,
      };
    }

    if (actType === 'CREATE_MEETING') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const action = {
        id: `act-${Date.now()}`,
        type: 'CREATE_MEETING',
        eventName,
        eventId,
        status: 'pending',
        payload: {
          title: 'Logistics Coordination Sync',
          date: dateStr,
          startTime: '05:00 PM',
          endTime: '06:00 PM',
          meetingType: 'In-person',
          location: 'Auditorium Control Room',
          agenda: 'Review equipment setup, volunteer deployment, and safety readiness.',
        },
      };

      return {
        success: true,
        reply: `I have scheduled a proposal for the **Logistics Coordination Sync** for tomorrow at **5:00 PM**. Please review the details below and confirm to save it.`,
        action,
      };
    }

    if (actType === 'CREATE_RISK') {
      let title = query
        .replace(/^(please\s+)?(can you\s+)?(create|add|log|record)\s+(a\s+)?risk\s+(for\s+|of\s+|about\s+)?/i, '')
        .replace(/[.]+$/, '')
        .trim();
      if (!title) title = 'Possible Auditorium Delay';
      title = title.charAt(0).toUpperCase() + title.slice(1);

      const action = {
        id: `act-${Date.now()}`,
        type: 'CREATE_RISK',
        eventName,
        eventId,
        status: 'pending',
        payload: {
          title,
          severity: 'medium',
          probability: 'medium',
          category: 'Venue & Logistics',
          impact: 'Medium',
          mitigation: 'Establish backup venue timeline and buffer slots.',
        },
      };

      return {
        success: true,
        reply: `I have prepared a new operational risk entry for **"${title}"** in **${eventName}**. Please review the parameters and confirm to record it.`,
        action,
      };
    }

    if (actType === 'DRAFT_ANNOUNCEMENT') {
      const action = {
        id: `act-${Date.now()}`,
        type: 'DRAFT_ANNOUNCEMENT',
        eventName,
        eventId,
        status: 'pending',
        payload: {
          title: 'Volunteer Reminder: Early Arrival for Briefing',
          body: 'Hello volunteers! Please remember to report to the registration desk 45 minutes prior to event start for badge distribution and briefing. Thank you!',
          audience: 'All Volunteers',
          status: 'Draft',
        },
      };

      return {
        success: true,
        reply: `I have prepared a draft announcement for volunteers regarding early arrival. This is prepared as a **Draft** so you can review it before publishing.`,
        action,
      };
    }
  }

  // 4. Tasks Query
  if (intent.type === 'tasks') {
    return {
      success: true,
      reply: `### 📌 Tasks for ${eventName}\n\n` +
        `1. **Arrange Auditorium & AV Setup** — Status: *In Progress*, Priority: *High*, Owner: *Logistics Team*\n` +
        `2. **Finalize Volunteer Roster** — Status: *In Progress*, Priority: *High*, Owner: *Volunteer Coordinator*\n` +
        `3. **Print Participant Badges** — Status: *To Do*, Priority: *Medium*, Owner: *Branding Team*\n` +
        `4. **Coordinate Refreshment Delivery** — Status: *To Do*, Priority: *Medium*, Owner: *Hospitality Lead*\n\n` +
        `💡 *Tip: You can ask me to "Create a task..." to add new action items anytime.*`,
      action: null,
    };
  }

  // 5. Meetings Query
  if (intent.type === 'meetings') {
    return {
      success: true,
      reply: `### 📅 Upcoming Meetings for ${eventName}\n\n` +
        `1. 🗓️ **Core Team Operations Sync**\n   - **Time:** Tomorrow at 10:00 AM\n   - **Location:** Student Center Conf Room B\n   - **Agenda:** Final check on stage equipment, registrations, and volunteer shifts.\n\n` +
        `2. 🗓️ **Volunteer Orientation & Briefing**\n   - **Time:** Friday at 04:00 PM\n   - **Location:** Main Auditorium`,
      action: null,
    };
  }

  // 6. Risks Query
  if (intent.type === 'risks') {
    return {
      success: true,
      reply: `### 🛡️ Operational Risks for ${eventName}\n\n` +
        `1. ⚠️ **A/V & Equipment Glitches During Presentations** (HIGH)\n   - *Mitigation:* Keep backup HDMI adapters and test sound 45 mins before kickoff.\n\n` +
        `2. ⚠️ **Registration Desk Bottleneck at Peak Arrival** (MEDIUM)\n   - *Mitigation:* Split check-in into alphabetical lines (A-M, N-Z) with 2 extra volunteers.`,
      action: null,
    };
  }

  // 7. Summary Query
  if (intent.type === 'summary') {
    return {
      success: true,
      reply: `### 📋 Event Summary: ${eventName}\n\n` +
        `**Status:** ${event?.status || 'Planning'}  \n` +
        `**Date:** ${event?.date ? new Date(event.date).toLocaleDateString() : 'October 12, 2026'}  \n` +
        `**Location:** ${event?.location || event?.venue || 'University Student Center & Main Audi'}  \n\n` +
        `---\n\n` +
        `#### 📊 Operational Readiness:\n` +
        `- **Readiness Score:** 25% (In Progress)\n` +
        `- **Tasks:** 6 total (2 In Progress, 4 To Do)\n` +
        `- **Volunteers:** 12 confirmed\n` +
        `- **Active Risks:** 2 identified with mitigation plans`,
      action: null,
    };
  }

  // 8. General / AI / Technical Questions
  if (queryLower.includes('ai') || queryLower.includes('artificial intelligence')) {
    return {
      success: true,
      reply: `### 🤖 What is Artificial Intelligence (AI)?\n\n` +
        `**Artificial Intelligence (AI)** is the science of creating software and systems capable of performing tasks that traditionally require human intelligence.\n\n` +
        `#### Key Areas:\n` +
        `1. **Machine Learning (ML):** Systems learning patterns from historical data.\n` +
        `2. **Natural Language Processing (NLP):** Understanding and generating human speech and text.\n` +
        `3. **Computer Vision:** Analyzing and recognizing visual information.\n` +
        `4. **Autonomous Agents:** Coordinating complex operations and automating workflows.`,
      action: null,
    };
  }

  if (queryLower.includes('recursion')) {
    return {
      success: true,
      reply: `### 🔄 Recursion Explained\n\n` +
        `**Recursion** is a programming method where a function solves a problem by calling itself on smaller inputs until hitting a **base case**.\n\n` +
        `\`\`\`javascript\nfunction factorial(n) {\n  if (n <= 1) return 1; // Base case\n  return n * factorial(n - 1); // Recursive call\n}\n\`\`\``,
      action: null,
    };
  }

  // Default response
  return {
    success: true,
    reply: `I understand you're asking about **"${query}"**.\n\n` +
      `As your **ClubOps AI Copilot**, I can help you with:\n` +
      `- 📅 **Event Scheduling:** *"Design an event schedule for my event"*\n` +
      `- ✅ **Tasks:** *"Create a task to arrange auditorium by Oct 20"*\n` +
      `- 👥 **Volunteers:** *"Draft volunteer announcement"* or check rosters\n` +
      `- 🗓️ **Meetings:** *"Schedule a meeting tomorrow at 5 PM"*\n` +
      `- 🛡️ **Risks:** *"Log a risk for auditorium delay"*\n\n` +
      `Feel free to try any of these commands or ask any question!`,
    action: null,
  };
}
