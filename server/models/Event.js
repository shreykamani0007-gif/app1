import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
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
  location: {
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
