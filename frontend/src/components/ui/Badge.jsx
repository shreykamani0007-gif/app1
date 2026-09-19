import React from 'react';

export default function Badge({
  children,
  variant,
  type = 'default',
  size = 'md',
  className = '',
}) {
  // Normalize string to match color mapping
  const key = (variant || children || '').toString().toLowerCase();

  const colorMap = {
    // Priority / Severity
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    
    // Status
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'in progress': 'bg-blue-50 text-blue-700 border-blue-200',
    todo: 'bg-slate-100 text-slate-700 border-slate-200',
    blocked: 'bg-rose-50 text-rose-700 border-rose-200',
    planning: 'bg-purple-50 text-purple-700 border-purple-200',
    upcoming: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    
    // Volunteer Status
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    busy: 'bg-amber-50 text-amber-700 border-amber-200',
    active: 'bg-blue-50 text-blue-700 border-blue-200',

    // Risk Status
    open: 'bg-rose-50 text-rose-700 border-rose-200',
    monitoring: 'bg-amber-50 text-amber-700 border-amber-200',
    mitigated: 'bg-emerald-50 text-emerald-700 border-emerald-200',

    // Announcement Status
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-slate-100 text-slate-600 border-slate-200',

    // Generic
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const selectedColor = colorMap[key] || colorMap.default;

  const sizeStyles = {
    sm: 'text-[11px] px-1.5 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-medium',
    lg: 'text-sm px-3 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${selectedColor} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {children}
    </span>
  );
}
