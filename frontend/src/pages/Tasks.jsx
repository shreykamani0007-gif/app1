import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  CheckSquare,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import EmptyState from '../components/ui/EmptyState';
import CreateTaskModal from '../components/modals/CreateTaskModal';

export default function Tasks({ tasks, setTasks, onCreateTask, events = [], currentEvent }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const owners = ['All', ...new Set(tasks.map((t) => t.owner))];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.owner.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || task.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'All' || task.priority.toLowerCase() === priorityFilter.toLowerCase();
    const matchesOwner = ownerFilter === 'All' || task.owner === ownerFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesOwner;
  });

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleToggleStatus = (task) => {
    const nextStatus = task.status === 'Completed' ? 'Todo' : 'Completed';
    setTasks(
      tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Tasks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and manage event responsibilities and operational workflows.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={Plus}
          size="md"
        >
          Create Task
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search tasks by title, owner, or details..."
            className="w-full sm:w-80"
          />

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-brand-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-brand-500 focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            {/* Owner Filter */}
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-brand-500 focus:outline-none"
            >
              {owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner === 'All' ? 'All Owners' : owner}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Task Table Card */}
      <Card className="overflow-hidden">
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description="Try changing your search term or filter criteria."
            actionLabel="Create Task"
            actionIcon={Plus}
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 sm:px-6">Task</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/75 transition-colors group"
                  >
                    {/* Task Title and Description */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-start space-x-2.5">
                        <button
                          onClick={() => handleToggleStatus(task)}
                          className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors"
                          title={task.status === 'Completed' ? 'Mark Incomplete' : 'Mark Complete'}
                        >
                          {task.status === 'Completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <div className="w-4 h-4 rounded border border-slate-300 hover:border-brand-500" />
                          )}
                        </button>
                        <div>
                          <p
                            className={`font-semibold text-slate-900 ${
                              task.status === 'Completed' ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {task.description}
                            </p>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium">
                            {task.event}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-[10px]">
                          {task.owner[0]}
                        </div>
                        <span className="font-medium text-slate-800">{task.owner}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <Badge variant={task.priority} size="sm">
                        {task.priority}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge variant={task.status} size="sm">
                        {task.status}
                      </Badge>
                    </td>

                    {/* Deadline */}
                    <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.deadline}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            const newTitle = prompt('Edit Task Title:', task.title);
                            if (newTitle) {
                              setTasks(tasks.map(t => t.id === task.id ? { ...t, title: newTitle } : t));
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={onCreateTask}
        events={events}
        defaultEvent={currentEvent}
      />
    </div>
  );
}
