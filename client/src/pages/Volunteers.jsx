import React from 'react';
import { Users, Plus, Mail, Phone, CheckCircle2, UserCheck } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';

export function Volunteers() {
  const toast = useToast();

  const volunteers = [
    { id: 1, name: 'Rahul Sharma', role: 'Design Lead', event: 'TechFest 2026', email: 'rahul@clubops.ai', status: 'Active' },
    { id: 2, name: 'Priya Patel', role: 'Sponsorship Coordinator', event: 'Hackathon 2026', email: 'priya@clubops.ai', status: 'Active' },
    { id: 3, name: 'Samir Verma', role: 'Logistics Volunteer', event: 'Cultural Night', email: 'samir@clubops.ai', status: 'Assigned' },
    { id: 4, name: 'Ananya Gupta', role: 'Stage Manager', event: 'TechFest 2026', email: 'ananya@clubops.ai', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteers"
        subtitle="Manage club members, roles, attendance, and task assignments."
        breadcrumb={
          <>
            <span>Team</span>
            <span>/</span>
            <span className="text-slate-700">Volunteers</span>
          </>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.info('Volunteer recruitment form will be linked in Step 2.')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Volunteer
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Roster (42 Total)</CardTitle>
          <Badge variant="success" size="sm">42 Active</Badge>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {volunteers.map((vol) => (
            <div key={vol.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {vol.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{vol.name}</h4>
                  <p className="text-xs text-slate-500">{vol.role} • {vol.event}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {vol.email}</span>
                <Badge variant="info" size="sm">{vol.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
