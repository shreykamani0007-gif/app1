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
  Brain,
  Zap,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import ActionConfirmationCard from '../components/ai/ActionConfirmationCard';
import EventPlanCard from '../components/ai/EventPlanCard';
import EventAnalysisCard from '../components/ai/EventAnalysisCard';
import { useEventContext } from '../context/EventContext';
import { useAiChat } from '../context/AiChatContext';
import {
  sendAiMessage,
  getAiStatus,
  createEvent,
  createTask,
  createRisk,
  createVolunteer,
  getVolunteersByEvent,
} from '../services/api';
import {
  analyzeEventIdea,
  generateEventPlan,
  determineNextQuestion,
  isGeminiConfigured,
} from '../services/geminiService';
import { defaultVolunteersByEvent } from '../data/volunteersData';

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function renderInline(text) {
  if (!text) return text;
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4)
      return <strong key={idx} className="font-semibold text-slate-900">{token.slice(2, -2)}</strong>;
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2)
      return <code key={idx} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-brand-700 font-mono text-[11px] sm:text-xs">{token.slice(1, -1)}</code>;
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2)
      return <em key={idx} className="italic text-slate-800">{token.slice(1, -1)}</em>;
    return token;
  });
}

function MarkdownRenderer({ content }) {
  if (!content) return null;
  const blocks = content.split(/\n\n+/);
  return (
    <div className="space-y-3 text-slate-800 text-xs sm:text-sm leading-relaxed">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
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
        if (trimmed.startsWith('#### ')) return <h5 key={bIdx} className="font-bold text-slate-800 text-xs sm:text-sm mt-2 mb-1">{renderInline(trimmed.replace(/^####\s+/, ''))}</h5>;
        if (trimmed.startsWith('### ')) return <h4 key={bIdx} className="font-bold text-slate-900 text-sm sm:text-base mt-2 mb-1">{renderInline(trimmed.replace(/^###\s+/, ''))}</h4>;
        if (trimmed.startsWith('## ')) return <h3 key={bIdx} className="font-bold text-slate-900 text-base sm:text-lg mt-3 mb-1 border-b border-slate-200 pb-1">{renderInline(trimmed.replace(/^##\s+/, ''))}</h3>;
        if (trimmed.startsWith('# ')) return <h2 key={bIdx} className="font-extrabold text-slate-900 text-lg sm:text-xl mt-3 mb-1.5">{renderInline(trimmed.replace(/^#\s+/, ''))}</h2>;
        if (trimmed === '---') return <hr key={bIdx} className="border-slate-200 my-2" />;

        const lines = trimmed.split('\n');
        const isBulletList = lines.every((l) => /^\s*[-*•]\s+/.test(l));
        const isNumberedList = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));

        if (isBulletList) return (
          <ul key={bIdx} className="space-y-1.5 my-2 pl-4 list-disc marker:text-brand-600">
            {lines.map((line, lIdx) => <li key={lIdx} className="pl-1">{renderInline(line.replace(/^\s*[-*•]\s+/, ''))}</li>)}
          </ul>
        );
        if (isNumberedList) return (
          <ol key={bIdx} className="space-y-1.5 my-2 pl-4 list-decimal marker:text-brand-600 marker:font-semibold">
            {lines.map((line, lIdx) => <li key={lIdx} className="pl-1">{renderInline(line.replace(/^\s*\d+[.)]\s+/, ''))}</li>)}
          </ol>
        );
        return (
          <p key={bIdx}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>{renderInline(line)}{lIdx < lines.length - 1 && <br />}</React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

// ─── Event Idea Detection ─────────────────────────────────────────────────────

function detectEventIdea(text) {
  const t = (text || '').toLowerCase().trim();

  // Traditional schedule workflow trigger
  const isScheduleTrigger =
    /\b(design|create|make|plan|build|draft)\s+(an?\s+)?(event\s+)?schedule\b/.test(t) ||
    /\b(event\s+schedule\s+creation|schedule\s+for\s+my\s+event|schedule\s+planner)\b/.test(t);

  // Broad event idea patterns
  const isEventIdea =
    /\b(organize|organise|host|run|conduct|hold|arrange|manage)\b.*\b(event|fest|festival|hackathon|workshop|seminar|competition|tournament|ceremony|conference|exhibition|meetup|webinar|symposium|summit)\b/.test(t) ||
    /\b(want to|going to|planning to|we are|we want|i am|i want)\b.*\b(organize|host|run|plan|have|conduct|hold)\b.*\b(event|hackathon|fest|workshop|seminar|competition|tournament|conference|festival)\b/.test(t) ||
    /\b(hackathon|festival|tournament|competition|workshop|seminar|conference|exhibition|cultural\s+fest|tech\s+fest|sports\s+meet|quiz\s+competition)\b.*\b(for|with|about|of|having)\b/.test(t) ||
    /\bwe\s+are\s+(organizing|hosting|planning|conducting|running|holding)\b/.test(t) ||
    /\b(2-day|1-day|one-day|two-day|multi-day|weekend)\b.*\b(event|hackathon|fest|tournament|workshop|seminar)\b/.test(t);

  return { isScheduleTrigger, isEventIdea: isScheduleTrigger || isEventIdea };
}

// ─── Fallback Plan Generator (when Gemini is offline) ────────────────────────

function generateFallbackPlan(details, availableVolunteers = []) {
  const { name, description = '', date, venue, participants } = details;
  const descLower = (description + ' ' + name).toLowerCase();

  let volunteerPool = availableVolunteers.map((v) => v.name).filter(Boolean);
  if (volunteerPool.length === 0) {
    const allDefs = Object.values(defaultVolunteersByEvent || {}).flat();
    volunteerPool = [...new Set(allDefs.map((v) => v.name))];
  }
  if (volunteerPool.length === 0) {
    volunteerPool = ['Maya Patel', 'Kavita Rao', 'Rohan Sharma', 'Liam Murphy', 'Sarah Jenkins', 'David Kim'];
  }
  const getVol = (idx) => volunteerPool[idx % volunteerPool.length];

  const eventDate = date ? new Date(date) : new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
  const daysOffset = (d) => {
    const dt = new Date(eventDate);
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().split('T')[0];
  };

  let tasks = [];
  let schedule = [];

  if (descLower.includes('hackathon') || descLower.includes('coding') || descLower.includes('programming')) {
    tasks = [
      { title: 'Set Up Registration Platform', category: 'Technical', priority: 'High', deadline: daysOffset(-21), description: 'Configure participant registration portal with team formation and problem statement access.', dependencies: [], requiredSkills: ['web development', 'technical'], suggestedRole: 'Technical Volunteer', department: 'Technical' },
      { title: 'Configure Contest Judging Platform', category: 'Technical', priority: 'High', deadline: daysOffset(-14), description: 'Set up judging dashboard, scoring rubrics, and submission portal.', dependencies: ['Set Up Registration Platform'], requiredSkills: ['technical', 'platform administration'], suggestedRole: 'Technical Volunteer', department: 'Technical' },
      { title: 'Test Wi-Fi & Network Infrastructure', category: 'Technical', priority: 'Urgent', deadline: daysOffset(-2), description: 'Verify bandwidth for 200+ simultaneous connections, configure isolated network for contestants.', dependencies: [], requiredSkills: ['networking', 'technical'], suggestedRole: 'IT Volunteer', department: 'Technical' },
      { title: 'Contact & Confirm Sponsors', category: 'Sponsorship', priority: 'High', deadline: daysOffset(-21), description: 'Reach out to corporate sponsors for prize money, swag, and booth space. Confirm packages.', dependencies: [], requiredSkills: ['communication', 'sponsorship'], suggestedRole: 'Outreach Volunteer', department: 'Sponsorship' },
      { title: 'Collect Sponsor Branding Assets', category: 'Sponsorship', priority: 'Medium', deadline: daysOffset(-14), description: 'Gather sponsor logos, banners, and branding requirements for event materials.', dependencies: ['Contact & Confirm Sponsors'], requiredSkills: ['communication', 'design'], suggestedRole: 'Outreach Volunteer', department: 'Sponsorship' },
      { title: 'Identify & Invite Mentors', category: 'HR', priority: 'High', deadline: daysOffset(-14), description: 'Identify experienced developers and domain experts as mentors. Send invitations with schedule.', dependencies: [], requiredSkills: ['communication', 'networking'], suggestedRole: 'Guest Relations Volunteer', department: 'HR' },
      { title: 'Confirm Mentor Availability & Schedule', category: 'HR', priority: 'Medium', deadline: daysOffset(-7), description: 'Finalize mentor slots, domains covered, and on-site rotation schedule.', dependencies: ['Identify & Invite Mentors'], requiredSkills: ['coordination'], suggestedRole: 'Guest Relations Volunteer', department: 'HR' },
      { title: 'Confirm Workshop Speakers & Topics', category: 'Operations', priority: 'High', deadline: daysOffset(-14), description: 'Finalize workshop topics, speaker details, and session timings.', dependencies: [], requiredSkills: ['communication', 'event management'], suggestedRole: 'Event Coordinator', department: 'Operations' },
      { title: 'Book & Confirm Venue', category: 'Logistics', priority: 'Urgent', deadline: daysOffset(-21), description: 'Confirm venue booking, get access timings, and map out space allocation.', dependencies: [], requiredSkills: ['logistics', 'coordination'], suggestedRole: 'Logistics Volunteer', department: 'Logistics' },
      { title: 'Arrange Seating & Power Supply', category: 'Logistics', priority: 'High', deadline: daysOffset(-3), description: 'Set up workstations, power extensions for contestants, and charging stations.', dependencies: ['Book & Confirm Venue'], requiredSkills: ['logistics', 'setup'], suggestedRole: 'Logistics Volunteer', department: 'Logistics' },
      { title: 'Design & Run Marketing Campaign', category: 'Marketing', priority: 'High', deadline: daysOffset(-14), description: 'Create posters, social media posts, and email campaigns to attract registrations.', dependencies: ['Contact & Confirm Sponsors'], requiredSkills: ['design', 'marketing', 'social media'], suggestedRole: 'Marketing Volunteer', department: 'Marketing' },
      { title: 'Print Participant Badges & Welcome Kits', category: 'Logistics', priority: 'Medium', deadline: daysOffset(-2), description: 'Print name badges, participant packets, and assemble welcome kits with sponsor swag.', dependencies: ['Collect Sponsor Branding Assets'], requiredSkills: ['printing', 'logistics'], suggestedRole: 'Logistics Volunteer', department: 'Logistics' },
      { title: 'Coordinate Catering & Refreshments', category: 'Catering', priority: 'Medium', deadline: daysOffset(-3), description: 'Order food for all participants across meals (breakfast, lunch, dinner, snacks).', dependencies: [], requiredSkills: ['catering', 'logistics'], suggestedRole: 'Hospitality Volunteer', department: 'Catering' },
      { title: 'Run Registration & Check-In Desk', category: 'Operations', priority: 'High', deadline: daysOffset(0), description: 'Manage participant check-in, badge distribution, and team formation on event day.', dependencies: ['Print Participant Badges & Welcome Kits'], requiredSkills: ['registration', 'people management'], suggestedRole: 'Registration Volunteer', department: 'Operations' },
      { title: 'Volunteer Briefing Session', category: 'HR', priority: 'High', deadline: daysOffset(-1), description: 'Brief all volunteers on their roles, schedules, emergency procedures, and escalation protocols.', dependencies: [], requiredSkills: ['communication', 'training'], suggestedRole: 'Team Lead', department: 'HR' },
      { title: 'Set Up Judging Panel & Evaluation', category: 'Operations', priority: 'High', deadline: daysOffset(0), description: 'Brief judges on rubrics, coordinate demo sessions, and tabulate scores.', dependencies: ['Configure Contest Judging Platform'], requiredSkills: ['coordination', 'technical evaluation'], suggestedRole: 'Coordinator', department: 'Operations' },
      { title: 'Organize Prize Distribution Ceremony', category: 'Operations', priority: 'High', deadline: daysOffset(0), description: 'Coordinate awards ceremony, prepare trophies/certificates, and arrange photography.', dependencies: ['Set Up Judging Panel & Evaluation'], requiredSkills: ['event management', 'coordination'], suggestedRole: 'Event Coordinator', department: 'Operations' },
      { title: 'Post-Event Feedback & Report', category: 'Operations', priority: 'Low', deadline: daysOffset(2), description: 'Collect participant feedback, compile event report, and share with team and sponsors.', dependencies: ['Organize Prize Distribution Ceremony'], requiredSkills: ['reporting', 'analysis'], suggestedRole: 'Operations Volunteer', department: 'Operations' },
    ];
    schedule = [
      { time: '08:00 AM - 09:00 AM', activity: 'Volunteer Setup & Core Team Arrival' },
      { time: '09:00 AM - 10:00 AM', activity: 'Participant Registration & Team Formation' },
      { time: '10:00 AM - 11:00 AM', activity: 'Opening Ceremony & Problem Statement Reveal' },
      { time: '11:00 AM - 01:00 PM', activity: 'Hacking Sprint 1 & Mentor Walkthroughs' },
      { time: '01:00 PM - 02:00 PM', activity: 'Lunch & Sponsor Booth Networking' },
      { time: '02:00 PM - 04:00 PM', activity: 'Workshop Sessions' },
      { time: '04:00 PM - 07:00 PM', activity: 'Hacking Sprint 2 & Technical Checkpoints' },
      { time: '07:00 PM - 08:00 PM', activity: 'Dinner & Networking' },
      { time: '08:00 PM - Overnight', activity: 'Continued Hacking & Overnight Mentor Support' },
      { time: 'Day 2 - 09:00 AM - 12:00 PM', activity: 'Final Sprint & Project Submission' },
      { time: 'Day 2 - 12:00 PM - 02:00 PM', activity: 'Project Demos & Judging' },
      { time: 'Day 2 - 02:00 PM - 03:00 PM', activity: 'Award Ceremony & Prize Distribution' },
    ];
  } else if (descLower.includes('cricket') || descLower.includes('football') || descLower.includes('sport') || descLower.includes('tournament') || descLower.includes('match')) {
    tasks = [
      { title: 'Team Registration & Eligibility Check', category: 'Registration', priority: 'High', deadline: daysOffset(-14), description: 'Register all participating teams, verify eligibility, and collect player details.', dependencies: [], requiredSkills: ['registration', 'administration'], suggestedRole: 'Registration Volunteer', department: 'Registration' },
      { title: 'Book Venue / Ground / Court', category: 'Logistics', priority: 'Urgent', deadline: daysOffset(-21), description: 'Reserve and confirm the sports venue, arrange necessary permits.', dependencies: [], requiredSkills: ['logistics', 'coordination'], suggestedRole: 'Logistics Volunteer', department: 'Logistics' },
      { title: 'Identify & Assign Referees / Umpires', category: 'Operations', priority: 'High', deadline: daysOffset(-14), description: 'Recruit certified referees/umpires for all matches and confirm their availability.', dependencies: [], requiredSkills: ['sports management', 'coordination'], suggestedRole: 'Operations Coordinator', department: 'Operations' },
      { title: 'Create Tournament Bracket & Schedule', category: 'Operations', priority: 'High', deadline: daysOffset(-10), description: 'Design round-robin or knockout bracket, generate match schedule and venue assignments.', dependencies: ['Team Registration & Eligibility Check'], requiredSkills: ['planning', 'sports management'], suggestedRole: 'Event Coordinator', department: 'Operations' },
      { title: 'Prepare Ground / Pitch / Court', category: 'Logistics', priority: 'High', deadline: daysOffset(-1), description: 'Prepare playing surface, mark boundaries, set up nets/stumps/goals.', dependencies: ['Book Venue / Ground / Court'], requiredSkills: ['ground management', 'physical setup'], suggestedRole: 'Logistics Volunteer', department: 'Logistics' },
      { title: 'Arrange Sports Equipment', category: 'Logistics', priority: 'High', deadline: daysOffset(-3), description: 'Procure balls, protective gear, uniforms, and other sport-specific equipment.', dependencies: [], requiredSkills: ['logistics', 'procurement'], suggestedRole: 'Logistics Volunteer', department: 'Logistics' },
      { title: 'Set Up Scorekeeping System', category: 'Technical', priority: 'Medium', deadline: daysOffset(-2), description: 'Configure digital or physical scoreboard, set up live score tracking.', dependencies: ['Create Tournament Bracket & Schedule'], requiredSkills: ['technical', 'sports management'], suggestedRole: 'Technical Volunteer', department: 'Technical' },
      { title: 'Arrange Medical Support & First Aid', category: 'Safety', priority: 'Urgent', deadline: daysOffset(-1), description: 'Station trained medical personnel with first aid kit and emergency procedures.', dependencies: [], requiredSkills: ['first aid', 'medical'], suggestedRole: 'Safety Volunteer', department: 'Safety' },
      { title: 'Audience & Crowd Management', category: 'Safety', priority: 'High', deadline: daysOffset(0), description: 'Manage spectator areas, enforce safety zones around playing field.', dependencies: [], requiredSkills: ['crowd management', 'safety'], suggestedRole: 'Safety Volunteer', department: 'Safety' },
      { title: 'Design Marketing & Promotion', category: 'Marketing', priority: 'Medium', deadline: daysOffset(-14), description: 'Create posters, social posts, and announcements to attract teams and spectators.', dependencies: [], requiredSkills: ['design', 'marketing'], suggestedRole: 'Marketing Volunteer', department: 'Marketing' },
      { title: 'Arrange Catering & Refreshments', category: 'Catering', priority: 'Medium', deadline: daysOffset(-3), description: 'Arrange food and water for players, officials, and volunteers throughout the event.', dependencies: [], requiredSkills: ['catering', 'logistics'], suggestedRole: 'Hospitality Volunteer', department: 'Catering' },
      { title: 'Prepare Trophies, Medals & Certificates', category: 'Operations', priority: 'Medium', deadline: daysOffset(-3), description: 'Order/prepare awards for winners, runners-up, and special recognitions.', dependencies: [], requiredSkills: ['procurement', 'coordination'], suggestedRole: 'Operations Volunteer', department: 'Operations' },
      { title: 'Prize Distribution & Closing Ceremony', category: 'Operations', priority: 'High', deadline: daysOffset(0), description: 'Organize final ceremony, distribute trophies and certificates, and take group photos.', dependencies: ['Prepare Trophies, Medals & Certificates'], requiredSkills: ['event management'], suggestedRole: 'Event Coordinator', department: 'Operations' },
      { title: 'Post-Event Report & Feedback', category: 'Operations', priority: 'Low', deadline: daysOffset(2), description: 'Collect team feedback, compile tournament report, and document lessons learned.', dependencies: [], requiredSkills: ['reporting'], suggestedRole: 'Operations Volunteer', department: 'Operations' },
    ];
    schedule = [
      { time: '07:30 AM - 08:30 AM', activity: 'Ground Setup & Officials Briefing' },
      { time: '08:30 AM - 09:00 AM', activity: 'Team Registration & Toss' },
      { time: '09:00 AM - 12:00 PM', activity: 'Quarter-Final Matches (Group A & B)' },
      { time: '12:00 PM - 01:00 PM', activity: 'Lunch Break & Scoreboard Update' },
      { time: '01:00 PM - 04:00 PM', activity: 'Semi-Final Matches' },
      { time: '04:00 PM - 04:30 PM', activity: 'Break & Final Preparation' },
      { time: '04:30 PM - 07:00 PM', activity: 'Grand Final Match' },
      { time: '07:00 PM - 07:30 PM', activity: 'Prize Distribution & Closing Ceremony' },
    ];
  } else if (descLower.includes('cultural') || descLower.includes('dance') || descLower.includes('music') || descLower.includes('drama') || descLower.includes('performance') || descLower.includes('fest')) {
    tasks = [
      { title: 'Book Stage & Venue', category: 'Logistics', priority: 'Urgent', deadline: daysOffset(-21), description: 'Confirm main stage, backstage area, green room, and audience seating layout.', dependencies: [], requiredSkills: ['logistics', 'venue management'], suggestedRole: 'Logistics Volunteer', department: 'Logistics' },
      { title: 'Identify & Invite Performers / Artists', category: 'Operations', priority: 'High', deadline: daysOffset(-14), description: 'Reach out to dance groups, music bands, drama clubs, and solo performers. Confirm availability.', dependencies: [], requiredSkills: ['communication', 'talent management'], suggestedRole: 'Guest Relations Volunteer', department: 'Operations' },
      { title: 'Finalize Performance Schedule & Running Order', category: 'Operations', priority: 'High', deadline: daysOffset(-7), description: 'Create timed schedule for all performances, allocate stage time, and plan transitions.', dependencies: ['Identify & Invite Performers / Artists'], requiredSkills: ['scheduling', 'event management'], suggestedRole: 'Event Coordinator', department: 'Operations' },
      { title: 'Set Up Sound & Lighting System', category: 'Technical', priority: 'Urgent', deadline: daysOffset(-1), description: 'Install and test PA system, stage monitors, spotlights, and effects lighting.', dependencies: ['Book Stage & Venue'], requiredSkills: ['audio-visual', 'technical', 'lighting'], suggestedRole: 'A/V Technical Volunteer', department: 'Technical' },
      { title: 'Conduct Sound Check & Rehearsal', category: 'Technical', priority: 'High', deadline: daysOffset(-1), description: 'Run full technical rehearsal with each performing group. Check microphone levels, lighting cues.', dependencies: ['Set Up Sound & Lighting System'], requiredSkills: ['audio-visual', 'coordination'], suggestedRole: 'Stage Manager', department: 'Technical' },
      { title: 'Arrange Costumes, Props & Backstage Support', category: 'Operations', priority: 'Medium', deadline: daysOffset(-3), description: 'Coordinate costume logistics, props storage, and quick-change facilities for performers.', dependencies: ['Identify & Invite Performers / Artists'], requiredSkills: ['backstage management', 'logistics'], suggestedRole: 'Backstage Volunteer', department: 'Operations' },
      { title: 'Stage Decoration & Set Design', category: 'Logistics', priority: 'Medium', deadline: daysOffset(-1), description: 'Decorate main stage and venue with themed backdrops, banners, and visual elements.', dependencies: ['Book Stage & Venue'], requiredSkills: ['decoration', 'design', 'logistics'], suggestedRole: 'Decoration Volunteer', department: 'Logistics' },
      { title: 'Ticketing & Audience Registration', category: 'Registration', priority: 'High', deadline: daysOffset(-7), description: 'Set up online/offline ticketing, manage entry passes, and coordinate gate management.', dependencies: [], requiredSkills: ['registration', 'ticketing'], suggestedRole: 'Registration Volunteer', department: 'Registration' },
      { title: 'Security & Crowd Management', category: 'Safety', priority: 'High', deadline: daysOffset(0), description: 'Deploy security personnel for entry control, emergency exits, and crowd flow management.', dependencies: [], requiredSkills: ['security', 'crowd management'], suggestedRole: 'Safety Volunteer', department: 'Safety' },
      { title: 'Photography & Videography', category: 'Marketing', priority: 'Medium', deadline: daysOffset(0), description: 'Assign photographers and videographers to capture performances, backstage moments, and crowd.', dependencies: [], requiredSkills: ['photography', 'videography'], suggestedRole: 'Media Volunteer', department: 'Marketing' },
      { title: 'Food & Refreshment Stalls', category: 'Catering', priority: 'Medium', deadline: daysOffset(-3), description: 'Arrange food vendors, stall setup, and refreshment logistics for audience and performers.', dependencies: [], requiredSkills: ['catering', 'logistics'], suggestedRole: 'Hospitality Volunteer', department: 'Catering' },
      { title: 'Marketing & Promotion', category: 'Marketing', priority: 'High', deadline: daysOffset(-14), description: 'Design and distribute posters, run social media campaign, create event buzz.', dependencies: [], requiredSkills: ['marketing', 'design', 'social media'], suggestedRole: 'Marketing Volunteer', department: 'Marketing' },
      { title: 'Closing Ceremony & Vote of Thanks', category: 'Operations', priority: 'Medium', deadline: daysOffset(0), description: 'Organize closing segment with certificates for performers and vote of thanks by organizers.', dependencies: ['Finalize Performance Schedule & Running Order'], requiredSkills: ['event management'], suggestedRole: 'Event Coordinator', department: 'Operations' },
    ];
    schedule = [
      { time: '03:00 PM - 04:00 PM', activity: 'Venue Setup & Technical Check' },
      { time: '04:00 PM - 05:00 PM', activity: 'Performer Backstage & Rehearsal' },
      { time: '05:00 PM - 05:30 PM', activity: 'Welcome Address & Lamp Lighting' },
      { time: '05:30 PM - 06:30 PM', activity: 'Dance Performances - Round 1' },
      { time: '06:30 PM - 07:00 PM', activity: 'Musical Performances' },
      { time: '07:00 PM - 07:30 PM', activity: 'Drama / Skit Showcase' },
      { time: '07:30 PM - 08:00 PM', activity: 'Group Dance Final' },
      { time: '08:00 PM - 08:30 PM', activity: 'Prize Distribution & Closing Ceremony' },
    ];
  } else {
    // Workshop / Seminar / General
    tasks = [
      { title: 'Confirm Speaker / Trainer', category: 'Operations', priority: 'Urgent', deadline: daysOffset(-14), description: 'Confirm the main speaker/trainer, collect their bio, topic details, and AV requirements.', dependencies: [], requiredSkills: ['communication', 'guest management'], suggestedRole: 'Guest Relations Volunteer', department: 'Operations' },
      { title: 'Book Venue / Conference Room', category: 'Logistics', priority: 'High', deadline: daysOffset(-14), description: 'Confirm venue with capacity, AV setup, and accessibility requirements.', dependencies: [], requiredSkills: ['logistics', 'venue management'], suggestedRole: 'Logistics Volunteer', department: 'Logistics' },
      { title: 'Set Up AV & Projector Equipment', category: 'Technical', priority: 'High', deadline: daysOffset(-1), description: 'Test projector, microphone, clicker, laptop connectivity, and internet connection.', dependencies: ['Book Venue / Conference Room'], requiredSkills: ['audio-visual', 'technical'], suggestedRole: 'A/V Technical Volunteer', department: 'Technical' },
      { title: 'Registration & Attendee Management', category: 'Registration', priority: 'High', deadline: daysOffset(-7), description: 'Set up registration form, manage confirmations, send reminders to registered attendees.', dependencies: [], requiredSkills: ['registration', 'communication'], suggestedRole: 'Registration Volunteer', department: 'Registration' },
      { title: 'Prepare Workshop Materials & Handouts', category: 'Operations', priority: 'Medium', deadline: daysOffset(-3), description: 'Print/prepare slides, handouts, worksheets, and resource lists for participants.', dependencies: ['Confirm Speaker / Trainer'], requiredSkills: ['content preparation', 'printing'], suggestedRole: 'Operations Volunteer', department: 'Operations' },
      { title: 'Arrange Seating Layout', category: 'Logistics', priority: 'Medium', deadline: daysOffset(-1), description: 'Set up chairs/tables in classroom, theatre, or U-shape arrangement as required.', dependencies: ['Book Venue / Conference Room'], requiredSkills: ['logistics', 'setup'], suggestedRole: 'Logistics Volunteer', department: 'Logistics' },
      { title: 'Marketing & Promotion', category: 'Marketing', priority: 'High', deadline: daysOffset(-10), description: 'Create event posters, email campaign, and social media posts to drive registrations.', dependencies: [], requiredSkills: ['marketing', 'design'], suggestedRole: 'Marketing Volunteer', department: 'Marketing' },
      { title: 'Arrange Refreshments & Breaks', category: 'Catering', priority: 'Low', deadline: daysOffset(-2), description: 'Order tea/coffee and snacks for mid-session breaks.', dependencies: [], requiredSkills: ['catering', 'logistics'], suggestedRole: 'Hospitality Volunteer', department: 'Catering' },
      { title: 'Manage Live Q&A / Interaction', category: 'Operations', priority: 'Medium', deadline: daysOffset(0), description: 'Coordinate audience Q&A, manage roving microphone, and moderate questions.', dependencies: ['Confirm Speaker / Trainer'], requiredSkills: ['moderation', 'communication'], suggestedRole: 'Event Coordinator', department: 'Operations' },
      { title: 'Certificate Distribution', category: 'Operations', priority: 'Medium', deadline: daysOffset(-1), description: 'Prepare and print participation certificates with attendee names.', dependencies: ['Registration & Attendee Management'], requiredSkills: ['documentation'], suggestedRole: 'Operations Volunteer', department: 'Operations' },
      { title: 'Feedback Collection & Event Report', category: 'Operations', priority: 'Low', deadline: daysOffset(1), description: 'Distribute feedback forms, compile responses, and write post-event summary report.', dependencies: [], requiredSkills: ['data collection', 'reporting'], suggestedRole: 'Operations Volunteer', department: 'Operations' },
    ];
    schedule = [
      { time: '09:00 AM - 09:30 AM', activity: 'Registration & Welcome Coffee' },
      { time: '09:30 AM - 10:00 AM', activity: 'Opening Address & Speaker Introduction' },
      { time: '10:00 AM - 11:30 AM', activity: 'Session 1 — Core Topic / Hands-on Workshop' },
      { time: '11:30 AM - 11:45 AM', activity: 'Networking Break & Refreshments' },
      { time: '11:45 AM - 01:00 PM', activity: 'Session 2 — Deep Dive & Group Activity' },
      { time: '01:00 PM - 02:00 PM', activity: 'Lunch Break' },
      { time: '02:00 PM - 03:30 PM', activity: 'Session 3 — Advanced Topics & Q&A Panel' },
      { time: '03:30 PM - 04:00 PM', activity: 'Certificate Distribution & Closing' },
    ];
  }

  // Build volunteer assignments (skill-based matching)
  const SKILL_TEAM_MAP = {
    'Technical': ['Tech Support', 'A/V & Tech', 'Technical', 'IT'],
    'Logistics': ['Logistics', 'Operations'],
    'Catering': ['Hospitality', 'Catering'],
    'Registration': ['Registration', 'Logistics'],
    'Marketing': ['Marketing', 'Media & Sound'],
    'HR': ['Guest Relations', 'HR'],
    'Safety': ['Operations', 'Safety'],
    'Operations': ['Operations', 'Guest Relations'],
    'Sponsorship': ['Marketing', 'Operations'],
  };

  const volunteerAssignments = tasks.slice(0, 6).map((task) => {
    const relatedTeams = SKILL_TEAM_MAP[task.category] || [];
    const matched = availableVolunteers.find(
      (v) => relatedTeams.some((team) => (v.team || '').toLowerCase().includes(team.toLowerCase()))
    );
    if (matched) {
      return {
        taskTitle: task.title,
        volunteerId: matched.id || matched._id,
        volunteerName: matched.name,
        matchReason: `Matched by team: ${matched.team} (skill: ${task.category})`,
        noMatchReason: '',
        hasMatch: true,
      };
    }
    return {
      taskTitle: task.title,
      volunteerId: null,
      volunteerName: null,
      matchReason: '',
      noMatchReason: `No volunteer with ${task.category} skills found. Please assign manually.`,
      hasMatch: false,
    };
  });

  const risks = [
    { title: 'A/V & Equipment Failure', severity: 'high', reason: 'Technical equipment may malfunction during the event.', mitigation: 'Keep backup cables, adapters, and test 45 minutes before event start.' },
    { title: 'Low Participant Turnout', severity: 'medium', reason: 'Registration numbers may not match confirmed participants.', mitigation: 'Send reminder messages 48h and 24h before the event. Keep a waitlist.' },
    { title: 'Venue / Space Issues', severity: 'medium', reason: 'Venue may have last-minute availability or capacity constraints.', mitigation: 'Confirm venue 2 days before and have a backup room identified.' },
  ];

  return {
    eventDetails: { name, description, date: date || 'TBD', venue: venue || 'TBD', location: venue, participants },
    analysis: { eventType: 'Event', eventScale: 'Medium', duration: '1 day', targetAudience: 'Students', activities: [], operationalAreas: [], requirements: [], risks: [] },
    schedule,
    tasks: tasks.map((t, idx) => ({ ...t, id: `task_${idx}`, status: 'To Do' })),
    volunteerAssignments,
    risks,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AiAssistant() {
  const { selectedEvent, selectedEventId, addNewEvent } = useEventContext();
  const {
    messages,
    setMessages,
    scheduleWorkflow,
    setScheduleWorkflow,
    inputVal,
    setInputVal,
    clearChat,
  } = useAiChat();

  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [aiConfig, setAiConfig] = useState({ configured: true });

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    getAiStatus().then((res) => {
      if (res && typeof res.configured === 'boolean') setAiConfig({ configured: res.configured });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const geminiAvailable = isGeminiConfigured();

  const samplePrompts = [
    {
      title: '🚀 Plan a Hackathon',
      prompt: 'We are organizing a 2-day college hackathon for around 200 students. There will be coding competitions, mentors, workshops, sponsors, food and a final prize distribution ceremony.',
      desc: 'AI analyzes & generates hackathon-specific tasks',
    },
    {
      title: '🏏 Sports Tournament',
      prompt: 'I want to organize an inter-college cricket tournament with 12 teams.',
      desc: 'Referee, team management & logistics tasks',
    },
    {
      title: '🎭 Cultural Festival',
      prompt: 'We are planning a one-day cultural festival with dance, music and drama performances for 300 students.',
      desc: 'Stage, performers, sound & crowd management tasks',
    },
    {
      title: '💡 Technical Workshop',
      prompt: 'Organize a technical workshop on AI and Machine Learning for 100 final year students.',
      desc: 'Speaker, AV, registration & materials tasks',
    },
    {
      title: '✅ Create a Task',
      prompt: 'Create a task to arrange the auditorium by October 20.',
      desc: 'Propose new task with deadline for active event',
    },
  ];

  // ─── Add AI message helper ──────────────────────────────────────────────────

  const addAiMessage = (content, extras = {}) => {
    const msg = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...extras,
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  // ─── handleSendMessage — Complete Workflow Engine ───────────────────────────

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

    // ─── WORKFLOW: asking_followup → collect answer ─────────────────────────
    if (scheduleWorkflow.step === 'asking_followup') {
      const { pendingQuestion, analysis, collected, missingInfoList = [] } = scheduleWorkflow.data;
      const field = pendingQuestion?.field;
      const label = pendingQuestion?.label || field;

      // Store the answer
      const newCollected = { ...collected, [field]: query, [label]: query };

      // Filter out the answered item
      const remainingMissing = missingInfoList.filter(
        (f) => !f.toLowerCase().includes(field.toLowerCase()) && !field.toLowerCase().includes(f.toLowerCase())
      );

      const nextQ = determineNextQuestion(remainingMissing, newCollected);

      if (nextQ) {
        // Still more questions to ask
        setScheduleWorkflow((prev) => ({
          step: 'asking_followup',
          data: {
            ...prev.data,
            collected: newCollected,
            pendingQuestion: nextQ,
            missingInfoList: remainingMissing,
          },
        }));
        addAiMessage(
          `Got it! **${label}**: *${query}*\n\nNext, **${nextQ.question}**\n*(${nextQ.hint})*`
        );
      } else {
        // All info collected — generate the plan
        addAiMessage(
          `Got it! **${label}**: *${query}*\n\nAll necessary information collected. Generating your personalized event plan now...`
        );
        await handleGeneratePlan({ ...scheduleWorkflow.data, collected: newCollected, analysis });
      }
      setTimeout(() => textareaRef.current?.focus(), 100);
      return;
    }

    // ─── WORKFLOW: plan editing ─────────────────────────────────────────────
    if (scheduleWorkflow.step === 'editing') {
      setLoading(true);
      try {
        const { analysis, collected } = scheduleWorkflow.data;
        // Parse any update hints from user
        const venueMatch = query.match(/venue\s+(?:to\s+|is\s+)?([a-z0-9\s,.-]+?)(?:\s+and|\s+date|\s+time|$)/i);
        const dateMatch = query.match(/date\s+(?:to\s+|is\s+)?([a-z0-9\s,.-]+?)(?:\s+and|\s+venue|\s+time|$)/i);
        const updatedCollected = {
          ...collected,
          ...(venueMatch ? { venue: venueMatch[1].trim() } : {}),
          ...(dateMatch ? { date: dateMatch[1].trim() } : {}),
          ...((!venueMatch && !dateMatch) ? { description: `${collected.description || ''} (Modifications: ${query})` } : {}),
        };
        await handleGeneratePlan({ analysis, collected: updatedCollected });
      } catch (err) {
        setErrorMessage('Failed to update event plan.');
      } finally {
        setLoading(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
      return;
    }

    // ─── Check for event idea trigger ──────────────────────────────────────
    const { isEventIdea } = detectEventIdea(query);

    if (scheduleWorkflow.step === 'idle' && isEventIdea) {
      setLoading(true);
      try {
        if (geminiAvailable) {
          // GEMINI FLOW: Analyze the event idea
          addAiMessage(
            `🔍 **Analyzing your event idea...**\n\nLet me understand what you're planning before generating tasks.`,
            {}
          );

          let analysis;
          try {
            analysis = await analyzeEventIdea(query);
          } catch (geminiErr) {
            console.warn('[Gemini Analysis Error]:', geminiErr.message);
            // Fallback: proceed with minimal analysis
            analysis = {
              eventType: 'Event', eventScale: 'Medium', duration: '1 day',
              targetAudience: 'Students', activities: [], operationalAreas: ['Logistics', 'Operations'],
              requirements: [], risks: [], missingInfo: ['Event date', 'Venue'],
              summary: query,
            };
          }

          // Show analysis card + determine what questions to ask
          const missingInfoList = analysis.missingInfo || [];
          const nextQ = determineNextQuestion(missingInfoList, { description: query });

          let analysisMessageContent = '';
          if (nextQ) {
            const listText = missingInfoList.map((m, idx) => `${idx + 1}. ${m}`).join('\n');
            analysisMessageContent = `Got it. This looks like a **${analysis.eventType}** for **${analysis.targetAudience || 'students'}**.\n\nTo create an accurate event plan, I need:\n${listText}\n\nLet's start with the **${nextQ.label}**: **${nextQ.question}**\n*(${nextQ.hint})*`;
          } else {
            analysisMessageContent = `Got it. This looks like a **${analysis.eventType}** for **${analysis.targetAudience || 'students'}**.\n\nI have all the necessary information. Generating your personalized event plan now...`;
          }

          setMessages((prev) => [
            ...prev,
            {
              id: `ai-analysis-${Date.now()}`,
              role: 'assistant',
              content: analysisMessageContent,
              analysis,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);

          if (nextQ) {
            setScheduleWorkflow({
              step: 'asking_followup',
              data: {
                originalIdea: query,
                analysis,
                collected: { description: query },
                pendingQuestion: nextQ,
                missingInfoList,
              },
            });
          } else {
            // No questions needed — generate plan immediately
            await handleGeneratePlan({
              analysis,
              collected: { description: query },
            }, true);
          }
        } else {
          // NO GEMINI KEY — use fallback directly
          setScheduleWorkflow({ step: 'asking_name', data: { description: query } });
          addAiMessage(`Sure! I'll help you create an event plan.\n\nWhat is the name of your event?`);
        }
      } catch (err) {
        console.error('[Event Idea Error]:', err);
        setErrorMessage('Failed to analyze event idea. Please try again.');
      } finally {
        setLoading(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
      return;
    }

    // ─── LEGACY fallback workflow (no Gemini key) ───────────────────────────
    if (scheduleWorkflow.step === 'asking_name') {
      setScheduleWorkflow((prev) => ({ step: 'asking_date', data: { ...prev.data, name: query } }));
      addAiMessage('What is the event date?');
      setTimeout(() => textareaRef.current?.focus(), 100);
      return;
    }
    if (scheduleWorkflow.step === 'asking_date') {
      setScheduleWorkflow((prev) => ({ step: 'asking_venue', data: { ...prev.data, date: query } }));
      addAiMessage('What is the venue?');
      setTimeout(() => textareaRef.current?.focus(), 100);
      return;
    }
    if (scheduleWorkflow.step === 'asking_venue') {
      setLoading(true);
      const fullDetails = { ...scheduleWorkflow.data, venue: query };
      try {
        let existingVolunteers = [];
        try {
          const volRes = await getVolunteersByEvent(selectedEventId);
          if (volRes?.success && Array.isArray(volRes.data)) existingVolunteers = volRes.data;
        } catch {}
        const generatedPlan = generateFallbackPlan(fullDetails, existingVolunteers);
        setScheduleWorkflow({ step: 'plan_ready', data: { ...fullDetails, plan: generatedPlan } });
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-plan-${Date.now()}`,
            role: 'assistant',
            content: `✅ **Event plan generated for "${fullDetails.name}"!**\n\nHere's your complete operational blueprint. Review and confirm to save everything to your dashboard.`,
            eventPlan: generatedPlan,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } catch (err) {
        setErrorMessage('Failed to generate event plan.');
      } finally {
        setLoading(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
      return;
    }

    // ─── Normal AI Chat ─────────────────────────────────────────────────────
    setLoading(true);
    try {
      const historyPayload = updatedMessages
        .filter((m) => m.id !== 'welcome-msg')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await sendAiMessage(query, selectedEventId, historyPayload);

      if (res && res.success && res.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: res.reply,
            action: res.action || null,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setErrorMessage(res?.message || 'Failed to get a response from ClubOps AI.');
      }
    } catch (err) {
      console.error('[AI Assistant Error]:', err);
      setErrorMessage(err.message || 'Unable to connect to AI service.');
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  // ─── Generate Full Plan (Gemini or Fallback) ────────────────────────────────

  const handleGeneratePlan = async (workflowData, skipLoadingSet = false) => {
    if (!skipLoadingSet) setLoading(true);

    const { analysis, collected } = workflowData;
    const details = {
      name: collected.name || collected['event name'] || `${analysis.eventType} ${new Date().getFullYear()}`,
      date: collected.date || '',
      venue: collected.venue || '',
      participants: collected.participants || '',
      description: collected.description || '',
    };

    try {
      addAiMessage(
        `⚙️ **Generating your personalized event plan...**\n\nCreating context-aware tasks for your **${analysis.eventType}**, matching volunteers by skills and calculating deadlines from your event date.`
      );

      let existingVolunteers = [];
      try {
        const volRes = await getVolunteersByEvent(selectedEventId);
        if (volRes?.success && Array.isArray(volRes.data) && volRes.data.length > 0) {
          existingVolunteers = volRes.data;
        } else {
          // Use seed data
          const allDefs = Object.values(defaultVolunteersByEvent || {}).flat();
          existingVolunteers = allDefs;
        }
      } catch {}

      let plan;
      try {
        if (geminiAvailable) {
          plan = await generateEventPlan(analysis, details, existingVolunteers);
        } else {
          plan = generateFallbackPlan({ ...details }, existingVolunteers);
        }
      } catch (geminiErr) {
        console.warn('[Gemini Plan Generation Error]:', geminiErr.message);
        // Fallback to local plan generator
        plan = generateFallbackPlan({ ...details }, existingVolunteers);
        addAiMessage(`⚠️ *AI plan generation encountered an issue — falling back to local template planner. The plan below is still tailored to your event description.*`);
      }

      setScheduleWorkflow({ step: 'plan_ready', data: { ...workflowData, plan } });

      const taskCount = plan.tasks?.length || 0;
      const matchedVols = (plan.volunteerAssignments || []).filter(va => va.hasMatch).length;

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-plan-${Date.now()}`,
          role: 'assistant',
          content: `✅ **Event Plan Ready: ${plan.eventDetails?.name || details.name}**\n\n**${taskCount} context-aware tasks** generated across ${[...new Set((plan.tasks || []).map(t => t.category))].length} operational areas.\n**${matchedVols} volunteers** matched by skill & role.\n\nReview the complete plan below and click **"Add to Dashboard"** to save everything.`,
          eventPlan: plan,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('[Generate Plan Error]:', err);
      setErrorMessage('Failed to generate event plan. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  // ─── Add to Dashboard ───────────────────────────────────────────────────────

  const handleAddToDashboard = async (plan) => {
    if (!plan || !plan.eventDetails) throw new Error('Event plan data is missing.');

    const { eventDetails, schedule = [], tasks = [], volunteerAssignments = [], risks = [] } = plan;

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
      schedule,
    };

    let createdEventRes;
    try {
      createdEventRes = await createEvent(newEventPayload);
    } catch {
      const localEvt = { _id: 'evt_' + Date.now(), id: 'evt_' + Date.now(), ...newEventPayload, createdAt: new Date().toISOString() };
      createdEventRes = { success: true, data: localEvt };
    }

    const createdEvent = createdEventRes.data || createdEventRes;
    const eventId = createdEvent._id || createdEvent.id;
    if (!eventId) throw new Error('Could not retrieve new event ID from server.');

    // Create tasks — include description, category, deadline, dependencies
    const localTasks = [];
    for (const t of tasks) {
      try {
        const tRes = await createTask(eventId, {
          title: t.title,
          description: t.description || '',
          owner: t.suggestedRole || 'Core Team',
          priority: t.priority || 'Medium',
          deadline: t.deadline || validDate,
          department: t.department || t.category || 'Operations',
          category: t.category || 'Operations',
          status: 'To Do',
          dependencies: t.dependencies || [],
          requiredSkills: t.requiredSkills || [],
        });
        if (tRes?.data) localTasks.push(tRes.data);
      } catch {}
    }
    if (localTasks.length > 0) {
      try { localStorage.setItem(`clubops_tasks_${eventId}`, JSON.stringify(localTasks)); } catch {}
    }

    // Create volunteers from matched assignments
    const localVols = [];
    for (const va of volunteerAssignments) {
      if (!va.hasMatch || !va.volunteerName) continue;
      try {
        const vRes = await createVolunteer(eventId, {
          name: va.volunteerName,
          role: va.taskTitle,
          team: 'Operations',
          shift: 'As Required',
          status: 'confirmed',
          matchReason: va.matchReason,
        });
        if (vRes?.data) localVols.push(vRes.data);
      } catch {}
    }
    if (localVols.length > 0) {
      try { localStorage.setItem(`clubops_volunteers_${eventId}`, JSON.stringify(localVols)); } catch {}
    }

    // Create risks
    const localRisks = [];
    for (const r of risks) {
      try {
        const rRes = await createRisk(eventId, {
          title: r.title,
          category: 'Operations',
          severity: (r.severity || 'medium').toLowerCase(),
          probability: 'medium',
          impact: 'Moderate',
          owner: 'Core Team',
          mitigation: r.mitigation || r.suggestedAction || '',
          status: 'open',
        });
        if (rRes?.data) localRisks.push(rRes.data);
      } catch {}
    }
    if (localRisks.length > 0) {
      try { localStorage.setItem(`clubops_risks_${eventId}`, JSON.stringify(localRisks)); } catch {}
    }

    addNewEvent(createdEvent);
    setScheduleWorkflow({ step: 'idle', data: {} });
    return createdEvent;
  };

  const handleEditPlan = () => {
    setScheduleWorkflow((prev) => ({ ...prev, step: 'editing' }));
    addAiMessage('What would you like to modify? (e.g., venue, date, add more tasks, change participants)');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => { clearChat(); setErrorMessage(null); };
  const isStarterState = messages.length <= 1;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Top Bar */}
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
              {geminiAvailable && (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <Brain className="w-3 h-3" /> Gemini AI
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {geminiAvailable ? (
            <StatusBadge status="confirmed" label="Gemini AI Active" />
          ) : (
            <StatusBadge status="urgent" label="AI Offline" />
          )}
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleClearChat} title="Reset conversation" className="text-xs h-8 text-slate-500 hover:text-slate-800">
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
                className={`flex gap-3 max-w-[94%] sm:max-w-[88%] lg:max-w-[82%] ${isAi ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${isAi ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-brand-500/20' : 'bg-slate-800 text-white'}`}>
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="flex flex-col group min-w-0 flex-1">
                  <div className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs relative ${isAi ? 'bg-white border border-slate-200/90 text-slate-800' : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white'}`}>
                    {isAi ? (
                      <>
                        <MarkdownRenderer content={msg.content} />
                        {/* Event Analysis Card */}
                        {msg.analysis && <EventAnalysisCard analysis={msg.analysis} />}
                        {/* Event Plan Card */}
                        {msg.eventPlan && (
                          <EventPlanCard
                            plan={msg.eventPlan}
                            onAddToDashboard={handleAddToDashboard}
                            onEditPlan={handleEditPlan}
                          />
                        )}
                        {/* Action Confirmation Card */}
                        {msg.action && (
                          <ActionConfirmationCard
                            action={msg.action}
                            onActionComplete={(actId, res) => {
                              setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, action: { ...m.action, status: 'confirmed', result: res.data } } : m));
                            }}
                            onActionCancel={() => {
                              setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, action: { ...m.action, status: 'cancelled' } } : m));
                            }}
                          />
                        )}
                        {/* Copy button */}
                        {msg.id !== 'welcome-msg' && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Copy to clipboard"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    )}
                  </div>
                  <span className={`text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1.5 ${isAi ? 'text-left' : 'text-right justify-end'}`}>
                    {isAi ? <><span>ClubOps AI</span><span>•</span><span>{msg.timestamp}</span></> : <><span>You</span><span>•</span><span>{msg.timestamp}</span></>}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Starter Quick Actions */}
          {isStarterState && (
            <div className="my-6 pt-4 border-t border-slate-100 animate-fade-in max-w-3xl">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-3">
                <Zap className="w-4 h-4 text-brand-500" />
                Describe your event idea or try a quick start:
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
                <span>
                  {scheduleWorkflow.step === 'idle' || scheduleWorkflow.step === 'asking_followup'
                    ? 'Analyzing your event with Gemini AI...'
                    : 'Generating your personalized event plan...'}
                </span>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800 flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-rose-700 leading-relaxed">{errorMessage}</div>
              <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pill Bar Suggestions */}
        {!isStarterState && (
          <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200/70 shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" /> Try:
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

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200/90 shrink-0">
          <div className="relative flex items-center bg-slate-50/90 border border-slate-300 rounded-2xl p-1.5 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all shadow-2xs">
            <input
              ref={textareaRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder={
                scheduleWorkflow.step === 'asking_followup'
                  ? (scheduleWorkflow.data?.pendingQuestion?.hint || 'Type your answer...')
                  : 'Describe your event idea or ask anything...'
              }
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
              Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Enter</kbd> to send
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Brain className="w-3 h-3 text-brand-400" />
              {geminiAvailable ? 'Powered by Google Gemini' : 'Local AI Mode'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
