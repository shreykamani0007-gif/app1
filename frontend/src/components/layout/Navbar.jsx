import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  Calendar,
  Check
} from 'lucide-react';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/events': 'Events',
  '/tasks': 'Tasks & Workflows',
  '/volunteers': 'Volunteers & Staff',
  '/meetings': 'Meetings & Notes',
  '/documents': 'Document Repository',
  '/risks': 'Risk Management',
  '/announcements': 'Announcements',
  '/ai-assistant': 'ClubOps AI Copilot',
  '/knowledge': 'Knowledge Base',
  '/settings': 'Settings',
};

export default function Navbar({ onMenuClick, currentEvent, setCurrentEvent, events = [] }) {
  const location = useLocation();
  const [showEventMenu, setShowEventMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic title based on pathname
  let pageTitle = routeTitles[location.pathname] || 'ClubOps AI';
  if (location.pathname.startsWith('/events/')) pageTitle = 'Event Details';
  if (location.pathname.startsWith('/meetings/')) pageTitle = 'Meeting Details';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6">
      {/* Left side: Hamburger & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Search, Event Selector, Notifications, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Global Search */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search operations..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>

        {/* Event Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowEventMenu(!showEventMenu)}
            className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Calendar className="h-3.5 w-3.5 text-brand-600 hidden sm:block" />
            <span className="max-w-[120px] sm:max-w-[170px] truncate">
              {currentEvent?.name || 'TechNova Hackathon 2026'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showEventMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50 animate-fade-in">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Active Event
              </div>
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => {
                    setCurrentEvent(ev);
                    setShowEventMenu(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-left transition-colors ${
                    currentEvent?.id === ev.id
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{ev.name}</span>
                  {currentEvent?.id === ev.id && <Check className="h-3.5 w-3.5 text-brand-600 ml-2 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg z-50 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[11px] text-brand-600 font-medium">3 unread</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                  <p className="font-medium text-slate-800">Venue confirmation due</p>
                  <p className="text-[11px] text-slate-500">Action required within 24 hours</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                  <p className="font-medium text-slate-800">New volunteer application</p>
                  <p className="text-[11px] text-slate-500">Priya registered as Operations</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                  <p className="font-medium text-slate-800">Risk flag detected</p>
                  <p className="text-[11px] text-slate-500">Sponsor confirmation pending</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs shadow-xs">
            P
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Prince</p>
            <p className="text-[10px] text-slate-400 leading-tight">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
