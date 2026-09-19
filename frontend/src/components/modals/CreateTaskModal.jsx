import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function CreateTaskModal({ isOpen, onClose, onCreateTask, events = [], defaultEvent }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    owner: 'Rohan',
    priority: 'Medium',
    status: 'Todo',
    deadline: '',
    event: defaultEvent?.name || 'TechNova Hackathon 2026',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;

    onCreateTask({
      id: Date.now(),
      title: formData.title,
      description: formData.description || 'Task created by event administrator.',
      owner: formData.owner,
      priority: formData.priority,
      status: formData.status,
      deadline: formData.deadline || 'Upcoming',
      event: formData.event,
    });

    setFormData({
      title: '',
      description: '',
      owner: 'Rohan',
      priority: 'Medium',
      status: 'Todo',
      deadline: '',
      event: defaultEvent?.name || 'TechNova Hackathon 2026',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          id="taskTitle"
          required
          placeholder="e.g. Confirm venue audio system"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <div>
          <label htmlFor="taskDesc" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            id="taskDesc"
            rows="3"
            placeholder="Details, subtasks, or contact person notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Owner"
            id="taskOwner"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            options={[
              { value: 'Rohan', label: 'Rohan (Sponsorship)' },
              { value: 'Priya', label: 'Priya (Operations)' },
              { value: 'Amit', label: 'Amit (Technical)' },
              { value: 'Neha', label: 'Neha (Design)' },
              { value: 'Kavita', label: 'Kavita (Logistics)' },
              { value: 'Prince', label: 'Prince (Admin)' },
            ]}
          />

          <Select
            label="Priority"
            id="taskPriority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' },
              { value: 'Critical', label: 'Critical' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Status"
            id="taskStatus"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'Todo', label: 'Todo' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Blocked', label: 'Blocked' },
            ]}
          />

          <Input
            label="Deadline"
            id="taskDeadline"
            placeholder="e.g. 28 Sept"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
