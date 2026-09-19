import React from 'react';
import { AlertTriangle, ShieldAlert, Plus, CheckCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';

export default function Risks() {
  const risksList = [
    {
      title: 'Main Hall Projector Bulb Life Expiry',
      severity: 'high',
      status: 'open',
      owner: 'Sarah Miller (Logistics)',
      mitigation: 'Procure backup projector lamp from university inventory or rental partner before Thursday soundcheck.',
    },
    {
      title: 'Wi-Fi Bandwidth Limit in Block C',
      severity: 'medium',
      status: 'open',
      owner: 'Campus IT Liaison',
      mitigation: 'Requested extra enterprise AP routers; IT Department testing scheduled for Friday.',
    },
    {
      title: 'Food Catering Headcount Variance (+/- 15%)',
      severity: 'low',
      status: 'resolved',
      owner: 'David Kim (Finance)',
      mitigation: 'Contractual 10% buffer clause established with dining vendor.',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk & Contingency Registry"
        description="Identify event vulnerabilities early, assign risk owners, and verify contingency fail-safes."
        badge={<StatusBadge status="urgent" label="3 Tracked" />}
        actions={
          <Button variant="danger" size="sm" icon={Plus}>
            Log New Risk
          </Button>
        }
      />

      <div className="space-y-4">
        {risksList.map((r, idx) => (
          <Card key={idx} className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 ${
                    r.severity === 'high' ? 'text-rose-600' : r.severity === 'medium' ? 'text-amber-500' : 'text-emerald-600'
                  }`}
                />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{r.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={r.severity} />
                <StatusBadge status={r.status} />
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-2">
              <span className="font-semibold text-slate-800">Contingency Plan:</span> {r.mitigation}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Risk Owner: <strong className="text-slate-700">{r.owner}</strong></span>
              <span className="cursor-pointer text-brand-600 hover:text-brand-700 font-medium">Edit Contingency</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
