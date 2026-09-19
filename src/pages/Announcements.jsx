import React from 'react';
import { Megaphone, Send, Clock, Users } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';

export default function Announcements() {
  const announcements = [
    {
      title: 'Mandatory Volunteer Walkthrough on Friday at 4 PM',
      audience: 'All Volunteers (78)',
      author: 'Alex Chen',
      time: 'Yesterday at 3:30 PM',
      body: 'Please assemble at the Main Auditorium stage for headset distribution, emergency exit protocols, and zone assignments.',
    },
    {
      title: 'Sponsor Booth Floor Plan Updated',
      audience: 'Core Team & Tech Leads',
      author: 'Priya Rao',
      time: '2 days ago',
      body: 'Google Cloud and Red Bull booths have swapped locations due to high-voltage power outlet requirements.',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Club Announcements"
        description="Broadcast updates to volunteers, committee heads, faculty advisors, or participants."
        badge={<StatusBadge status="confirmed" label="Broadcast Hub" />}
        actions={
          <Button variant="primary" size="sm" icon={Send}>
            New Broadcast
          </Button>
        }
      />

      <div className="space-y-4">
        {announcements.map((a, idx) => (
          <Card key={idx} className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{a.title}</h3>
              </div>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {a.time}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 my-2 leading-relaxed">{a.body}</p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-600" />
                Audience: <strong className="text-slate-700">{a.audience}</strong>
              </span>
              <span>Posted by: <strong className="text-slate-700">{a.author}</strong></span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
