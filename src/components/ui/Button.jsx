import React from 'react';

const variants = {
  primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 active:bg-brand-800',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:bg-slate-300',
  outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700 active:bg-slate-100',
  ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/20 active:bg-red-800',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-3.5 py-2 text-sm font-medium rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}
