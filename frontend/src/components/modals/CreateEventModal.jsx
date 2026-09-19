import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function CreateEventModal({ isOpen, onClose, onCreateEvent }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    participants: '',
    volunteers: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    onCreateEvent({
      id: formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4),
      name: formData.name,
      description: formData.description || 'Club organized event.',
      date: formData.date || 'TBD',
      location: formData.location || 'Campus Center',
      participants: parseInt(formData.participants) || 50,
      volunteers: parseInt(formData.volunteers) || 5,
      status: 'Planning',
      progress: 0,
      category: 'General',
    });

    setFormData({
      name: '',
      description: '',
      date: '',
      location: '',
      participants: '',
      volunteers: '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Event">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Event Name"
          id="eventName"
          required
          placeholder="e.g. TechNova Hackathon 2026"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div>
          <label htmlFor="eventDesc" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            id="eventDesc"
            rows="3"
            placeholder="Briefly describe the objective, format, and target audience..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Date"
            id="eventDate"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Input
            label="Location"
            id="eventLocation"
            placeholder="e.g. Main Auditorium"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Expected Participants"
            id="participants"
            type="number"
            placeholder="e.g. 250"
            value={formData.participants}
            onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
          />
          <Input
            label="Number of Volunteers"
            id="volunteers"
            type="number"
            placeholder="e.g. 20"
            value={formData.volunteers}
            onChange={(e) => setFormData({ ...formData, volunteers: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create Event
          </Button>
        </div>
      </form>
    </Modal>
  );
}
