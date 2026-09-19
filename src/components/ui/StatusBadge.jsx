import React from 'react';

const statusConfig = {
  todo: { label: 'To Do', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  done: { label: 'Done', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  urgent: { label: 'Urgent', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  high: { label: 'High Risk', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  medium: { label: 'Medium', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  low: { label: 'Low', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  open: { label: 'Open', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  resolved: { label: 'Resolved', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  confirmed: { label: 'Confirmed', bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  critical: { label: 'Critical Risk', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-600' },
  monitoring: { label: 'Monitoring', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
};

export default function StatusBadge({ status, label, className = '' }) {
  const normalizedKey = status?.toLowerCase().replace(/[\s-]/g, '_');
  const config = statusConfig[normalizedKey] || {
    label: label || status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label || config.label}
    </span>
  );
}
