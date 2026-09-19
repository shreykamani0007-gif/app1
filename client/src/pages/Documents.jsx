import React from 'react';
import { FileText, Plus, Upload, Download, Eye, FileCheck } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';

export function Documents() {
  const toast = useToast();

  const documents = [
    { id: 1, name: 'TechFest_2026_Budget_Proposal.pdf', size: '2.4 MB', updated: '2 days ago', type: 'Finance', status: 'Approved' },
    { id: 2, name: 'Auditorium_Booking_Permission_Form.pdf', size: '1.1 MB', updated: 'Yesterday', type: 'Logistics', status: 'Pending Dean Sign' },
    { id: 3, name: 'Sponsorship_Brochure_v2.pdf', size: '5.8 MB', updated: '4 hours ago', type: 'Outreach', status: 'Draft' },
    { id: 4, name: 'Volunteer_Code_of_Conduct.docx', size: '420 KB', updated: 'Last week', type: 'HR', status: 'Approved' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        subtitle="Central repository for club permissions, budgets, contracts, and creative assets."
        breadcrumb={
          <>
            <span>Assets</span>
            <span>/</span>
            <span className="text-slate-700">Documents</span>
          </>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.info('Document upload will be supported in Step 2.')}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload File
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Repository Files ({documents.length})</CardTitle>
          <Badge variant="neutral" size="sm">Cloud Synced</Badge>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{doc.name}</h4>
                  <p className="text-xs text-slate-500">
                    {doc.type} • {doc.size} • Updated {doc.updated}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={doc.status === 'Approved' ? 'success' : 'warning'} size="sm">
                  {doc.status}
                </Badge>
                <div className="flex items-center gap-1 text-slate-400">
                  <button onClick={() => toast.info(`Viewing ${doc.name}`)} className="p-1.5 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => toast.success(`Downloading ${doc.name}`)} className="p-1.5 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
