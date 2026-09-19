import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Task must belong to an event'],
  },
  owner: {
    type: String,
    trim: true,
    default: 'Unassigned',
  },
  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High', 'Urgent'],
      message: '{VALUE} is not a valid priority',
    },
    default: 'Medium',
  },
  status: {
    type: String,
    enum: {
      values: ['To Do', 'In Progress', 'Completed', 'Overdue'],
      message: '{VALUE} is not a valid status',
    },
    default: 'To Do',
  },
  deadline: {
    type: String,
    trim: true,
    default: '',
  },
  department: {
    type: String,
    trim: true,
    default: 'General',
  },
  dependencies: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index tasks by eventId for fast queries
taskSchema.index({ eventId: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
