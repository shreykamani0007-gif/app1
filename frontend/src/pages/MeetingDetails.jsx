import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Save,
  Plus
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function MeetingDetails({ meetings, setMeetings, onCreateTask }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const meeting = meetings.find((m) => m.id.toString() === id) || meetings[0] || {
    title: 'Weekly Core Team Meeting',
    date: 'Today',
    time: '5:00 PM',
    participants: 8,
    agenda: 'Overall progress check, sponsorship pipeline review, and blocker resolution across departments.',
    notes: `Discussed venue confirmation.\nRohan will contact the sponsor by Friday.\nPriya will book the auditorium.\nAmit will prepare the registration form by Monday.`,
    extractedActions: [
      { task: 'Contact sponsor for tier 1 commitment', owner: 'Rohan', deadline: 'Friday' },
      { task: 'Book auditorium and sign requisition slip', owner: 'Priya', deadline: 'Tomorrow' },
      { task: 'Prepare registration form on website', owner: 'Amit', deadline: 'Monday' }
    ]
  };

  const [notes, setNotes] = useState(meeting.notes || '');
  const [extractedActions, setExtractedActions] = useState(meeting.extractedActions || []);
  const [isExtracting, setIsExtracting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleExtractActions = () => {
    setIsExtracting(true);
    setTimeout(() => {
      const mockExtracted = [
        { task: 'Follow up with Dean regarding auditorium booking', owner: 'Priya', deadline: 'Tomorrow' },
        { task: 'Email revised tier 1 sponsor deck to CloudScale', owner: 'Rohan', deadline: 'Friday' },
        { task: 'Test live registration flow with dummy responses', owner: 'Amit', deadline: 'Monday' },
        { task: 'Design 3 promotional banners for social media', owner: 'Neha', deadline: 'Tuesday' },
      ];
      setExtractedActions(mockExtracted);
      setIsExtracting(false);
    }, 600);
  };

  const handleSaveNotes = () => {
    setMeetings(
      meetings.map((m) =>
        m.id === meeting.id
          ? { ...m, notes, notesStatus: 'Ready', actionItemCount: extractedActions.length }
          : m
      )
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCreateTaskFromAction = (action) => {
    if (onCreateTask) {
      onCreateTask({
        id: Date.now(),
        title: action.task,
        owner: action.owner,
        priority: 'High',
        status: 'Todo',
        deadline: action.deadline,
        event: 'TechNova Hackathon 2026',
        description: `Extracted from meeting "${meeting.title}" notes.`
      });
      alert(`Task "${action.task}" added to your Tasks board!`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate('/meetings')}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to all meetings
      </button>

      {/* Header Info Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={meeting.notesStatus === 'Ready' ? 'Completed' : 'Upcoming'} size="sm">
                Notes: {meeting.notesStatus || 'Ready'}
              </Badge>
              <span className="text-xs text-slate-400 font-medium">Core Session</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {meeting.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span>{meeting.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span>{meeting.time}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span>{meeting.participants} Participants</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Save}
              onClick={handleSaveNotes}
            >
              {savedSuccess ? 'Saved!' : 'Save Notes'}
            </Button>
          </div>
        </div>

        {/* Agenda */}
        <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <span className="font-bold text-slate-800 block mb-1 uppercase tracking-wider text-[10px]">
            Meeting Agenda
          </span>
          <p className="text-slate-600 leading-relaxed">{meeting.agenda}</p>
        </div>
      </Card>

      {/* Meeting Notes and AI Extraction Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes Editor */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Meeting Notes
            </h3>
            <span className="text-xs text-slate-400">Collaborative scratchpad</span>
          </div>

          <textarea
            rows="10"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type meeting notes, key discussion points, or paste transcript here..."
            className="w-full rounded-xl border border-slate-300 p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ai"
              icon={Sparkles}
              size="md"
              disabled={isExtracting}
              onClick={handleExtractActions}
              className="w-full sm:w-auto"
            >
              {isExtracting ? 'Analyzing Notes...' : '✨ Extract Action Items'}
            </Button>
          </div>
        </Card>

        {/* Extracted Action Items */}
        <Card className="p-6 space-y-4 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-md bg-indigo-600 text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Extracted Action Items ({extractedActions.length})
              </h3>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              AI Powered
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Tasks automatically recognized from discussion notes with detected owners and deadlines.
          </p>

          {extractedActions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-white text-xs text-slate-400">
              Click <strong>"✨ Extract Action Items"</strong> to parse tasks and owners from your notes.
            </div>
          ) : (
            <div className="space-y-3">
              {extractedActions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900">{action.task}</p>
                    <div className="mt-1 flex items-center space-x-3 text-[11px] text-slate-500">
                      <span className="font-semibold text-brand-600">Owner: {action.owner}</span>
                      <span>•</span>
                      <span>Due: {action.deadline}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    icon={Plus}
                    onClick={() => handleCreateTaskFromAction(action)}
                    className="shrink-0 text-xs"
                  >
                    Add Task
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
