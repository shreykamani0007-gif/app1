import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  Video,
  FileText,
  AlertTriangle,
  Bell,
  Sparkles,
  BookOpen,
  Settings,
  X,
  Layers
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Events', path: '/events', icon: Calendar },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Volunteers', path: '/volunteers', icon: Users },
  { name: 'Meetings', path: '/meetings', icon: Video },
  { name: 'Documents', path: '/documents', icon: FileText },
  { name: 'Risks', path: '/risks', icon: AlertTriangle },
  { name: 'Announcements', path: '/announcements', icon: Bell },
  { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles, isAi: true },
  { name: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                ClubOps <span className="text-brand-600">AI</span>
              </span>
              <span className="block text-[10px] font-medium text-slate-400 -mt-0.5">
                Operations Platform
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? item.isAi
                        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 shadow-xs'
                        : 'bg-brand-50 text-brand-700 font-semibold border border-brand-100 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? item.isAi
                            ? 'text-purple-600'
                            : 'text-brand-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.name}</span>
                    {item.isAi && (
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700 border border-purple-200 ml-1">
                        AI
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom club info */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <div className="flex items-center space-x-3 rounded-lg bg-white p-2.5 border border-slate-200/80 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700 font-bold text-xs">
              TN
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">TechNova Club</p>
              <p className="text-[11px] text-slate-500 truncate">Admin Console</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
