import React from 'react';

export default function PageHeader({ title, description, badge, actions, children }) {
  return (
    <div className="mb-6 pb-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {badge && <span>{badge}</span>}
        </div>
        {description && (
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">{description}</p>
        )}
      </div>
      {(actions || children) && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}
