import React from 'react';
import { Calendar, Plus, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';

export function Events() {
  const toast = useToast();

  const events = [
    {
      id: 'evt-1',
      title: 'TechFest 2026',
      date: 'September 25, 2026',
      time: '09:00 AM - 06:00 PM',
      venue: 'DDU Auditorium',
      attendees: 450,
      volunteers: 24,
      status: 'In Planning',
      variant: 'info',
    },
    {
      id: 'evt-2',
      title: 'Hackathon 2026',
      date: 'October 10, 2026',
      time: '24 Hours Non-Stop',
      venue: 'Innovation Lab',
      attendees: 180,
      volunteers: 12,
      status: 'Risk Review',
      variant: 'warning',
    },
    {
      id: 'evt-3',
      title: 'Cultural Night',
      date: 'October 18, 2026',
      time: '06:30 PM - 10:30 PM',
      venue: 'Main Ground',
      attendees: 800,
      volunteers: 35,
      status: 'Confirmed',
      variant: 'success',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        subtitle="Manage and coordinate all upcoming college club events."
        breadcrumb={
          <>
            <span>Operations</span>
            <span>/</span>
            <span className="text-slate-700">Events</span>
          </>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.info('New Event creation wizard will be connected in Step 2.')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Event
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((evt) => (
          <Card key={evt.id} hover className="overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <Badge variant={evt.variant} size="sm" dot>
                  {evt.status}
                </Badge>
                <h3 className="text-base font-bold text-slate-900 mt-2">{evt.title}</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{evt.date} • {evt.time}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{evt.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{evt.attendees} Attendees • {evt.volunteers} Volunteers</span>
              </div>
            </CardContent>

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Event Operations</span>
              <button
                onClick={() => toast.info(`Opening details for ${evt.title}`)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
