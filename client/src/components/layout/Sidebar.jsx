import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  CalendarClock,
  FileText,
  AlertTriangle,
  Megaphone,
  BookOpen,
  Sparkles,
  Settings,
  X,
  LogOut,
  Layers
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { classNames } from '../../utils/helpers';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Events', path: '/events', icon: Calendar, badge: '3' },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare, badge: '18' },
  { name: 'Volunteers', path: '/volunteers', icon: Users },
  { name: 'Meetings', path: '/meetings', icon: CalendarClock },
  { name: 'Documents', path: '/documents', icon: FileText },
  { name: 'Risks', path: '/risks', icon: AlertTriangle, badge: '4', badgeVariant: 'danger' },
  { name: 'Announcements', path: '/announcements', icon: Megaphone },
  { name: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
  { name: 'AI Assistant', path: '/ai', icon: Sparkles, aiSpecial: true },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
    if (onClose) onClose();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-600/30 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight font-sans">ClubOps</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded border border-brand-500/30">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Event Operations</p>
          </div>
        </NavLink>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                classNames(
                  'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-brand-600 text-white font-semibold shadow-sm shadow-brand-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70',
                  item.aiSpecial && !window.location.pathname.includes('/ai') && 'text-indigo-300'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={classNames(
                        'w-4 h-4 transition-colors',
                        isActive
                          ? 'text-white'
                          : item.aiSpecial
                          ? 'text-brand-400 group-hover:text-white'
                          : 'text-slate-400 group-hover:text-white'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={classNames(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                        isActive
                          ? 'bg-brand-700/80 text-white'
                          : item.badgeVariant === 'danger'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User profile at bottom */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
              CA
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Demo User</p>
              <p className="text-[11px] text-brand-300 font-medium truncate">Club Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out to Login"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile / Tablet overlay drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
