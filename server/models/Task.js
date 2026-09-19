import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
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
    assignee: {
      type: String,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

// Synchronize owner and assignee
taskSchema.pre('save', function () {
  if (!this.assignee && this.owner) {
    this.assignee = this.owner;
  }
  if (!this.owner && this.assignee) {
    this.owner = this.assignee;
  }
});

// Index tasks by eventId for fast scoped queries
taskSchema.index({ eventId: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
