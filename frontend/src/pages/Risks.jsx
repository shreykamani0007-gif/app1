import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

export default function Risks({ risks, setRisks }) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const [newRisk, setNewRisk] = useState({
    risk: '',
    severity: 'Medium',
    probability: 'Medium',
    impact: '',
    owner: 'Rohan',
    status: 'Open',
    mitigation: '',
  });

  const filteredRisks = risks.filter((r) => {
    const matchesSearch =
      r.risk.toLowerCase().includes(search.toLowerCase()) ||
      r.impact.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity =
      severityFilter === 'All' || r.severity.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  const handleAddRisk = (e) => {
    e.preventDefault();
    if (!newRisk.risk) return;

    setRisks([
      ...risks,
      {
        id: Date.now(),
        risk: newRisk.risk,
        severity: newRisk.severity,
        probability: newRisk.probability,
        impact: newRisk.impact || 'Schedule and logistical delay',
        owner: newRisk.owner,
        status: newRisk.status,
        mitigation: newRisk.mitigation || 'Contingency plan being formulated.',
      }
    ]);

    setNewRisk({
      risk: '',
      severity: 'Medium',
      probability: 'Medium',
      impact: '',
      owner: 'Rohan',
      status: 'Open',
      mitigation: '',
    });
    setIsAddModalOpen(false);
  };

  const handleAiRiskScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult([
        {
          risk: 'Power overload during peak hackathon demo session',
          severity: 'High',
          probability: 'Medium',
          impact: 'Sudden outage during presentations',
          owner: 'Amit',
          mitigation: 'Request auxiliary campus generator backup by 30 Sept.'
        },
        {
          risk: 'Registration check-in line bottlenecks',
          severity: 'Medium',
          probability: 'High',
          impact: 'Delayed keynote start time',
          owner: 'Priya',
          mitigation: 'Enable QR code digital self-check-in stations.'
        }
      ]);
    }, 800);
  };

  const handleApplyScannedRisk = (scanned) => {
    setRisks([
      ...risks,
      {
        id: Date.now(),
        ...scanned,
        status: 'Open',
      }
    ]);
    setScanResult(scanResult.filter((s) => s.risk !== scanned.risk));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Risks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Identify, assess severity, and manage operational contingency plans for club events.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <Button
            variant="ai"
            icon={Sparkles}
            size="md"
            disabled={isScanning}
            onClick={handleAiRiskScan}
          >
            {isScanning ? 'Scanning Event...' : '✨ AI Risk Scan'}
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            icon={Plus}
            size="md"
          >
            Add Risk
          </Button>
        </div>
      </div>

      {/* AI Risk Scan Banner / Drawer */}
      {scanResult && scanResult.length > 0 && (
        <Card className="p-5 border-indigo-200 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-pink-50/20 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Risk Scan Findings ({scanResult.length} potential vulnerabilities identified)</span>
            </div>
            <button
              onClick={() => setScanResult(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scanResult.map((scanned, i) => (
              <div key={i} className="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">{scanned.risk}</span>
                  <Badge variant={scanned.severity} size="sm">{scanned.severity}</Badge>
                </div>
                <p className="text-[11px] text-slate-500">{scanned.impact}</p>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-indigo-700 font-medium text-[11px]">Recommended: {scanned.mitigation}</span>
                  <Button size="sm" variant="outline" onClick={() => handleApplyScannedRisk(scanned)}>
                    Track Risk
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search risks, impacts, or owners..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center space-x-2">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                severityFilter === sev
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Table Card */}
      <Card className="overflow-hidden">
        {filteredRisks.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No risks found"
            description="All clear! No risks matching your criteria are currently recorded."
            actionLabel="Add Risk"
            actionIcon={Plus}
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 sm:px-6">Risk Factor</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Probability</th>
                  <th className="py-3 px-4">Impact</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6">Mitigation Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRisks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                      {risk.risk}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={risk.severity} size="sm">
                        {risk.severity}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {risk.probability}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {risk.impact}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {risk.owner}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={risk.status} size="sm">
                        {risk.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-600 max-w-xs">
                      {risk.mitigation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Risk Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Operational Risk"
      >
        <form onSubmit={handleAddRisk} className="space-y-4">
          <Input
            label="Risk Description"
            id="riskDesc"
            required
            placeholder="e.g. Venue confirmation delayed"
            value={newRisk.risk}
            onChange={(e) => setNewRisk({ ...newRisk, risk: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Severity"
              id="riskSeverity"
              value={newRisk.severity}
              onChange={(e) => setNewRisk({ ...newRisk, severity: e.target.value })}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' },
              ]}
            />

            <Select
              label="Probability"
              id="riskProb"
              value={newRisk.probability}
              onChange={(e) => setNewRisk({ ...newRisk, probability: e.target.value })}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
              ]}
            />
          </div>

          <Input
            label="Potential Impact"
            id="riskImpact"
            placeholder="e.g. Event schedule disruption"
            value={newRisk.impact}
            onChange={(e) => setNewRisk({ ...newRisk, impact: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Owner"
              id="riskOwner"
              value={newRisk.owner}
              onChange={(e) => setNewRisk({ ...newRisk, owner: e.target.value })}
              options={[
                { value: 'Rohan', label: 'Rohan' },
                { value: 'Priya', label: 'Priya' },
                { value: 'Amit', label: 'Amit' },
                { value: 'Prince', label: 'Prince' },
              ]}
            />

            <Select
              label="Status"
              id="riskStatus"
              value={newRisk.status}
              onChange={(e) => setNewRisk({ ...newRisk, status: e.target.value })}
              options={[
                { value: 'Open', label: 'Open' },
                { value: 'Monitoring', label: 'Monitoring' },
                { value: 'Mitigated', label: 'Mitigated' },
              ]}
            />
          </div>

          <div>
            <label htmlFor="riskMitigation" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Mitigation / Contingency Action
            </label>
            <textarea
              id="riskMitigation"
              rows="3"
              placeholder="Action steps to eliminate or reduce risk..."
              value={newRisk.mitigation}
              onChange={(e) => setNewRisk({ ...newRisk, mitigation: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Risk
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
