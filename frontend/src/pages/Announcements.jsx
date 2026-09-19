import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Sparkles,
  Users,
  Calendar,
  Send,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

export default function Announcements({ announcements, setAnnouncements }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    audience: 'All Participants',
    status: 'Published',
    content: '',
  });

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('Write an urgent announcement reminding volunteers about setup at 8 AM');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.title) return;

    setAnnouncements([
      {
        id: Date.now(),
        title: formData.title,
        audience: formData.audience,
        date: 'Today',
        status: formData.status,
        content: formData.content || 'Club announcement details.',
      },
      ...announcements,
    ]);

    setFormData({
      title: '',
      audience: 'All Participants',
      status: 'Published',
      content: '',
    });
    setIsCreateModalOpen(false);
  };

  const handleAiGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setFormData({
        title: 'Urgent: Volunteer Call Time & Venue Setup Guidelines',
        audience: 'Volunteers',
        status: 'Published',
        content: `🚨 Calling all TechNova volunteers!\n\nPlease assemble at Main Auditorium tomorrow at sharp 8:00 AM for stage lighting, badge printing, and swag kit distribution. Breakfast and official volunteer t-shirts will be provided in Room 204. Let's make this event unforgettable!`,
      });
      setIsAiModalOpen(false);
      setIsCreateModalOpen(true);
    }, 700);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Announcements
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, schedule, and broadcast club communications to participants and teams.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <Button
            variant="ai"
            icon={Sparkles}
            size="md"
            onClick={() => setIsAiModalOpen(true)}
          >
            ✨ Generate with AI
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            icon={Plus}
            size="md"
          >
            Create Announcement
          </Button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((item) => (
          <Card key={item.id} className="p-5 sm:p-6 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {item.title}
                  </h3>
                  <div className="mt-1 flex items-center space-x-3 text-xs text-slate-500">
                    <span className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Audience: <strong className="ml-1 text-slate-700">{item.audience}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {item.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <Badge variant={item.status} size="sm">
                  {item.status}
                </Badge>
                <button
                  onClick={() => handleCopy(item.id, `${item.title}\n\n${item.content}`)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {item.content}
            </p>
          </Card>
        ))}
      </div>

      {/* AI Generator Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="✨ Generate Announcement with AI"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Describe the key message, audience, and tone. ClubOps AI will draft a polished broadcast.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Topic or Instructions
            </label>
            <textarea
              rows="3"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={() => setIsAiModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="ai"
              icon={Sparkles}
              disabled={isGenerating}
              onClick={handleAiGenerate}
            >
              {isGenerating ? 'Generating Draft...' : 'Generate Broadcast'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Announcement"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Title"
            id="annTitle"
            required
            placeholder="e.g. Volunteer Meeting Reminder"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Audience"
              id="annAudience"
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              options={[
                { value: 'All Participants', label: 'All Participants' },
                { value: 'Volunteers', label: 'Volunteers' },
                { value: 'Core Team', label: 'Core Team' },
                { value: 'Sponsors & Mentors', label: 'Sponsors & Mentors' },
              ]}
            />

            <Select
              label="Status"
              id="annStatus"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Published', label: 'Published' },
                { value: 'Draft', label: 'Draft' },
              ]}
            />
          </div>

          <div>
            <label htmlFor="annContent" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Message Content
            </label>
            <textarea
              id="annContent"
              rows="4"
              required
              placeholder="Type your announcement broadcast message..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Post Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
