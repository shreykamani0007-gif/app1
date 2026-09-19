import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  Award,
  Briefcase
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

export default function Volunteers({ volunteers, setVolunteers }) {
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState({
    name: '',
    role: 'Operations',
    skills: '',
    availability: 'Available',
    assignedTasks: 0,
    email: '',
    phone: '',
  });

  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesSearch =
      vol.name.toLowerCase().includes(search.toLowerCase()) ||
      vol.role.toLowerCase().includes(search.toLowerCase()) ||
      vol.skills.toLowerCase().includes(search.toLowerCase());

    const matchesAvailability =
      availabilityFilter === 'All' || vol.availability.toLowerCase() === availabilityFilter.toLowerCase();

    return matchesSearch && matchesAvailability;
  });

  const handleAddVolunteer = (e) => {
    e.preventDefault();
    if (!newVolunteer.name) return;

    setVolunteers([
      ...volunteers,
      {
        id: Date.now(),
        name: newVolunteer.name,
        role: newVolunteer.role,
        skills: newVolunteer.skills || 'General Coordination',
        availability: newVolunteer.availability,
        assignedTasks: 0,
        status: 'Active',
        email: newVolunteer.email || `${newVolunteer.name.toLowerCase().replace(/\s+/g, '.')}@club.edu`,
        phone: newVolunteer.phone || '+91 98765 00000',
      }
    ]);

    setNewVolunteer({
      name: '',
      role: 'Operations',
      skills: '',
      availability: 'Available',
      assignedTasks: 0,
      email: '',
      phone: '',
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Volunteers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your event volunteer team, roles, skill allocations, and availability.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          icon={Plus}
          size="md"
        >
          Add Volunteer
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, role, or specific skills..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center space-x-2">
          {['All', 'Available', 'Busy'].map((filter) => (
            <button
              key={filter}
              onClick={() => setAvailabilityFilter(filter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                availabilityFilter === filter
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Volunteer Cards Grid */}
      {filteredVolunteers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No volunteers found"
          description="We couldn't find any volunteers matching your search criteria."
          actionLabel="Add Volunteer"
          actionIcon={Plus}
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVolunteers.map((vol) => (
            <Card key={vol.id} className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {vol.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {vol.name}
                      </h3>
                      <p className="text-xs text-brand-600 font-medium mt-0.5">
                        {vol.role}
                      </p>
                    </div>
                  </div>
                  <Badge variant={vol.availability} size="sm">
                    {vol.availability}
                  </Badge>
                </div>

                {/* Skills */}
                <div className="mt-4">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    Skills & Expertise
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {vol.skills.split(',').map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact info */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span className="truncate">{vol.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span>{vol.phone}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  <strong className="text-slate-900">{vol.assignedTasks}</strong> active tasks
                </span>
                <Badge variant={vol.status} size="sm">
                  {vol.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Volunteer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Volunteer"
      >
        <form onSubmit={handleAddVolunteer} className="space-y-4">
          <Input
            label="Full Name"
            id="volName"
            required
            placeholder="e.g. Rohan Patel"
            value={newVolunteer.name}
            onChange={(e) => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Role"
              id="volRole"
              value={newVolunteer.role}
              onChange={(e) => setNewVolunteer({ ...newVolunteer, role: e.target.value })}
              options={[
                { value: 'Operations Lead', label: 'Operations Lead' },
                { value: 'Sponsorship Lead', label: 'Sponsorship Lead' },
                { value: 'Technical Lead', label: 'Technical Lead' },
                { value: 'Design & Media', label: 'Design & Media' },
                { value: 'Logistics', label: 'Logistics' },
                { value: 'Outreach & PR', label: 'Outreach & PR' },
                { value: 'General Volunteer', label: 'General Volunteer' },
              ]}
            />

            <Select
              label="Availability"
              id="volAvailability"
              value={newVolunteer.availability}
              onChange={(e) => setNewVolunteer({ ...newVolunteer, availability: e.target.value })}
              options={[
                { value: 'Available', label: 'Available' },
                { value: 'Busy', label: 'Busy' },
              ]}
            />
          </div>

          <Input
            label="Skills (comma separated)"
            id="volSkills"
            placeholder="e.g. Event Management, Public Speaking, React"
            value={newVolunteer.skills}
            onChange={(e) => setNewVolunteer({ ...newVolunteer, skills: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email"
              id="volEmail"
              type="email"
              placeholder="e.g. rohan@club.edu"
              value={newVolunteer.email}
              onChange={(e) => setNewVolunteer({ ...newVolunteer, email: e.target.value })}
            />
            <Input
              label="Phone"
              id="volPhone"
              placeholder="e.g. +91 98765 43210"
              value={newVolunteer.phone}
              onChange={(e) => setNewVolunteer({ ...newVolunteer, phone: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Volunteer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
