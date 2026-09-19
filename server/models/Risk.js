import mongoose from 'mongoose';

const riskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Risk title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical', 'urgent'],
        message: '{VALUE} is not a valid severity level',
      },
      default: 'medium',
    },
    probability: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid probability level',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'resolved', 'monitoring'],
        message: '{VALUE} is not a valid risk status',
      },
      default: 'open',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    owner: {
      type: String,
      trim: true,
      default: 'Risk Officer',
    },
    mitigation: {
      type: String,
      trim: true,
      default: '',
    },
    impact: {
      type: String,
      trim: true,
      default: 'Medium',
    },
    dueDate: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Risk must belong to an event'],
    },
  },
  {
    timestamps: true,
  }
);

riskSchema.index({ eventId: 1, createdAt: -1 });

const Risk = mongoose.model('Risk', riskSchema);

export default Risk;
