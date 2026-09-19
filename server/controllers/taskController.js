import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Event from '../models/Event.js';

// In-memory fallback tasks linked to specific events
export let inMemoryTasks = [
  // InnovateX Fest 2026 tasks
  {
    _id: 'task_inno_1',
    eventId: 'evt_innovatex_2026',
    title: 'Confirm guest speaker travel reimbursement',
    description: 'Process flights and hotel invoices for 3 keynote speakers.',
    owner: 'David K.',
    department: 'Finance',
    priority: 'Urgent',
    status: 'In Progress',
    deadline: 'Tomorrow, 5:00 PM',
    dependencies: 'Dean Signature',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: 'task_inno_2',
    eventId: 'evt_innovatex_2026',
    title: 'Prepare Wi-Fi credentials signage for Block C',
    description: 'Print QR code stands for participant wireless credentials.',
    owner: 'Tech Team',
    department: 'Tech Ops',
    priority: 'High',
    status: 'In Progress',
    deadline: 'Sep 22, 2:00 PM',
    dependencies: 'Network credentials from IT',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    _id: 'task_inno_3',
    eventId: 'evt_innovatex_2026',
    title: 'Finalize lunch coupons with university dining hall',
    description: 'Agree on meal packet count and dietary requirements.',
    owner: 'Alex C.',
    department: 'Logistics',
    priority: 'Medium',
    status: 'To Do',
    deadline: 'Sep 27, 4:00 PM',
    dependencies: 'Attendee registration list',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    _id: 'task_inno_4',
    eventId: 'evt_innovatex_2026',
    title: 'Collect participant waiver forms digitally',
    description: 'Send electronic consent forms to all 250 confirmed teams.',
    owner: 'Priya R.',
    department: 'Registration',
    priority: 'Medium',
    status: 'Completed',
    deadline: 'Completed',
    dependencies: 'None',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },

  // TechFest 2026 tasks
  {
    _id: 'task_tech_1',
    eventId: 'evt_techfest_2026',
    title: 'Arrange venue and auditorium soundcheck',
    description: 'Book main hall and test wireless lapels & mixer console.',
    owner: 'Marcus L.',
    department: 'Logistics',
    priority: 'High',
    status: 'In Progress',
    deadline: 'Oct 5, 10:00 AM',
    dependencies: 'Facility Manager Permission',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    _id: 'task_tech_2',
    eventId: 'evt_techfest_2026',
    title: 'Contact sponsors for title sponsorship deck',
    description: 'Reach out to top tier sponsors with brochure and contract.',
    owner: 'Sophia W.',
    department: 'Sponsorship',
    priority: 'Urgent',
    status: 'To Do',
    deadline: 'Oct 8, 6:00 PM',
    dependencies: 'Club budget sheet',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    _id: 'task_tech_3',
    eventId: 'evt_techfest_2026',
    title: 'Prepare posters and social media banners',
    description: 'Design digital teaser assets and print A3 posters.',
    owner: 'Design Club',
    department: 'Marketing',
    priority: 'Medium',
    status: 'Completed',
    deadline: 'Oct 1, 12:00 PM',
    dependencies: 'Event logo finalization',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

// @desc    Get all tasks belonging to an event
// @route   GET /api/events/:eventId/tasks
// @access  Public
export const getTasksByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
      const tasks = await Task.find({ eventId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    }

    // Fallback: In-memory store
    const tasks = inMemoryTasks.filter((t) => String(t.eventId) === String(eventId));
    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:taskId
// @access  Public
export const getTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(taskId)) {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: `Task not found with id of ${taskId}`,
        });
      }
      return res.status(200).json({
        success: true,
        data: task,
      });
    }

    // Fallback: In-memory store
    const task = inMemoryTasks.find((t) => String(t._id) === String(taskId));
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id of ${taskId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task for an event
// @route   POST /api/events/:eventId/tasks
// @access  Public
export const createTask = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { title, description, owner, priority, status, deadline, department, dependencies } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required in URL',
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
      const task = await Task.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        eventId,
        owner: owner ? owner.trim() : 'Unassigned',
        priority: priority || 'Medium',
        status: status || 'To Do',
        deadline: deadline ? deadline.trim() : '',
        department: department ? department.trim() : 'General',
        dependencies: dependencies ? dependencies.trim() : '',
      });

      return res.status(201).json({
        success: true,
        data: task,
      });
    }

    // Fallback: In-memory store
    const newTask = {
      _id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      eventId: String(eventId),
      title: title.trim(),
      description: description ? description.trim() : '',
      owner: owner ? owner.trim() : 'Unassigned',
      priority: priority || 'Medium',
      status: status || 'To Do',
      deadline: deadline ? deadline.trim() : '',
      department: department ? department.trim() : 'General',
      dependencies: dependencies ? dependencies.trim() : '',
      createdAt: new Date().toISOString(),
    };

    inMemoryTasks.unshift(newTask);

    return res.status(201).json({
      success: true,
      data: newTask,
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task by ID
// @route   PUT /api/tasks/:taskId
// @access  Public
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(taskId)) {
      // Exclude eventId from updates so task cannot be orphaned accidentally
      const updateData = { ...req.body };
      delete updateData.eventId;

      const task = await Task.findByIdAndUpdate(taskId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: `Task not found with id of ${taskId}`,
        });
      }

      return res.status(200).json({
        success: true,
        data: task,
      });
    }

    // Fallback: In-memory store
    const index = inMemoryTasks.findIndex((t) => String(t._id) === String(taskId));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id of ${taskId}`,
      });
    }

    const { eventId, ...allowedUpdates } = req.body;
    inMemoryTasks[index] = {
      ...inMemoryTasks[index],
      ...allowedUpdates,
    };

    return res.status(200).json({
      success: true,
      data: inMemoryTasks[index],
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task by ID
// @route   DELETE /api/tasks/:taskId
// @access  Public
export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(taskId)) {
      const task = await Task.findByIdAndDelete(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: `Task not found with id of ${taskId}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: {},
      });
    }

    // Fallback: In-memory store
    const index = inMemoryTasks.findIndex((t) => String(t._id) === String(taskId));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id of ${taskId}`,
      });
    }

    inMemoryTasks.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: {},
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};
