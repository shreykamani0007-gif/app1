import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    size: {
      type: String,
      trim: true,
      default: '1.2 MB',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    fileUrl: {
      type: String,
      trim: true,
      default: '',
    },
    uploadedBy: {
      type: String,
      trim: true,
      default: 'Event Lead',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Document must belong to an event'],
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.pre('save', function () {
  if (!this.title && this.name) {
    this.title = this.name;
  }
  if (!this.name && this.title) {
    this.name = this.title;
  }
});

documentSchema.index({ eventId: 1, createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
