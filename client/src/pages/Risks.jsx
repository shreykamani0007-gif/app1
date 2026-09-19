import React from 'react';
import { AlertTriangle, Plus, ShieldAlert, CheckCircle, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';

export function Risks() {
  const toast = useToast();

  const risks = [
    {
      id: 1,
      title: 'Auditorium Booking Permission Delay',
      event: 'TechFest 2026',
      severity: 'Critical',
      variant: 'danger',
      description: 'Dean approval pending for weekend date. May require alternate venue if not signed by Friday.',
      mitigation: 'Faculty advisor has scheduled a direct meeting with Dean today at 04:00 PM.',
    },
    {
      id: 2,
      title: 'WiFi Capacity Limit in Innovation Lab',
      event: 'Hackathon 2026',
      severity: 'High',
      variant: 'danger',
      description: 'Lab router capped at 100 simultaneous DHCP leases; 180 hackathon participants expected.',
      mitigation: 'Requested IT center to configure temporary subnet with high-capacity access points.',
    },
    {
      id: 3,
      title: 'Sound Vendor Advance Payment Due',
      event: 'TechFest 2026',
      severity: 'Medium',
      variant: 'warning',
      description: 'Vendor requires 50% deposit before equipment staging begins.',
      mitigation: 'Student Council treasurer processing reimbursement check.',
    },
    {
      id: 4,
      title: 'Rain Contingency for Open Ground Stage',
      event: 'Cultural Night',
      severity: 'High',
      variant: 'danger',
      description: 'Weather forecast predicts 40% precipitation probability on event evening.',
      mitigation: 'Secured backup booking of Indoor Sports Complex.',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risks & Mitigations"
        subtitle="Proactively track operational bottlenecks and contingency strategies."
        breadcrumb={
          <>
            <span>Security</span>
            <span>/</span>
            <span className="text-slate-700">Risks</span>
          </>
        }
        actions={
          <Button
            variant="danger"
            size="sm"
            onClick={() => toast.info('Risk logging will be enabled in Step 2.')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Log Risk
          </Button>
        }
      />

      <div className="space-y-4">
        {risks.map((risk) => (
          <Card key={risk.id} className="border-l-4 border-l-rose-500">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Badge variant={risk.variant} size="sm" dot>
                      {risk.severity} Severity
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {risk.event}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{risk.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{risk.description}</p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Mitigation Strategy
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5">{risk.mitigation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
