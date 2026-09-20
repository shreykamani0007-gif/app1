/**
 * geminiService.js
 * Core Gemini API integration for ClubOps AI intelligent event planning.
 * Uses @google/genai v2 SDK (browser-compatible).
 *
 * Provides:
 *  - analyzeEventIdea(ideaText) → structured event analysis JSON
 *  - determineNextQuestion(analysis, collected) → next follow-up question or null
 *  - generateEventPlan(analysis, details, volunteers) → full event plan JSON
 */

import { GoogleGenAI } from '@google/genai';

// ─── SDK Initialization ────────────────────────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let _ai = null;
function getAi() {
  if (!_ai) {
    if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env');
    _ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return _ai;
}

const MODEL = 'gemini-2.0-flash';

// ─── JSON Extraction Helper ────────────────────────────────────────────────

/**
 * Extract JSON from a Gemini response that might have surrounding text or markdown.
 */
function extractJson(text) {
  if (!text) throw new Error('Empty Gemini response');

  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch {}

  // Strip markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {}
  }

  // Find first { ... } block
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }

  throw new Error('Could not extract valid JSON from Gemini response');
}

/**
 * Call Gemini model with a prompt, return raw text.
 */
async function callGemini(prompt) {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      temperature: 0.4,
      maxOutputTokens: 4096,
    },
  });
  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || response?.text || '';
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

// ─── STEP 1: Analyze Event Idea ───────────────────────────────────────────

/**
 * Send raw event idea to Gemini for structured analysis.
 * @param {string} ideaText - User's free-form event description
 * @returns {Promise<object>} Structured event analysis
 */
export async function analyzeEventIdea(ideaText) {
  const prompt = `You are an expert event planning analyst. Analyze this event idea and extract structured information.

Event idea from user: "${ideaText}"

Respond ONLY with valid JSON (no markdown, no extra text) in this EXACT format:
{
  "eventType": "Hackathon|Cultural Festival|Sports Tournament|Workshop|Seminar|Conference|Exhibition|Other",
  "eventScale": "Small (<50 people)|Medium (50-200 people)|Large (200+ people)",
  "duration": "Half day|1 day|2 days|3 days|Weekend|Multi-day",
  "targetAudience": "description of target audience",
  "activities": ["list", "of", "main", "activities"],
  "operationalAreas": ["Technical", "Logistics", "Hospitality", "Marketing", "Sponsorship", "Registration", "Safety", "Catering", "etc"],
  "requirements": ["key", "resources", "and", "infrastructure", "needed"],
  "risks": ["potential", "risk", "areas"],
  "missingInfo": ["date", "venue", "participants", "duration"],
  "summary": "One sentence summary of what this event is about"
}

Rules:
- missingInfo must ONLY contain items the user did NOT provide: "date", "venue", "participants", "duration", "event name"
- If user said "200 students" then participants is NOT missing
- If user mentioned dates, date is NOT missing
- If user mentioned location/venue, venue is NOT missing
- activities must be specific to THIS event type (not generic)
- operationalAreas must reflect what this event actually needs`;

  const text = await callGemini(prompt);
  const analysis = extractJson(text);

  // Validate and normalize
  return {
    eventType: analysis.eventType || 'Event',
    eventScale: analysis.eventScale || 'Medium (50-200 people)',
    duration: analysis.duration || '1 day',
    targetAudience: analysis.targetAudience || 'Students',
    activities: Array.isArray(analysis.activities) ? analysis.activities : [],
    operationalAreas: Array.isArray(analysis.operationalAreas) ? analysis.operationalAreas : ['Logistics'],
    requirements: Array.isArray(analysis.requirements) ? analysis.requirements : [],
    risks: Array.isArray(analysis.risks) ? analysis.risks : [],
    missingInfo: Array.isArray(analysis.missingInfo) ? analysis.missingInfo : [],
    summary: analysis.summary || '',
  };
}

// ─── STEP 2: Determine Next Follow-Up Question ────────────────────────────

const QUESTION_MAP = {
  'event name': {
    question: "What would you like to name this event?",
    hint: "e.g., InnovateX Hackathon 2026",
  },
  'date': {
    question: "What is the event date (or date range)?",
    hint: "e.g., October 15, 2026 or Oct 15-16, 2026",
  },
  'venue': {
    question: "Where will the event be held?",
    hint: "e.g., University Auditorium, Block C Labs",
  },
  'participants': {
    question: "How many participants are you expecting?",
    hint: "e.g., 200 students, 12 teams",
  },
  'duration': {
    question: "How long will the event run?",
    hint: "e.g., 1 day, 2 days, half-day",
  },
};

/**
 * Determine what information is still missing and return the next question.
 * @param {string[]} missingInfo - From Gemini analysis
 * @param {object} collected - Already collected data
 * @returns {{ field: string, question: string, hint: string } | null}
 */
export function determineNextQuestion(missingInfo, collected) {
  for (const field of missingInfo) {
    const key = field.toLowerCase().trim();
    // Skip if already collected
    if (collected[key] || collected[key === 'participants' ? 'participants' : key]) continue;
    const qMap = QUESTION_MAP[key];
    if (qMap) {
      return { field: key, ...qMap };
    }
  }
  return null; // No more questions needed
}

// ─── STEP 3: Generate Full Event Plan ────────────────────────────────────

/**
 * Generate a comprehensive, event-specific plan using Gemini.
 * @param {object} analysis - From analyzeEventIdea()
 * @param {object} details - Collected event details (name, date, venue, participants)
 * @param {Array} volunteers - Available volunteers from the system
 * @returns {Promise<object>} Full event plan
 */
export async function generateEventPlan(analysis, details, volunteers = []) {
  const today = new Date();
  const eventDate = details.date
    ? new Date(details.date)
    : new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
  const eventDateStr = eventDate.toISOString().split('T')[0];

  const volunteersStr = volunteers.length > 0
    ? volunteers.map(v => `- ID: ${v.id || v._id}, Name: ${v.name}, Role: ${v.role}, Team: ${v.team}`).join('\n')
    : 'No volunteers currently registered in the system.';

  const prompt = `You are an expert event operations planner. Generate a COMPLETE, SPECIFIC event plan.

EVENT ANALYSIS:
- Event Type: ${analysis.eventType}
- Scale: ${analysis.eventScale}
- Duration: ${analysis.duration}
- Target Audience: ${analysis.targetAudience}
- Activities: ${analysis.activities.join(', ')}
- Operational Areas Needed: ${analysis.operationalAreas.join(', ')}
- Known Risks: ${analysis.risks.join(', ')}

COLLECTED EVENT DETAILS:
- Event Name: ${details.name || 'Event'}
- Date: ${eventDateStr}
- Venue: ${details.venue || 'To be confirmed'}
- Expected Participants: ${details.participants || 'Unknown'}
- User Description: ${details.description || analysis.summary}

AVAILABLE VOLUNTEERS IN SYSTEM:
${volunteersStr}

Generate tasks SPECIFICALLY for a ${analysis.eventType}. 
${analysis.eventType === 'Hackathon' ? 'Include tasks for: registration platform, contest/judging platform, Wi-Fi/network, mentor management, sponsor booth, prize distribution, participant kits, coding environment setup.' : ''}
${analysis.eventType === 'Cultural Festival' ? 'Include tasks for: stage setup, sound/lighting, artist/performer management, costume & props, crowd management, security, photography, decoration.' : ''}
${analysis.eventType === 'Sports Tournament' ? 'Include tasks for: team registration, referee/umpire assignment, field/court preparation, scorekeeping, equipment, medical support, audience safety, trophy/certificate.' : ''}
${analysis.eventType === 'Workshop' ? 'Include tasks for: speaker confirmation, materials/handouts, projector/AV, hands-on equipment, attendance management, feedback forms, certificates.' : ''}
${analysis.eventType === 'Seminar' ? 'Include tasks for: speaker logistics, AV setup, seating arrangement, registration desk, live streaming, Q&A moderation, certificates, post-event report.' : ''}
${analysis.eventType === 'Conference' ? 'Include tasks for: keynote speaker management, track sessions, sponsorship packages, networking areas, badge printing, live streaming, panel management.' : ''}
DO NOT generate generic tasks that could apply to any event. Tasks must be specific to this event type and activities.

DEADLINE RULES:
- Use event date: ${eventDateStr}
- Critical infrastructure tasks (venue, platform, equipment) → 3-4 weeks before
- Sponsorship/Speaker confirmation → 3 weeks before
- Marketing/promotion → 2 weeks before
- Volunteer training/briefing → 1 week before
- Final checks/dry run → 1-2 days before
- Event-day tasks → ${eventDateStr}
- Post-event tasks → 1-3 days after event

VOLUNTEER MATCHING:
- Only assign volunteers from the system list provided
- Match based on their Role and Team to the task's required skills
- If no good match exists, set volunteerId to null and explain why

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "schedule": [
    {"time": "HH:MM AM/PM - HH:MM AM/PM", "activity": "specific activity name"}
  ],
  "tasks": [
    {
      "title": "specific task title",
      "description": "detailed description of what needs to be done",
      "category": "Technical|Logistics|Marketing|Sponsorship|Hospitality|Registration|Safety|Operations|Catering|Venue|HR|Finance",
      "priority": "Urgent|High|Medium|Low",
      "deadline": "YYYY-MM-DD",
      "dependencies": ["title of task this depends on"],
      "requiredSkills": ["skill1", "skill2"],
      "suggestedRole": "role type for volunteer",
      "department": "department name"
    }
  ],
  "volunteerAssignments": [
    {
      "taskTitle": "exact task title",
      "volunteerId": "volunteer id or null",
      "volunteerName": "volunteer name or null",
      "matchReason": "why this volunteer matches (mention their role/team)",
      "noMatchReason": "why no match was found (only if volunteerId is null)"
    }
  ],
  "risks": [
    {
      "title": "specific risk title",
      "severity": "critical|high|medium|low",
      "reason": "why this is a risk for this event",
      "mitigation": "specific mitigation strategy"
    }
  ]
}

Generate at least 12-18 tasks covering all operational areas. Make them realistic and actionable.`;

  const text = await callGemini(prompt);
  const plan = extractJson(text);

  // Normalize and validate the plan
  const normalizedTasks = (plan.tasks || []).map((t, idx) => ({
    id: `task_${idx}`,
    title: t.title || 'Untitled Task',
    description: t.description || '',
    category: t.category || 'Operations',
    priority: t.priority || 'Medium',
    deadline: t.deadline || eventDateStr,
    dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
    requiredSkills: Array.isArray(t.requiredSkills) ? t.requiredSkills : [],
    suggestedRole: t.suggestedRole || '',
    department: t.department || t.category || 'Operations',
    status: 'To Do',
  }));

  const normalizedVolAssignments = (plan.volunteerAssignments || []).map(va => ({
    taskTitle: va.taskTitle || '',
    volunteerId: va.volunteerId || null,
    volunteerName: va.volunteerName || null,
    matchReason: va.matchReason || '',
    noMatchReason: va.noMatchReason || '',
    hasMatch: !!va.volunteerId,
  }));

  const normalizedRisks = (plan.risks || []).map(r => ({
    title: r.title || 'Unknown Risk',
    severity: r.severity || 'medium',
    reason: r.reason || '',
    mitigation: r.mitigation || r.suggestedAction || '',
  }));

  const normalizedSchedule = (plan.schedule || []).map(s => ({
    time: s.time || '',
    activity: s.activity || '',
  }));

  return {
    eventDetails: {
      name: details.name || analysis.eventType,
      description: details.description || analysis.summary,
      date: eventDateStr,
      venue: details.venue || 'TBD',
      location: details.venue || 'TBD',
      participants: details.participants || '',
    },
    analysis,
    schedule: normalizedSchedule,
    tasks: normalizedTasks,
    volunteerAssignments: normalizedVolAssignments,
    risks: normalizedRisks,
  };
}

// ─── Availability Check ────────────────────────────────────────────────────

/**
 * Check if Gemini API is available and configured.
 */
export function isGeminiConfigured() {
  return !!GEMINI_API_KEY;
}
