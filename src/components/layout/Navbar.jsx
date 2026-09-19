import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Calendar,
  CheckCircle2,
  CheckSquare,
  FileText,
  Clock,
  User,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  X
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';

export default function Navbar({ onOpenSidebar }) {
  const navigate = useNavigate();
  const { selectedEvent } = useEventContext();

  // Notification state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'New volunteer task assigned',
      message: 'Maya Patel was assigned to Lead Usher duty for tomorrow’s morning shift.',
      time: '10m ago',
      unread: true,
      icon: CheckSquare,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'notif_2',
      title: 'Meeting scheduled for tomorrow',
      message: 'Operations Sync scheduled for tomorrow at 10:00 AM in Conference Room B.',
      time: '1h ago',
      unread: true,
      icon: Calendar,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'notif_3',
      title: 'New event document uploaded',
      message: 'Volunteer_Briefing_Guidelines.docx was added to Event Documents.',
      time: '3h ago',
      unread: true,
      icon: FileText,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'notif_4',
      title: 'Stage setup inspection passed',
      message: 'A/V & Stage inspection completed successfully for Main Auditorium.',
      time: '5h ago',
      unread: false,
      icon: CheckCircle2,
      color: 'bg-blue-50 text-blue-600',
    },
  ]);

  // Profile dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Unread count
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Mark single as read
  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile hamburger & Context breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span className="max-w-[200px] truncate">
              {selectedEvent ? selectedEvent.name : 'InnovateX Fest 2026'}
            </span>
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold">Operations Command</span>
        </div>
      </div>

      {/* Center: Search bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Quick search tasks, volunteers, rooms... (Ctrl + K)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            title="Notifications"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {notificationsOpen && (
            <div className="absolute right-0 sm:-right-8 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notification Items */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleToggleRead(n.id)}
                      className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        n.unread
                          ? 'bg-brand-50/30 hover:bg-brand-50/50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs font-semibold truncate ${
                              n.unread ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>

                      {n.unread && (
                        <div className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 text-center bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400">
                Active Event: <strong className="text-slate-600">{selectedEvent ? selectedEvent.name : 'Club Event'}</strong>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative pl-2 border-l border-slate-200" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
              AC
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">Alex Chen</p>
              <p className="text-[10px] text-slate-500">Event Lead · CS Club</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 py-1.5 divide-y divide-slate-100 overflow-hidden animate-fadeIn">
              {/* User Overview Header */}
              <div className="px-4 py-3 bg-slate-50/70">
                <p className="text-xs font-bold text-slate-900">Alex Chen</p>
                <p className="text-[11px] font-semibold text-brand-600 mt-0.5">Event Lead · CS Club</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">alex.chen@clubops.org</p>
              </div>

              {/* Navigation Links */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </button>
              </div>

              {/* Sign Out */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
