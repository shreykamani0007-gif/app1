import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Download,
  Eye,
  Calendar,
  User,
  FileSpreadsheet,
  FileCode,
  FileCheck
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

export default function Documents({ documents, setDocuments, events = [] }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [eventFilter, setEventFilter] = useState('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: '',
    category: 'Guidelines',
    event: 'TechNova Hackathon 2026',
    type: 'PDF',
  });

  const categories = ['All', 'Guidelines', 'Sponsorship', 'Operations', 'Finance'];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All' || doc.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesEvent =
      eventFilter === 'All' || doc.event === eventFilter;

    return matchesSearch && matchesCategory && matchesEvent;
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newDoc.name) return;

    setDocuments([
      ...documents,
      {
        id: Date.now(),
        name: newDoc.name.endsWith(`.${newDoc.type.toLowerCase()}`) ? newDoc.name : `${newDoc.name}.${newDoc.type.toLowerCase()}`,
        type: newDoc.type,
        size: '1.5 MB',
        uploadedBy: 'Prince',
        uploadedDate: 'Today',
        category: newDoc.category,
        event: newDoc.event,
      }
    ]);

    setNewDoc({
      name: '',
      category: 'Guidelines',
      event: 'TechNova Hackathon 2026',
      type: 'PDF',
    });
    setIsUploadModalOpen(false);
  };

  const getDocIcon = (type) => {
    switch (type.toUpperCase()) {
      case 'PDF':
        return <FileText className="w-8 h-8 text-rose-500" />;
      case 'DOCX':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'XLSX':
        return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      default:
        return <FileCode className="w-8 h-8 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Documents
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep all event-related documents, proposals, agreements, and guidelines in one place.
          </p>
        </div>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          icon={Plus}
          size="md"
        >
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search documents by filename or uploader..."
            className="w-full sm:w-80"
          />

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-brand-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>

            {/* Event Filter */}
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-brand-500 focus:outline-none"
            >
              <option value="All">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.name}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Try adjusting your search criteria or upload a new document."
          actionLabel="Upload Document"
          actionIcon={Plus}
          onAction={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all group">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      {getDocIcon(doc.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {doc.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {doc.size} • {doc.type}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Category</span>
                    <Badge variant="default" size="sm">{doc.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Event</span>
                    <span className="text-slate-700 font-medium truncate max-w-[160px]">{doc.event}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Uploaded by</span>
                    <span className="text-slate-700 font-medium">{doc.uploadedBy} ({doc.uploadedDate})</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Eye}
                  className="w-1/2 text-xs"
                  onClick={() => alert(`Opening preview for ${doc.name}`)}
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Download}
                  className="w-1/2 text-xs"
                  onClick={() => alert(`Downloading ${doc.name}`)}
                >
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Event Document"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <Input
            label="Document Name"
            id="docName"
            required
            placeholder="e.g. Venue Requirements.pdf"
            value={newDoc.name}
            onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Category"
              id="docCategory"
              value={newDoc.category}
              onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
              options={[
                { value: 'Guidelines', label: 'Guidelines' },
                { value: 'Sponsorship', label: 'Sponsorship' },
                { value: 'Operations', label: 'Operations' },
                { value: 'Finance', label: 'Finance' },
              ]}
            />

            <Select
              label="File Type"
              id="docType"
              value={newDoc.type}
              onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
              options={[
                { value: 'PDF', label: 'PDF Document' },
                { value: 'DOCX', label: 'Word Document (DOCX)' },
                { value: 'XLSX', label: 'Excel Spreadsheet (XLSX)' },
              ]}
            />
          </div>

          <Select
            label="Associated Event"
            id="docEvent"
            value={newDoc.event}
            onChange={(e) => setNewDoc({ ...newDoc, event: e.target.value })}
            options={events.map((e) => ({ value: e.name, label: e.name }))}
          />

          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center bg-slate-50/50">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Choose file or drag here</p>
            <p className="text-[11px] text-slate-400 mt-1">Mock upload for hackathon UI</p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
