import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Users,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Plus,
  Edit3,
  Loader2,
  ShieldAlert,
  Link2,
  Wrench,
  Tag,
  UserCheck,
  UserX,
} from 'lucide-react';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';

const PRIORITY_STYLES = {
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-50 text-slate-600 border-slate-200',
};

const CATEGORY_COLORS = {
  Technical: 'bg-blue-100 text-blue-700',
  Logistics: 'bg-orange-100 text-orange-700',
  Marketing: 'bg-purple-100 text-purple-700',
  Sponsorship: 'bg-amber-100 text-amber-700',
  Hospitality: 'bg-pink-100 text-pink-700',
  Registration: 'bg-cyan-100 text-cyan-700',
  Safety: 'bg-red-100 text-red-700',
  Catering: 'bg-lime-100 text-lime-700',
  Operations: 'bg-slate-100 text-slate-700',
  HR: 'bg-indigo-100 text-indigo-700',
  Finance: 'bg-emerald-100 text-emerald-700',
  Venue: 'bg-teal-100 text-teal-700',
};

const SEVERITY_STYLES = {
  critical: 'bg-rose-100 text-rose-800 border-rose-300',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function EventPlanCard({ plan, onAddToDashboard, onEditPlan }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(plan.status || 'pending');
  const [errorMsg, setErrorMsg] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  if (!plan) return null;

  const {
    eventDetails = {},
    analysis = {},
    schedule = [],
    tasks = [],
    volunteerAssignments = [],
    risks = [],
  } = plan;

  const matchedCount = volunteerAssignments.filter(va => va.hasMatch).length;
  const unmatchedCount = volunteerAssignments.filter(va => !va.hasMatch).length;
  const categories = [...new Set(tasks.map(t => t.category).filter(Boolean))];

  const handleConfirm = async () => {
    try {
      setStatus('saving');
      setErrorMsg(null);
      await onAddToDashboard(plan);
      setStatus('added');
    } catch (err) {
      console.error('[EventPlanCard Error]:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Failed to add event to dashboard.');
    }
  };

  // Group tasks by category
  const tasksByCategory = tasks.reduce((acc, t) => {
    const cat = t.category || 'Operations';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  // Build a taskTitle → volunteer map for quick lookup
  const volMap = {};
  for (const va of volunteerAssignments) {
    volMap[va.taskTitle] = va;
  }

  return (
    <div className="mt-4 w-full rounded-2xl border border-brand-200/90 bg-gradient-to-b from-white via-brand-50/10 to-white shadow-md p-4 sm:p-6 text-slate-800 space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="border-b border-slate-200/80 pb-4">
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                {analysis.eventType ? `${analysis.eventType} Plan` : 'Generated Event Plan'}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {eventDetails.name || 'Untitled Event'}
              </h3>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Plan Ready for Review
          </span>
        </div>

        {eventDetails.description && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">{eventDetails.description}</p>
        )}

        {/* Event meta pills */}
        <div className="flex flex-wrap gap-2 text-xs text-slate-700">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200/80 font-medium">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>{eventDetails.date || 'TBD'}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200/80 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>{eventDetails.venue || eventDetails.location || 'TBD'}</span>
          </div>
          {eventDetails.participants && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200/80 font-medium">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>{eventDetails.participants} participants</span>
            </div>
          )}
        </div>

        {/* Summary stats */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-xl bg-indigo-50 border border-indigo-200/80">
            <div className="text-base font-extrabold text-indigo-700">{tasks.length}</div>
            <div className="text-[10px] text-indigo-500 font-medium">Tasks</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-teal-50 border border-teal-200/80">
            <div className="text-base font-extrabold text-teal-700">{matchedCount}</div>
            <div className="text-[10px] text-teal-500 font-medium">Matched Vols</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-rose-50 border border-rose-200/80">
            <div className="text-base font-extrabold text-rose-700">{risks.length}</div>
            <div className="text-[10px] text-rose-500 font-medium">Risks</div>
          </div>
        </div>
      </div>

      {/* ── Schedule ── */}
      {schedule.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-brand-600" />
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              Event Schedule
            </h4>
          </div>
          <div className="relative pl-4 sm:pl-6 border-l-2 border-brand-200/80 space-y-3 my-2">
            {schedule.map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[21px] sm:-left-[29px] top-1.5 w-3 h-3 rounded-full bg-brand-600 ring-4 ring-white border-2 border-brand-400" />
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-brand-300 transition-colors">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md shrink-0">{item.time}</span>
                    <span className="text-xs sm:text-sm font-medium text-slate-800">{item.activity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tasks by Category ── */}
      {tasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                Context-Aware Tasks ({tasks.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.slice(0, 5).map((cat, i) => (
                <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[cat] || 'bg-slate-100 text-slate-600'}`}>{cat}</span>
              ))}
              {categories.length > 5 && <span className="text-[10px] text-slate-400">+{categories.length - 5} more</span>}
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(tasksByCategory).map(([category, catTasks]) => (
              <div key={category}>
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold mb-2 ${CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-600'}`}>
                  <Tag className="w-2.5 h-2.5" /> {category}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catTasks.map((t, idx) => {
                    const vol = volMap[t.title];
                    const isExpanded = expandedTask === `${category}-${idx}`;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl bg-white border shadow-2xs transition-all cursor-pointer ${isExpanded ? 'border-brand-300 shadow-sm' : 'border-slate-200/90 hover:border-indigo-300'}`}
                        onClick={() => setExpandedTask(isExpanded ? null : `${category}-${idx}`)}
                      >
                        {/* Task header */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-900 leading-snug flex-1">{t.title}</span>
                          <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.Medium}`}>
                            {t.priority || 'Medium'}
                          </span>
                        </div>

                        {/* Deadline */}
                        {t.deadline && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-700 mb-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span className="font-medium">Due: {t.deadline}</span>
                          </div>
                        )}

                        {/* Volunteer match */}
                        {vol && (
                          <div className={`flex items-center gap-1.5 text-[11px] mt-1 ${vol.hasMatch ? 'text-teal-700' : 'text-rose-600'}`}>
                            {vol.hasMatch ? (
                              <><UserCheck className="w-3 h-3 shrink-0" /><span className="font-medium">{vol.volunteerName}</span></>
                            ) : (
                              <><UserX className="w-3 h-3 shrink-0" /><span>No match — assign manually</span></>
                            )}
                          </div>
                        )}

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
                            {t.description && (
                              <p className="text-[11px] text-slate-600 leading-snug">{t.description}</p>
                            )}
                            {t.dependencies?.length > 0 && (
                              <div className="flex items-start gap-1 text-[11px] text-slate-500">
                                <Link2 className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                                <span><strong className="text-slate-700">Depends on:</strong> {t.dependencies.join(', ')}</span>
                              </div>
                            )}
                            {t.requiredSkills?.length > 0 && (
                              <div className="flex items-start gap-1 text-[11px] text-slate-500">
                                <Wrench className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                                <span><strong className="text-slate-700">Skills:</strong> {t.requiredSkills.join(', ')}</span>
                              </div>
                            )}
                            {t.suggestedRole && (
                              <div className="flex items-center gap-1 text-[11px] text-indigo-600">
                                <User className="w-3 h-3 shrink-0" />
                                <span><strong>Suggested role:</strong> {t.suggestedRole}</span>
                              </div>
                            )}
                            {vol && vol.hasMatch && vol.matchReason && (
                              <div className="text-[11px] text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100">
                                ✓ {vol.matchReason}
                              </div>
                            )}
                            {vol && !vol.hasMatch && vol.noMatchReason && (
                              <div className="text-[11px] text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                                ✗ {vol.noMatchReason}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Volunteer Assignment Summary ── */}
      {volunteerAssignments.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                Volunteer Assignments
              </h4>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-teal-700 font-semibold">{matchedCount} matched</span>
              {unmatchedCount > 0 && <span className="text-rose-600 font-semibold">{unmatchedCount} unmatched</span>}
            </div>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            {volunteerAssignments.map((va, idx) => (
              <div key={idx} className="p-3 text-xs flex items-start gap-3 flex-wrap hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`shrink-0 w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] ${va.hasMatch ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-600'}`}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 truncate">{va.taskTitle}</span>
                </div>
                {va.hasMatch ? (
                  <div className="flex items-center gap-1.5 text-teal-700">
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium">{va.volunteerName}</span>
                    {va.matchReason && <span className="text-[10px] text-slate-400 truncate max-w-[120px]">({va.matchReason})</span>}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-600">
                    <UserX className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium">No suitable volunteer found</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Risks ── */}
      {risks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              Potential Risks ({risks.length})
            </h4>
          </div>
          <div className="space-y-2">
            {risks.map((r, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span>⚠️</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{r.title}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border capitalize ${SEVERITY_STYLES[r.severity] || SEVERITY_STYLES.medium}`}>
                    {r.severity || 'medium'}
                  </span>
                </div>
                {r.reason && <p className="text-xs text-slate-600 pl-6"><strong className="text-slate-700">Reason:</strong> {r.reason}</p>}
                {(r.mitigation || r.suggestedAction) && (
                  <p className="text-xs text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100 pl-6">
                    <strong className="text-emerald-900">Mitigation:</strong> {r.mitigation || r.suggestedAction}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Confirmation Buttons ── */}
      <div className="pt-4 border-t border-slate-200/80">
        {status === 'pending' && (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              ✅ Your personalized event plan is ready. Would you like to add it to the dashboard?
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="primary" size="sm" icon={Plus} onClick={handleConfirm} className="shadow-sm">
                Add to Dashboard
              </Button>
              <Button variant="outline" size="sm" icon={Edit3} onClick={() => onEditPlan && onEditPlan(plan)}>
                Modify Plan
              </Button>
            </div>
          </div>
        )}

        {status === 'saving' && (
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 p-3 rounded-xl bg-brand-50 border border-brand-200">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving event, {tasks.length} tasks, {matchedCount} volunteer assignments, and {risks.length} risks to dashboard...</span>
          </div>
        )}

        {status === 'added' && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold">"{eventDetails.name}" added to your dashboard!</p>
                <p className="text-[11px] text-emerald-700">{tasks.length} tasks · {matchedCount} volunteer assignments · {risks.length} risks — all saved and live.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')} className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700">View Dashboard</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/tasks')} className="text-xs h-8 border-emerald-300 text-emerald-800 hover:bg-emerald-100/50">View Tasks</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/volunteers')} className="text-xs h-8 border-emerald-300 text-emerald-800 hover:bg-emerald-100/50">View Volunteers</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/risks')} className="text-xs h-8 border-emerald-300 text-emerald-800 hover:bg-emerald-100/50">View Risks</Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{errorMsg || 'Failed to add event.'}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleConfirm} className="text-xs border-rose-300 text-rose-800 hover:bg-rose-100/50">
              Retry Adding
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
