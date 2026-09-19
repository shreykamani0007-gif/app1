import React, { useState } from 'react';
import { Users, UserPlus, Calendar, Clock, Search, Trash2, Pencil, Filter } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import EventSwitcher from '../components/ui/EventSwitcher';
import Modal from '../components/ui/Modal';

// Realistic demo volunteer rosters for at least 3 distinct events
const defaultVolunteersByEvent = {
  evt_innovatex_2026: [
    {
      id: 'vol_inno_1',
      name: 'Maya Patel',
      role: 'Lead Usher',
      team: 'Hospitality',
      shift: 'Morning (08:00 - 13:00)',
      status: 'confirmed',
    },
    {
      id: 'vol_inno_2',
      name: 'Kavita Rao',
      role: 'Stage Manager',
      team: 'A/V & Tech',
      shift: 'Full Day (09:00 - 18:00)',
      status: 'confirmed',
    },
    {
      id: 'vol_inno_3',
      name: 'Rohan Sharma',
      role: 'Registration Desk',
      team: 'Logistics',
      shift: 'Opening Shift (07:30 - 12:00)',
      status: 'active',
    },
    {
      id: 'vol_inno_4',
      name: 'Liam Murphy',
      role: 'Speaker Escort',
      team: 'Guest Relations',
      shift: 'Afternoon (12:00 - 17:00)',
      status: 'todo',
    },
    {
      id: 'vol_inno_5',
      name: 'Sarah Jenkins',
      role: 'Hackathon Proctor',
      team: 'Tech Support',
      shift: 'Overnight (20:00 - 04:00)',
      status: 'confirmed',
    },
    {
      id: 'vol_inno_6',
      name: 'David Kim',
      role: 'Catering & Refreshments',
      team: 'Hospitality',
      shift: 'Lunch Service (11:30 - 15:30)',
      status: 'active',
    },
    {
      id: 'vol_inno_7',
      name: 'Priya Nair',
      role: 'Social Media & Photography',
      team: 'Marketing',
      shift: 'Full Day (09:00 - 18:00)',
      status: 'confirmed',
    },
    {
      id: 'vol_inno_8',
      name: 'Marcus Vance',
      role: 'Badge & Kit Distribution',
      team: 'Logistics',
      shift: 'Morning (08:00 - 13:00)',
      status: 'active',
    },
    {
      id: 'vol_inno_9',
      name: 'Elena Rostova',
      role: 'First Aid & Safety Liaison',
      team: 'Operations',
      shift: 'Evening (16:00 - 22:00)',
      status: 'confirmed',
    },
  ],
  evt_techfest_2026: [
    {
      id: 'vol_tech_1',
      name: 'Alex Rivera',
      role: 'Arena Safety Officer',
      team: 'Robotics Lead',
      shift: 'Morning (08:30 - 14:00)',
      status: 'confirmed',
    },
    {
      id: 'vol_tech_2',
      name: 'Chloe Dupont',
      role: 'Coding League Proctor',
      team: 'Academics',
      shift: 'Midday (11:00 - 16:30)',
      status: 'active',
    },
    {
      id: 'vol_tech_3',
      name: 'Tariq Mansoor',
      role: 'Hardware Inspection',
      team: 'Tech Crew',
      shift: 'Opening Shift (08:00 - 12:30)',
      status: 'confirmed',
    },
    {
      id: 'vol_tech_4',
      name: 'Ananya Gupta',
      role: 'VIP Hospitality Host',
      team: 'Guest Relations',
      shift: 'Afternoon (13:00 - 18:00)',
      status: 'confirmed',
    },
    {
      id: 'vol_tech_5',
      name: 'Lucas Silva',
      role: 'Live Stream Operator',
      team: 'Media & Sound',
      shift: 'Full Day (09:00 - 17:30)',
      status: 'active',
    },
    {
      id: 'vol_tech_6',
      name: 'Zoe Washington',
      role: 'Scoreboard Coordinator',
      team: 'Operations',
      shift: 'Finals Shift (14:00 - 19:00)',
      status: 'todo',
    },
  ],
  evt_aws_workshop_2026: [
    {
      id: 'vol_aws_1',
      name: 'Devin Brooks',
      role: 'Cloud Lab Assistant',
      team: 'Technical Mentorship',
      shift: 'Morning (09:00 - 13:30)',
      status: 'confirmed',
    },
    {
      id: 'vol_aws_2',
      name: 'Meera Sundaram',
      role: 'Check-in & Credential Desk',
      team: 'Logistics',
      shift: 'Registration (08:30 - 11:30)',
      status: 'active',
    },
    {
      id: 'vol_aws_3',
      name: 'Kevin Zhao',
      role: 'Sandbox Environment Monitor',
      team: 'Tech Support',
      shift: 'Afternoon (13:00 - 17:00)',
      status: 'confirmed',
    },
    {
      id: 'vol_aws_4',
      name: 'Natasha Petrova',
      role: 'Q&A Chat Moderator',
      team: 'Virtual Operations',
      shift: 'Full Session (09:30 - 16:30)',
      status: 'confirmed',
    },
    {
      id: 'vol_aws_5',
      name: 'Samira Khan',
      role: 'Swag & Certificate Desk',
      team: 'Member Experience',
      shift: 'Wrap-up (15:00 - 18:00)',
      status: 'todo',
    },
  ],
};

const avatarColors = [
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-sky-50 text-sky-700 border-sky-200',
  'bg-rose-50 text-rose-700 border-rose-200',
];

export default function Volunteers() {
  const { selectedEvent, selectedEventId } = useEventContext();

  // Persistent volunteer storage keyed by eventId
  const [volunteersByEvent, setVolunteersByEvent] = useState(() => {
    try {
      const cached = localStorage.getItem('clubops_volunteers_by_event');
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...defaultVolunteersByEvent, ...parsed };
      }
    } catch (err) {
      console.warn('Failed to parse volunteers cache:', err);
    }
    return defaultVolunteersByEvent;
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    team: 'Logistics',
    shift: 'Morning (08:00 - 13:00)',
    status: 'confirmed',
  });

  // Current active event's volunteers
  const currentVolunteers = volunteersByEvent[selectedEventId] || [];
  const enrolledCount = currentVolunteers.length;

  // Persist helper
  const persistVolunteers = (newData) => {
    setVolunteersByEvent(newData);
    try {
      localStorage.setItem('clubops_volunteers_by_event', JSON.stringify(newData));
    } catch (err) {
      console.warn('Failed to persist volunteers:', err);
    }
  };

  // Open Modal for Add or Edit
  const openModal = (volunteer = null) => {
    if (volunteer) {
      setEditingVolunteer(volunteer);
      setFormData({
        name: volunteer.name,
        role: volunteer.role,
        team: volunteer.team,
        shift: volunteer.shift,
        status: volunteer.status,
      });
    } else {
      setEditingVolunteer(null);
      setFormData({
        name: '',
        role: '',
        team: 'Logistics',
        shift: 'Morning (08:00 - 13:00)',
        status: 'confirmed',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVolunteer(null);
  };

  // Handle Form Submit (Add or Edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) return;

    if (editingVolunteer) {
      // Edit existing volunteer in currently selected event
      const updatedList = currentVolunteers.map((v) =>
        v.id === editingVolunteer.id
          ? {
              ...v,
              name: formData.name.trim(),
              role: formData.role.trim(),
              team: formData.team.trim(),
              shift: formData.shift.trim(),
              status: formData.status,
            }
          : v
      );
      persistVolunteers({
        ...volunteersByEvent,
        [selectedEventId]: updatedList,
      });
    } else {
      // Add new volunteer to currently selected event ONLY
      const newVolunteer = {
        id: `vol_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: formData.name.trim(),
        role: formData.role.trim(),
        team: formData.team.trim(),
        shift: formData.shift.trim(),
        status: formData.status,
      };
      persistVolunteers({
        ...volunteersByEvent,
        [selectedEventId]: [newVolunteer, ...currentVolunteers],
      });
    }

    closeModal();
  };

  // Handle Delete (Only from current event)
  const handleDeleteVolunteer = (id) => {
    const updatedList = currentVolunteers.filter((v) => v.id !== id);
    persistVolunteers({
      ...volunteersByEvent,
      [selectedEventId]: updatedList,
    });
  };

  // Filtered volunteers for search
  const filteredVolunteers = currentVolunteers.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || v.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteers & Staffing"
        description="Manage volunteer rosters, team assignments, check-ins, and schedule shifts."
        badge={
          <div className="flex flex-wrap items-center gap-2">
            {/* Active Event Context Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/80 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="max-w-[200px] sm:max-w-[260px] truncate">
                {selectedEvent ? selectedEvent.name : 'Active Event'}
              </span>
            </span>

            {/* Dynamic Enrolled Count */}
            <StatusBadge status="confirmed" label={`${enrolledCount} Enrolled`} />
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Event Switcher directly accessible on page */}
            <EventSwitcher />

            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => openModal()}
            >
              Add Volunteer
            </Button>
          </div>
        }
      />

      {/* Roster Controls: Search & Filter (Only when there are volunteers) */}
      {currentVolunteers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search volunteers by name, role, or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
            >
              <option value="all">All Statuses ({currentVolunteers.length})</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="todo">To Do</option>
            </select>
          </div>
        </div>
      )}

      {/* Volunteer List or Professional Empty State */}
      <Card>
        <CardContent className="p-0">
          {currentVolunteers.length === 0 ? (
            /* Professional Empty State as required */
            <div className="py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-2xs">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No volunteers assigned yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Add volunteers to this event to get started.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => openModal()}
              >
                Add Volunteer
              </Button>
            </div>
          ) : filteredVolunteers.length === 0 ? (
            /* Filter Empty State */
            <div className="py-12 px-6 text-center">
              <p className="text-sm font-medium text-slate-700">No volunteers match your search</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing or adjusting your search filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-3 text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* Active Volunteer Roster */
            <div className="divide-y divide-slate-100">
              {filteredVolunteers.map((v, idx) => {
                const initials = v.name
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                const colorClass = avatarColors[idx % avatarColors.length];

                return (
                  <div
                    key={v.id || idx}
                    className="p-4 hover:bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full border font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs ${colorClass}`}
                      >
                        {initials}
                      </div>

                      {/* Name & Role */}
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">{v.name}</h3>
                        <p className="text-xs text-slate-500 truncate">
                          {v.role} • <span className="text-brand-600 font-medium">{v.team}</span>
                        </p>
                      </div>
                    </div>

                    {/* Shift, Status & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3.5 text-xs text-slate-500 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="flex items-center gap-1.5 font-medium text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Shift: {v.shift}</span>
                      </span>

                      <StatusBadge status={v.status} />

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => openModal(v)}
                          title="Edit Volunteer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVolunteer(v.id)}
                          title="Delete Volunteer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Volunteer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingVolunteer ? 'Edit Volunteer' : 'Add Volunteer'}
        description={`Assign volunteer details for: ${selectedEvent?.name || 'Selected Event'}`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editingVolunteer ? 'Save Changes' : 'Add to Event'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Patel"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lead Usher"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Team / Department
              </label>
              <input
                type="text"
                placeholder="e.g. Hospitality, A/V, Logistics"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shift
              </label>
              <input
                type="text"
                placeholder="e.g. Morning (08:00 - 13:00)"
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 bg-white"
              >
                <option value="confirmed">Confirmed</option>
                <option value="active">Active</option>
                <option value="todo">To Do</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
