import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import taskRoutes from './taskRoutes.js';
import meetingRoutes from './meetingRoutes.js';
import volunteerRoutes from './volunteerRoutes.js';
import documentRoutes from './documentRoutes.js';
import riskRoutes from './riskRoutes.js';
import announcementRoutes from './announcementRoutes.js';

const router = express.Router();

// Re-route into sub-resource routers
router.use('/:eventId/tasks', taskRoutes);
router.use('/:eventId/meetings', meetingRoutes);
router.use('/:eventId/volunteers', volunteerRoutes);
router.use('/:eventId/documents', documentRoutes);
router.use('/:eventId/risks', riskRoutes);
router.use('/:eventId/announcements', announcementRoutes);

router.route('/')
  .get(getEvents)
  .post(createEvent);

router.route('/:id')
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

export default router;
