import React from 'react';
import { Loader2 } from 'lucide-react';
import { classNames } from '../../utils/helpers';

const variants = {
  primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 active:bg-brand-800 focus-visible:ring-brand-500 border border-transparent',
  secondary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:bg-slate-950 focus-visible:ring-slate-900 border border-transparent',
  outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm active:bg-slate-100 focus-visible:ring-slate-400',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-400',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 active:bg-rose-800 focus-visible:ring-rose-500 border border-transparent',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-medium rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={classNames(
        baseClasses,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
