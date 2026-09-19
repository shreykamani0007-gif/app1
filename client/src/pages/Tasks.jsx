import React from 'react';
import { CheckSquare, Plus, Filter, Clock, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';

export function Tasks() {
  const toast = useToast();

  const taskList = [
    { id: 1, title: 'Confirm auditorium booking', event: 'TechFest 2026', due: 'Tomorrow', priority: 'urgent', assignee: 'Alex' },
    { id: 2, title: 'Finalize event poster', event: 'TechFest 2026', due: 'In 2 days', priority: 'normal', assignee: 'Rahul' },
    { id: 3, title: 'Contact sponsors', event: 'Hackathon 2026', due: 'Sep 22', priority: 'high', assignee: 'Priya' },
    { id: 4, title: 'Assign registration volunteers', event: 'Cultural Night', due: 'Sep 24', priority: 'normal', assignee: 'Samir' },
    { id: 5, title: 'Coordinate sound system vendor', event: 'TechFest 2026', due: 'Sep 23', priority: 'urgent', assignee: 'Neha' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="Track action items, assignments, and committee deliverables."
        breadcrumb={
          <>
            <span>Execution</span>
            <span>/</span>
            <span className="text-slate-700">Tasks</span>
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Filter options will be connected in Step 2.')}
              leftIcon={<Filter className="w-3.5 h-3.5" />}
            >
              Filter
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast.info('Task creation will be enabled in Step 2.')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Task
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>All Committee Tasks (18)</CardTitle>
          <Badge variant="neutral" size="sm">5 shown</Badge>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {taskList.map((task) => (
            <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{task.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {task.event} • Assigned to <span className="font-medium text-slate-700">{task.assignee}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {task.due}
                </span>
                <Badge
                  variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'neutral'}
                  size="sm"
                >
                  {task.priority}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
