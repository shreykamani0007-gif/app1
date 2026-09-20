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

function getApiKey() {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof process !== 'undefined' && (process.env?.VITE_GEMINI_API_KEY || process.env?.GEMINI_API_KEY)) ||
    ''
  );
}

let _ai = null;
function getAi() {
  if (!_ai) {
    const key = getApiKey();
    if (!key) throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env');
    _ai = new GoogleGenAI({ apiKey: key });
  }
  return _ai;
}

const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.7-flash'];

// ─── JSON Extraction Helper ────────────────────────────────────────────────

/**
 * Extract JSON from a Gemini response that might have surrounding text or markdown.
 */
function extractJson(text) {
  if (!text) throw new Error('Empty Gemini response');

  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch { }

  // Strip markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch { }
  }

  // Find first { ... } block
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch { }
  }

  throw new Error('Could not extract valid JSON from Gemini response');
}

/**
 * Call Gemini model with candidate fallback, return raw text.
 */
async function callGemini(prompt) {
  const ai = getAi();
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        });
        const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || response?.text || '';
        if (text && text.trim()) return text;
      } catch (err) {
        lastError = err;
        if (err.message && (err.message.includes('503') || err.message.includes('UNAVAILABLE') || err.message.includes('overloaded') || err.message.includes('high demand'))) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('Gemini returned an empty response across all models');
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
  let eventDate = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
  if (details.date) {
    const parsed = new Date(details.date);
    if (!isNaN(parsed.getTime())) eventDate = parsed;
  }
  const eventDateStr = eventDate.toISOString().split('T')[0];

  const safeAnalysis = {
    eventType: analysis?.eventType || 'Event',
    eventScale: analysis?.eventScale || 'Medium',
    duration: analysis?.duration || '1 day',
    targetAudience: analysis?.targetAudience || 'Students',
    activities: Array.isArray(analysis?.activities) ? analysis.activities : [],
    operationalAreas: Array.isArray(analysis?.operationalAreas) ? analysis.operationalAreas : ['Operations', 'Logistics'],
    requirements: Array.isArray(analysis?.requirements) ? analysis.requirements : [],
    dependencies: Array.isArray(analysis?.dependencies) ? analysis.dependencies : [],
    risks: Array.isArray(analysis?.risks) ? analysis.risks : [],
    summary: details.description || analysis?.summary || '',
  };

  const volunteersStr = volunteers.length > 0
    ? volunteers.map(v => `- ID: "${v.id || v._id}", Name: "${v.name}", Role: "${v.role}", Team/Dept: "${v.team || v.department || 'Operations'}", Shift: "${v.shift || 'Flexible'}"`).join('\n')
    : 'No volunteers currently registered in the database.';

  const prompt = `You are an expert event operations planner for ClubOps AI. Generate a COMPLETE, HIGHLY CONTEXT-AWARE event plan based strictly on the event analysis and details below.

EVENT ANALYSIS:
- Event Type: ${safeAnalysis.eventType}
- Scale: ${safeAnalysis.eventScale}
- Duration: ${safeAnalysis.duration}
- Target Audience: ${safeAnalysis.targetAudience}
- Expected Participants: ${details.participants || safeAnalysis.expectedParticipants || 'As specified'}
- Activities: ${safeAnalysis.activities.join(', ') || 'General event activities'}
- Required Operational Areas: ${safeAnalysis.operationalAreas.join(', ')}
- Identified Resources & Requirements: ${safeAnalysis.requirements.join(', ') || 'Standard equipment'}
- Dependencies: ${safeAnalysis.dependencies.join(', ') || 'Standard operational flow'}
- Potential Risks: ${safeAnalysis.risks.join(', ') || 'Standard operational risks'}

COLLECTED EVENT DETAILS:
- Event Name: ${details.name || safeAnalysis.eventType}
- Event Date: ${eventDateStr}
- Venue: ${details.venue || 'To be confirmed'}
- Expected Participants: ${details.participants || safeAnalysis.expectedParticipants || 'Confirmed'}
- Additional Description: ${details.description || safeAnalysis.summary}

AVAILABLE VOLUNTEERS IN DATABASE:
${volunteersStr}

==================================================
TASK GENERATION RULES:
==================================================
1. Do NOT generate the same fixed/generic task list. The task list must specifically adapt to a ${safeAnalysis.eventType}.
${safeAnalysis.eventType.toLowerCase().includes('hackathon') ? '- For this Hackathon: Generate technical tasks (platform, Wi-Fi, contestant accounts), sponsorship tasks (packages, logos, prize pool), logistics (power strips, seating, food), mentor management (schedule, invitations), workshops, registration desk, judging & demos, prize ceremony.' : ''}
${safeAnalysis.eventType.toLowerCase().includes('cricket') || safeAnalysis.eventType.toLowerCase().includes('sports') || safeAnalysis.eventType.toLowerCase().includes('tournament') ? '- For this Sports Tournament: Generate sports/ground tasks (pitch/court preparation, equipment inspection), team management (fixtures, team check-in), referee/umpire coordination, scorekeeping, medical/first-aid team, audience safety, refreshments, trophy distribution.' : ''}
${safeAnalysis.eventType.toLowerCase().includes('cultural') || safeAnalysis.eventType.toLowerCase().includes('festival') ? '- For this Cultural Festival: Generate stage setup, sound & lighting, artist/performer schedule, costume & green room, crowd management, photography/videography, security, anchor coordination, awards.' : ''}
${safeAnalysis.eventType.toLowerCase().includes('workshop') ? '- For this Workshop: Generate speaker confirmation, hands-on lab equipment, projector & AV, attendee software prerequisites, print materials, attendance tracking, feedback forms, certificates.' : ''}
${safeAnalysis.eventType.toLowerCase().includes('seminar') ? '- For this Seminar: Generate guest speaker travel & hospitality, auditorium AV & mics, presentation review, VIP seating, registration desk, live streaming, Q&A moderation, memento presentation.' : ''}
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
      "responsibility": "specific responsibility (e.g. Registration Desk, AV Setup, Entry Management)",
      "time": "reporting time or shift (e.g. 09:00 AM)",
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
    suggestedRole: t.suggestedVolunteerRole || t.suggestedRole || '',
    suggestedVolunteerRole: t.suggestedVolunteerRole || t.suggestedRole || '',
    department: t.department || t.category || 'Operations',
    status: 'To Do',
  }));

  const normalizedVolAssignments = (plan.volunteerAssignments || []).map((va, idx) => {
    const hasMatch = Boolean(va.hasMatch !== false && va.volunteerId && va.volunteerName);
    const defaultTimes = ['08:00 AM', '09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '01:00 PM'];
    return {
      taskTitle: va.taskTitle || '',
      volunteerId: hasMatch ? va.volunteerId : null,
      volunteerName: hasMatch ? va.volunteerName : null,
      responsibility: va.responsibility || (hasMatch ? `${va.volunteerName}'s Operational Task` : 'Unassigned'),
      time: va.time || defaultTimes[idx % defaultTimes.length],
      matchReason: hasMatch ? (va.matchReason || 'Matched by role & skill') : '',
      noMatchReason: hasMatch ? '' : (va.noMatchReason || '⚠️ Not enough volunteers available for this task.'),
      hasMatch,
    };
  });

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
  return !!getApiKey();
}
