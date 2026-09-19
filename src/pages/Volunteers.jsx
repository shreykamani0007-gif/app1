import React from 'react';
import { Users, UserPlus, Mail, Phone } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';

export default function Volunteers() {
  const volunteersList = [
    { name: 'Maya Patel', role: 'Lead Usher', team: 'Hospitality', shift: 'Morning (08:00 - 13:00)', status: 'confirmed' },
    { name: 'Kavita Rao', role: 'Stage Manager', team: 'A/V & Tech', shift: 'Full Day (09:00 - 18:00)', status: 'confirmed' },
    { name: 'Rohan Sharma', role: 'Registration Desk', team: 'Logistics', shift: 'Opening Shift (07:30 - 12:00)', status: 'active' },
    { name: 'Liam Murphy', role: 'Speaker Escort', team: 'Guest Relations', shift: 'Afternoon (12:00 - 17:00)', status: 'todo' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteers & Staffing"
        description="Manage volunteer rosters, team assignments, check-ins, and schedule shifts."
        badge={<StatusBadge status="confirmed" label="78 Enrolled" />}
        actions={
          <Button variant="primary" size="sm" icon={UserPlus}>
            Add Volunteer
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {volunteersList.map((v, idx) => (
              <div
                key={idx}
                className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {v.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{v.name}</h3>
                    <p className="text-xs text-slate-500">
                      {v.role} • <span className="text-brand-600 font-medium">{v.team}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Shift: {v.shift}</span>
                  <StatusBadge status={v.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
