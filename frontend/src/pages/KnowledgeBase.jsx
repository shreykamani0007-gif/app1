import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  Clock,
  Eye,
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import EmptyState from '../components/ui/EmptyState';

export default function KnowledgeBase({ knowledge }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeItem, setActiveItem] = useState(null);

  const categories = [
    'All',
    'Event Guidelines',
    'SOPs',
    'Previous Events',
    'Sponsors',
    'Venues',
    'Club Policies',
  ];

  const filteredKnowledge = knowledge.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Knowledge Base
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search your club's institutional event memory, guidelines, SOPs, and post-mortems.
        </p>
      </div>

      {/* Big Search Bar */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md">
        <h3 className="text-lg font-bold mb-1">How can we help your operations today?</h3>
        <p className="text-xs text-brand-100 mb-4">
          Query standard operating procedures, past sponsor templates, and auditorium clearances.
        </p>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents, guidelines, SOPs, past event templates..."
            className="w-full rounded-xl bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner"
          />
        </div>
      </Card>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Knowledge Items Grid */}
      {filteredKnowledge.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No articles found"
          description="Try searching with different keywords or selecting another category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredKnowledge.map((item) => (
            <Card
              key={item.id}
              hover
              onClick={() => setActiveItem(item)}
              className="p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="default" size="sm">
                    {item.category}
                  </Badge>
                  <span className="flex items-center text-[11px] text-slate-400">
                    <Eye className="w-3 h-3 mr-1" />
                    {item.reads} reads
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {item.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Updated {item.updated}
                </span>
                <span className="font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                  Read article &rarr;
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Read Article Modal / Preview */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full border border-slate-200 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <Badge variant="default" size="sm">{activeItem.category}</Badge>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{activeItem.title}</h3>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
              <p className="font-medium text-slate-900">{activeItem.excerpt}</p>
              <p>
                This document serves as the standard operating guideline approved by the TechNova Club executive committee. All student coordinators and leads must ensure compliance with auditorium clearance protocols, safety approvals, and equipment handover signoffs.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <strong>Key Takeaway:</strong> Always verify speaker requirements and submit audio/visual requisition at least 7 days prior to event commencement.
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button onClick={() => setActiveItem(null)}>
                Close Article
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
