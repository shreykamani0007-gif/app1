import React, { createContext, useContext, useState, useEffect } from 'react';
import { getEvents } from '../services/api';

const defaultEvents = [
  {
    _id: 'evt_innovatex_2026',
    name: 'InnovateX Fest 2026',
    description: '36-hour national collegiate hackathon, keynote speaker tracks, and tech club project exhibitions.',
    date: '2026-10-12T09:00:00.000Z',
    location: 'University Student Center & Main Audi',
    status: 'Ongoing',
  },
  {
    _id: 'evt_techfest_2026',
    name: 'TechFest 2026',
    description: 'Annual inter-college robotics championship, paper presentations, and coding league.',
    date: '2026-11-05T10:00:00.000Z',
    location: 'Campus Engineering Block & Quad',
    status: 'Planning',
  },
];

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState(() => {
    try {
      const cached = localStorage.getItem('clubops_events_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore parse error
    }
    return defaultEvents;
  });

  const [selectedEventId, setSelectedEventIdState] = useState(() => {
    return localStorage.getItem('clubops_selected_event_id') || defaultEvents[0]._id;
  });

  const [loading, setLoading] = useState(false);

  // Set and persist selected event
  const setSelectedEventId = (id) => {
    setSelectedEventIdState(id);
    localStorage.setItem('clubops_selected_event_id', id);
  };

  const refreshEvents = async () => {
    try {
      setLoading(true);
      const res = await getEvents();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        // Merge with defaults if defaults are missing
        const fetched = res.data;
        const missingDefaults = defaultEvents.filter(
          (d) => !fetched.some((f) => f.name.toLowerCase() === d.name.toLowerCase() || (f._id || f.id) === d._id)
        );
        const combined = [...fetched, ...missingDefaults];
        setEvents(combined);
        localStorage.setItem('clubops_events_cache', JSON.stringify(combined));

        // If current selected event doesn't exist in new list, pick first
        if (!combined.some((e) => (e._id || e.id) === selectedEventId)) {
          setSelectedEventId(combined[0]._id || combined[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not load events from server, using local events cache:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshEvents();
  }, []);

  const selectedEvent =
    events.find((e) => String(e._id || e.id) === String(selectedEventId)) || events[0] || defaultEvents[0];

  return (
    <EventContext.Provider
      value={{
        events,
        selectedEvent,
        selectedEventId: selectedEvent ? selectedEvent._id || selectedEvent.id : selectedEventId,
        setSelectedEventId,
        refreshEvents,
        loading,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return ctx;
}
