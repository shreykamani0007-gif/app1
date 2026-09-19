import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Announcement content is required'],
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    audience: {
      type: String,
      trim: true,
      default: 'All Volunteers',
    },
    author: {
      type: String,
      trim: true,
      default: 'Event Lead',
    },
    createdBy: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Draft', 'Sent', 'Scheduled'],
        message: '{VALUE} is not a valid announcement status',
      },
      default: 'Sent',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Announcement must belong to an event'],
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.pre('save', function () {
  if (!this.content && this.body) {
    this.content = this.body;
  }
  if (!this.body && this.content) {
    this.body = this.content;
  }
  if (!this.createdBy && this.author) {
    this.createdBy = this.author;
  }
  if (!this.author && this.createdBy) {
    this.author = this.createdBy;
  }
});

announcementSchema.index({ eventId: 1, createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
