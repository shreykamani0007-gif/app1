import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  User,
  Calendar,
  Loader2,
  X,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import ActionConfirmationCard from '../components/ai/ActionConfirmationCard';
import EventPlanCard from '../components/ai/EventPlanCard';
import { useEventContext } from '../context/EventContext';
import {
  sendAiMessage,
  getAiStatus,
  createEvent,
  createTask,
  createRisk,
  createVolunteer,
  getVolunteersByEvent,
} from '../services/api';
import { defaultVolunteersByEvent } from '../data/volunteersData';

/**
 * Structured text renderer for AI responses supporting:
 * - Code blocks (```lang ... ```)
 * - Headings (#, ##, ###, ####)
 * - Bullet lists (- item or * item)
 * - Numbered lists (1. item)
 * - Bold (**text**), inline code (`code`), italic (*text*)
 */
function MarkdownRenderer({ content }) {
  if (!content) return null;

  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-3 text-slate-800 text-xs sm:text-sm leading-relaxed">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();

        // Code block
        if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
          const lines = trimmed.slice(3, -3).trim().split('\n');
          const lang = lines[0].match(/^[a-z0-9_-]+$/i) ? lines.shift() : '';
          return (
            <div key={bIdx} className="my-2 rounded-xl bg-slate-900 text-slate-100 p-3.5 text-xs font-mono overflow-x-auto shadow-inner">
              {lang && <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">{lang}</div>}
              <pre className="whitespace-pre-wrap">{lines.join('\n')}</pre>
            </div>
          );
        }

        // Headings
        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={bIdx} className="font-bold text-slate-800 text-xs sm:text-sm mt-2 mb-1">
              {renderInline(trimmed.replace(/^####\s+/, ''))}
            </h5>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={bIdx} className="font-bold text-slate-900 text-sm sm:text-base mt-2 mb-1">
              {renderInline(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={bIdx} className="font-bold text-slate-900 text-base sm:text-lg mt-3 mb-1 border-b border-slate-200 pb-1">
              {renderInline(trimmed.replace(/^##\s+/, ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={bIdx} className="font-extrabold text-slate-900 text-lg sm:text-xl mt-3 mb-1.5">
              {renderInline(trimmed.replace(/^#\s+/, ''))}
            </h2>
          );
        }

        // Horizontal rule
        if (trimmed === '---') {
          return <hr key={bIdx} className="border-slate-200 my-2" />;
        }

        // List block (bullets or numbers)
        const lines = trimmed.split('\n');
        const isBulletList = lines.every((l) => /^\s*[-*•]\s+/.test(l));
        const isNumberedList = lines.every((l) => /^\s*\d+[\.)]\s+/.test(l));

        if (isBulletList) {
          return (
            <ul key={bIdx} className="space-y-1.5 my-2 pl-4 list-disc marker:text-brand-600">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="pl-1">
                  {renderInline(line.replace(/^\s*[-*•]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={bIdx} className="space-y-1.5 my-2 pl-4 list-decimal marker:text-brand-600 marker:font-semibold">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="pl-1">
                  {renderInline(line.replace(/^\s*\d+[\.)]\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        // Regular paragraph with linebreaks
        return (
          <p key={bIdx}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Formats inline Markdown: **bold**, `code`, and *italic*
 */
function renderInline(text) {
  if (!text) return text;

  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-brand-700 font-mono text-[11px] sm:text-xs">
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      return (
        <em key={idx} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}

/**
 * Generate a complete, adaptive event plan based on user responses and available real volunteers
 */
function generateEventPlan(details, availableVolunteers = []) {
  const { name, description = '', date, venue } = details;
  const descLower = description.toLowerCase();

  // Extract volunteer names from real system volunteers or fallback to defaults
  let volunteerPool = availableVolunteers.map((v) => v.name).filter(Boolean);
  if (volunteerPool.length === 0) {
    const allDefs = Object.values(defaultVolunteersByEvent || {}).flat();
    volunteerPool = [...new Set(allDefs.map((v) => v.name))];
  }
  if (volunteerPool.length === 0) {
    volunteerPool = ['Maya Patel', 'Kavita Rao', 'Rohan Sharma', 'Liam Murphy', 'Sarah Jenkins', 'David Kim'];
  }

  const getVol = (idx) => volunteerPool[idx % volunteerPool.length];

  // 1. Adaptive Schedule based on event description
  let schedule = [];
  if (descLower.includes('hackathon') || descLower.includes('code') || descLower.includes('dev') || descLower.includes('programming')) {
    schedule = [
      { time: '08:30 AM - 09:30 AM', activity: 'Registration, Breakfast & Team Formation' },
      { time: '09:30 AM - 10:30 AM', activity: 'Opening Ceremony & Problem Statement Reveal' },
      { time: '10:30 AM - 01:00 PM', activity: 'Hacking Sprint 1 & Mentor Walkthroughs' },
      { time: '01:00 PM - 02:00 PM', activity: 'Lunch & Sponsor Booth Networking' },
      { time: '02:00 PM - 05:00 PM', activity: 'Hacking Sprint 2 & Technical Checkpoints' },
      { time: '05:00 PM - 06:30 PM', activity: 'Project Submissions & Live Demos' },
      { time: '06:30 PM - 07:30 PM', activity: 'Judging Deliberation & Award Ceremony' },
    ];
  } else if (descLower.includes('workshop') || descLower.includes('seminar') || descLower.includes('talk') || descLower.includes('training')) {
    schedule = [
      { time: '09:00 AM - 09:45 AM', activity: 'Registration & Welcome Coffee' },
      { time: '09:45 AM - 10:15 AM', activity: 'Opening Keynote & Topic Overview' },
      { time: '10:15 AM - 11:45 AM', activity: 'Interactive Workshop Session 1' },
      { time: '11:45 AM - 12:00 PM', activity: 'Mid-Morning Networking Break' },
      { time: '12:00 PM - 01:15 PM', activity: 'Hands-on Practice & Group Case Study' },
      { time: '01:15 PM - 02:15 PM', activity: 'Lunch & Peer Discussions' },
      { time: '02:15 PM - 03:45 PM', activity: 'Advanced Deep Dive & Q&A Panel' },
      { time: '03:45 PM - 04:15 PM', activity: 'Closing Remarks & Resource Distribution' },
    ];
  } else if (descLower.includes('conference') || descLower.includes('summit') || descLower.includes('symposium')) {
    schedule = [
      { time: '08:30 AM - 09:30 AM', activity: 'Badge Collection & Light Breakfast' },
      { time: '09:30 AM - 10:30 AM', activity: 'Presidential Address & Keynote Speaker' },
      { time: '10:45 AM - 12:30 PM', activity: 'Track Sessions (Technical & Leadership)' },
      { time: '12:30 PM - 01:30 PM', activity: 'Executive Networking Lunch' },
      { time: '01:30 PM - 03:30 PM', activity: 'Panel Discussion & Lightning Talks' },
      { time: '03:45 PM - 05:00 PM', activity: 'Closing Keynote & Next Year Preview' },
    ];
  } else {
    // General / cultural / sports / club event
    schedule = [
      { time: '09:00 AM - 10:00 AM', activity: 'Venue Setup & Participant Registration' },
      { time: '10:00 AM - 10:30 AM', activity: 'Welcome Address & Opening Ceremony' },
      { time: '10:30 AM - 01:00 PM', activity: 'Main Stage Events & Competitions' },
      { time: '01:00 PM - 02:00 PM', activity: 'Lunch Break & Community Booths' },
      { time: '02:00 PM - 04:30 PM', activity: 'Afternoon Showcase & Activities' },
      { time: '04:30 PM - 05:30 PM', activity: 'Award Distribution & Closing Remarks' },
    ];
  }

  // 2. Tasks
  const tasks = [
    {
      title: 'Confirm Venue Booking & AV Checklist',
      owner: 'Logistics Team',
      priority: 'High',
      deadline: '7 days before event',
    },
    {
      title: 'Finalize Volunteer Roster & Briefing',
      owner: 'Volunteer Coordinator',
      priority: 'High',
      deadline: '4 days before event',
    },
    {
      title: 'Print Participant Badges & Welcome Kits',
      owner: 'Branding Team',
      priority: 'Medium',
      deadline: '2 days before event',
    },
    {
      title: 'Coordinate Catering & Refreshment Delivery',
      owner: 'Hospitality Lead',
      priority: 'Medium',
      deadline: '1 day before event',
    },
    {
      title: 'Sound Check & Live Rehearsal',
      owner: 'Tech Lead',
      priority: 'High',
      deadline: 'Event Day 07:30 AM',
    },
    {
      title: 'Post-Event Feedback & Survey Distribution',
      owner: 'Operations Team',
      priority: 'Low',
      deadline: '1 day after event',
    },
  ];

  // 3. Volunteer Assignments (Task -> Volunteer -> Responsibility -> Time)
  const volunteerAssignments = [
    {
      task: 'Registration Desk',
      volunteer: getVol(0),
      responsibility: 'Scan QR tickets, distribute badges & welcome kits',
      time: '08:30 AM - 11:00 AM',
    },
    {
      task: 'A/V & Stage Operations',
      volunteer: getVol(1),
      responsibility: 'Manage microphones, stage projector & slide decks',
      time: '09:00 AM - 05:30 PM',
    },
    {
      task: 'Hospitality & Catering',
      volunteer: getVol(2),
      responsibility: 'Coordinate lunch service, water stations & snacks',
      time: '11:30 AM - 02:30 PM',
    },
    {
      task: 'Crowd Flow & Help Desk',
      volunteer: getVol(3),
      responsibility: 'Direct attendee movements and manage inquiries',
      time: '08:30 AM - 05:00 PM',
    },
    {
      task: 'Safety & Emergency Support',
      volunteer: getVol(4),
      responsibility: 'Emergency exit oversight and first aid point of contact',
      time: 'All Day',
    },
  ];

  // 4. Deadlines
  const deadlines = [
    { milestone: '2 Weeks Before', action: 'Finalize speakers, budget approval, and equipment rental' },
    { milestone: '1 Week Before', action: 'Close participant registration & send arrival guidelines' },
    { milestone: '3 Days Before', action: 'Finalize catering headcount & print participant badges' },
    { milestone: '1 Day Before', action: 'Venue dry run, AV test, and volunteer briefing' },
    { milestone: 'Event Day (07:30 AM)', action: 'Core team arrival & registration desk setup' },
  ];

  // 5. Potential Risks & Suggested Actions
  const risks = [
    {
      title: 'A/V & Equipment Glitches During Presentations',
      severity: 'high',
      reason: 'Microphone feedback, HDMI compatibility, or projector display delays can interrupt the event.',
      suggestedAction: 'Keep backup HDMI adapters, offline presentation copies, and test equipment 45 minutes prior.',
    },
    {
      title: 'Registration Desk Bottleneck at Peak Arrival',
      severity: 'medium',
      reason: 'Crowd arrivals concentrated within 30 minutes can create queues extending outside the venue.',
      suggestedAction: 'Split check-in into alphabetical lines (A-M, N-Z) and deploy 2 additional volunteers.',
    },
    {
      title: 'Catering & Dietary Availability Constraints',
      severity: 'low',
      reason: 'Unregistered walk-in guests or uncommunicated dietary preferences can cause shortages.',
      suggestedAction: 'Order 10-15% surplus refreshments and clearly label vegetarian and vegan options.',
    },
  ];

  return {
    eventDetails: {
      name,
      description,
      date,
      venue,
      location: venue,
    },
    schedule,
    tasks,
    volunteerAssignments,
    deadlines,
    risks,
  };
}

/**
 * Format markdown summary for event plan in chat bubble
 */
function formatPlanMarkdown(plan) {
  const { eventDetails, schedule, tasks, volunteerAssignments, deadlines, risks } = plan;

  return `### 📅 Event Plan Generated: ${eventDetails.name}

Here is the complete event schedule and operational blueprint tailored for **${eventDetails.name}**:

#### 1. Event Details
- **Event Name:** ${eventDetails.name}
- **Description:** ${eventDetails.description}
- **Date:** ${eventDetails.date}
- **Venue:** ${eventDetails.venue}

#### 2. Event Schedule
${schedule.map((s) => `- **${s.time}:** ${s.activity}`).join('\n')}

#### 3. Recommended Tasks
${tasks.map((t, idx) => `${idx + 1}. **${t.title}** — *Owner:* ${t.owner} | *Priority:* ${t.priority} | *Deadline:* ${t.deadline}`).join('\n')}

#### 4. Volunteer Assignments (Real System Volunteers)
${volunteerAssignments.map((va) => `- **${va.task}** → **${va.volunteer}** → *${va.responsibility}* (${va.time})`).join('\n')}

#### 5. Key Milestones & Deadlines
${deadlines.map((d) => `- **${d.milestone}:** ${d.action}`).join('\n')}

#### 6. Potential Risks & Suggested Actions
${risks.map((r) => `- ⚠️ **${r.title}** (${r.severity.toUpperCase()})\n  - *Reason:* ${r.reason}\n  - *Suggested Action:* ${r.suggestedAction}`).join('\n')}

---
**Would you like to add this event and its tasks, volunteers, and risks to your dashboard?**
Click **[Add to Dashboard]** below to save it, or **[Edit Plan]** to modify details.`;
}

export default function AiAssistant() {
  const { selectedEvent, selectedEventId, addNewEvent } = useEventContext();

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Conversational event schedule creation workflow state machine
  const [scheduleWorkflow, setScheduleWorkflow] = useState({
    step: 'idle', // 'idle' | 'asking_name' | 'asking_desc' | 'asking_date' | 'asking_venue' | 'plan_ready' | 'editing'
    data: {},
  });

  // AI Configuration status (queried from backend)
  const [aiConfig, setAiConfig] = useState({
    configured: true,
  });

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Clean, natural initial greeting
  const getInitialGreeting = () => ({
    id: 'welcome-msg',
    role: 'assistant',
    content: "Hello! How can I help you today? Feel free to ask general questions or anything related to your club's active event.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState(() => [getInitialGreeting()]);

  // Query backend AI status on mount
  useEffect(() => {
    getAiStatus()
      .then((res) => {
        if (res && typeof res.configured === 'boolean') {
          setAiConfig({ configured: res.configured });
        }
      })
      .catch(() => {});
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const samplePrompts = [
    {
      title: 'Design Event Schedule',
      prompt: 'Design an event schedule for my event',
      desc: 'Step-by-step AI schedule & operations planner',
    },
    {
      title: 'Create Task: Arrange Auditorium',
      prompt: 'Create a task to arrange the auditorium by October 20.',
      desc: 'Propose new task with deadline for active event',
    },
    {
      title: 'Schedule Meeting',
      prompt: 'Schedule a logistics meeting tomorrow at 5 PM.',
      desc: 'Plan ops sync with agenda and room setup',
    },
    {
      title: 'Log Potential Risk',
      prompt: 'Create a risk for possible auditorium delay.',
      desc: 'Record severity, probability & mitigation',
    },
    {
      title: 'Draft Volunteer Announcement',
      prompt: 'Draft an announcement reminding volunteers to arrive early.',
      desc: 'Prepare safety draft notice before broadcasting',
    },
  ];

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputVal).trim();
    if (!query || loading) return;

    setErrorMessage(null);
    setInputVal('');

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // =========================================================================
    // STEP 1: Check if this is a trigger for the Event Schedule Creation workflow
    // =========================================================================
    const isScheduleTrigger =
      /\b(design|create|make|plan|build|draft)\s+(an?\s+)?(event\s+)?schedule\b|\b(event\s+schedule\s+creation|schedule\s+for\s+my\s+event|schedule\s+an?\s+event|help\s+me\s+schedule|schedule\s+planner)\b/i.test(
        query
      );

    if (scheduleWorkflow.step === 'idle' && isScheduleTrigger) {
      setScheduleWorkflow({
        step: 'asking_name',
        data: {},
      });

      const assistantMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: "Sure! I'll help you create the event schedule. Let's start with the basics.\n\nWhat is the name of the event?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setTimeout(() => textareaRef.current?.focus(), 100);
      return;
    }

    // =========================================================================
    // STEP 2: Conversational Questioning Flow (ONE AT A TIME)
    // =========================================================================
    if (scheduleWorkflow.step === 'asking_name') {
      setScheduleWorkflow((prev) => ({
        step: 'asking_desc',
        data: { ...prev.data, name: query },
      }));

      const assistantMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: "Briefly describe the event.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setTimeout(() => textareaRef.current?.focus(), 100);
      return;
    }

    if (scheduleWorkflow.step === 'asking_desc') {
      setScheduleWorkflow((prev) => ({
        step: 'asking_date',
        data: { ...prev.data, description: query },
      }));

      const assistantMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: "What is the event date?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setTimeout(() => textareaRef.current?.focus(), 100);
      return;
    }

    if (scheduleWorkflow.step === 'asking_date') {
      setScheduleWorkflow((prev) => ({
        step: 'asking_venue',
        data: { ...prev.data, date: query },
      }));

      const assistantMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: "What is the venue?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setTimeout(() => textareaRef.current?.focus(), 100);
      return;
    }

    if (scheduleWorkflow.step === 'asking_venue') {
      setLoading(true);
      const fullDetails = {
        ...scheduleWorkflow.data,
        venue: query,
      };

      try {
        // Fetch existing system volunteers to assign real volunteers
        let existingVolunteers = [];
        try {
          const volRes = await getVolunteersByEvent(selectedEventId);
          if (volRes && volRes.success && Array.isArray(volRes.data) && volRes.data.length > 0) {
            existingVolunteers = volRes.data;
          }
        } catch {}

        const generatedPlan = generateEventPlan(fullDetails, existingVolunteers);
        const planMarkdown = formatPlanMarkdown(generatedPlan);

        setScheduleWorkflow({
          step: 'plan_ready',
          data: {
            ...fullDetails,
            plan: generatedPlan,
          },
        });

        const assistantMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: planMarkdown,
          eventPlan: generatedPlan,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error('[Generate Event Plan Error]:', err);
        setErrorMessage('Failed to generate event plan. Please try again.');
      } finally {
        setLoading(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
      return;
    }

    if (scheduleWorkflow.step === 'editing') {
      setLoading(true);
      try {
        const currentData = scheduleWorkflow.data;
        const updatedDetails = { ...currentData };

        // Check if user requested date or venue update
        const venueMatch = query.match(/venue\s+(?:to\s+|is\s+)?([a-z0-9\s,.-]+?)(?:\s+and|\s+date|\s+time|$)/i);
        if (venueMatch) updatedDetails.venue = venueMatch[1].trim();

        const dateMatch = query.match(/date\s+(?:to\s+|is\s+)?([a-z0-9\s,.-]+?)(?:\s+and|\s+venue|\s+time|$)/i);
        if (dateMatch) updatedDetails.date = dateMatch[1].trim();

        if (!venueMatch && !dateMatch) {
          updatedDetails.description = `${updatedDetails.description || ''} (Modifications: ${query})`;
        }

        let existingVolunteers = [];
        try {
          const volRes = await getVolunteersByEvent(selectedEventId);
          if (volRes && volRes.success && Array.isArray(volRes.data)) {
            existingVolunteers = volRes.data;
          }
        } catch {}

        const updatedPlan = generateEventPlan(updatedDetails, existingVolunteers);
        const planMarkdown = formatPlanMarkdown(updatedPlan);

        setScheduleWorkflow({
          step: 'plan_ready',
          data: {
            ...updatedDetails,
            plan: updatedPlan,
          },
        });

        const assistantMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: `I've updated the event plan based on your request:\n\n${planMarkdown}`,
          eventPlan: updatedPlan,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setErrorMessage('Failed to update event plan.');
      } finally {
        setLoading(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
      return;
    }

    // =========================================================================
    // STEP 3: Normal AI Chat / Event Context Queries (Existing Functionality)
    // =========================================================================
    setLoading(true);
    try {
      const historyPayload = updatedMessages
        .filter((m) => m.id !== 'welcome-msg')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await sendAiMessage(query, selectedEventId, historyPayload);

      if (res && res.success && res.reply) {
        const assistantMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          action: res.action || null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorText = res?.message || 'Failed to get a response from ClubOps AI.';
        setErrorMessage(errorText);
      }
    } catch (err) {
      console.error('[AI Assistant Client Error]:', err);
      setErrorMessage(
        err.message || 'Unable to connect to AI service. Please make sure the backend is running.'
      );
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleAddToDashboard = async (plan) => {
    if (!plan || !plan.eventDetails) {
      throw new Error('Event plan data is missing.');
    }

    const { eventDetails, tasks = [], volunteerAssignments = [], risks = [] } = plan;

    // 1. Create the new event in database
    let validDate = eventDetails.date;
    const parsedDate = new Date(eventDetails.date);
    if (isNaN(parsedDate.getTime())) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      validDate = d.toISOString().split('T')[0];
    } else {
      validDate = parsedDate.toISOString().split('T')[0];
    }

    const newEventPayload = {
      name: eventDetails.name,
      description: eventDetails.description,
      date: validDate,
      location: eventDetails.venue || eventDetails.location || 'Campus Center',
      venue: eventDetails.venue || eventDetails.location || 'Campus Center',
      status: 'Planning',
    };

    const createdEventRes = await createEvent(newEventPayload);
    const createdEvent = createdEventRes.data || createdEventRes;
    const eventId = createdEvent._id || createdEvent.id;

    if (!eventId) {
      throw new Error('Could not retrieve new event ID from server.');
    }

    // 2. Automatically populate Tasks
    for (const t of tasks) {
      try {
        await createTask(eventId, {
          title: t.title,
          owner: t.owner || 'Core Team',
          priority: t.priority || 'Medium',
          deadline: t.deadline || 'TBD',
          department: 'Operations',
          status: 'To Do',
        });
      } catch (err) {
        console.warn('Failed to save task:', err.message);
      }
    }

    // 3. Automatically populate Volunteers
    for (const va of volunteerAssignments) {
      try {
        await createVolunteer(eventId, {
          name: va.volunteer,
          role: va.responsibility,
          team: va.task,
          shift: va.time,
          status: 'confirmed',
          email: `${va.volunteer.toLowerCase().replace(/[^a-z0-9]/g, '')}@campus.edu`,
        });
      } catch (err) {
        console.warn('Failed to save volunteer:', err.message);
      }
    }

    // 4. Automatically populate Risks
    for (const r of risks) {
      try {
        await createRisk(eventId, {
          title: r.title,
          category: 'Operations',
          severity: (r.severity || 'Medium').toLowerCase(),
          probability: 'medium',
          impact: 'Moderate',
          owner: 'Core Team',
          mitigation: r.suggestedAction || r.reason || '',
          status: 'open',
        });
      } catch (err) {
        console.warn('Failed to save risk:', err.message);
      }
    }

    // 5. Update centralized EventContext so all pages reflect the new event immediately
    addNewEvent(createdEvent);

    // Reset schedule workflow state back to idle
    setScheduleWorkflow({ step: 'idle', data: {} });

    return createdEvent;
  };

  const handleEditPlan = () => {
    setScheduleWorkflow((prev) => ({
      ...prev,
      step: 'editing',
    }));

    const assistantMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: 'What would you like to modify? (e.g., schedule, tasks, venue, date)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setScheduleWorkflow({ step: 'idle', data: {} });
    setMessages([getInitialGreeting()]);
    setErrorMessage(null);
    setInputVal('');
  };

  const isStarterState = messages.length <= 1;

  return (
    <div className="w-full h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Sleek Top Navigation Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-4 sm:px-6 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-brand-500/25 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">ClubOps Copilot</h1>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <Calendar className="w-3 h-3 text-brand-600" />
                Active Event: {selectedEvent?.name || 'All Events'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {aiConfig.configured ? (
            <StatusBadge status="confirmed" label="Google Gemini Connected" />
          ) : (
            <StatusBadge status="urgent" label="AI Offline" />
          )}

          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={handleClearChat}
            title="Reset conversation"
            className="text-xs h-8 text-slate-500 hover:text-slate-800"
          >
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Main Chat Canvas */}
      <Card className="flex-1 flex flex-col min-h-0 border-slate-200/90 shadow-sm overflow-hidden bg-gradient-to-b from-slate-50/40 via-white to-white">
        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4">
          {messages.map((msg) => {
            const isAi = msg.role === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[94%] sm:max-w-[85%] lg:max-w-[80%] ${
                  isAi ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isAi
                      ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-brand-500/20'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className="flex flex-col group min-w-0">
                  <div
                    className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs relative ${
                      isAi
                        ? 'bg-white border border-slate-200/90 text-slate-800'
                        : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white'
                    }`}
                  >
                    {isAi ? (
                      <>
                        <MarkdownRenderer content={msg.content} />
                        {msg.eventPlan && (
                          <EventPlanCard
                            plan={msg.eventPlan}
                            onAddToDashboard={handleAddToDashboard}
                            onEditPlan={handleEditPlan}
                          />
                        )}
                        {msg.action && (
                          <ActionConfirmationCard
                            action={msg.action}
                            onActionComplete={(actId, res) => {
                              setMessages((prev) =>
                                prev.map((m) =>
                                  m.id === msg.id
                                    ? {
                                        ...m,
                                        action: {
                                          ...m.action,
                                          status: 'confirmed',
                                          result: res.data,
                                        },
                                      }
                                    : m
                                )
                              );
                            }}
                            onActionCancel={() => {
                              setMessages((prev) =>
                                prev.map((m) =>
                                  m.id === msg.id
                                    ? {
                                        ...m,
                                        action: {
                                          ...m.action,
                                          status: 'cancelled',
                                        },
                                      }
                                    : m
                                )
                              );
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    )}

                    {/* Copy action on AI bubbles */}
                    {isAi && msg.id !== 'welcome-msg' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Metadata */}
                  <span
                    className={`text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1.5 ${
                      isAi ? 'text-left' : 'text-right justify-end'
                    }`}
                  >
                    {isAi ? (
                      <>
                        <span>ClubOps AI</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    ) : (
                      <>
                        <span>You</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Action Cards in Starter State */}
          {isStarterState && (
            <div className="my-6 pt-4 border-t border-slate-100 animate-fade-in max-w-3xl">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Try Asking:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {samplePrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="text-left p-3.5 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 text-xs transition-all shadow-2xs group cursor-pointer"
                  >
                    <div className="font-semibold text-slate-800 group-hover:text-brand-700 flex items-center justify-between">
                      <span>{item.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading bubble */}
          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-start animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-brand-200 rounded-2xl px-4 py-3 shadow-2xs text-xs text-slate-700 flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
                <span>ClubOps AI is thinking...</span>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800 flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-rose-700 leading-relaxed">{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Compact Quick Suggestions Pill Bar (Only when chat has started) */}
        {!isStarterState && (
          <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200/70 shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" /> Suggestions:
            </span>
            {samplePrompts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleSendMessage(item.prompt)}
                className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 text-[11px] text-slate-600 font-medium transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {item.title}
              </button>
            ))}
          </div>
        )}

        {/* Full-Width Bottom Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200/90 shrink-0">
          <div className="relative flex items-center bg-slate-50/90 border border-slate-300 rounded-2xl p-1.5 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all shadow-2xs">
            <input
              ref={textareaRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask anything or request event operations tasks..."
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
            />
            <div className="shrink-0 pr-1">
              <Button
                type="button"
                size="sm"
                variant="primary"
                icon={loading ? Loader2 : Send}
                disabled={!inputVal.trim() || loading}
                onClick={() => handleSendMessage()}
                className={loading ? 'animate-pulse' : ''}
              >
                <span>{loading ? 'Thinking...' : 'Send'}</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 mt-1.5 px-1">
            <span>
              Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Shift + Enter</kbd> for newline
            </span>
            <span className="text-slate-400">Powered by Google Gemini</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
