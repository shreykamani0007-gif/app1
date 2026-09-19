import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  CornerDownLeft
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const initialMessages = [
  {
    id: 1,
    sender: 'bot',
    text: `Hi Prince 👋\n\nI'm your ClubOps AI assistant.\n\nI can help you:\n• Plan events\n• Find overdue tasks\n• Analyze risks\n• Summarize meetings\n• Create announcements\n• Manage event operations`,
    timestamp: '12:00 PM',
  },
];

const suggestedPrompts = [
  'Create an event plan',
  'Find overdue tasks',
  "Summarize today's meetings",
  'Identify event risks',
  'Create an announcement',
  'Show unassigned tasks',
];

const mockResponses = {
  'create an event plan': `Here is an operational launch blueprint for your upcoming event:\n\n1. **Phase 1: Foundation (4 weeks out)**\n   • Finalize auditorium booking & AV equipment\n   • Publish registration portal with team limits\n\n2. **Phase 2: Outreach (2 weeks out)**\n   • Confirm Tier 1 sponsors & swag delivery\n   • Allocate 20 volunteers across Check-in, Tech, and Logistics\n\n3. **Phase 3: Execution (Week of event)**\n   • Dry run with AV engineers & sound test\n   • Send broadcast to 300 registered hackers`,
  'find overdue tasks': `🔍 **Overdue & Critical Task Audit:**\n\n1. **Confirm venue** — Assigned to *Rohan* (Due yesterday)\n   *Status: In Progress — Needs administrative signature*\n\n2. **Security and safety clearance** — Assigned to *Kavita* (Due 24 Sept)\n   *Status: Blocked — Waiting on Dean's office approval*\n\nWould you like me to send a ping to Rohan and Kavita?`,
  "summarize today's meetings": `📋 **Summary of Today's Meetings:**\n\n**Weekly Core Team Meeting (5:00 PM)**\n• **Venue Status:** Priya will follow up with facilities tomorrow.\n• **Sponsorship:** Rohan secured initial confirmation from CloudScale.\n• **Web Portal:** Amit is pushing the team registration form live by Monday.\n\n**Extracted Action Items:** 3 items generated and assigned.`,
  'identify event risks': `⚠️ **Top Operational Risks Detected:**\n\n1. **Venue Confirmation Delayed (High Severity):** If not resolved by Friday, setup for 300 participants is in jeopardy.\n2. **Sponsor Confirmation Pending (High Severity):** Swag order deadline is 28 Sept.\n3. **Volunteer Bottleneck (Medium):** Need 5 more volunteers for front-desk check-in.\n\nRecommended: Run an **AI Risk Scan** in the Risks module.`,
  'create an announcement': `📢 **Draft Announcement:**\n\n**Subject:** TechNova Hackathon 2026 — Volunteer Call Time\n\n"Hey Team! Please remember to arrive at Main Auditorium at 8:00 AM tomorrow for setup and credential distribution. Let's make this hackathon spectacular!"`,
  'show unassigned tasks': `📋 **Unassigned Tasks Found:**\n\n1. **Prepare feedback survey form** (Event: TechNova Hackathon)\n2. **Organize certificate distribution** (Event: TechNova Hackathon)\n3. **Order pizza & snacks for midnight sprint** (Event: TechNova Hackathon)\n\nWould you like me to auto-assign these based on volunteer availability?`,
};

export default function AIAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let reply = `I've analyzed your club records for "${query}". Currently all operations for TechNova Hackathon 2026 are progressing smoothly at 72% readiness. Let me know if you want to inspect tasks, risks, or draft an announcement.`;

      for (const [key, val] of Object.entries(mockResponses)) {
        if (lowerQuery.includes(key)) {
          reply = val;
          break;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            ClubOps AI <Sparkles className="w-5 h-5 text-indigo-600" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Your AI event operations copilot for planning, risks, and coordination.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          Active Agent
        </span>
      </div>

      {/* Chat Conversation Card */}
      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 bg-white">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? 'P' : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 shadow-2xs whitespace-pre-line'
                }`}
              >
                {msg.text}
                <div
                  className={`mt-1.5 text-[10px] ${
                    msg.sender === 'user' ? 'text-brand-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center space-x-1.5 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 font-medium">ClubOps AI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pills */}
        <div className="px-4 py-2 bg-slate-50/75 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 uppercase tracking-wider">
            Suggested:
          </span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/50 transition-all shrink-0 shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ClubOps AI anything..."
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
            <Button
              type="submit"
              variant="ai"
              icon={Send}
              size="md"
              disabled={!input.trim()}
              className="shrink-0"
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
