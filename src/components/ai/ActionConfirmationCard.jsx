import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Megaphone,
  CheckSquare,
  UserCheck,
  Loader2,
  Tag,
  MapPin,
  Users,
} from 'lucide-react';
import Button from '../ui/Button';
import { executeAiAction } from '../../services/api';

/**
 * Visual metadata for each supported action type
 */
const ACTION_META = {
  CREATE_TASK: {
    label: 'Create Task',
    icon: CheckSquare,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    btnLabel: 'Confirm & Create Task',
    successMsg: 'Task created successfully.',
  },
  UPDATE_TASK: {
    label: 'Update Task',
    icon: CheckSquare,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    btnLabel: 'Confirm & Update Task',
    successMsg: 'Task updated successfully.',
  },
  ASSIGN_TASK: {
    label: 'Assign Task',
    icon: UserCheck,
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    btnLabel: 'Confirm Assignment',
    successMsg: 'Task assigned successfully.',
  },
  CREATE_RISK: {
    label: 'Log Risk',
    icon: AlertTriangle,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    btnLabel: 'Confirm & Log Risk',
    successMsg: 'Risk created successfully.',
  },
  CREATE_MEETING: {
    label: 'Schedule Meeting',
    icon: Calendar,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    btnLabel: 'Confirm & Schedule',
    successMsg: 'Meeting scheduled successfully.',
  },
  DRAFT_ANNOUNCEMENT: {
    label: 'Draft Announcement',
    icon: Megaphone,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    btnLabel: 'Confirm Draft (Save as Draft)',
    successMsg: 'Announcement draft saved successfully.',
  },
};

export default function ActionConfirmationCard({
  action,
  onActionComplete,
  onActionCancel,
}) {
  const [status, setStatus] = useState(action.status || 'pending'); // 'pending' | 'executing' | 'confirmed' | 'cancelled' | 'error'
  const [errorMsg, setErrorMsg] = useState(null);
  const [resultData, setResultData] = useState(null);

  if (!action || !action.type) return null;

  const meta = ACTION_META[action.type] || {
    label: action.type.replace(/_/g, ' '),
    icon: CheckCircle2,
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    btnLabel: 'Confirm Action',
    successMsg: 'Action completed successfully.',
  };

  const Icon = meta.icon;
  const payload = action.payload || {};

  // Handle Action Confirmation
  const handleConfirm = async () => {
    try {
      setStatus('executing');
      setErrorMsg(null);

      const res = await executeAiAction({
        type: action.type,
        eventId: action.eventId,
        payload: action.payload,
      });

      if (res && res.success) {
        setStatus('confirmed');
        setResultData(res.data);
        if (onActionComplete) {
          onActionComplete(action.id, res);
        }
      } else {
        throw new Error(res?.message || 'Failed to execute action.');
      }
    } catch (err) {
      console.error('[Action Execution Error]:', err);
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred while executing this action.');
    }
  };

  // Handle Action Cancellation
  const handleCancel = () => {
    setStatus('cancelled');
    if (onActionCancel) {
      onActionCancel(action.id);
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/90 shadow-2xs overflow-hidden transition-all text-xs">
      {/* Header Banner */}
      <div className="px-3.5 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-bold border text-[11px] ${meta.badgeColor}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {meta.label}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 truncate">
            Target: <strong className="text-slate-800">{action.eventName || 'Active Event'}</strong>
          </span>
        </div>

        {/* State Badge */}
        {status === 'pending' && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            Confirmation Required
          </span>
        )}
        {status === 'confirmed' && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        )}
        {status === 'cancelled' && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        )}
      </div>

      {/* Payload Details */}
      <div className="p-3.5 space-y-2">
        {payload.title && (
          <div className="flex items-start justify-between gap-2">
            <span className="text-slate-500 font-medium shrink-0">Title:</span>
            <span className="font-bold text-slate-800 text-right">{payload.title}</span>
          </div>
        )}

        {payload.taskTitle && (
          <div className="flex items-start justify-between gap-2">
            <span className="text-slate-500 font-medium shrink-0">Task:</span>
            <span className="font-bold text-slate-800 text-right">{payload.taskTitle}</span>
          </div>
        )}

        {payload.assignee && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500 font-medium shrink-0">Assignee:</span>
            <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60">
              {payload.assignee}
            </span>
          </div>
        )}

        {payload.priority && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500 font-medium shrink-0">Priority:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${
                payload.priority === 'High' || payload.priority === 'Urgent'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              {payload.priority}
            </span>
          </div>
        )}

        {payload.severity && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500 font-medium shrink-0">Severity:</span>
            <span className="font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
              {payload.severity}
            </span>
          </div>
        )}

        {payload.deadline && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500 font-medium shrink-0">Deadline:</span>
            <span className="text-slate-700 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {payload.deadline}
            </span>
          </div>
        )}

        {payload.date && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500 font-medium shrink-0">Date & Time:</span>
            <span className="text-slate-700 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {payload.date} at {payload.startTime || 'TBD'}
            </span>
          </div>
        )}

        {payload.location && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500 font-medium shrink-0">Location:</span>
            <span className="text-slate-700 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {payload.location}
            </span>
          </div>
        )}

        {payload.body && (
          <div className="mt-1 pt-2 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium block mb-1">Content Preview:</span>
            <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 italic leading-relaxed text-[11px]">
              "{payload.body}"
            </p>
          </div>
        )}

        {payload.audience && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-slate-500 font-medium shrink-0">Audience:</span>
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {payload.audience}
            </span>
          </div>
        )}
      </div>

      {/* Action Decision / Confirmation Footer */}
      <div className="px-3.5 py-2.5 bg-white border-t border-slate-200/80 flex items-center justify-end gap-2">
        {status === 'pending' && (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleConfirm}
              className="font-bold cursor-pointer text-xs h-8 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {meta.btnLabel}
            </Button>
          </>
        )}

        {status === 'executing' && (
          <div className="flex items-center gap-2 text-brand-600 font-semibold py-1">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Executing action in database...</span>
          </div>
        )}

        {status === 'confirmed' && (
          <div className="w-full flex items-center justify-between text-emerald-700 font-bold py-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {meta.successMsg}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Saved to MongoDB</span>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="w-full flex items-center justify-between text-slate-500 font-medium py-1">
            <span className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-slate-400" />
              No changes were made.
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Dismissed</span>
          </div>
        )}

        {status === 'error' && (
          <div className="w-full flex items-center justify-between gap-2">
            <span className="text-rose-600 font-semibold truncate">
              {errorMsg || 'Failed to complete action.'}
            </span>
            <Button size="xs" variant="secondary" onClick={handleConfirm}>
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
