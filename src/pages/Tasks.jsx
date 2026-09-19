import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  User,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Briefcase
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import EventSwitcher from '../components/ui/EventSwitcher';
import { useEventContext } from '../context/EventContext';
import { getTasksByEvent, createTask, updateTask, deleteTask } from '../services/api';

// Fallback seed tasks per event if backend is disconnected
const fallbackSeedTasks = {
  evt_innovatex_2026: [
    {
      _id: 'task_inno_1',
      eventId: 'evt_innovatex_2026',
      title: 'Confirm guest speaker travel reimbursement',
      description: 'Process flights and hotel invoices for 3 keynote speakers.',
      owner: 'David K.',
      department: 'Finance',
      priority: 'Urgent',
      status: 'In Progress',
      deadline: 'Tomorrow, 5:00 PM',
      dependencies: 'Dean Signature',
    },
    {
      _id: 'task_inno_2',
      eventId: 'evt_innovatex_2026',
      title: 'Prepare Wi-Fi credentials signage for Block C',
      description: 'Print QR code stands for participant wireless credentials.',
      owner: 'Tech Team',
      department: 'Tech Ops',
      priority: 'High',
      status: 'In Progress',
      deadline: 'Sep 22, 2:00 PM',
      dependencies: 'Network credentials from IT',
    },
    {
      _id: 'task_inno_3',
      eventId: 'evt_innovatex_2026',
      title: 'Finalize lunch coupons with university dining hall',
      description: 'Agree on meal packet count and dietary requirements.',
      owner: 'Alex C.',
      department: 'Logistics',
      priority: 'Medium',
      status: 'To Do',
      deadline: 'Sep 27, 4:00 PM',
      dependencies: 'Attendee registration list',
    },
    {
      _id: 'task_inno_4',
      eventId: 'evt_innovatex_2026',
      title: 'Collect participant waiver forms digitally',
      description: 'Send electronic consent forms to all 250 confirmed teams.',
      owner: 'Priya R.',
      department: 'Registration',
      priority: 'Medium',
      status: 'Completed',
      deadline: 'Completed',
      dependencies: 'None',
    },
  ],
  evt_techfest_2026: [
    {
      _id: 'task_tech_1',
      eventId: 'evt_techfest_2026',
      title: 'Arrange venue and auditorium soundcheck',
      description: 'Book main hall and test wireless lapels & mixer console.',
      owner: 'Marcus L.',
      department: 'Logistics',
      priority: 'High',
      status: 'In Progress',
      deadline: 'Oct 5, 10:00 AM',
      dependencies: 'Facility Manager Permission',
    },
    {
      _id: 'task_tech_2',
      eventId: 'evt_techfest_2026',
      title: 'Contact sponsors for title sponsorship deck',
      description: 'Reach out to top tier sponsors with brochure and contract.',
      owner: 'Sophia W.',
      department: 'Sponsorship',
      priority: 'Urgent',
      status: 'To Do',
      deadline: 'Oct 8, 6:00 PM',
      dependencies: 'Club budget sheet',
    },
    {
      _id: 'task_tech_3',
      eventId: 'evt_techfest_2026',
      title: 'Prepare posters and social media banners',
      description: 'Design digital teaser assets and print A3 posters.',
      owner: 'Design Club',
      department: 'Marketing',
      priority: 'Medium',
      status: 'Completed',
      deadline: 'Oct 1, 12:00 PM',
      dependencies: 'Event logo finalization',
    },
  ],
};

export default function Tasks() {
  const { selectedEvent, selectedEventId } = useEventContext();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // New Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    department: 'Logistics',
    owner: '',
    priority: 'Medium',
    status: 'To Do',
    deadline: '',
    dependencies: '',
  });

  // Fetch tasks strictly for the selected event
  const loadTasks = async () => {
    if (!selectedEventId) return;
    setLoading(true);

    try {
      const res = await getTasksByEvent(selectedEventId);
      if (res && res.success && Array.isArray(res.data)) {
        setTasks(res.data);
      } else {
        // Fallback store
        const fallback = fallbackSeedTasks[selectedEventId] || [];
        setTasks(fallback);
      }
    } catch (err) {
      console.warn(`Could not load tasks for event ${selectedEventId} from API, using fallback:`, err.message);
      const fallback = fallbackSeedTasks[selectedEventId] || [];
      setTasks(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Reload tasks whenever the selected event changes
  useEffect(() => {
    loadTasks();
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
  }, [selectedEventId]);

  // Create Task Handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !selectedEventId) return;

    try {
      setIsSubmitting(true);
      const payload = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        department: taskForm.department || 'General',
        owner: taskForm.owner.trim() || 'Unassigned',
        priority: taskForm.priority,
        status: taskForm.status,
        deadline: taskForm.deadline.trim() || 'No deadline',
        dependencies: taskForm.dependencies.trim(),
      };

      try {
        const res = await createTask(selectedEventId, payload);
        if (res && res.success && res.data) {
          setTasks((prev) => [res.data, ...prev]);
        } else {
          // Local fallback creation
          const localNewTask = {
            ...payload,
            _id: `task_${Date.now()}`,
            eventId: selectedEventId,
          };
          setTasks((prev) => [localNewTask, ...prev]);
        }
      } catch {
        const localNewTask = {
          ...payload,
          _id: `task_${Date.now()}`,
          eventId: selectedEventId,
        };
        setTasks((prev) => [localNewTask, ...prev]);
      }

      // Reset form and close modal
      setTaskForm({
        title: '',
        description: '',
        department: 'Logistics',
        owner: '',
        priority: 'Medium',
        status: 'To Do',
        deadline: '',
        dependencies: '',
      });
      setIsModalOpen(false);
    } catch (err) {
      alert(`Failed to create task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status toggle handler
  const handleToggleStatus = async (task) => {
    const nextStatusMap = {
      'To Do': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'To Do',
      'Overdue': 'In Progress',
    };
    const newStatus = nextStatusMap[task.status] || 'In Progress';

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTask(task._id, { status: newStatus });
    } catch {
      // Ignored for local fallback
    }
  };

  // Delete task handler
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    setTasks((prev) => prev.filter((t) => t._id !== taskId));

    try {
      await deleteTask(taskId);
    } catch {
      // Ignored for local fallback
    }
  };

  // Filter tasks belonging strictly to the selected event
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Must match search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(q);
        const matchesOwner = task.owner?.toLowerCase().includes(q);
        const matchesDept = task.department?.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesOwner && !matchesDept && !matchesDesc) {
          return false;
        }
      }

      // Must match status filter
      if (statusFilter !== 'All') {
        const normStatus = task.status?.toLowerCase().replace(/[\s-]/g, '_');
        const normFilter = statusFilter.toLowerCase().replace(/[\s-]/g, '_');
        if (normFilter === 'pending' && normStatus !== 'to_do') return false;
        if (normFilter !== 'pending' && normStatus !== normFilter) return false;
      }

      // Must match priority filter
      if (priorityFilter !== 'All') {
        if (task.priority?.toLowerCase() !== priorityFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  // Statistics for the selected event only
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const todo = tasks.filter((t) => t.status === 'To Do').length;
    return { total, completed, inProgress, todo };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Page Header with Event Context and Reusable Event Switcher */}
      <PageHeader
        title="Event Tasks"
        description={`Organize, assign, and monitor milestones across teams for ${
          selectedEvent ? selectedEvent.name : 'your active event'
        }.`}
        badge={
          <StatusBadge
            status="confirmed"
            label={`${stats.total} Total ${stats.total === 1 ? 'Task' : 'Tasks'}`}
          />
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Reusable Event Switcher near Tasks page header */}
            <EventSwitcher />

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              New Task
            </Button>
          </div>
        }
      />

      {/* Selected Event Context Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Selected Event
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            <span className="text-xs font-bold text-brand-600">Active Workspace</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            {selectedEvent ? selectedEvent.name : 'InnovateX Fest 2026'}
          </h2>
          {selectedEvent?.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {selectedEvent.description}
            </p>
          )}
        </div>

        {/* Dynamic Task Stats for Selected Event */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <span className="block text-[10px] uppercase font-semibold text-slate-400">Total</span>
            <span className="text-sm font-bold text-slate-900">{stats.total}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-center">
            <span className="block text-[10px] uppercase font-semibold text-blue-600">In Progress</span>
            <span className="text-sm font-bold text-blue-700">{stats.inProgress}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
            <span className="block text-[10px] uppercase font-semibold text-emerald-600">Completed</span>
            <span className="text-sm font-bold text-emerald-700">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${selectedEvent ? selectedEvent.name : 'event'} tasks...`}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-700 placeholder-slate-400 shadow-2xs"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          {['All', 'To Do', 'In Progress', 'Completed'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-brand-600 text-white shadow-2xs font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}

          {/* Priority filter selector */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ml-1"
          >
            <option value="All">Priority: All</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Loading tasks for {selectedEvent?.name}...
            </div>
          ) : filteredTasks.length === 0 ? (
            /* 10. EMPTY STATE */
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All'
                  ? 'No matching tasks found'
                  : 'No tasks for this event yet.'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All'
                  ? 'Try adjusting your search query or status filter.'
                  : `Get started by creating the first operational milestone for ${
                      selectedEvent ? selectedEvent.name : 'this event'
                    }.`}
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsModalOpen(true)}
                className="mt-4 shadow-sm"
              >
                + Create First Task
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTasks.map((t) => {
                const isCompleted = t.status === 'Completed';
                return (
                  <div
                    key={t._id}
                    className={`p-4 sm:p-5 hover:bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      isCompleted ? 'bg-slate-50/40' : ''
                    }`}
                  >
                    {/* Left: Checkmark toggle, Title, Description, Department */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(t)}
                        title="Click to advance status"
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors border cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-white border-slate-300 text-slate-400 hover:border-brand-500 hover:text-brand-600'
                        }`}
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-sm font-semibold text-slate-900 ${
                              isCompleted ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {t.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            {t.department || 'General'}
                          </span>
                        </div>

                        {t.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {t.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-slate-600">
                            <User className="w-3 h-3 text-slate-400" />
                            Assignee: <strong>{t.owner || 'Unassigned'}</strong>
                          </span>
                          {t.deadline && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-600">
                                <Clock className="w-3 h-3 text-slate-400" />
                                Due: {t.deadline}
                              </span>
                            </>
                          )}
                          {t.dependencies && (
                            <>
                              <span>•</span>
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                                Dep: {t.dependencies}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Priority, Status, Delete */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {t.priority && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.priority === 'Urgent'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : t.priority === 'High'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.priority}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(t)}
                        className="cursor-pointer"
                      >
                        <StatusBadge status={t.status} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(t._id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. NEW TASK MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Event Task"
        description="Add an actionable duty assigned to the current event context."
        footer={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateTask}
              disabled={isSubmitting || !taskForm.title.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          {/* Automatic Event Association Banner */}
          <div className="p-3 bg-brand-50/70 border border-brand-200/80 rounded-xl text-xs">
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
              Event Context (Auto-Bound)
            </span>
            <p className="font-bold text-slate-900 mt-0.5">
              {selectedEvent ? selectedEvent.name : 'Current Active Event'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              This task will be saved strictly under this event and will not appear in other club events.
            </p>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="taskTitle">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="taskTitle"
              type="text"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g., Arrange Wi-Fi credentials signage"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="taskDesc">
              Description / Notes
            </label>
            <textarea
              id="taskDesc"
              rows={2}
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Provide context, required tools, or notes for the assignee..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
            />
          </div>

          {/* Grid: Department & Owner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="taskDept">
                Department / Team
              </label>
              <select
                id="taskDept"
                value={taskForm.department}
                onChange={(e) => setTaskForm({ ...taskForm, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              >
                <option value="Logistics">Logistics</option>
                <option value="Tech Ops">Tech Ops</option>
                <option value="Finance">Finance</option>
                <option value="Registration">Registration</option>
                <option value="Marketing">Marketing</option>
                <option value="Hospitality">Hospitality</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="taskOwner">
                Assignee / Owner
              </label>
              <input
                id="taskOwner"
                type="text"
                value={taskForm.owner}
                onChange={(e) => setTaskForm({ ...taskForm, owner: e.target.value })}
                placeholder="e.g., Alex C. or Team Lead"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              />
            </div>
          </div>

          {/* Grid: Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="taskPriority">
                Priority
              </label>
              <select
                id="taskPriority"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="taskStatus">
                Status
              </label>
              <select
                id="taskStatus"
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Grid: Deadline & Dependencies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="taskDeadline">
                Deadline
              </label>
              <input
                id="taskDeadline"
                type="text"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                placeholder="e.g., Tomorrow, 5:00 PM"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="taskDependencies">
                Dependencies (optional)
              </label>
              <input
                id="taskDependencies"
                type="text"
                value={taskForm.dependencies}
                onChange={(e) => setTaskForm({ ...taskForm, dependencies: e.target.value })}
                placeholder="e.g., Dean approval"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
