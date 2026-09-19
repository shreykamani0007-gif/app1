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

const router = express.Router();

// Re-route into task and meeting routers
router.use('/:eventId/tasks', taskRoutes);
router.use('/:eventId/meetings', meetingRoutes);

router.route('/')
  .get(getEvents)
  .post(createEvent);

router.route('/:id')
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

export default router;
