import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    venue: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['Planning', 'Ongoing', 'Completed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Planning',
    },
    expectedAttendees: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to synchronize location/venue and date/startDate
eventSchema.pre('save', function () {
  if (!this.venue && this.location) {
    this.venue = this.location;
  }
  if (!this.location && this.venue) {
    this.location = this.venue;
  }
  if (!this.startDate && this.date) {
    this.startDate = this.date;
  }
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
