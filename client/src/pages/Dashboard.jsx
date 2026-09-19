import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  Users,
  AlertTriangle,
  Clock,
  MapPin,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  UserCheck,
  FileCheck
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { useToast } from '../hooks/useToast';

export function Dashboard() {
  const toast = useToast();

  const [priorities, setPriorities] = useState([
    { id: 1, title: 'Confirm auditorium booking', event: 'TechFest 2026', done: false, priority: 'urgent' },
    { id: 2, title: 'Finalize event poster', event: 'TechFest 2026', done: true, priority: 'normal' },
    { id: 3, title: 'Contact sponsors', event: 'Hackathon 2026', done: false, priority: 'high' },
    { id: 4, title: 'Assign registration volunteers', event: 'Cultural Night', done: false, priority: 'normal' },
  ]);

  const togglePriority = (id) => {
    setPriorities((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = !item.done;
          if (updated) toast.success(`Completed: "${item.title}"`);
          return { ...item, done: updated };
        }
        return item;
      })
    );
  };

  const sampleEvents = [
    {
      id: 1,
      name: 'TechFest 2026',
      date: 'September 25, 2026',
      venue: 'DDU Auditorium',
      attendees: '450 Expected',
      status: 'On Track',
      statusVariant: 'success',
      tag: 'Annual Flagship',
    },
    {
      id: 2,
      name: 'Hackathon 2026',
      date: 'October 10, 2026',
      venue: 'Innovation Lab',
      attendees: '180 Participants',
      status: 'Risk Review',
      statusVariant: 'warning',
      tag: '24-Hour Codefest',
    },
    {
      id: 3,
      name: 'Cultural Night',
      date: 'October 18, 2026',
      venue: 'Main Ground',
      attendees: '800 Expected',
      status: 'Planning',
      statusVariant: 'info',
      tag: 'Campus Celebration',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      actor: 'Rahul Sharma',
      action: 'completed',
      target: '"Design Event Poster"',
      time: '18m ago',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500 bg-emerald-50',
    },
    {
      id: 2,
      actor: 'Priya Patel',
      action: 'was assigned',
      target: '"Contact Sponsor"',
      time: '1h ago',
      icon: UserCheck,
      iconColor: 'text-blue-500 bg-blue-50',
    },
    {
      id: 3,
      actor: 'ClubOps Sentinel',
      action: 'flagged risk',
      target: 'New risk detected for TechFest 2026',
      time: '2h ago',
      icon: AlertTriangle,
      iconColor: 'text-rose-500 bg-rose-50',
    },
    {
      id: 4,
      actor: 'AI Assistant',
      action: 'processed',
      target: 'Meeting notes processed by AI',
      time: '4h ago',
      icon: Sparkles,
      iconColor: 'text-purple-500 bg-purple-50',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Page Header */}
      <PageHeader
        title="Good morning, Club Admin 👋"
        subtitle="Here's what's happening across your club events."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Event creation modal will be connected in step 2.')}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Event
            </Button>
            <Link to="/ai">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                AI Briefing
              </Button>
            </Link>
          </div>
        }
      />

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Active Events"
          value="3"
          icon={<Calendar className="w-5 h-5 text-brand-600" />}
          trend="+1 scheduled next month"
          trendType="positive"
          color="indigo"
        />
        <StatCard
          title="Pending Tasks"
          value="18"
          icon={<CheckSquare className="w-5 h-5 text-amber-600" />}
          trend="4 due before Friday"
          trendType="warning"
          color="amber"
        />
        <StatCard
          title="Volunteers"
          value="42"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          trend="+6 joined this week"
          trendType="positive"
          color="emerald"
        />
        <StatCard
          title="High Risk Issues"
          value="4"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          trend="Requires urgent review"
          trendType="danger"
          color="rose"
        />
      </div>

      {/* Main Content Split: Upcoming Events (left) & Today's Priorities + Activity (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Events (2 cols on large) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">3 active productions across campus venues</p>
              </div>
              <Link
                to="/events"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100">
              {sampleEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-base font-bold text-slate-900 tracking-tight">{evt.name}</h4>
                      <Badge variant={evt.statusVariant} size="sm" dot>
                        {evt.status}
                      </Badge>
                      <span className="hidden md:inline-block text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {evt.tag}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.attendees}</span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/events`}>
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                    >
                      Manage
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Today's Priorities */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Priorities</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">High-impact tasks demanding core committee focus</p>
              </div>
              <Link
                to="/tasks"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
              >
                <span>All Tasks</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100">
              {priorities.map((task) => (
                <div
                  key={task.id}
                  onClick={() => togglePriority(task.id)}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => {}} // Handled by container click
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium transition-all ${
                          task.done ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Assigned to {task.event}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {task.priority === 'urgent' && (
                      <Badge variant="danger" size="sm">Urgent</Badge>
                    )}
                    {task.priority === 'high' && (
                      <Badge variant="warning" size="sm">High</Badge>
                    )}
                    {task.priority === 'normal' && (
                      <Badge variant="neutral" size="sm">Normal</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Live audit trail across team workflows</p>
              </div>
              <Badge variant="neutral" size="sm">Live</Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {recentActivity.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.id} className="relative group">
                      {/* Timeline dot icon */}
                      <div
                        className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white ${act.iconColor}`}
                      >
                        <Icon className="w-2.5 h-2.5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-slate-700 leading-snug">
                          <span className="font-semibold text-slate-900">{act.actor}</span>{' '}
                          <span className="text-slate-500">{act.action}</span>{' '}
                          <span className="font-medium text-slate-900">{act.target}</span>
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {act.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick AI Ops Summary Card */}
          <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-0 shadow-lg">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-brand-200 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> ClubOps AI Engine
                </span>
                <span className="text-[11px] text-slate-300">v0.1 Ready</span>
              </div>
              <h4 className="text-sm font-bold tracking-tight text-white">
                Next AI Milestone: Automated Vendor Risk Extraction
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect your WhatsApp groups or meeting recordings in Step 2 to enable auto-action items.
              </p>
              <Link to="/ai">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center bg-white/10 hover:bg-white/20 text-white border-white/20 mt-2"
                >
                  Explore AI Hub
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
