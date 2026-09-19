import React from 'react';

export default function LoadingState({ message = 'Loading...', rows = 3 }) {
  return (
    <div className="w-full space-y-4 py-8 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 rounded-full bg-slate-200"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-slate-100 rounded-lg w-full"></div>
      ))}
      <p className="text-center text-xs text-slate-400 mt-2">{message}</p>
    </div>
  );
}
