import React, { useState, useEffect } from 'react';
import { Megaphone, Send, Clock, Users, Calendar, Trash2 } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import EventSwitcher from '../components/ui/EventSwitcher';
import Modal from '../components/ui/Modal';
import {
  getAnnouncementsByEvent,
  createAnnouncement,
  deleteAnnouncement,
} from '../services/api';

export default function Announcements() {
  const { selectedEvent, selectedEventId } = useEventContext();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    audience: 'All Volunteers',
    author: 'Event Lead',
    body: '',
  });

  const fetchAnnouncements = async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      const res = await getAnnouncementsByEvent(selectedEventId);
      if (res && res.success && Array.isArray(res.data)) {
        setAnnouncements(res.data);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      console.warn('Failed to fetch announcements:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedEventId]);

  const openModal = () => {
    setFormData({
      title: '',
      audience: 'All Volunteers',
      author: 'Event Lead',
      body: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateAnnouncement = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) return;

    const payload = {
      title: formData.title.trim(),
      body: formData.body.trim(),
      content: formData.body.trim(),
      audience: formData.audience,
      author: formData.author.trim() || 'Event Lead',
      status: 'Sent',
    };

    try {
      const res = await createAnnouncement(selectedEventId, payload);
      if (res && res.success && res.data) {
        setAnnouncements((prev) => [res.data, ...prev]);
      } else {
        // Local fallback
        const localNew = { ...payload, _id: `ann_${Date.now()}`, id: `ann_${Date.now()}`, createdAt: new Date().toISOString() };
        setAnnouncements((prev) => [localNew, ...prev]);
      }
    } catch {
      // Local fallback on any error
      const localNew = { ...payload, _id: `ann_${Date.now()}`, id: `ann_${Date.now()}`, createdAt: new Date().toISOString() };
      setAnnouncements((prev) => [localNew, ...prev]);
    }

    closeModal();
  };

  const handleDeleteAnnouncement = async (id) => {
    // Optimistically remove from UI first
    setAnnouncements((prev) => prev.filter((a) => (a._id || a.id) !== id));
    try {
      await deleteAnnouncement(id);
    } catch {
      // Already removed from UI; localStorage updated in api.js fallback
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Club Announcements"
        description="Broadcast updates to volunteers, committee heads, faculty advisors, or participants."
        badge={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/80 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="max-w-[200px] sm:max-w-[260px] truncate">
                {selectedEvent ? selectedEvent.name : 'Active Event'}
              </span>
            </span>
            <StatusBadge status="confirmed" label={`${announcements.length} Broadcasts`} />
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <EventSwitcher />
            <Button variant="primary" size="sm" icon={Send} onClick={openModal}>
              New Broadcast
            </Button>
          </div>
        }
      />

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-2xs">
              <Megaphone className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No announcements broadcast yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Send emergency briefings, itinerary changes, or reminders to volunteers and participants.
            </p>
            <Button variant="primary" size="sm" icon={Send} onClick={openModal}>
              New Broadcast
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a, idx) => (
            <Card key={a._id || a.id || idx} className="p-5 hover:shadow-md transition-shadow group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">{a.title}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {formatDate(a.createdAt || a.time)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnouncement(a._id || a.id)}
                    title="Delete Broadcast"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 my-2 leading-relaxed whitespace-pre-line">
                {a.body || a.content}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-600" />
                  Audience: <strong className="text-slate-700">{a.audience || 'All Volunteers'}</strong>
                </span>
                <span>Posted by: <strong className="text-slate-700">{a.author || a.createdBy || 'Event Lead'}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Broadcast Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Send New Broadcast"
        description={`Post an announcement for ${selectedEvent?.name || 'current event'}`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateAnnouncement}>
              Post Broadcast
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Announcement Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule Change: Stage Keynote Moved to 3:00 PM"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Audience
              </label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 bg-white"
              >
                <option value="All Volunteers">All Volunteers</option>
                <option value="Core Team & Leads">Core Team & Leads</option>
                <option value="Tech Crew">Tech Crew</option>
                <option value="Hospitality Team">Hospitality Team</option>
                <option value="All Participants">All Participants</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author / Sender
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Chen (Event Lead)"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Type your announcement details here..."
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
