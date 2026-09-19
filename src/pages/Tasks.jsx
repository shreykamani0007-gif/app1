import React from 'react';
import { CheckSquare, Plus, Filter, Search } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';

export default function Tasks() {
  const placeholderTasks = [
    { id: 'TSK-101', title: 'Confirm guest speaker travel reimbursement', dept: 'Finance', status: 'urgent', due: 'Tomorrow' },
    { id: 'TSK-102', title: 'Prepare Wi-Fi credentials signage for Block C', dept: 'Tech Ops', status: 'in_progress', due: 'In 3 days' },
    { id: 'TSK-103', title: 'Finalize lunch coupons with university dining hall', dept: 'Logistics', status: 'todo', due: 'In 5 days' },
    { id: 'TSK-104', title: 'Collect participant waiver forms digitally', dept: 'Registration', status: 'completed', due: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Tasks"
        description="Organize, assign, and monitor milestones across all event teams and departments."
        badge={<StatusBadge status="todo" label="52 Total Tasks" />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={Filter}>
              Filter
            </Button>
            <Button variant="primary" size="sm" icon={Plus}>
              New Task
            </Button>
          </div>
        }
      />

      {/* Search & Filter Bar Placeholder */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            readOnly
            placeholder="Search tasks by title or assignee..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-700"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Filter by status:</span>
          <span className="px-2.5 py-1 text-xs rounded-lg bg-slate-200/60 text-slate-700 font-medium">All</span>
          <span className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-600">Pending</span>
          <span className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-600">Done</span>
        </div>
      </div>

      {/* Task List Placeholder Table / Card */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {placeholderTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-400">{t.id}</span>
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900">{t.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Department: {t.dept}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-500">Due: {t.due}</span>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
