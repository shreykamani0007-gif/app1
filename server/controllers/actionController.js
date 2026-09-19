import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Task from '../models/Task.js';
import Risk from '../models/Risk.js';
import Meeting from '../models/Meeting.js';
import Announcement from '../models/Announcement.js';
import { inMemoryEvents } from './eventController.js';
import { inMemoryTasks } from './taskController.js';
import { inMemoryRisks } from './riskController.js';
import { inMemoryMeetings } from './meetingController.js';
import { inMemoryAnnouncements } from './announcementController.js';

// Allowed AI action types whitelist
const ALLOWED_ACTION_TYPES = [
  'CREATE_TASK',
  'UPDATE_TASK',
  'ASSIGN_TASK',
  'CREATE_RISK',
  'CREATE_MEETING',
  'DRAFT_ANNOUNCEMENT',
];

/**
 * Resolve and validate event exists
 */
async function resolveEvent(eventId) {
  if (!eventId) return null;

  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(eventId)) {
    try {
      const dbEvent = await Event.findById(eventId);
      if (dbEvent) return dbEvent;
    } catch {
      // Fall through to memory
    }
  }

  const memEvent = inMemoryEvents.find(
    (e) => String(e._id) === String(eventId) || e.name === eventId
  );
  return memEvent || null;
}

/**
 * @desc    Execute confirmed AI action
 * @route   POST /api/ai/execute-action
 * @access  Private (auth required)
 */
export const executeAction = async (req, res, next) => {
  try {
    const { type, eventId, payload } = req.body || {};

    if (!type || !ALLOWED_ACTION_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid or unsupported action type: "${type}". Supported actions: ${ALLOWED_ACTION_TYPES.join(', ')}`,
      });
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Action payload is required and must be an object',
      });
    }

    // Verify active event
    const event = await resolveEvent(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Active event with ID "${eventId}" not found. Action must belong to a valid event.`,
      });
    }

    const resolvedEventId = event._id;
    const authorName = req.user?.name || 'Club Organizer';

    // 1. CREATE_TASK
    if (type === 'CREATE_TASK') {
      const { title, description, priority, status, deadline, department, owner, assignee } = payload;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Task title is required',
        });
      }

      // Normalize priority
      const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
      const normalizedPriority = validPriorities.find(
        (p) => p.toLowerCase() === String(priority || '').toLowerCase()
      ) || 'Medium';

      // Normalize status
      const validStatuses = ['To Do', 'In Progress', 'Completed', 'Overdue'];
      const normalizedStatus = validStatuses.find(
        (s) => s.toLowerCase() === String(status || '').toLowerCase()
      ) || 'To Do';

      const taskData = {
        eventId: resolvedEventId,
        title: title.trim(),
        description: description ? description.trim() : '',
        priority: normalizedPriority,
        status: normalizedStatus,
        deadline: deadline ? deadline.trim() : '',
        department: department ? department.trim() : 'General',
        owner: owner ? owner.trim() : assignee ? assignee.trim() : 'Unassigned',
        assignee: assignee ? assignee.trim() : owner ? owner.trim() : 'Unassigned',
      };

      let createdTask = null;
      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(resolvedEventId)) {
        createdTask = await Task.create(taskData);
      } else {
        const memTask = {
          _id: `task_${Date.now()}`,
          ...taskData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryTasks.push(memTask);
        createdTask = memTask;
      }

      return res.status(201).json({
        success: true,
        message: `Task "${createdTask.title}" created successfully.`,
        actionType: type,
        data: createdTask,
      });
    }

    // 2. ASSIGN_TASK
    if (type === 'ASSIGN_TASK') {
      const { taskId, taskTitle, assignee, owner } = payload;
      const assignedTo = (assignee || owner || '').trim();

      if (!assignedTo) {
        return res.status(400).json({
          success: false,
          message: 'Assignee name is required to assign a task',
        });
      }

      let task = null;

      // Try finding by taskId first
      if (taskId && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(taskId)) {
        task = await Task.findOne({ _id: taskId, eventId: resolvedEventId });
      }

      // If not found by ID, search by title in the active event
      if (!task) {
        const searchTitle = (taskTitle || payload.title || '').trim();
        if (searchTitle) {
          if (mongoose.connection.readyState === 1) {
            task = await Task.findOne({
              eventId: resolvedEventId,
              title: { $regex: new RegExp(searchTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
            });
          }
          if (!task) {
            task = inMemoryTasks.find(
              (t) =>
                String(t.eventId) === String(resolvedEventId) &&
                t.title.toLowerCase().includes(searchTitle.toLowerCase())
            );
          }
        }
      }

      if (!task) {
        // Find most recent task in event as fallback if user says "Assign the registration task"
        if (mongoose.connection.readyState === 1) {
          task = await Task.findOne({
            eventId: resolvedEventId,
            title: { $regex: /registration|volunteer|task/i },
          });
        }
        if (!task) {
          task = inMemoryTasks.find(
            (t) =>
              String(t.eventId) === String(resolvedEventId) &&
              /registration|volunteer|task/i.test(t.title)
          );
        }
      }

      if (!task) {
        return res.status(404).json({
          success: false,
          message: `Could not find a matching task to assign in ${event.name}.`,
        });
      }

      if (task.save) {
        task.owner = assignedTo;
        task.assignee = assignedTo;
        if (task.status === 'To Do') task.status = 'In Progress';
        await task.save();
      } else {
        task.owner = assignedTo;
        task.assignee = assignedTo;
        if (task.status === 'To Do') task.status = 'In Progress';
      }

      return res.status(200).json({
        success: true,
        message: `Task "${task.title}" assigned to ${assignedTo} successfully.`,
        actionType: type,
        data: task,
      });
    }

    // 3. UPDATE_TASK
    if (type === 'UPDATE_TASK') {
      const { taskId, title, priority, status, deadline, department, owner, assignee } = payload;

      let task = null;
      if (taskId && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(taskId)) {
        task = await Task.findOne({ _id: taskId, eventId: resolvedEventId });
      }

      if (!task && (payload.searchTitle || title)) {
        const sTitle = payload.searchTitle || title;
        if (mongoose.connection.readyState === 1) {
          task = await Task.findOne({
            eventId: resolvedEventId,
            title: { $regex: new RegExp(sTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
          });
        }
        if (!task) {
          task = inMemoryTasks.find(
            (t) =>
              String(t.eventId) === String(resolvedEventId) &&
              t.title.toLowerCase().includes(sTitle.toLowerCase())
          );
        }
      }

      if (!task) {
        return res.status(404).json({
          success: false,
          message: `Task not found in active event ${event.name}`,
        });
      }

      if (title) task.title = title.trim();
      if (priority) {
        const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
        const matched = validPriorities.find((p) => p.toLowerCase() === String(priority).toLowerCase());
        if (matched) task.priority = matched;
      }
      if (status) {
        const validStatuses = ['To Do', 'In Progress', 'Completed', 'Overdue'];
        const matched = validStatuses.find((s) => s.toLowerCase() === String(status).toLowerCase());
        if (matched) task.status = matched;
      }
      if (deadline !== undefined) task.deadline = deadline;
      if (department !== undefined) task.department = department;
      if (owner || assignee) {
        task.owner = owner || assignee;
        task.assignee = assignee || owner;
      }

      if (task.save) {
        await task.save();
      }

      return res.status(200).json({
        success: true,
        message: `Task "${task.title}" updated successfully.`,
        actionType: type,
        data: task,
      });
    }

    // 4. CREATE_RISK
    if (type === 'CREATE_RISK') {
      const { title, description, severity, probability, category, owner, mitigation, impact } = payload;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Risk title is required',
        });
      }

      const validSeverities = ['low', 'medium', 'high', 'critical', 'urgent'];
      const normalizedSeverity = validSeverities.find(
        (s) => s.toLowerCase() === String(severity || '').toLowerCase()
      ) || 'medium';

      const validProbabilities = ['low', 'medium', 'high'];
      const normalizedProbability = validProbabilities.find(
        (p) => p.toLowerCase() === String(probability || '').toLowerCase()
      ) || 'medium';

      const riskData = {
        eventId: resolvedEventId,
        title: title.trim(),
        description: description ? description.trim() : '',
        severity: normalizedSeverity,
        probability: normalizedProbability,
        status: 'open',
        category: category ? category.trim() : 'Operational',
        owner: owner ? owner.trim() : 'Risk Officer',
        mitigation: mitigation ? mitigation.trim() : '',
        impact: impact ? impact.trim() : 'Medium',
      };

      let createdRisk = null;
      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(resolvedEventId)) {
        createdRisk = await Risk.create(riskData);
      } else {
        const memRisk = {
          _id: `risk_${Date.now()}`,
          ...riskData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryRisks.push(memRisk);
        createdRisk = memRisk;
      }

      return res.status(201).json({
        success: true,
        message: `Risk "${createdRisk.title}" logged successfully.`,
        actionType: type,
        data: createdRisk,
      });
    }

    // 5. CREATE_MEETING
    if (type === 'CREATE_MEETING') {
      const { title, date, startTime, endTime, meetingType, location, agenda, organizer, participants } = payload;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Meeting title is required',
        });
      }

      // Default date to tomorrow if not specified
      let meetingDate = date ? String(date).trim() : '';
      if (!meetingDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        meetingDate = tomorrow.toISOString().split('T')[0];
      }

      const meetingStartTime = startTime ? String(startTime).trim() : '05:00 PM';
      const meetingEndTime = endTime ? String(endTime).trim() : '06:00 PM';

      const validMeetingTypes = ['In-person', 'Online', 'Hybrid'];
      const normalizedType = validMeetingTypes.find(
        (t) => t.toLowerCase() === String(meetingType || '').toLowerCase()
      ) || 'In-person';

      const meetingData = {
        eventId: resolvedEventId,
        title: title.trim(),
        date: meetingDate,
        startTime: meetingStartTime,
        endTime: meetingEndTime,
        meetingType: normalizedType,
        location: location ? location.trim() : 'Main Conference Room',
        organizer: organizer ? organizer.trim() : authorName,
        agenda: agenda ? agenda.trim() : '',
        participants: Array.isArray(participants) && participants.length > 0
          ? participants
          : [{ name: authorName, role: 'Organizer', email: req.user?.email || '' }],
      };

      let createdMeeting = null;
      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(resolvedEventId)) {
        createdMeeting = await Meeting.create(meetingData);
      } else {
        const memMeeting = {
          _id: `meet_${Date.now()}`,
          ...meetingData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryMeetings.push(memMeeting);
        createdMeeting = memMeeting;
      }

      return res.status(201).json({
        success: true,
        message: `Meeting "${createdMeeting.title}" scheduled for ${createdMeeting.date} at ${createdMeeting.startTime} successfully.`,
        actionType: type,
        data: createdMeeting,
      });
    }

    // 6. DRAFT_ANNOUNCEMENT
    if (type === 'DRAFT_ANNOUNCEMENT') {
      const { title, body, content, audience, author } = payload;

      const announcementContent = (body || content || '').trim();
      if (!announcementContent) {
        return res.status(400).json({
          success: false,
          message: 'Announcement content is required',
        });
      }

      const announcementTitle = (title || 'Volunteer Notice').trim();

      // STRICT REQUIREMENT: Must be Draft only! Never auto-publish!
      const announcementData = {
        eventId: resolvedEventId,
        title: announcementTitle,
        body: announcementContent,
        content: announcementContent,
        audience: audience ? audience.trim() : 'All Volunteers',
        author: author ? author.trim() : authorName,
        createdBy: authorName,
        status: 'Draft', // strictly Draft
      };

      let createdAnnouncement = null;
      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(resolvedEventId)) {
        createdAnnouncement = await Announcement.create(announcementData);
      } else {
        const memAnnouncement = {
          _id: `ann_${Date.now()}`,
          ...announcementData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryAnnouncements.push(memAnnouncement);
        createdAnnouncement = memAnnouncement;
      }

      return res.status(201).json({
        success: true,
        message: `Announcement draft "${createdAnnouncement.title}" saved successfully as Draft.`,
        actionType: type,
        data: createdAnnouncement,
      });
    }

    return res.status(400).json({
      success: false,
      message: `Unhandled action type: ${type}`,
    });
  } catch (error) {
    next(error);
  }
};
