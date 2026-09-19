import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { useEventContext } from '../../context/EventContext';

export default function EventSwitcher({ className = '', showLabel = true, onChange }) {
  const { events, selectedEvent, selectedEventId, setSelectedEventId } = useEventContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (eventId) => {
    setSelectedEventId(eventId);
    setIsOpen(false);
    if (onChange) onChange(eventId);
  };

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`} ref={dropdownRef}>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
          Event:
        </span>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      >
        <div className="w-2 h-2 rounded-full bg-brand-600 shrink-0 animate-pulse" />
        <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
        <span className="truncate max-w-[180px] sm:max-w-[240px]">
          {selectedEvent ? selectedEvent.name : 'Select Event'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5 divide-y divide-slate-100 overflow-hidden animate-fadeIn">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Switch Club Event
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {events.map((evt) => {
              const evtId = evt._id || evt.id;
              const isSelected = String(evtId) === String(selectedEventId);
              return (
                <button
                  key={evtId}
                  type="button"
                  onClick={() => handleSelect(evtId)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-brand-50/70 text-brand-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-semibold">{evt.name}</p>
                    {evt.status && (
                      <p className="text-[10px] text-slate-400 mt-0.5">Status: {evt.status}</p>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
