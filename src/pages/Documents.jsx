import React from 'react';
import { FileText, Download, FilePlus, Folder } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';

export default function Documents() {
  const documents = [
    { name: 'InnovateX_2026_Event_Proposal.pdf', size: '2.4 MB', updated: 'Yesterday', category: 'Approvals' },
    { name: 'Auditorium_A_V_Stage_Floorplan.pdf', size: '5.1 MB', updated: '3 days ago', category: 'Logistics' },
    { name: 'Sponsorship_Tier_Brochure_v3.pdf', size: '1.8 MB', updated: 'Last week', category: 'Finance' },
    { name: 'Volunteer_Briefing_Guidelines.docx', size: '820 KB', updated: 'Sep 14, 2026', category: 'Operations' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Documents & Files"
        description="Centralized repository for club proposals, permissions, sponsor brochures, and guideline files."
        badge={<StatusBadge status="confirmed" label="4 Documents" />}
        actions={
          <Button variant="primary" size="sm" icon={FilePlus}>
            New Document
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900">{doc.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      {doc.category} • {doc.size} • Modified {doc.updated}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={Download}>
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
