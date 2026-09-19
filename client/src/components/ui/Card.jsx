import React from 'react';
import { classNames } from '../../utils/helpers';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={classNames(
        'bg-white rounded-xl border border-slate-200/80 shadow-sm transition-all duration-150',
        hover && 'hover:border-slate-300 hover:shadow-md cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={classNames('p-5 border-b border-slate-100 flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={classNames('text-base font-semibold text-slate-900 tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p
      className={classNames('text-xs text-slate-500 mt-0.5', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={classNames('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={classNames('p-5 pt-0 border-t border-slate-100 flex items-center', className)}
      {...props}
    >
      {children}
    </div>
  );
}
