import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Search,
  Check,
  Calendar,
  MapPin,
  Plus,
  X,
  Flame,
  Layers
} from 'lucide-react';

export default function EventSelector({
  events = [],
  selectedEventIndex = 0,
  onSelectEvent,
  onAddEvent,
  formatDate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedEvent = events[selectedEventIndex] || events[0] || null;

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus search input when dropdown opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Reset filters when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setStatusFilter('ALL');
    }
  }, [isOpen]);

  // Filter events based on search query and status filter
  const filteredEvents = events.filter((ev) => {
    const nameMatch = ev.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch = ev.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = ev.status?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = !searchQuery || nameMatch || locationMatch || statusMatch;

    const matchesStatus =
      statusFilter === 'ALL' ||
      ev.status?.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate status counts
  const statusCounts = {
    ALL: events.length,
    Planning: events.filter((e) => e.status === 'Planning').length,
    Ongoing: events.filter((e) => e.status === 'Ongoing').length,
    Completed: events.filter((e) => e.status === 'Completed').length,
  };

  // Helper for status badge styling
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Ongoing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Planning':
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block w-full sm:w-auto" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select active event"
        className="w-full sm:w-auto group relative bg-slate-900/80 hover:bg-slate-800/90 active:bg-slate-800 border border-white/20 hover:border-white/35 rounded-xl px-4 py-2.5 transition-all text-left focus:outline-none focus:ring-2 focus:ring-brand-400/60 shadow-lg backdrop-blur-md flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0 text-brand-300 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Event
              </span>
              <span className="text-[10px] font-medium bg-white/10 px-2 py-0.5 rounded-full text-slate-300 border border-white/10">
                {events.length} {events.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[280px] md:max-w-[340px] block">
                {selectedEvent?.name || 'Select Event'}
              </span>
              {selectedEvent?.status && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadgeStyle(
                    selectedEvent.status
                  )}`}
                >
                  {selectedEvent.status}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-300 group-hover:text-white pl-2 border-l border-white/10">
          <span className="text-xs font-medium hidden sm:inline text-slate-400 group-hover:text-slate-200">
            Switch
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-brand-300' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-2 left-0 w-full sm:w-[460px] md:w-[500px] max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all text-white animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Popover Header & Search */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Event
                </span>
                <span className="text-[10px] bg-brand-500/20 text-brand-300 font-bold px-2 py-0.5 rounded-full border border-brand-500/30">
                  {events.length} Registered
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close event selector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, location, or status..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-800/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {['ALL', 'Planning', 'Ongoing', 'Completed'].map((status) => {
                const count = statusCounts[status] || 0;
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>{status === 'ALL' ? 'All' : status}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Items List */}
          <div className="max-h-72 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/50">
            {filteredEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-1.5">
                <p className="font-semibold text-slate-300">No matching events found</p>
                <p className="text-[11px] text-slate-500">
                  Try adjusting your search query or filter
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                    }}
                    className="mt-2 text-xs text-brand-400 hover:underline font-semibold"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              filteredEvents.map((ev) => {
                const originalIndex = events.findIndex(
                  (orig) => (orig._id && orig._id === ev._id) || orig.name === ev.name
                );
                const isSelected = originalIndex === selectedEventIndex;

                return (
                  <button
                    key={ev._id || originalIndex}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectEvent(originalIndex >= 0 ? originalIndex : 0);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-400/50 ${
                      isSelected
                        ? 'bg-brand-600/25 border border-brand-500/50 shadow-sm'
                        : 'hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold truncate block group-hover:text-brand-200 transition-colors ${
                            isSelected ? 'text-white' : 'text-slate-200'
                          }`}
                        >
                          {ev.name}
                        </span>
                        {ev.status && (
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadgeStyle(
                              ev.status
                            )}`}
                          >
                            {ev.status}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                        {ev.date && (
                          <span className="flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {formatDate ? formatDate(ev.date) : ev.date}
                          </span>
                        )}
                        {ev.location && (
                          <span className="flex items-center gap-1 truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-brand-500/30 border border-brand-500/60 flex items-center justify-center text-brand-300 shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Select
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          <div className="p-2.5 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onAddEvent) onAddEvent();
              }}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Event</span>
            </button>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              ESC to close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
