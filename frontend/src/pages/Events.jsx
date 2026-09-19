import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  UserCheck,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import EmptyState from '../components/ui/EmptyState';
import CreateEventModal from '../components/modals/CreateEventModal';

export default function Events({ events, onCreateEvent }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      ev.location.toLowerCase().includes(search.toLowerCase()) ||
      ev.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ev.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Events
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage all your club events, hackathons, and workshops.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={Plus}
          size="md"
        >
          Create Event
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by event name, venue, or description..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Planning', 'Upcoming', 'Completed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                statusFilter === filter
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="We couldn't find any events matching your filters. Try creating one!"
          actionLabel="Create Event"
          actionIcon={Plus}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => (
            <Card
              key={ev.id}
              hover
              onClick={() => navigate(`/events/${ev.id}`)}
              className="flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant={ev.status} size="sm">
                    {ev.status}
                  </Badge>
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                    {ev.category || 'Event'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-1">
                  {ev.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {ev.description}
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center text-slate-500">
                    <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center text-slate-500">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-brand-600" />
                    <span className="text-slate-600">
                      <strong className="text-slate-900">{ev.participants}</strong> participants
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-slate-600">
                      <strong className="text-slate-900">{ev.volunteers}</strong> volunteers
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress & Footer */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">Readiness</span>
                  <span className="font-bold text-slate-900">{ev.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      ev.progress === 100
                        ? 'bg-emerald-500'
                        : ev.progress >= 60
                        ? 'bg-brand-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${ev.progress}%` }}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/events/${ev.id}`);
                  }}
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateEvent={onCreateEvent}
      />
    </div>
  );
}
