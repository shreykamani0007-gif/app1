import React, { useState } from 'react';
import { Sparkles, FileText, AlertTriangle, Users, Calendar, ArrowRight, Bot, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';

export function AiAssistant() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('insights');

  const operationalWorkflows = [
    {
      id: 1,
      title: 'Generate Official Permission Letter',
      desc: 'Auto-fill college dean permission template using TechFest schedule & auditorium specs.',
      tag: 'Documents',
      icon: FileText,
    },
    {
      id: 2,
      title: 'Volunteer Shift Optimization',
      desc: 'Distribute 42 volunteers across morning setup, registration, and evening crowd control.',
      tag: 'Volunteers',
      icon: Users,
    },
    {
      id: 3,
      title: 'Operational Risk Assessment',
      desc: 'Scan current vendor confirmations & highlight missing dependencies.',
      tag: 'Risks',
      icon: AlertTriangle,
    },
    {
      id: 4,
      title: 'Post-Meeting Action Extractor',
      desc: 'Convert bullet notes into assigned tasks with due dates and owners.',
      tag: 'Tasks',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant & Operations Intelligence"
        subtitle="Autonomous workflow automation for college club event operations."
        breadcrumb={
          <>
            <span>Intelligence</span>
            <span>/</span>
            <span className="text-slate-700">AI Assistant</span>
          </>
        }
        actions={
          <Badge variant="purple" size="md" dot>
            Engine: Gemini 2.0 Flash
          </Badge>
        }
      />

      {/* AI Intelligence Header Card */}
      <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border-0 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Event Operations Co-pilot
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              ClubOps Intelligence Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Trained on campus protocols, event logistics checklists, and volunteer coordination workflows.
            </p>
          </div>
          <div className="shrink-0">
            <Button
              variant="outline"
              size="md"
              onClick={() => toast.info('Full AI API connection will be activated in Step 2.')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold"
            >
              Run Full Diagnostic
            </Button>
          </div>
        </div>
      </Card>

      {/* Structured Operational Workflows */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Suggested Operational Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {operationalWorkflows.map((flow) => {
            const Icon = flow.icon;
            return (
              <Card key={flow.id} hover className="p-5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant="neutral" size="sm">{flow.tag}</Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 pt-1">{flow.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{flow.desc}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info(`Triggered: ${flow.title}`)}
                    className="text-brand-600 hover:text-brand-700"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Execute Workflow
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
