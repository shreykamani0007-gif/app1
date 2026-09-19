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
  ArrowRight,
  Plus,
  Edit3,
  Loader2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import { Card } from '../ui/Card';

export default function EventPlanCard({
  plan,
  onAddToDashboard,
  onEditPlan,
}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(plan.status || 'pending'); // 'pending' | 'saving' | 'added' | 'error'
  const [errorMsg, setErrorMsg] = useState(null);

  if (!plan) return null;

  const {
    eventDetails = {},
    schedule = [],
    tasks = [],
    volunteerAssignments = [],
    risks = [],
    volunteersWarning = null,
  } = plan;

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

  return (
    <div className="mt-4 w-full rounded-2xl border border-brand-200/90 bg-gradient-to-b from-white via-brand-50/20 to-white shadow-md p-4 sm:p-6 text-slate-800 space-y-6 animate-fade-in">
      {/* 1. Header & Event Details Summary */}
      <div className="border-b border-slate-200/80 pb-4">
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                Generated Event Plan
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
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
            {eventDetails.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2.5 text-xs text-slate-700">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200/80 font-medium">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>{eventDetails.date || 'TBD'}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200/80 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>{eventDetails.venue || eventDetails.location || 'TBD'}</span>
          </div>
        </div>
      </div>

      {/* 2. Event Schedule Timeline */}
      {schedule && schedule.length > 0 && (
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
                {/* Timeline node */}
                <div className="absolute -left-[21px] sm:-left-[29px] top-1.5 w-3 h-3 rounded-full bg-brand-600 ring-4 ring-white border-2 border-brand-400" />
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-brand-300 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      {item.time}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-800 flex-1">
                      {item.activity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Generated Operational Tasks */}
      {tasks && tasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              Operational Tasks & Deadlines ({tasks.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {tasks.map((t, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {idx + 1}. {t.title}
                  </span>
                  <StatusBadge status={t.priority || 'Medium'} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex-wrap gap-1">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                    <User className="w-3 h-3 text-slate-400" />
                    {t.owner || 'Unassigned'}
                  </span>
                  {t.deadline && (
                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {t.deadline}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Volunteer Assignments */}
      {volunteerAssignments && volunteerAssignments.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                Volunteer Assignments
              </h4>
            </div>
            <span className="text-[11px] text-slate-500">
              Task → Volunteer → Responsibility → Time
            </span>
          </div>

          {volunteersWarning && (
            <div className="mb-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{volunteersWarning}</span>
            </div>
          )}

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            {volunteerAssignments.map((va, idx) => (
              <div
                key={idx}
                className="p-3 text-xs flex items-center justify-between gap-3 flex-wrap hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-[140px]">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-900">{va.task}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-slate-400">→</span>
                  <span className="font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                    {va.volunteer}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-slate-400">→</span>
                  <span>{va.responsibility}</span>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {va.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Potential Risks */}
      {risks && risks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              Potential Risks & Recommended Actions ({risks.length})
            </h4>
          </div>

          <div className="space-y-2">
            {risks.map((r, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">⚠️</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {r.title}
                    </span>
                  </div>
                  <StatusBadge status={r.severity || 'medium'} />
                </div>
                {r.reason && (
                  <p className="text-xs text-slate-600 pl-5">
                    <strong className="text-slate-700">Reason:</strong> {r.reason}
                  </p>
                )}
                {r.suggestedAction && (
                  <p className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 pl-5">
                    <strong className="text-emerald-900">Suggested Action:</strong> {r.suggestedAction}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Confirmation Prompt & Action Buttons */}
      <div className="pt-4 border-t border-slate-200/80">
        {status === 'pending' && (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              Your event plan is ready. Would you like me to add this event to the dashboard?
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleConfirm}
                className="shadow-sm"
              >
                Add to Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Edit3}
                onClick={() => onEditPlan && onEditPlan(plan)}
              >
                Edit Plan
              </Button>
            </div>
          </div>
        )}

        {status === 'saving' && (
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 p-3 rounded-xl bg-brand-50 border border-brand-200">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Adding event, tasks, volunteers, and risks to your dashboard...</span>
          </div>
        )}

        {status === 'added' && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  Event "{eventDetails.name}" has been successfully added to your dashboard!
                </p>
                <p className="text-[11px] text-emerald-700">
                  Active event updated. All tasks, volunteer assignments, and risks are now live.
                </p>
              </div>
            </div>

            {/* Quick Navigation Buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700"
              >
                View Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/tasks')}
                className="text-xs h-8 border-emerald-300 text-emerald-800 hover:bg-emerald-100/50"
              >
                View Tasks
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/risks')}
                className="text-xs h-8 border-emerald-300 text-emerald-800 hover:bg-emerald-100/50"
              >
                View Risks
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/volunteers')}
                className="text-xs h-8 border-emerald-300 text-emerald-800 hover:bg-emerald-100/50"
              >
                View Volunteers
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{errorMsg || 'Failed to add event.'}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfirm}
              className="text-xs border-rose-300 text-rose-800 hover:bg-rose-100/50"
            >
              Retry Adding
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
