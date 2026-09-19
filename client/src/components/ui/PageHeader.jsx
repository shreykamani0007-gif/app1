import React from 'react';
import { classNames } from '../../utils/helpers';

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  className = ''
}) {
  return (
    <div className={classNames('mb-6 sm:mb-8', className)}>
      {breadcrumb && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
          {breadcrumb}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
