import React, { useState, useEffect } from 'react';
import { FileText, Download, FilePlus, Trash2, Calendar, Folder } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import EventSwitcher from '../components/ui/EventSwitcher';
import Modal from '../components/ui/Modal';
import {
  getDocumentsByEvent,
  createDocument,
  deleteDocument,
} from '../services/api';

export default function Documents() {
  const { selectedEvent, selectedEventId } = useEventContext();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Approvals',
    size: '1.5 MB',
    description: '',
  });

  const fetchDocuments = async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      const res = await getDocumentsByEvent(selectedEventId);
      if (res && res.success && Array.isArray(res.data)) {
        setDocuments(res.data);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.warn('Failed to fetch documents:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedEventId]);

  const openModal = () => {
    setFormData({
      name: '',
      category: 'Approvals',
      size: '1.5 MB',
      description: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateDocument = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      title: formData.name.trim(),
      category: formData.category,
      size: formData.size.trim() || '1.5 MB',
      description: formData.description.trim(),
      uploadedBy: 'Core Team',
    };

    try {
      const res = await createDocument(selectedEventId, payload);
      if (res && res.success && res.data) {
        setDocuments((prev) => [res.data, ...prev]);
      } else {
        const localNew = { ...payload, _id: `doc_${Date.now()}`, id: `doc_${Date.now()}`, createdAt: new Date().toISOString() };
        setDocuments((prev) => [localNew, ...prev]);
      }
    } catch {
      const localNew = { ...payload, _id: `doc_${Date.now()}`, id: `doc_${Date.now()}`, createdAt: new Date().toISOString() };
      setDocuments((prev) => [localNew, ...prev]);
    }

    closeModal();
  };

  const handleDeleteDocument = async (id) => {
    // Optimistically remove from UI first
    setDocuments((prev) => prev.filter((d) => (d._id || d.id) !== id));
    try {
      await deleteDocument(id);
    } catch {
      // Already removed from UI; localStorage updated in api.js fallback
    }
  };

  const handleDownload = (doc) => {
    const content = `ClubOps AI Document: ${doc.name}\nCategory: ${doc.category}\nEvent: ${selectedEvent?.name || ''}\nCreated: ${doc.createdAt || ''}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name.endsWith('.pdf') || doc.name.endsWith('.docx') ? doc.name : `${doc.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Documents & Files"
        description="Centralized repository for club proposals, permissions, sponsor brochures, and guideline files."
        badge={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/80 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="max-w-[200px] sm:max-w-[260px] truncate">
                {selectedEvent ? selectedEvent.name : 'Active Event'}
              </span>
            </span>
            <StatusBadge status="confirmed" label={`${documents.length} Documents`} />
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <EventSwitcher />
            <Button variant="primary" size="sm" icon={FilePlus} onClick={openModal}>
              New Document
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          {documents.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-2xs">
                <Folder className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No documents uploaded yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Upload proposals, permission letters, and sponsor brochures for this event.
              </p>
              <Button variant="primary" size="sm" icon={FilePlus} onClick={openModal}>
                New Document
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {documents.map((doc, idx) => (
                <div
                  key={doc._id || doc.id || idx}
                  className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900">{doc.name}</h3>
                      <p className="text-[11px] text-slate-500">
                        {doc.category} • {doc.size || '1.2 MB'} • {doc.uploadedBy ? `Uploaded by ${doc.uploadedBy}` : 'Uploaded'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={() => handleDownload(doc)}
                    >
                      Download
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc._id || doc.id)}
                      title="Delete Document"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Document Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add Event Document"
        description={`Upload or register a new document for ${selectedEvent?.name || 'current event'}`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateDocument}>
              Add Document
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateDocument} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Name / Filename <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. InnovateX_Budget_Draft_v2.pdf"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 bg-white"
              >
                <option value="Approvals">Approvals</option>
                <option value="Logistics">Logistics</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Academics">Academics</option>
                <option value="Legal">Legal</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                File Size
              </label>
              <input
                type="text"
                placeholder="e.g. 2.4 MB"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Brief description or purpose of this file..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
