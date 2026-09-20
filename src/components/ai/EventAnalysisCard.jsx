import React from 'react';
import {
  Brain,
  Users,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Zap,
} from 'lucide-react';

const AREA_COLORS = {
  Technical: 'bg-blue-50 text-blue-700 border-blue-200',
  Logistics: 'bg-orange-50 text-orange-700 border-orange-200',
  Hospitality: 'bg-pink-50 text-pink-700 border-pink-200',
  Marketing: 'bg-purple-50 text-purple-700 border-purple-200',
  Sponsorship: 'bg-amber-50 text-amber-700 border-amber-200',
  Registration: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Safety: 'bg-red-50 text-red-700 border-red-200',
  Catering: 'bg-lime-50 text-lime-700 border-lime-200',
  Operations: 'bg-slate-50 text-slate-700 border-slate-200',
  HR: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Finance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function AreaBadge({ label }) {
  const cls = AREA_COLORS[label] || 'bg-slate-50 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

export default function EventAnalysisCard({ analysis }) {
  if (!analysis) return null;

  const {
    eventType,
    eventScale,
    duration,
    targetAudience,
    activities = [],
    operationalAreas = [],
    requirements = [],
    risks = [],
    summary,
  } = analysis;

  return (
    <div className="mt-3 w-full rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/60 to-indigo-50/40 shadow-sm p-4 text-slate-800 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Brain className="w-4.5 h-4.5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Event Analysis Complete</h3>
          {summary && (
            <p className="text-xs text-slate-600 mt-0.5 leading-snug">{summary}</p>
          )}
        </div>
      </div>

      {/* Core Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-center shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Event Type</div>
          <div className="text-xs font-bold text-brand-700">{eventType}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-center shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Scale</div>
          <div className="text-xs font-bold text-slate-800">{eventScale}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-center shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Duration</div>
          <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> {duration}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-center shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Audience</div>
          <div className="text-xs font-bold text-slate-800 leading-snug">{targetAudience}</div>
        </div>
      </div>

      {/* Activities */}
      {activities.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            <Zap className="w-3 h-3 text-amber-500" /> Key Activities
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activities.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[10px] text-slate-700 font-medium shadow-2xs">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" /> {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Operational Areas */}
      {operationalAreas.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            <Layers className="w-3 h-3 text-brand-500" /> Operational Areas Identified
          </div>
          <div className="flex flex-wrap gap-1.5">
            {operationalAreas.map((area, i) => (
              <AreaBadge key={i} label={area} />
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {requirements.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            <Cpu className="w-3 h-3 text-indigo-500" /> Key Requirements
          </div>
          <ul className="space-y-0.5">
            {requirements.slice(0, 5).map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks Preview */}
      {risks.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            <AlertTriangle className="w-3 h-3 text-rose-500" /> Potential Risk Areas
          </div>
          <div className="flex flex-wrap gap-1.5">
            {risks.map((r, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-full text-[10px] text-rose-700 font-medium">
                <AlertTriangle className="w-2.5 h-2.5 shrink-0" /> {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
