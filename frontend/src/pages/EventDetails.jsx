import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Video,
  AlertCircle,
  Plus
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

export default function EventDetails({
  events,
  tasks,
  volunteers,
  meetings,
  documents,
  risks,
  announcements,
  deadlines
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [showAiModal, setShowAiModal] = useState(false);

  // Find event
  const event = events.find((e) => e.id === id) || events[0] || {
    name: 'TechNova Hackathon 2026',
    date: '15 October 2026',
    location: 'Main Auditorium',
    participants: 300,
    volunteers: 20,
    status: 'Planning',
    progress: 72,
    description: 'The premier 24-hour hackathon bringing together top developers, designers, and innovators to build impactful solutions.'
  };

  const tabs = [
    'Overview',
    'Tasks',
    'Volunteers',
    'Meetings',
    'Documents',
    'Risks',
    'Announcements',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate('/events')}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to all events
      </button>

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Badge variant={event.status} size="md">
                {event.status}
              </Badge>
              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                {event.category || 'Flagship Event'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {event.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>{event.participants} Participants</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ai"
              icon={Sparkles}
              size="md"
              onClick={() => setShowAiModal(true)}
            >
              AI Event Planner
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex overflow-x-auto border-b border-slate-100 space-x-1 sm:space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap px-1 sm:px-2 ${
                activeTab === tab
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Top Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Event Description & Progress */}
            <Card className="p-6 lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Event Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {event.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-700">Operational Readiness</span>
                  <span className="text-brand-600">{event.progress}% Complete</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-brand-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${event.progress}%` }}
                  />
                </div>
              </div>

              {/* Event Statistics */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-500">Volunteers Allocated</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">{event.volunteers}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-500">Tasks Completed</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">12 / 16</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-500">Days to Kickoff</span>
                  <p className="text-xl font-bold text-indigo-600 mt-1">26</p>
                </div>
              </div>
            </Card>

            {/* AI Insights for Event */}
            <Card className="p-6 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-700">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-sm font-bold">AI Operational Audit</h3>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                  <p className="font-semibold text-slate-800">Catering headcount</p>
                  <p className="text-slate-500 mt-0.5">300 participants require 350 boxed meals with buffer.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                  <p className="font-semibold text-slate-800">Auditorium mic clearance</p>
                  <p className="text-slate-500 mt-0.5">Check with facilities for 4 wireless handheld mics by 28 Sept.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Upcoming Deadlines for this Event */}
          <Card className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Upcoming Event Deadlines
            </h3>
            <div className="divide-y divide-slate-100">
              {deadlines.map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">{d.title}</span>
                    <p className="text-xs text-slate-500">{d.team}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={d.priority} size="sm">
                      {d.priority}
                    </Badge>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {d.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Other Tabs render appropriate sub-views */}
      {activeTab === 'Tasks' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Event Tasks</h3>
            <Link to="/tasks" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Open Full Task Board &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{t.title}</p>
                  <p className="text-slate-500 mt-0.5">Assigned to {t.owner} • Due {t.deadline}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={t.priority} size="sm">{t.priority}</Badge>
                  <Badge variant={t.status} size="sm">{t.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'Volunteers' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Assigned Volunteers</h3>
            <Link to="/volunteers" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Manage Volunteers &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {volunteers.map((v) => (
              <div key={v.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="font-bold text-slate-900 text-sm">{v.name}</p>
                <p className="text-xs text-slate-500">{v.role}</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-600">{v.assignedTasks} tasks</span>
                  <Badge variant={v.availability} size="sm">{v.availability}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'Meetings' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Event Meetings</h3>
            <Link to="/meetings" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View All Meetings &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {meetings.map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{m.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{m.date} • {m.time} • {m.participants} attendees</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate(`/meetings/${m.id}`)}>
                  View Notes
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'Documents' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Event Documents</h3>
            <Link to="/documents" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Document Vault &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3">
                <FileText className="w-8 h-8 text-indigo-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                  <p className="text-[11px] text-slate-500">{doc.size} • {doc.category}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'Risks' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Risk Matrix</h3>
            <Link to="/risks" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Risk Center &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {risks.map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{r.risk}</p>
                  <p className="text-slate-500 mt-0.5">Mitigation: {r.mitigation}</p>
                </div>
                <Badge variant={r.severity} size="sm">{r.severity}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'Announcements' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Announcements</h3>
            <Link to="/announcements" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Create Announcement &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                  <Badge variant={a.status} size="sm">{a.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">{a.content}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Event Planner Modal Demo */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">AI Event Planner</h3>
            </div>
            <p className="text-xs text-slate-600">
              Analyzing historical hackathon templates, volunteer capacity, and venue specs for <strong>{event.name}</strong>...
            </p>
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2 text-slate-700">
              <p className="font-semibold text-indigo-900">✨ Generated Recommendations:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Assign 4 check-in volunteers during peak rush (8:30 AM - 10:00 AM).</li>
                <li>Schedule power surge checks 2 hours before opening ceremony.</li>
                <li>Deploy sponsor mentor channels on Discord 48 hours prior.</li>
              </ul>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setShowAiModal(false)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
