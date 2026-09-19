import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Modal } from '../ui/Modal';
import { Search, Calendar, CheckSquare, Users, Sparkles, ArrowRight } from 'lucide-react';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut for Cmd+K / Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const quickLinks = [
    { title: 'TechFest 2026', type: 'Event', path: '/events', icon: Calendar },
    { title: 'Confirm auditorium booking', type: 'Task', path: '/tasks', icon: CheckSquare },
    { title: 'Rahul Sharma (Lead Volunteer)', type: 'Volunteer', path: '/volunteers', icon: Users },
    { title: 'Ask AI: Event budget status', type: 'AI Query', path: '/ai', icon: Sparkles },
  ];

  const handleSelectLink = (path) => {
    setSearchOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onSearchClick={() => setSearchOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Quick Search Modal */}
      <Modal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Quick Command & Search"
        description="Search events, tasks, volunteers, or operations across ClubOps AI"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event name, task, or volunteer..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick Suggestions
            </p>
            <div className="space-y-1">
              {quickLinks.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectLink(item.path)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-500 group-hover:text-brand-600 border border-slate-200/60 shadow-2xs">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                        <p className="text-[10px] text-slate-500">{item.type}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
