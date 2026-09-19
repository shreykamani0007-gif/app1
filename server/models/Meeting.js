import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Meeting must belong to an event'],
    },
    date: {
      type: String,
      required: [true, 'Meeting date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    meetingType: {
      type: String,
      enum: ['In-person', 'Online', 'Hybrid'],
      default: 'In-person',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    organizer: {
      type: String,
      trim: true,
      default: 'Event Lead',
    },
    participants: [
      {
        id: { type: String },
        name: { type: String, required: true },
        role: { type: String, default: 'Member' },
        team: { type: String, default: 'General' },
        email: { type: String, default: '' },
        status: { type: String, default: 'Expected' },
      },
    ],
    agenda: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  {
    timestamps: true,
  }
);

meetingSchema.index({ eventId: 1, date: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
