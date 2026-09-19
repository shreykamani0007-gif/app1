import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { classNames } from '../../utils/helpers';

const routeTitleMap = {
  '/dashboard': { title: 'Dashboard', category: 'Overview' },
  '/events': { title: 'Events', category: 'Planning' },
  '/tasks': { title: 'Tasks', category: 'Execution' },
  '/volunteers': { title: 'Volunteers', category: 'Team' },
  '/meetings': { title: 'Meetings', category: 'Coordination' },
  '/documents': { title: 'Documents', category: 'Assets' },
  '/risks': { title: 'Risks & Mitigations', category: 'Security' },
  '/announcements': { title: 'Announcements', category: 'Communications' },
  '/knowledge': { title: 'Knowledge Base', category: 'Resources' },
  '/ai': { title: 'AI Assistant', category: 'Intelligence' },
  '/settings': { title: 'Settings', category: 'Preferences' },
};

export function Navbar({ onMenuClick, onSearchClick }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const currentRoute = routeTitleMap[location.pathname] || {
    title: 'ClubOps AI',
    category: 'Operations',
  };

  const sampleNotifications = [
    {
      id: 1,
      title: 'High Risk Alert',
      desc: 'TechFest audio vendor contract pending signoff.',
      time: '12m ago',
      type: 'risk',
    },
    {
      id: 2,
      title: 'Meeting Notes Processed',
      desc: 'AI summarized Core Committee Sync.',
      time: '1h ago',
      type: 'ai',
    },
    {
      id: 3,
      title: 'Volunteer Milestone',
      desc: '42 volunteers registered for Hackathon 2026.',
      time: '3h ago',
      type: 'info',
    },
  ];

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile menu toggle + breadcrumb & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium leading-none mb-1">
            <span>ClubOps AI</span>
            <span>/</span>
            <span className="text-slate-600 font-semibold">{currentRoute.category}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {currentRoute.title}
          </h2>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger button */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/60 transition-all text-xs font-medium"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-slate-500">Search operations...</span>
          <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</span>
                <Badge variant="info" size="sm">3 new</Badge>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {sampleNotifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                      {n.type === 'risk' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      ) : n.type === 'ai' ? (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 leading-tight">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-3 pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Name */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            CA
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-semibold text-slate-900 leading-none">Demo User</span>
            <span className="block text-[11px] text-slate-500 leading-tight mt-0.5">Club Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
