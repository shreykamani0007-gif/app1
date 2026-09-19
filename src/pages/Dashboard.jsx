import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Flame,
  Activity,
  ChevronRight,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EventSelector from '../components/dashboard/EventSelector';
import EventSwitcher from '../components/ui/EventSwitcher';
import { useEventContext } from '../context/EventContext';
import { getEvents, createEvent, getTasksByEvent } from '../services/api';

export default function Dashboard() {
  const {
    events: contextEvents,
    selectedEventId,
    setSelectedEventId,
    refreshEvents: refreshContextEvents,
  } = useEventContext();

  const [events, setEvents] = useState(contextEvents || []);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [eventTasks, setEventTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal for creating a new event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    status: 'Planning',
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getEvents();
      if (res && res.data && res.data.length > 0) {
        setEvents(res.data);
      } else if (contextEvents && contextEvents.length > 0) {
        setEvents(contextEvents);
      }
    } catch (err) {
      console.warn('Dashboard fetchEvents warning:', err.message);
      if (contextEvents && contextEvents.length > 0) {
        setEvents(contextEvents);
      } else {
        setError(err.message || 'Failed to connect to backend server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Synchronize events with context
  useEffect(() => {
    if (contextEvents && contextEvents.length > 0) {
      setEvents(contextEvents);
    }
  }, [contextEvents]);

  // Synchronize selected index when selectedEventId changes
  useEffect(() => {
    if (events.length > 0 && selectedEventId) {
      const idx = events.findIndex((e) => String(e._id || e.id) === String(selectedEventId));
      if (idx !== -1 && idx !== selectedEventIndex) {
        setSelectedEventIndex(idx);
      }
    }
  }, [selectedEventId, events]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return;

    try {
      setSubmitting(true);
      const res = await createEvent(formData);
      if (res.success && res.data) {
        setEvents((prev) => [res.data, ...prev]);
        setSelectedEventIndex(0);
        setIsModalOpen(false);
        setFormData({
          name: '',
          description: '',
          date: '',
          location: '',
          status: 'Planning',
        });
      }
    } catch (err) {
      alert(`Failed to create event: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSampleEvent = async () => {
    try {
      setSubmitting(true);
      const sample = {
        name: 'InnovateX Hackathon & Tech Fest 2026',
        description: '36-hour national collegiate hackathon, keynote speaker tracks, and tech club project exhibitions.',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'University Student Center & Main Audi',
        status: 'Ongoing',
      };
      const res = await createEvent(sample);
      if (res.success && res.data) {
        setEvents((prev) => [res.data, ...prev]);
        setSelectedEventIndex(0);
      }
    } catch (err) {
      alert(`Failed to create sample event: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const activeEvent = events[selectedEventIndex] || events[0] || null;

  // Fallback map for offline/instant initial state
  const fallbackTasksMap = {
    evt_innovatex_2026: [
      { status: 'In Progress', deadline: 'Tomorrow, 5:00 PM', title: 'Confirm guest speaker travel reimbursement', owner: 'David K.', department: 'Finance' },
      { status: 'In Progress', deadline: 'Sep 22, 2:00 PM', title: 'Prepare Wi-Fi credentials signage for Block C', owner: 'Tech Team', department: 'Tech Ops' },
      { status: 'To Do', deadline: 'Sep 27, 4:00 PM', title: 'Finalize lunch coupons with university dining hall', owner: 'Alex C.', department: 'Logistics' },
      { status: 'Completed', deadline: 'Completed', title: 'Collect participant waiver forms digitally', owner: 'Priya R.', department: 'Registration' },
    ],
    evt_techfest_2026: [
      { status: 'In Progress', deadline: 'Oct 5, 10:00 AM', title: 'Arrange venue and auditorium soundcheck', owner: 'Marcus L.', department: 'Logistics' },
      { status: 'To Do', deadline: 'Oct 8, 6:00 PM', title: 'Contact sponsors for title sponsorship deck', owner: 'Sophia W.', department: 'Sponsorship' },
      { status: 'Completed', deadline: 'Oct 1, 12:00 PM', title: 'Prepare posters and social media banners', owner: 'Design Club', department: 'Marketing' },
    ],
  };

  // Fetch tasks belonging strictly to the currently selected active event
  useEffect(() => {
    if (activeEvent) {
      const eId = activeEvent._id || activeEvent.id;
      getTasksByEvent(eId)
        .then((res) => {
          if (res && res.success && Array.isArray(res.data)) {
            setEventTasks(res.data);
          } else {
            setEventTasks(fallbackTasksMap[eId] || []);
          }
        })
        .catch(() => {
          setEventTasks(fallbackTasksMap[eId] || []);
        });
    }
  }, [activeEvent]);

  // Dynamic statistics per event
  const totalTasksCount = eventTasks.length;
  const completedTasksCount = eventTasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasksCount = eventTasks.filter((t) => t.status === 'In Progress').length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const metrics = [
    {
      title: 'Total Tasks',
      value: String(totalTasksCount),
      subtext: `${inProgressTasksCount} in progress`,
      icon: ListTodo,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Completed Tasks',
      value: String(completedTasksCount),
      subtext: `${completionRate}% completion rate`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Active Volunteers',
      value: '78',
      subtext: '42 confirmed on duty',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Open Risks',
      value: '3',
      subtext: '1 requires dean signoff',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  const upcomingDeadlines = eventTasks.filter((t) => t.status !== 'Completed' && t.deadline).length > 0
    ? eventTasks
        .filter((t) => t.status !== 'Completed' && t.deadline)
        .slice(0, 4)
        .map((t) => ({
          title: t.title,
          lead: `${t.department || 'Lead'} (${t.owner || 'Assigned'})`,
          due: t.deadline,
          status: t.status === 'To Do' ? 'todo' : 'in_progress',
        }))
    : [
        {
          title: 'No pending deadlines for this event',
          lead: 'All milestones verified',
          due: 'Up to date',
          status: 'completed',
        },
      ];

  const openRisks = [
    {
      title: 'Main Hall Projector Bulb Replacement',
      severity: 'high',
      impact: 'Keynote presentations could face delay if backup bulb is not procured.',
      owner: 'Sarah M.',
    },
    {
      title: 'Wi-Fi Bandwidth Limit in Block C',
      severity: 'medium',
      impact: '500+ attendees simultaneous coding may overload default access points.',
      owner: 'Tech Team',
    },
    {
      title: 'Guest Speaker Travel Reschedule',
      severity: 'low',
      impact: 'Flight delayed by 2 hours; agenda buffer absorbed the variance.',
      owner: 'Guest Relations',
    },
  ];

  const recentActivity = [
    {
      actor: 'Sarah M.',
      action: 'completed task',
      target: 'Fire Safety Clearance NOC',
      time: '15 minutes ago',
    },
    {
      actor: 'Alex Chen',
      action: 'assigned 4 volunteers to',
      target: 'Hackathon Check-in Desk',
      time: '1 hour ago',
    },
    {
      actor: 'System Monitor',
      action: 'flagged risk update on',
      target: 'Block C Network Bandwidth',
      time: '3 hours ago',
    },
    {
      actor: 'Priya R.',
      action: 'uploaded asset',
      target: 'InnovateX_Banner_Final_v2.pdf',
      time: '5 hours ago',
    },
  ];

  // Format date helper
  const formatEventDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate days remaining
  const calculateDaysLeft = (dateString) => {
    if (!dateString) return null;
    const target = new Date(dateString);
    if (isNaN(target.getTime())) return null;
    const diffTime = target - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Passed';
    if (diffDays === 0) return 'Today';
    return `${diffDays} Days`;
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title="Event Operations Command"
        description="Real-time status, volunteer coordination, and operational milestones for college club management."
        badge={<StatusBadge status="active" label="Live Preparation" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              Add Event
            </Button>
            <Button variant="primary" size="sm" icon={ArrowUpRight}>
              Export Report
            </Button>
          </div>
        }
      />

      {/* 1. Event Overview Banner / States */}
      {loading ? (
        /* Loading State */
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800 animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="h-4 bg-slate-800 rounded w-48" />
              <div className="h-8 bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-800 rounded w-1/2" />
            </div>
            <div className="h-16 w-48 bg-slate-800 rounded-xl" />
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="h-3 bg-slate-800 rounded w-36" />
            <div className="h-3 bg-slate-800 rounded w-24" />
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-rose-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">Backend Connection Issue</h3>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchEvents}
            className="border-rose-300 text-rose-800 hover:bg-rose-100"
          >
            Retry Connection
          </Button>
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800 text-center">
          <div className="max-w-md mx-auto py-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20">
              <Calendar className="w-6 h-6 text-brand-300" />
            </div>
            <h3 className="text-xl font-bold text-white">No Events Found</h3>
            <p className="text-xs text-slate-300 mt-1.5 mb-5 leading-relaxed">
              No events are currently registered in the database. Create a new event or populate with a sample event to begin operations tracking.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsModalOpen(true)}
              >
                Create Event
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateSampleEvent}
                disabled={submitting}
                className="text-white border-white/20 hover:bg-white/10"
              >
                Load Sample Event
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Populated Event Overview Banner */
        <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          {/* Contained background blur blob so popover dropdown is not clipped */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
          </div>

          {/* Clean, Scalable Event Selector */}
          <div className="relative z-30 mb-5">
            <EventSelector
              events={events}
              selectedEventIndex={selectedEventIndex}
              onSelectEvent={(idx) => {
                setSelectedEventIndex(idx);
                const evt = events[idx];
                if (evt) setSelectedEventId(evt._id || evt.id);
              }}
              onAddEvent={() => setIsModalOpen(true)}
              formatDate={formatEventDate}
            />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/30 text-brand-300 border border-brand-500/40 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Status: {activeEvent.status || 'Planning'}
                </span>
                {activeEvent.location && (
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {activeEvent.location}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {activeEvent.name}
              </h2>
              <p className="text-sm text-slate-300 mt-1.5 max-w-2xl">
                {activeEvent.description || 'No description provided for this event.'}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-xl border border-white/15 shrink-0">
              <div>
                <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Countdown</div>
                <div className="text-2xl font-black text-white">
                  {calculateDaysLeft(activeEvent.date) || '18 Days'}
                </div>
                <div className="text-[11px] text-brand-200">
                  Scheduled: {formatEventDate(activeEvent.date)}
                </div>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Readiness</div>
                <div className="text-2xl font-black text-emerald-400">{completionRate}%</div>
                <div className="text-[11px] text-emerald-200">
                  {completionRate > 50 ? 'On Target' : 'In Progress'}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
              <span>Overall Operations Progress</span>
              <span className="font-semibold text-white">
                {completedTasksCount} of {totalTasksCount} milestones verified
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Metric Cards: Total Tasks, Completed Tasks, Volunteers, Open Risks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {m.title}
                </span>
                <div className={`w-9 h-9 rounded-xl ${m.bg} ${m.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{m.value}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600 inline" />
                  <span>{m.subtext}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. Operational Checkpoints: Deadlines & Risks (Side-by-Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Deadlines (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Upcoming Deadlines</CardTitle>
                <CardDescription>Prioritized operations checkpoints approaching soon</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                View All Tasks
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {upcomingDeadlines.map((item, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span>Lead: {item.lead}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.due}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Risks & Contingencies (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Open Risks & Contingencies</CardTitle>
                <CardDescription>Issues requiring proactive mitigation before event day</CardDescription>
              </div>
              <StatusBadge status="urgent" label="3 Open" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {openRisks.map((risk, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-800">{risk.title}</h4>
                      <StatusBadge status={risk.severity} />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{risk.impact}</p>
                    <div className="mt-2 text-[11px] text-slate-400">
                      Assigned owner: <span className="font-semibold text-slate-600">{risk.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Live Activity & Operations Health Overview (2-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Recent Activity</CardTitle>
                <CardDescription>Live log from team members and operational updates</CardDescription>
              </div>
              <Activity className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">{act.actor}</span>{' '}
                      {act.action}{' '}
                      <span className="font-semibold text-slate-800">{act.target}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Operations Health & Resource Status (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Operations Health</CardTitle>
                <CardDescription>Resource deployment and milestone tracking</CardDescription>
              </div>
              <StatusBadge status="active" label="Healthy" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Task Progress Stat */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Milestone Completion
                  </span>
                  <span className="font-bold text-slate-900">65.4%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65.4%' }} />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">34 of 52 milestones verified</p>
              </div>

              {/* Volunteer Shift Stat */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Volunteer Staffing
                  </span>
                  <span className="font-bold text-slate-900">42 / 78 On Duty</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '53.8%' }} />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">53.8% shift coverage active</p>
              </div>

              {/* Risk Mitigation Stat */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Critical Risk Status
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">1 Dean Signoff</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">2 other risks monitored by logistics & tech leads</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Event"
        description="Add a new club event to track its milestones and operational readiness."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateEvent}
              disabled={submitting || !formData.name || !formData.date}
            >
              {submitting ? 'Creating...' : 'Create Event'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Event Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HackCon 2026"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Describe event scope, target audience, and key goals..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Event Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="Planning">Planning</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g. University Student Center & Auditorium"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
