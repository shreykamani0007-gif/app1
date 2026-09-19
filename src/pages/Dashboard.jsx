import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
  Users,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Flame,
  Activity,
  ChevronRight
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';

export default function Dashboard() {
  // Mock data for Step 1 UI placeholders
  const metrics = [
    {
      title: 'Total Tasks',
      value: '52',
      subtext: '+8 added this week',
      icon: ListTodo,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Completed Tasks',
      value: '34',
      subtext: '65.4% completion rate',
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

  const upcomingDeadlines = [
    {
      title: 'Sponsorship Agreement Finalization',
      lead: 'Finance Lead (David K.)',
      due: 'Tomorrow, 5:00 PM',
      status: 'urgent',
    },
    {
      title: 'Auditorium AV & Lighting Walkthrough',
      lead: 'Logistics Lead (Sarah M.)',
      due: 'Sep 22, 2:00 PM',
      status: 'in_progress',
    },
    {
      title: 'Attendee Badge & Lanyard Printing',
      lead: 'Design Lead (Priya R.)',
      due: 'Sep 25, 11:59 PM',
      status: 'todo',
    },
    {
      title: 'Food Catering Headcount Sign-off',
      lead: 'Operations (Alex C.)',
      due: 'Sep 27, 4:00 PM',
      status: 'todo',
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
      actor: 'ClubOps AI',
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

  const aiInsights = [
    {
      type: 'Urgent Bottleneck',
      text: 'Auditorium booking invoice has been pending approval for 4 days. Contact Faculty Advisor to avoid cancellation.',
      tag: 'Critical Action',
    },
    {
      type: 'Volunteer Shift Optimization',
      text: 'Sunday morning session (8:00 AM - 11:00 AM) is understaffed by 6 volunteers for breakfast logistics.',
      tag: 'Staffing Alert',
    },
    {
      type: 'Budget Tracking',
      text: 'Merchandise quote came in 8% below estimated budget. Projected savings: $420.',
      tag: 'Cost Efficiency',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title="Event Operations Command"
        description="Real-time status, volunteer coordination, and AI-driven insights for college club operations."
        badge={<StatusBadge status="active" label="Live Preparation" />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={Calendar}>
              Oct 12 - 14, 2026
            </Button>
            <Button variant="primary" size="sm" icon={Sparkles}>
              AI Event Audit
            </Button>
          </div>
        }
      />

      {/* 1. Event Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/30 text-brand-300 border border-brand-500/40 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Annual Flagship Event
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                University Student Center & Main Audi
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              InnovateX Hackathon & Tech Fest 2026
            </h2>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl">
              36-hour national collegiate hackathon, keynote speaker tracks, and tech club project exhibitions.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-xl border border-white/15 shrink-0">
            <div>
              <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Countdown</div>
              <div className="text-2xl font-black text-white">18 Days</div>
              <div className="text-[11px] text-brand-200">Scheduled: Oct 12, 2026</div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Readiness</div>
              <div className="text-2xl font-black text-emerald-400">68%</div>
              <div className="text-[11px] text-emerald-200">On Target</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span>Overall Operations Progress</span>
            <span className="font-semibold text-white">34 of 52 milestones verified</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full" style={{ width: '68%' }} />
          </div>
        </div>
      </div>

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

      {/* 3. AI Insights Widget & Upcoming Deadlines (2-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Insights Card (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full border-brand-200/80 bg-gradient-to-b from-indigo-50/40 via-white to-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">AI Operations Copilot</CardTitle>
                  <CardDescription>Live automated risk & workflow recommendations</CardDescription>
                </div>
              </div>
              <StatusBadge status="confirmed" label="Active" />
            </CardHeader>
            <CardContent className="space-y-3.5">
              {aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-brand-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                      {insight.type}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                      {insight.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

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
      </div>

      {/* 4. Open Risks & Recent Activity (2-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Open Risks (7 cols) */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Open Risks & Contingencies</CardTitle>
                <CardDescription>Active issues requiring proactive mitigation before event day</CardDescription>
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
                    <p className="text-xs text-slate-600">{risk.impact}</p>
                    <div className="mt-2 text-[11px] text-slate-400">
                      Assigned owner: <span className="font-semibold text-slate-600">{risk.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity (5 cols) */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Recent Activity</CardTitle>
                <CardDescription>Live log from team members and automation</CardDescription>
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
      </div>
    </div>
  );
}
