import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Plus,
  MapPin,
  Users,
  Clock,
  Video,
  FileText,
  User,
  CheckCircle2,
  Trash2,
  Edit3,
  ExternalLink,
  AlertCircle,
  X,
  Mail,
  UserCheck,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import EventSwitcher from '../components/ui/EventSwitcher';
import { useEventContext } from '../context/EventContext';
import {
  getMeetingsByEvent,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from '../services/api';
import { defaultVolunteersByEvent } from '../data/volunteersData';

// Fallback seed meetings per event if backend is disconnected
const fallbackSeedMeetings = {
  evt_innovatex_2026: [
    {
      _id: 'meet_inno_1',
      eventId: 'evt_innovatex_2026',
      title: 'Weekly Core Committee Sync',
      date: '2026-10-02',
      startTime: '05:00 PM',
      endTime: '06:00 PM',
      meetingType: 'In-person',
      location: 'Student Union Room 302',
      meetingLink: '',
      organizer: 'Alex Chen (Lead Coordinator)',
      participants: [
        { id: 'vol_inno_1', name: 'Maya Patel', role: 'Lead Usher', team: 'Hospitality', email: 'maya.patel@campus.edu', status: 'Expected' },
        { id: 'vol_inno_2', name: 'Kavita Rao', role: 'Stage Manager', team: 'A/V & Tech', email: 'kavita.rao@campus.edu', status: 'Confirmed' },
        { id: 'vol_inno_3', name: 'Rohan Sharma', role: 'Registration Desk', team: 'Logistics', email: 'rohan.sharma@campus.edu', status: 'Confirmed' },
        { id: 'vol_inno_5', name: 'Sarah Jenkins', role: 'Hackathon Proctor', team: 'Tech Support', email: 'sarah.jenkins@campus.edu', status: 'Expected' },
        { id: 'vol_inno_6', name: 'David Kim', role: 'Catering Lead', team: 'Hospitality', email: 'david.kim@campus.edu', status: 'Expected' },
      ],
      agenda: '1. Review sponsor booth arrangements in the main hall.\n2. Finalize volunteer shift rotations for Day 1.\n3. Validate electrical load and high-voltage outlets with facilities.',
      description: 'Weekly status checkpoint with team captains and coordinators to identify blockers ahead of the hackathon kickoff.',
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'meet_inno_2',
      eventId: 'evt_innovatex_2026',
      title: 'Hackathon Logistics & Vendor Walkthrough',
      date: '2026-10-05',
      startTime: '03:00 PM',
      endTime: '04:30 PM',
      meetingType: 'Hybrid',
      location: 'Auditorium Main Stage',
      meetingLink: 'https://meet.google.com/inno-logistics-2026',
      organizer: 'Sarah Miller (Logistics)',
      participants: [
        { id: 'vol_inno_3', name: 'Rohan Sharma', role: 'Registration Desk', team: 'Logistics', email: 'rohan.sharma@campus.edu', status: 'Confirmed' },
        { id: 'vol_inno_8', name: 'Marcus Vance', role: 'Badge Distribution', team: 'Logistics', email: 'marcus.vance@campus.edu', status: 'Expected' },
        { id: 'vol_inno_9', name: 'Elena Rostova', role: 'Safety Liaison', team: 'Operations', email: 'elena.rostova@campus.edu', status: 'Confirmed' },
      ],
      agenda: '1. Physical inspection of sound reinforcement and microphone packs.\n2. Sign off on food truck and catering access routes at East gate.\n3. Review badge barcode scanners and spare receipt printers.',
      description: 'On-site walkthrough with university facilities management and external A/V rental partners.',
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
    },
  ],
  evt_techfest_2026: [
    {
      _id: 'meet_tech_1',
      eventId: 'evt_techfest_2026',
      title: 'Robotics Arena & Safety Briefing',
      date: '2026-10-08',
      startTime: '11:00 AM',
      endTime: '12:30 PM',
      meetingType: 'In-person',
      location: 'Robotics Lab & Arena Zone 4',
      meetingLink: '',
      organizer: 'Alex Rivera (Arena Safety Officer)',
      participants: [
        { id: 'vol_tech_1', name: 'Alex Rivera', role: 'Arena Safety Officer', team: 'Robotics Lead', email: 'alex.rivera@campus.edu', status: 'Confirmed' },
        { id: 'vol_tech_3', name: 'Tariq Mansoor', role: 'Hardware Inspection', team: 'Tech Crew', email: 'tariq.mansoor@campus.edu', status: 'Expected' },
        { id: 'vol_tech_5', name: 'Lucas Silva', role: 'Live Stream Operator', team: 'Media & Sound', email: 'lucas.silva@campus.edu', status: 'Expected' },
      ],
      agenda: '1. Test emergency kill-switch system across fighting robot cages.\n2. Inspect Lexan polycarbonate safety shield barriers.\n3. Verify fire extinguisher placements and first-aid kits.',
      description: 'Safety audit required by Faculty Advisor before heavy battle-bots can enter the testing perimeter.',
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'meet_tech_2',
      eventId: 'evt_techfest_2026',
      title: 'Title Sponsors & Press Briefing',
      date: '2026-10-12',
      startTime: '02:00 PM',
      endTime: '03:00 PM',
      meetingType: 'Online',
      location: '',
      meetingLink: 'https://meet.google.com/techfest-press-sync',
      organizer: 'Sophia W. (Sponsorship Head)',
      participants: [
        { id: 'vol_tech_2', name: 'Chloe Dupont', role: 'Coding League Proctor', team: 'Academics', email: 'chloe.dupont@campus.edu', status: 'Confirmed' },
        { id: 'vol_tech_6', name: 'Zoe Washington', role: 'Scoreboard Coordinator', team: 'Operations', email: 'zoe.washington@campus.edu', status: 'Expected' },
      ],
      agenda: '1. Finalize co-branded lanyard proofs with printing partner.\n2. Confirm press passes for collegiate tech journalists.\n3. Outline keynote speaking order for opening ceremony.',
      description: 'Virtual alignment call with corporate sponsors and media leads.',
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
    },
  ],
};

export default function Meetings() {
  const { selectedEvent, selectedEventId } = useEventContext();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [agendaMeeting, setAgendaMeeting] = useState(null);
  const [membersMeeting, setMembersMeeting] = useState(null);
  const [deleteConfirmMeeting, setDeleteConfirmMeeting] = useState(null);

  // Form State
  const [formValues, setFormValues] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingType: 'In-person',
    location: '',
    meetingLink: '',
    organizer: 'Alex Chen (Lead Coordinator)',
    participants: [],
    agenda: '',
    description: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Available volunteers for current event context
  const availableVolunteers = useMemo(() => {
    return defaultVolunteersByEvent[selectedEventId] || defaultVolunteersByEvent['evt_innovatex_2026'] || [];
  }, [selectedEventId]);

  // Load meetings strictly for active event
  const loadMeetings = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await getMeetingsByEvent(selectedEventId);
      if (res && res.success && Array.isArray(res.data)) {
        setMeetings(res.data);
      } else {
        setMeetings(fallbackSeedMeetings[selectedEventId] || []);
      }
    } catch (err) {
      console.warn(`Could not load meetings for ${selectedEventId}, using fallback:`, err.message);
      setMeetings(fallbackSeedMeetings[selectedEventId] || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [selectedEventId]);

  // Flash message helper
  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  // Helper to parse time string into minutes for comparison
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    // Format could be "17:00" or "05:00 PM"
    const cleaned = timeStr.trim();
    if (cleaned.includes('AM') || cleaned.includes('PM')) {
      const parts = cleaned.split(/[:\s]/);
      let hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1] || '0', 10);
      const meridiem = parts[2]?.toUpperCase() || (cleaned.includes('PM') ? 'PM' : 'AM');
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
    const [h, m] = cleaned.split(':').map((n) => parseInt(n, 10));
    return (h || 0) * 60 + (m || 0);
  };

  // Open Form for Scheduling (New)
  const handleOpenSchedule = () => {
    setEditingMeetingId(null);
    setFormErrors({});
    // Pre-populate with first 2 available volunteers
    const initialParticipants = availableVolunteers.slice(0, 2).map((v) => ({
      id: v.id,
      name: v.name,
      role: v.role,
      team: v.team,
      email: v.email,
      status: 'Expected',
    }));

    setFormValues({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      meetingType: 'In-person',
      location: 'Student Union Room 302',
      meetingLink: '',
      organizer: 'Alex Chen (Lead Coordinator)',
      participants: initialParticipants,
      agenda: '1. Agenda checkpoint\n2. Key deliverables\n3. Action items',
      description: '',
    });
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (meeting) => {
    setEditingMeetingId(meeting._id);
    setFormErrors({});
    setFormValues({
      title: meeting.title || '',
      date: meeting.date || '',
      startTime: meeting.startTime || '',
      endTime: meeting.endTime || '',
      meetingType: meeting.meetingType || 'In-person',
      location: meeting.location || '',
      meetingLink: meeting.meetingLink || '',
      organizer: meeting.organizer || '',
      participants: meeting.participants || [],
      agenda: meeting.agenda || '',
      description: meeting.description || '',
    });
    if (agendaMeeting) setAgendaMeeting(null);
    setIsFormOpen(true);
  };

  // Participant selector toggles
  const handleAddParticipant = (volId) => {
    if (!volId) return;
    const vol = availableVolunteers.find((v) => v.id === volId);
    if (!vol) return;

    if (!formValues.participants.some((p) => p.id === vol.id)) {
      setFormValues((prev) => ({
        ...prev,
        participants: [
          ...prev.participants,
          {
            id: vol.id,
            name: vol.name,
            role: vol.role,
            team: vol.team,
            email: vol.email,
            status: 'Expected',
          },
        ],
      }));
    }
  };

  const handleRemoveParticipant = (volId) => {
    setFormValues((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== volId),
    }));
  };

  // Form Validation and Submission
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formValues.title.trim()) {
      errors.title = 'Meeting title is required.';
    }

    if (!formValues.date) {
      errors.date = 'Meeting date is required.';
    }

    if (!formValues.startTime.trim()) {
      errors.startTime = 'Start time is required.';
    }

    if (!formValues.endTime.trim()) {
      errors.endTime = 'End time is required.';
    }

    if (formValues.startTime && formValues.endTime) {
      const startMin = parseTimeToMinutes(formValues.startTime);
      const endMin = parseTimeToMinutes(formValues.endTime);
      if (endMin <= startMin) {
        errors.endTime = 'End time must be strictly after start time.';
      }
    }

    if (formValues.meetingType === 'In-person' && !formValues.location.trim()) {
      errors.location = 'Location / venue is required for in-person meetings.';
    }

    if (formValues.meetingType === 'Online' && !formValues.meetingLink.trim()) {
      errors.meetingLink = 'Meeting link (Google Meet / Zoom URL) is required for online meetings.';
    }

    if (formValues.meetingType === 'Hybrid' && !formValues.location.trim() && !formValues.meetingLink.trim()) {
      errors.location = 'Provide either a physical room or a virtual meeting link for hybrid meetings.';
    }

    if (!formValues.participants || formValues.participants.length === 0) {
      errors.participants = 'Please add at least one participant.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSubmitting(true);

    const payload = {
      ...formValues,
      title: formValues.title.trim(),
      location: formValues.location.trim(),
      meetingLink: formValues.meetingLink.trim(),
      organizer: formValues.organizer.trim(),
      agenda: formValues.agenda.trim(),
      description: formValues.description.trim(),
      status: 'Scheduled',
    };

    try {
      if (editingMeetingId) {
        // Update
        const res = await updateMeeting(editingMeetingId, payload);
        const updatedObj = res && res.data ? res.data : { ...payload, _id: editingMeetingId, eventId: selectedEventId };
        setMeetings((prev) => prev.map((m) => (m._id === editingMeetingId ? updatedObj : m)));
        showToast('Meeting updated successfully.');
      } else {
        // Create
        const res = await createMeeting(selectedEventId, payload);
        const newObj = res && res.data ? res.data : { ...payload, _id: `meet_${Date.now()}`, eventId: selectedEventId };
        setMeetings((prev) => [newObj, ...prev]);
        showToast('Meeting scheduled successfully.');
      }
      setIsFormOpen(false);
    } catch (err) {
      console.warn('API error during meeting save, using local update:', err.message);
      if (editingMeetingId) {
        setMeetings((prev) =>
          prev.map((m) => (m._id === editingMeetingId ? { ...payload, _id: editingMeetingId, eventId: selectedEventId } : m))
        );
        showToast('Meeting updated successfully (Local).');
      } else {
        const fallbackNew = { ...payload, _id: `meet_${Date.now()}`, eventId: selectedEventId };
        setMeetings((prev) => [fallbackNew, ...prev]);
        showToast('Meeting scheduled successfully (Local).');
      }
      setIsFormOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Controlled Deletion
  const handleConfirmDelete = async () => {
    if (!deleteConfirmMeeting) return;
    const idToDelete = deleteConfirmMeeting._id;

    try {
      await deleteMeeting(idToDelete);
    } catch (err) {
      console.warn('Delete API call failed, removing locally:', err.message);
    }

    setMeetings((prev) => prev.filter((m) => m._id !== idToDelete));
    if (agendaMeeting && agendaMeeting._id === idToDelete) {
      setAgendaMeeting(null);
    }
    setDeleteConfirmMeeting(null);
    showToast('Meeting has been cancelled and deleted.');
  };

  // Toggle member attendance status
  const handleToggleAttendance = (memberId) => {
    if (!membersMeeting) return;
    const updatedParticipants = membersMeeting.participants.map((p) => {
      if (p.id === memberId) {
        const nextStatus = p.status === 'Confirmed' ? 'Expected' : 'Confirmed';
        return { ...p, status: nextStatus };
      }
      return p;
    });

    const updatedMeeting = { ...membersMeeting, participants: updatedParticipants };
    setMembersMeeting(updatedMeeting);
    setMeetings((prev) => prev.map((m) => (m._id === updatedMeeting._id ? updatedMeeting : m)));

    // Sync to backend silently
    updateMeeting(updatedMeeting._id, { participants: updatedParticipants }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Meetings & Committee Syncs"
        description={`Schedule team standups, record agendas, and track meeting minutes for ${
          selectedEvent ? selectedEvent.name : 'active event'
        }.`}
        badge={
          <StatusBadge
            status="active"
            label={`${meetings.length} Scheduled`}
          />
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Event Switcher */}
            <EventSwitcher />

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenSchedule}
            >
              Schedule Meeting
            </Button>
          </div>
        }
      />

      {/* Active Event Banner Pill */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Meeting Scope
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h2 className="text-base font-bold text-slate-900">
              {selectedEvent ? selectedEvent.name : 'InnovateX Fest 2026'}
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-500">Live Workspace</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-600" />
          <span>Showing only committee meetings for this event</span>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center text-xs text-slate-400">
          Loading meetings for {selectedEvent?.name}...
        </div>
      )}

      {/* Empty State */}
      {!loading && meetings.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No meetings scheduled for this event.
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Coordinate with leads, schedule volunteer walkthroughs, and set agendas for{' '}
            {selectedEvent?.name}.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenSchedule}
            className="mt-4 shadow-sm"
          >
            + Schedule First Meeting
          </Button>
        </div>
      )}

      {/* Meeting Cards Grid */}
      {!loading && meetings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {meetings.map((m) => {
            const memberCount = m.participants ? m.participants.length : 0;
            return (
              <Card key={m._id} className="p-5 flex flex-col justify-between hover:border-brand-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={m.status === 'Scheduled' ? 'active' : m.status} label={m.status} />
                    <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                      {m.meetingType || 'In-person'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug line-clamp-2">
                    {m.title}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{m.date} • {m.startTime} - {m.endTime}</span>
                    </div>

                    {m.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{m.location}</span>
                      </div>
                    )}

                    {m.meetingLink && (
                      <div className="flex items-center gap-2">
                        <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <a
                          href={m.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-700 truncate font-medium underline flex items-center gap-1"
                        >
                          Join Video Call
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{memberCount} {memberCount === 1 ? 'member' : 'members'} invited</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons: View Agenda & View Members */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMembersMeeting(m)}
                    className="text-xs flex-1 justify-center"
                    icon={Users}
                  >
                    View Members
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setAgendaMeeting(m)}
                    className="text-xs flex-1 justify-center"
                    icon={FileText}
                  >
                    View Agenda
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SCHEDULE & EDIT MEETING MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingMeetingId ? 'Edit Event Meeting' : 'Schedule Event Meeting'}
        description={`Associate meeting notes, timing, and participants with ${
          selectedEvent ? selectedEvent.name : 'active event'
        }.`}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFormOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitForm}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingMeetingId ? 'Save Changes' : 'Schedule Meeting'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {/* Active Event Banner (Auto-bound) */}
          <div className="p-3 bg-brand-50/70 border border-brand-200 rounded-xl text-xs">
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
              Event Context (Auto-Associated)
            </span>
            <p className="font-bold text-slate-900 mt-0.5">
              {selectedEvent ? selectedEvent.name : 'InnovateX Fest 2026'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              This meeting is strictly scoped to this event and will not appear in other club schedules.
            </p>
          </div>

          {/* Meeting Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="mTitle">
              Meeting Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="mTitle"
              type="text"
              value={formValues.title}
              onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
              placeholder="e.g., Hackathon Logistics & Vendor Walkthrough"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
            />
            {formErrors.title && <p className="text-[11px] text-rose-600 mt-1">{formErrors.title}</p>}
          </div>

          {/* Date & Times Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="mDate">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="mDate"
                type="date"
                value={formValues.date}
                onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              />
              {formErrors.date && <p className="text-[11px] text-rose-600 mt-1">{formErrors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="mStart">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="mStart"
                type="text"
                value={formValues.startTime}
                onChange={(e) => setFormValues({ ...formValues, startTime: e.target.value })}
                placeholder="e.g., 03:00 PM"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              />
              {formErrors.startTime && <p className="text-[11px] text-rose-600 mt-1">{formErrors.startTime}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="mEnd">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="mEnd"
                type="text"
                value={formValues.endTime}
                onChange={(e) => setFormValues({ ...formValues, endTime: e.target.value })}
                placeholder="e.g., 04:30 PM"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              />
              {formErrors.endTime && <p className="text-[11px] text-rose-600 mt-1">{formErrors.endTime}</p>}
            </div>
          </div>

          {/* Meeting Type & Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="mType">
                Meeting Type
              </label>
              <select
                id="mType"
                value={formValues.meetingType}
                onChange={(e) => setFormValues({ ...formValues, meetingType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              >
                <option value="In-person">In-person</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="mOrganizer">
                Organizer / Chair
              </label>
              <input
                id="mOrganizer"
                type="text"
                value={formValues.organizer}
                onChange={(e) => setFormValues({ ...formValues, organizer: e.target.value })}
                placeholder="e.g., Alex Chen (Lead Coordinator)"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              />
            </div>
          </div>

          {/* Location & Link based on Type */}
          {(formValues.meetingType === 'In-person' || formValues.meetingType === 'Hybrid') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="mLocation">
                Room / Venue Location <span className="text-rose-500">*</span>
              </label>
              <input
                id="mLocation"
                type="text"
                value={formValues.location}
                onChange={(e) => setFormValues({ ...formValues, location: e.target.value })}
                placeholder="e.g., Auditorium Main Stage or Room 302"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              />
              {formErrors.location && <p className="text-[11px] text-rose-600 mt-1">{formErrors.location}</p>}
            </div>
          )}

          {(formValues.meetingType === 'Online' || formValues.meetingType === 'Hybrid') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="mLink">
                Online Meeting Link <span className="text-rose-500">*</span>
              </label>
              <input
                id="mLink"
                type="url"
                value={formValues.meetingLink}
                onChange={(e) => setFormValues({ ...formValues, meetingLink: e.target.value })}
                placeholder="e.g., https://meet.google.com/xyz-abcd-efg"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              />
              {formErrors.meetingLink && <p className="text-[11px] text-rose-600 mt-1">{formErrors.meetingLink}</p>}
            </div>
          )}

          {/* Participant Management (Multi-select Chips) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Participants / Members <span className="text-rose-500">*</span>
            </label>

            {/* Selected Chips */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px] mb-2 items-center">
              {formValues.participants.length === 0 ? (
                <span className="text-xs text-slate-400">No participants selected yet. Pick below.</span>
              ) : (
                formValues.participants.map((p) => (
                  <span
                    key={p.id || p.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium"
                  >
                    <span>{p.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(p.id)}
                      className="p-0.5 rounded hover:bg-indigo-100 text-indigo-500 hover:text-indigo-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Quick Picker dropdown from existing volunteer roster */}
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  handleAddParticipant(e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="" disabled>
                  + Select volunteer to add to meeting...
                </option>
                {availableVolunteers
                  .filter((v) => !formValues.participants.some((p) => p.id === v.id))
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.role} • {v.team})
                    </option>
                  ))}
              </select>
            </div>
            {formErrors.participants && <p className="text-[11px] text-rose-600 mt-1">{formErrors.participants}</p>}
          </div>

          {/* Agenda */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="mAgenda">
              Meeting Agenda
            </label>
            <textarea
              id="mAgenda"
              rows={3}
              value={formValues.agenda}
              onChange={(e) => setFormValues({ ...formValues, agenda: e.target.value })}
              placeholder="1. Review sponsor agreements&#10;2. A/V walkthrough&#10;3. Next steps"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900 leading-relaxed font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="mDesc">
              Description / Objectives
            </label>
            <textarea
              id="mDesc"
              rows={2}
              value={formValues.description}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              placeholder="Brief summary of meeting purpose and required prep materials..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
            />
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. VIEW AGENDA & DETAILS MODAL */}
      {/* ========================================================================= */}
      {agendaMeeting && (
        <Modal
          isOpen={!!agendaMeeting}
          onClose={() => setAgendaMeeting(null)}
          title={agendaMeeting.title}
          description={`${agendaMeeting.date} • ${agendaMeeting.startTime} - ${agendaMeeting.endTime}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setDeleteConfirmMeeting(agendaMeeting)}
              >
                Delete Meeting
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit3}
                  onClick={() => handleOpenEdit(agendaMeeting)}
                >
                  Edit Meeting
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAgendaMeeting(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Metadata Bar */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Meeting Type</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                  {agendaMeeting.meetingType || 'In-person'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Organizer / Lead</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {agendaMeeting.organizer || 'Event Lead'}
                </span>
              </div>

              {agendaMeeting.location && (
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Room / Venue</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    {agendaMeeting.location}
                  </span>
                </div>
              )}

              {agendaMeeting.meetingLink && (
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Virtual Room</span>
                  <a
                    href={agendaMeeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-600 hover:text-brand-700 underline flex items-center gap-1.5 mt-0.5"
                  >
                    <Video className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    {agendaMeeting.meetingLink}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Description */}
            {agendaMeeting.description && (
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Objective / Overview</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {agendaMeeting.description}
                </p>
              </div>
            )}

            {/* Complete Agenda */}
            <div>
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                Complete Meeting Agenda
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed whitespace-pre-line border border-slate-800 shadow-inner">
                {agendaMeeting.agenda || 'No agenda items recorded for this session.'}
              </div>
            </div>

            {/* Participants Summary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900">
                  Invited Participants ({agendaMeeting.participants ? agendaMeeting.participants.length : 0})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const current = agendaMeeting;
                    setAgendaMeeting(null);
                    setMembersMeeting(current);
                  }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                >
                  Manage Roster & Attendance →
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {agendaMeeting.participants && agendaMeeting.participants.map((p) => (
                  <span
                    key={p.id || p.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {p.name} ({p.role || 'Member'})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW MEMBERS MODAL */}
      {/* ========================================================================= */}
      {membersMeeting && (
        <Modal
          isOpen={!!membersMeeting}
          onClose={() => setMembersMeeting(null)}
          title={`Meeting Members (${membersMeeting.participants ? membersMeeting.participants.length : 0})`}
          description={membersMeeting.title}
          maxWidth="max-w-xl"
          footer={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMembersMeeting(null)}
            >
              Done
            </Button>
          }
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-2">
              Review invited committee members and click attendance badges to toggle between Expected and Confirmed.
            </p>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {(!membersMeeting.participants || membersMeeting.participants.length === 0) ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No participants assigned to this meeting.
                </div>
              ) : (
                membersMeeting.participants.map((m) => {
                  const isConfirmed = m.status === 'Confirmed';
                  return (
                    <div
                      key={m.id || m.name}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {m.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{m.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {m.role || 'Member'} • <span className="text-brand-600 font-medium">{m.team || 'General'}</span>
                          </p>
                          {m.email && (
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-2.5 h-2.5" />
                              {m.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Attendance Toggle Badge */}
                      <button
                        type="button"
                        onClick={() => handleToggleAttendance(m.id)}
                        title="Click to toggle attendance status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                          isConfirmed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span>{m.status || 'Expected'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 4. DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmMeeting && (
        <Modal
          isOpen={!!deleteConfirmMeeting}
          onClose={() => setDeleteConfirmMeeting(null)}
          title="Cancel & Delete Meeting"
          description="Are you sure you want to delete this meeting? This action cannot be undone."
          footer={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteConfirmMeeting(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
              >
                Delete Meeting
              </Button>
            </div>
          }
        >
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{deleteConfirmMeeting.title}</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              Scheduled for {deleteConfirmMeeting.date} ({deleteConfirmMeeting.startTime} - {deleteConfirmMeeting.endTime}).
              All participants will be notified of cancellation.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
