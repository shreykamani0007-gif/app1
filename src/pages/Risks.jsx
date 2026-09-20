import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Plus,
  Calendar,
  Clock,
  Search,
  Filter,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  User,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import EventSwitcher from '../components/ui/EventSwitcher';
import Modal from '../components/ui/Modal';
import {
  getRisksByEvent,
  createRisk,
  updateRisk,
  deleteRisk,
} from '../services/api';

// Realistic demo risk registries for at least 3 distinct events
const defaultRisksByEvent = {
  evt_innovatex_2026: [
    {
      id: 'risk_inno_1',
      title: 'Main Hall Projector Bulb Life Expiry',
      description: 'Projector lamp may exceed operational lifespan during the keynote track.',
      category: 'Technical',
      severity: 'high',
      status: 'open',
      owner: 'Sarah Miller (Logistics)',
      mitigation: 'Procure backup projector lamp from university inventory or rental partner before Thursday soundcheck.',
      probability: 'Medium',
      impact: 'High',
      dueDate: '2026-10-10',
      notes: 'Bulb hours currently at 2,850 / 3,000 rating.',
    },
    {
      id: 'risk_inno_2',
      title: 'Wi-Fi Bandwidth Limit in Block C',
      description: 'Concurrent device saturation during hackathon coding sprints may throttle internet speeds.',
      category: 'Technical',
      severity: 'medium',
      status: 'monitoring',
      owner: 'Campus IT Liaison',
      mitigation: 'Requested extra enterprise AP routers; IT Department testing scheduled for Friday.',
      probability: 'High',
      impact: 'Medium',
      dueDate: '2026-10-11',
      notes: 'Expected 600 concurrent devices across hackathon floors.',
    },
    {
      id: 'risk_inno_3',
      title: 'Food Catering Headcount Variance (+/- 15%)',
      description: 'Walk-in attendees and mentor registrations may surpass initial meal estimate.',
      category: 'Catering',
      severity: 'low',
      status: 'resolved',
      owner: 'David Kim (Finance)',
      mitigation: 'Contractual 10% buffer clause established with dining vendor.',
      probability: 'Low',
      impact: 'Low',
      dueDate: '2026-10-09',
      notes: 'Vendor agreed to deliver supplemental boxed meals within 45 mins if needed.',
    },
  ],
  evt_techfest_2026: [
    {
      id: 'risk_tech_1',
      title: 'Robotics Arena Polycarbonate Barrier Scratches / Visibility',
      description: 'Impact debris could impair spectator sightlines and safety certification.',
      category: 'Safety',
      severity: 'high',
      status: 'open',
      owner: 'Alex Rivera (Robotics Lead)',
      mitigation: 'Inspect panels on setup day; apply optical polishing compound or swap damaged sheets with spares.',
      probability: 'Medium',
      impact: 'High',
      dueDate: '2026-11-03',
      notes: 'Combat robotics safety regulation compliance mandatory.',
    },
    {
      id: 'risk_tech_2',
      title: 'High-Voltage Battery Charging Overload',
      description: 'Multiple combat robot teams charging high-discharge LiPo batteries simultaneously.',
      category: 'Safety',
      severity: 'critical',
      status: 'open',
      owner: 'Tariq Mansoor (Tech Crew)',
      mitigation: 'Designate dedicated fireproof LiPo charging bunker with Class D extinguishers and surge limiters.',
      probability: 'Low',
      impact: 'High',
      dueDate: '2026-11-04',
      notes: 'No charging permitted in team pit areas.',
    },
    {
      id: 'risk_tech_3',
      title: 'Live Stream Audio Sync Drift',
      description: 'Audio latency between auditorium PA mixer and digital capture card.',
      category: 'Technical',
      severity: 'low',
      status: 'monitoring',
      owner: 'Lucas Silva (Media & Sound)',
      mitigation: 'Use hardware audio delay unit on mixer output before feeding OBS encoder.',
      probability: 'Medium',
      impact: 'Low',
      dueDate: '2026-11-04',
      notes: 'Backup stream key pre-configured on secondary YouTube channel.',
    },
  ],
  evt_aws_workshop_2026: [
    {
      id: 'risk_aws_1',
      title: 'AWS Sandbox Account Service Quota Limits',
      description: 'Students launching concurrent EC2 GPU/CPU instances may hit regional quota caps.',
      category: 'Technical',
      severity: 'high',
      status: 'open',
      owner: 'Kevin Zhao (Tech Support)',
      mitigation: 'Submit limit increase tickets for EC2 and SageMaker instances at least 7 days prior to workshop.',
      probability: 'Medium',
      impact: 'High',
      dueDate: '2026-11-15',
      notes: 'Ticket #89124 submitted to AWS Educate support.',
    },
    {
      id: 'risk_aws_2',
      title: 'Attendee Laptop Dependency Incompatibilities (ARM vs x86)',
      description: 'Apple Silicon vs Windows Intel architecture differences with local Docker containers.',
      category: 'Logistics',
      severity: 'medium',
      status: 'monitoring',
      owner: 'Devin Brooks (Mentorship)',
      mitigation: 'Provide cloud-based Cloud9 / VS Code browser IDE environments so local installation is optional.',
      probability: 'High',
      impact: 'Low',
      dueDate: '2026-11-18',
      notes: 'Container image tested and hosted on ECR public.',
    },
  ],
};

const categoryOptions = [
  'Technical',
  'Venue',
  'Safety',
  'Logistics',
  'Staffing',
  'Catering',
  'Finance',
  'Security',
  'Communication',
  'Other',
];

const defaultOwnerOptions = [
  'Sarah Miller (Logistics)',
  'Alex Chen (Event Lead)',
  'David Kim (Finance)',
  'Campus IT Liaison',
  'Maya Patel (Hospitality)',
  'Kavita Rao (A/V & Tech)',
  'Elena Rostova (Safety Liaison)',
  'Alex Rivera (Robotics Lead)',
  'Tariq Mansoor (Tech Crew)',
  'Kevin Zhao (Tech Support)',
  'Devin Brooks (Mentorship)',
];

export default function Risks() {
  const { selectedEvent, selectedEventId } = useEventContext();

  const [currentRisks, setCurrentRisks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const initialFormState = {
    title: '',
    description: '',
    category: 'Technical',
    severity: 'high',
    status: 'open',
    owner: 'Sarah Miller (Logistics)',
    customOwner: '',
    mitigation: '',
    probability: 'Medium',
    impact: 'High',
    dueDate: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchRisks = async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      const res = await getRisksByEvent(selectedEventId);
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setCurrentRisks(res.data);
      } else {
        // Fall back to seed data for this event
        setCurrentRisks(defaultRisksByEvent[selectedEventId] || []);
      }
    } catch {
      setCurrentRisks(defaultRisksByEvent[selectedEventId] || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, [selectedEventId]);

  // Open Modal for Create or Edit
  const openModal = (risk = null) => {
    setValidationError('');
    if (risk) {
      setEditingRisk(risk);
      const isKnownOwner = defaultOwnerOptions.includes(risk.owner);
      setFormData({
        title: risk.title || '',
        description: risk.description || '',
        category: risk.category || 'Technical',
        severity: risk.severity || 'high',
        status: risk.status || 'open',
        owner: isKnownOwner ? risk.owner : 'custom',
        customOwner: isKnownOwner ? '' : risk.owner || '',
        mitigation: risk.mitigation || '',
        probability: risk.probability || 'Medium',
        impact: risk.impact || 'High',
        dueDate: risk.dueDate || '',
        notes: risk.notes || '',
      });
    } else {
      setEditingRisk(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRisk(null);
    setValidationError('');
  };

  // Handle Submit (Create or Edit)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Required Field Validation
    const resolvedOwner =
      formData.owner === 'custom' ? formData.customOwner.trim() : formData.owner;

    if (!formData.title.trim()) {
      setValidationError('Risk Title is required.');
      return;
    }
    if (!formData.category) {
      setValidationError('Risk Category is required.');
      return;
    }
    if (!formData.severity) {
      setValidationError('Risk Level is required.');
      return;
    }
    if (!formData.status) {
      setValidationError('Status is required.');
      return;
    }
    if (!resolvedOwner) {
      setValidationError('Risk Owner is required.');
      return;
    }
    if (!formData.mitigation.trim()) {
      setValidationError('Contingency Plan is required.');
      return;
    }

    setValidationError('');

    const riskPayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      severity: formData.severity,
      status: formData.status,
      owner: resolvedOwner,
      mitigation: formData.mitigation.trim(),
      probability: formData.probability,
      impact: formData.impact,
      dueDate: formData.dueDate,
      notes: formData.notes.trim(),
    };

    try {
      if (editingRisk) {
        const id = editingRisk._id || editingRisk.id;
        const res = await updateRisk(id, riskPayload);
        const updatedObj = (res && res.success && res.data) ? res.data : { ...editingRisk, ...riskPayload };
        setCurrentRisks((prev) => prev.map((r) => ((r._id || r.id) === id ? updatedObj : r)));
        setToastMessage('Risk updated successfully.');
      } else {
        const res = await createRisk(selectedEventId, riskPayload);
        if (res && res.success && res.data) {
          setCurrentRisks((prev) => [res.data, ...prev]);
        } else {
          const localNew = { ...riskPayload, _id: `risk_${Date.now()}`, id: `risk_${Date.now()}`, createdAt: new Date().toISOString() };
          setCurrentRisks((prev) => [localNew, ...prev]);
        }
        setToastMessage('Risk logged successfully.');
      }
    } catch {
      // Local fallback on any error
      if (editingRisk) {
        const id = editingRisk._id || editingRisk.id;
        setCurrentRisks((prev) => prev.map((r) => ((r._id || r.id) === id ? { ...editingRisk, ...riskPayload } : r)));
        setToastMessage('Risk updated (offline).');
      } else {
        const localNew = { ...riskPayload, _id: `risk_${Date.now()}`, id: `risk_${Date.now()}`, createdAt: new Date().toISOString() };
        setCurrentRisks((prev) => [localNew, ...prev]);
        setToastMessage('Risk logged (offline).');
      }
    }

    closeModal();
  };

  // Handle Delete (Only from current event)
  const handleDeleteRisk = async (id) => {
    // Optimistically remove from UI first
    setCurrentRisks((prev) => prev.filter((r) => (r._id || r.id) !== id));
    setToastMessage('Risk deleted.');
    try {
      await deleteRisk(id);
    } catch {
      // Already removed from UI; localStorage updated in api.js fallback
    }
  };

  // Filtered risks
  const filteredRisks = currentRisks.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.owner && r.owner.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.category && r.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.mitigation && r.mitigation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSeverity =
      severityFilter === 'all' || r.severity.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="ml-2 p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header with Event Context & Dynamic Count */}
      <PageHeader
        title="Risk & Contingency Registry"
        description="Identify event vulnerabilities early, assign risk owners, and verify contingency fail-safes."
        badge={
          <div className="flex flex-wrap items-center gap-2">
            {/* Active Event Context Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="max-w-[200px] sm:max-w-[260px] truncate">
                {selectedEvent ? selectedEvent.name : 'Active Event'}
              </span>
            </span>

            {/* Dynamic Tracked Count */}
            <StatusBadge status="urgent" label={`${currentRisks.length} Tracked`} />
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Event Switcher directly accessible on page */}
            <EventSwitcher />

            <Button
              variant="danger"
              size="sm"
              icon={Plus}
              onClick={() => openModal()}
            >
              Log New Risk
            </Button>
          </div>
        }
      />

      {/* Roster Controls: Search & Filter (Only when risks exist) */}
      {currentRisks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search risks by title, owner, category, or contingency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
            >
              <option value="all">All Statuses ({currentRisks.length})</option>
              <option value="open">Open</option>
              <option value="monitoring">Monitoring</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
            >
              <option value="all">All Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Risks List or Professional Empty State */}
      {currentRisks.length === 0 ? (
        /* Professional Empty State */
        <Card className="p-0">
          <CardContent className="py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-2xs">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No risks have been logged for this event yet.
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Identify potential vulnerabilities and add a contingency plan.
            </p>
            <Button
              variant="danger"
              size="sm"
              icon={Plus}
              onClick={() => openModal()}
            >
              Log New Risk
            </Button>
          </CardContent>
        </Card>
      ) : filteredRisks.length === 0 ? (
        /* Filter Empty State */
        <Card className="p-0">
          <CardContent className="py-12 px-6 text-center">
            <p className="text-sm font-medium text-slate-700">No risks match your search filters</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing or adjusting your search filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSeverityFilter('all');
              }}
              className="mt-3 text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
            >
              Clear Filters
            </button>
          </CardContent>
        </Card>
      ) : (
        /* Risk Cards List */
        <div className="space-y-4">
          {filteredRisks.map((r) => {
            const severityColor =
              r.severity === 'critical' || r.severity === 'high'
                ? 'text-rose-600'
                : r.severity === 'medium'
                ? 'text-amber-500'
                : 'text-emerald-600';

            return (
              <Card key={r._id || r.id} className="p-5 hover:shadow-md transition-shadow group">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-start gap-3 min-w-0">
                    <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${severityColor}`} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {r.title}
                        </h3>
                        {r.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {r.category}
                          </span>
                        )}
                      </div>
                      {r.description && (
                        <p className="text-xs text-slate-500 mt-1">{r.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={r.severity} />
                    <StatusBadge status={r.status} />
                  </div>
                </div>

                {/* Contingency Plan */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 mt-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Contingency Plan:</span>{' '}
                  {r.mitigation}
                </div>

                {/* Additional Risk Details */}
                {(r.probability || r.impact || r.dueDate || r.notes) && (
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-500">
                    {r.probability && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        Probability: <strong className="text-slate-800">{r.probability}</strong>
                      </span>
                    )}
                    {r.impact && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        Impact: <strong className="text-slate-800">{r.impact}</strong>
                      </span>
                    )}
                    {r.dueDate && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Due: <strong className="text-slate-800">{r.dueDate}</strong>
                      </span>
                    )}
                    {r.notes && (
                      <span className="italic text-slate-400 max-w-md truncate">
                        Note: {r.notes}
                      </span>
                    )}
                  </div>
                )}

                {/* Card Footer: Risk Owner, Edit, and Delete */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Risk Owner: <strong className="text-slate-700">{r.owner}</strong>
                    </span>
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openModal(r)}
                      className="cursor-pointer text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Contingency</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRisk(r._id || r.id)}
                      title="Delete Risk"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors opacity-80 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Log New Risk / Edit Risk Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRisk ? 'Edit Risk & Contingency' : 'Log New Risk'}
        description="Identify a potential event risk and define its contingency plan."
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleSubmit}>
              {editingRisk ? 'Save Changes' : 'Log Risk'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Active Event Context Banner */}
          <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Event: <strong className="font-semibold">{selectedEvent ? selectedEvent.name : 'Active Event'}</strong>
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-200/60 text-rose-800 px-2 py-0.5 rounded">
              Active Scope
            </span>
          </div>

          {/* Validation Error Alert */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Risk Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Risk Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Main Hall Projector Bulb Life Expiry"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Projector may fail during the main presentation."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Category, Level, Status (3-col on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Risk Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 bg-white"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Risk Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 bg-white"
              >
                <option value="open">Open</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Risk Owner */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Risk Owner <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 bg-white"
              >
                {defaultOwnerOptions.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
                <option value="custom">+ Enter custom owner name...</option>
              </select>

              {formData.owner === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter owner name and team..."
                  value={formData.customOwner}
                  onChange={(e) => setFormData({ ...formData, customOwner: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800"
                />
              )}
            </div>
          </div>

          {/* Contingency Plan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contingency Plan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Arrange a backup projector and test it before the event."
              value={formData.mitigation}
              onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Probability, Impact, Due Date (3-col on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Probability
              </label>
              <select
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Impact
              </label>
              <select
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 bg-white"
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Optional Notes
            </label>
            <textarea
              rows={2}
              placeholder="Add any additional context, serial numbers, or contact notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
