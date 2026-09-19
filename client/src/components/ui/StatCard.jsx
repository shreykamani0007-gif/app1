import React from 'react';
import { Card } from './Card';
import { classNames } from '../../utils/helpers';

const colorThemes = {
  indigo: {
    iconBg: 'bg-brand-50 text-brand-600 border border-brand-100',
    bar: 'bg-brand-500',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    bar: 'bg-emerald-500',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
    bar: 'bg-amber-500',
  },
  rose: {
    iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
    bar: 'bg-rose-500',
  },
  slate: {
    iconBg: 'bg-slate-100 text-slate-600 border border-slate-200',
    bar: 'bg-slate-500',
  },
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendType = 'neutral',
  color = 'indigo',
  className = ''
}) {
  const theme = colorThemes[color] || colorThemes.indigo;

  const trendStyles = {
    positive: 'text-emerald-700 bg-emerald-50',
    warning: 'text-amber-700 bg-amber-50',
    danger: 'text-rose-700 bg-rose-50',
    neutral: 'text-slate-600 bg-slate-100',
  };

  return (
    <Card className={classNames('p-5 relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h4>
        </div>
        <div className={classNames('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm', theme.iconBg)}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-2">
          <span className={classNames('text-xs font-medium px-2 py-0.5 rounded-md inline-block', trendStyles[trendType] || trendStyles.neutral)}>
            {trend}
          </span>
        </div>
      )}
    </Card>
  );
}
