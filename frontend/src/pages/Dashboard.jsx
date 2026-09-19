import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  Clock,
  Users,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CreateEventModal from '../components/modals/CreateEventModal';

export default function Dashboard({
  events,
  tasks,
  volunteers,
  deadlines,
  taskProgress,
  recentActivities,
  aiInsights,
  onCreateEvent,
}) {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Derive stats dynamically from state or props
  const stats = [
    {
      label: 'Total Events',
      value: events?.length || 4,
      icon: Calendar,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      link: '/events',
    },
    {
      label: 'Active Tasks',
      value: tasks?.filter(t => t.status === 'In Progress').length || 24,
      icon: CheckSquare,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      link: '/tasks',
    },
    {
      label: 'Pending Tasks',
      value: tasks?.filter(t => t.status === 'Todo').length || 8,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      link: '/tasks',
    },
    {
      label: 'Volunteers',
      value: volunteers?.length || 32,
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      link: '/volunteers',
    },
    {
      label: 'Upcoming Deadlines',
      value: deadlines?.length || 7,
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      link: '/tasks',
    },
    {
      label: 'Open Risks',
      value: 3,
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      link: '/risks',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Greeting and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Good morning, Prince 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's what's happening with your club events.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={Plus}
          size="md"
          className="shadow-sm"
        >
          Create Event
        </Button>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              hover
              onClick={() => navigate(stat.link)}
              className="p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg border ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                  {stat.label}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* AI Event Insights - High Priority Section */}
      <Card className="p-5 sm:p-6 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                AI Event Insights
              </h3>
              <p className="text-xs text-slate-500">
                Real-time operational alerts synthesized from tasks, deadlines, and team logs
              </p>
            </div>
          </div>
          <Link
            to="/ai-assistant"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 hidden sm:inline-flex"
          >
            Ask AI Copilot <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiInsights.map((insight) => (
            <div
              key={insight.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                {insight.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : insight.type === 'urgent' ? (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className="text-xs font-medium text-slate-800 leading-snug">
                  {insight.text}
                </span>
              </div>
              <Link
                to={insight.link}
                className="shrink-0 text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 pl-2 border-l border-slate-100"
              >
                <span>{insight.cta}</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Deadlines & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Deadlines */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Upcoming Deadlines
                </h3>
                <p className="text-xs text-slate-500">Critical deliverables due soon</p>
              </div>
              <Link
                to="/tasks"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View all tasks <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {deadlines.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                        {item.title}
                      </p>
                      <Badge variant={item.priority} size="sm">
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.team} • <span className="text-slate-400">{item.event}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      {item.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Recent Activity
                </h3>
                <p className="text-xs text-slate-500">Real-time club updates and actions</p>
              </div>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start space-x-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0 text-[11px]">
                    {act.user[0]}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">{act.user}</span>{' '}
                      {act.action}{' '}
                      <span className="font-medium text-brand-700">{act.target}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Task Progress Breakdown */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Task Progress
              </h3>
              <p className="text-xs text-slate-500">Overall operational completion</p>
            </div>

            {/* Segmented Multi-color Progress Bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner mb-5">
              <div
                style={{ width: `${taskProgress.completed}%` }}
                className="bg-emerald-500 h-full"
                title={`Completed: ${taskProgress.completed}%`}
              />
              <div
                style={{ width: `${taskProgress.inProgress}%` }}
                className="bg-blue-500 h-full"
                title={`In Progress: ${taskProgress.inProgress}%`}
              />
              <div
                style={{ width: `${taskProgress.pending}%` }}
                className="bg-amber-400 h-full"
                title={`Pending: ${taskProgress.pending}%`}
              />
              <div
                style={{ width: `${taskProgress.blocked}%` }}
                className="bg-rose-500 h-full"
                title={`Blocked: ${taskProgress.blocked}%`}
              />
            </div>

            {/* Progress Breakdown list */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-700">Completed</span>
                </div>
                <span className="font-bold text-slate-900">{taskProgress.completed}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-medium text-slate-700">In Progress</span>
                </div>
                <span className="font-bold text-slate-900">{taskProgress.inProgress}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="font-medium text-slate-700">Pending</span>
                </div>
                <span className="font-bold text-slate-900">{taskProgress.pending}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-medium text-slate-700">Blocked</span>
                </div>
                <span className="font-bold text-slate-900">{taskProgress.blocked}%</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate('/tasks')}
              >
                Manage All Tasks
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateEvent={onCreateEvent}
      />
    </div>
  );
}
