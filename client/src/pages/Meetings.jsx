import React from 'react';
import { CalendarClock, Plus, Video, Sparkles, Clock, Users } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';

export function Meetings() {
  const toast = useToast();

  const meetings = [
    {
      id: 1,
      title: 'Weekly Core Committee Sync',
      date: 'Today, 05:00 PM',
      duration: '45 mins',
      platform: 'Google Meet / Lab 3',
      attendees: 8,
      status: 'Upcoming',
      hasNotes: false,
    },
    {
      id: 2,
      title: 'TechFest Sponsorship Review',
      date: 'Yesterday, 03:30 PM',
      duration: '60 mins',
      platform: 'Auditorium Green Room',
      attendees: 5,
      status: 'Completed',
      hasNotes: true,
      summary: 'Processed by ClubOps AI: 4 action items extracted, 2 risks flagged.',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings"
        subtitle="Schedule synchronizations and let AI transcribe action items."
        breadcrumb={
          <>
            <span>Coordination</span>
            <span>/</span>
            <span className="text-slate-700">Meetings</span>
          </>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.info('Meeting scheduler will be integrated in Step 2.')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Schedule Meeting
          </Button>
        }
      />

      <div className="space-y-4">
        {meetings.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{m.title}</h3>
                    <Badge variant={m.status === 'Upcoming' ? 'info' : 'neutral'} size="sm">
                      {m.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {m.date} ({m.duration})</span>
                    <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5 text-slate-400" /> {m.platform}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> {m.attendees} Members</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {m.status === 'Upcoming' ? (
                    <Button variant="outline" size="sm">Join Call</Button>
                  ) : (
                    <Button variant="outline" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}>
                      View AI Minutes
                    </Button>
                  )}
                </div>
              </div>

              {m.summary && (
                <div className="mt-4 p-3 bg-brand-50/60 rounded-xl border border-brand-100/80 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-brand-900 font-medium">{m.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
