import React from 'react';
import { BookOpen, Plus, Search, Folder, ExternalLink, Bookmark } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';

export function Knowledge() {
  const toast = useToast();

  const articles = [
    { id: 1, title: 'Standard Event Approval Workflow at DDU', category: 'Administration', readTime: '5 min read', pinned: true },
    { id: 2, title: 'Sponsorship Pitching Playbook & Tier Matrix', category: 'Fundraising', readTime: '8 min read', pinned: true },
    { id: 3, title: 'Audio & Visual Setup Checklist for Auditorium', category: 'Logistics', readTime: '4 min read', pinned: false },
    { id: 4, title: 'Emergency Protocols & First-Aid Points Map', category: 'Safety', readTime: '3 min read', pinned: false },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        subtitle="Standard operating procedures, past post-mortems, and guides."
        breadcrumb={
          <>
            <span>Resources</span>
            <span>/</span>
            <span className="text-slate-700">Knowledge Base</span>
          </>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.info('Article authoring editor will be added in Step 2.')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Guide
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((art) => (
          <Card key={art.id} hover className="p-5">
            <div className="flex items-start justify-between">
              <Badge variant="info" size="sm">
                {art.category}
              </Badge>
              {art.pinned && (
                <span className="text-brand-600 text-xs font-semibold flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 fill-current" /> Pinned
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-3">{art.title}</h3>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
              <span>{art.readTime}</span>
              <button
                onClick={() => toast.info(`Reading "${art.title}"`)}
                className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
              >
                <span>Read SOP</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
