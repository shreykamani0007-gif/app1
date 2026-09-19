import React, { useState } from 'react';
import { Sparkles, Send, Bot, Lightbulb, CheckCircle2, ShieldAlert } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';

export default function AiAssistant() {
  const [inputVal, setInputVal] = useState('');

  const samplePrompts = [
    'Generate a reminder announcement for volunteers arriving for shift 1',
    'Audit our upcoming deadlines and spot schedule collisions',
    'Draft a formal letter to Dean of Student Affairs for auditorium permission',
    'Estimate catering order based on 250 confirmed attendees',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="ClubOps AI Copilot"
        description="Autonomous operations assistant designed to draft announcements, spot logistical bottlenecks, and optimize club events."
        badge={<StatusBadge status="confirmed" label="AI Operational" />}
      />

      {/* Hero card */}
      <Card className="border-brand-200 bg-gradient-to-br from-indigo-50/70 via-white to-white p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">How can ClubOps AI assist your event today?</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Ask questions about your club's tasks, volunteer schedules, risk register, or have the AI generate documents and briefings.
            </p>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="mt-6 pt-5 border-t border-slate-200/80">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-3">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Suggested Quick Actions:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputVal(prompt)}
                className="text-left p-3 rounded-xl bg-white border border-slate-200/90 hover:border-brand-400 hover:bg-brand-50/20 text-xs text-slate-700 font-medium transition-all shadow-2xs cursor-pointer"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Mock Chat / Query Input */}
        <div className="mt-6">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask ClubOps AI a question or request an event operations draft..."
              className="w-full pl-4 pr-24 py-3 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 shadow-sm"
            />
            <div className="absolute right-2">
              <Button size="sm" variant="primary" icon={Send}>
                Ask AI
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 text-center">
            ClubOps AI Step 1 Mock Interface • Real LLM engine integration planned for future step.
          </p>
        </div>
      </Card>
    </div>
  );
}
