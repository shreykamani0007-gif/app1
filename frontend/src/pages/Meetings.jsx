import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckSquare,
  ArrowRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

export default function Meetings({ meetings, setMeetings }) {
  const navigate = useNavigate();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: 'Today',
    time: '5:00 PM',
    participants: '6',
    agenda: '',
  });

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!newMeeting.title) return;

    setMeetings([
      ...meetings,
      {
        id: Date.now(),
        title: newMeeting.title,
        date: newMeeting.date,
        time: newMeeting.time,
        participants: parseInt(newMeeting.participants) || 4,
        agenda: newMeeting.agenda || 'General alignment and planning.',
        notesStatus: 'Draft',
        actionItemCount: 0,
        notes: `Meeting notes for ${newMeeting.title}:\n- Initial discussion pending.`,
        extractedActions: []
      }
    ]);

    setNewMeeting({
      title: '',
      date: 'Today',
      time: '5:00 PM',
      participants: '6',
      agenda: '',
    });
    setIsScheduleModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Meetings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Plan meetings, take collaborative notes, and automatically extract action items.
          </p>
        </div>
        <Button
          onClick={() => setIsScheduleModalOpen(true)}
          icon={Plus}
          size="md"
        >
          Schedule Meeting
        </Button>
      </div>

      {/* Meeting Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {meetings.map((meeting) => (
          <Card
            key={meeting.id}
            hover
            onClick={() => navigate(`/meetings/${meeting.id}`)}
            className="flex flex-col justify-between p-5 group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <Badge
                  variant={meeting.notesStatus === 'Ready' ? 'Completed' : 'Upcoming'}
                  size="sm"
                >
                  Notes: {meeting.notesStatus}
                </Badge>
                <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  <CheckSquare className="w-3 h-3 mr-1 text-slate-400" />
                  {meeting.actionItemCount} actions
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                {meeting.title}
              </h3>

              <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500">
                <div className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>{meeting.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>{meeting.time}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>{meeting.participants}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                <span className="font-semibold text-slate-700 block mb-1">Agenda</span>
                <p className="line-clamp-2 leading-relaxed">{meeting.agenda}</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-200"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/meetings/${meeting.id}`);
                }}
              >
                <span>View Meeting & Notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule New Meeting"
      >
        <form onSubmit={handleSchedule} className="space-y-4">
          <Input
            label="Meeting Title"
            id="meetingTitle"
            required
            placeholder="e.g. Venue Planning Meeting"
            value={newMeeting.title}
            onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Date"
              id="meetingDate"
              placeholder="e.g. Tomorrow or 25 Sept"
              value={newMeeting.date}
              onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
            />
            <Input
              label="Time"
              id="meetingTime"
              placeholder="e.g. 5:00 PM"
              value={newMeeting.time}
              onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
            />
          </div>

          <Input
            label="Expected Participants"
            id="meetingParticipants"
            type="number"
            placeholder="e.g. 6"
            value={newMeeting.participants}
            onChange={(e) => setNewMeeting({ ...newMeeting, participants: e.target.value })}
          />

          <div>
            <label htmlFor="meetingAgenda" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Agenda
            </label>
            <textarea
              id="meetingAgenda"
              rows="3"
              placeholder="Key discussion topics and objectives..."
              value={newMeeting.agenda}
              onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Schedule Meeting
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
