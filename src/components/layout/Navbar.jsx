import React, { useState } from 'react';
import { Menu, Bell, Search, Plus, Sparkles, Calendar } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

export default function Navbar({ onOpenSidebar }) {
  const [showQuickModal, setShowQuickModal] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile hamburger & Context breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="px-2 py-1 bg-slate-100 rounded-md text-slate-700 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              InnovateX 2026
            </span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Operations Command</span>
          </div>
        </div>

        {/* Center / Search bar placeholder */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              placeholder="Quick search tasks, volunteers, rooms... (Ctrl + K)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer"
              onClick={() => setShowQuickModal(true)}
            />
          </div>
        </div>

        {/* Right: Quick actions, notifications, user preview */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setShowQuickModal(true)}
            className="hidden sm:inline-flex"
          >
            Quick Action
          </Button>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Notifications"
            onClick={() => setShowQuickModal(true)}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* User mini badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              AC
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">Alex Chen</p>
              <p className="text-[10px] text-slate-400">Lead Coordinator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Action Mock Modal */}
      <Modal
        isOpen={showQuickModal}
        onClose={() => setShowQuickModal(false)}
        title="Quick Operations Action"
        description="Select an action to launch in ClubOps AI."
        footer={
          <Button variant="secondary" size="sm" onClick={() => setShowQuickModal(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Ask AI Assistant</p>
                <p className="text-xs text-slate-500">Draft announcements, find schedule conflicts</p>
              </div>
            </div>
            <span className="text-xs text-brand-600 font-semibold">Open</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Create Task</p>
                <p className="text-xs text-slate-500">Assign duty, deadline, and volunteer lead</p>
              </div>
            </div>
            <span className="text-xs text-brand-600 font-semibold">New</span>
          </div>
        </div>
      </Modal>
    </>
  );
}
