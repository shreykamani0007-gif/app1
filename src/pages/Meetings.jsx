import React from 'react';
import { Calendar, Plus, MapPin, Users, Clock } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';

export default function Meetings() {
  const meetings = [
    {
      title: 'Weekly Core Committee Sync',
      time: 'Tomorrow, 5:00 PM - 6:00 PM',
      location: 'Student Union Room 302',
      attendees: '12 members',
      status: 'active',
    },
    {
      title: 'Hackathon Logistics & Vendor Walkthrough',
      time: 'Thursday, 3:00 PM - 4:30 PM',
      location: 'Auditorium Main Stage',
      attendees: '8 members',
      status: 'todo',
    },
    {
      title: 'Faculty Advisor & Safety Review',
      time: 'Friday, 11:00 AM - 12:00 PM',
      location: 'Faculty Lounge / Zoom',
      attendees: '5 members',
      status: 'todo',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings & Committee Syncs"
        description="Schedule team standups, record agendas, and track meeting minutes."
        badge={<StatusBadge status="active" label="3 Scheduled" />}
        actions={
          <Button variant="primary" size="sm" icon={Plus}>
            Schedule Meeting
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {meetings.map((m, idx) => (
          <Card key={idx} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={m.status} />
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 1 hr
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{m.title}</h3>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  <span>{m.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{m.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{m.attendees}</span>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
              <Button variant="ghost" size="sm">
                View Agenda
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
