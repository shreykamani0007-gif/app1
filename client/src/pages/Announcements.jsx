import React from 'react';
import { Megaphone, Plus, Send, Clock, Users } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';

export function Announcements() {
  const toast = useToast();

  const announcements = [
    {
      id: 1,
      title: 'Auditorium Setup Volunteer Briefing Tomorrow',
      audience: 'All Volunteers',
      time: 'Today at 10:30 AM',
      author: 'Club Admin',
      content: 'Please gather in front of the main foyer at 09:00 AM sharp. Badges and breakfast tokens will be distributed.',
      channels: ['WhatsApp Bot', 'Email'],
    },
    {
      id: 2,
      title: 'Hackathon Registration Closing in 24 Hours',
      audience: 'Public / College Portal',
      time: 'Yesterday',
      author: 'Priya Patel',
      content: 'Final call for hackathon teams. Over 140 participants already confirmed. Cap is 180.',
      channels: ['Instagram', 'Discord'],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="Broadcast updates to club members, volunteers, or event participants."
        breadcrumb={
          <>
            <span>Communications</span>
            <span>/</span>
            <span className="text-slate-700">Announcements</span>
          </>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.info('Broadcast sender will be hooked up in Step 2.')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Announcement
          </Button>
        }
      />

      <div className="space-y-4">
        {announcements.map((ann) => (
          <Card key={ann.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="purple" size="sm">
                    {ann.audience}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {ann.time} by {ann.author}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {ann.channels.map((ch, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{ann.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
