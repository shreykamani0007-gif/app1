import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Volunteer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Volunteer email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      trim: true,
      default: 'Volunteer',
    },
    team: {
      type: String,
      trim: true,
      default: 'General',
    },
    shift: {
      type: String,
      trim: true,
      default: 'Flexible',
    },
    availability: {
      type: String,
      trim: true,
      default: 'Full Day',
    },
    status: {
      type: String,
      enum: {
        values: ['confirmed', 'active', 'todo'],
        message: '{VALUE} is not a valid volunteer status',
      },
      default: 'active',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Volunteer must belong to an event'],
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize shift and availability
volunteerSchema.pre('save', function () {
  if (!this.availability && this.shift) {
    this.availability = this.shift;
  }
  if (!this.shift && this.availability) {
    this.shift = this.availability;
  }
});

volunteerSchema.index({ eventId: 1, createdAt: -1 });

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

export default Volunteer;
