import express from 'express';
import {
  getMeetingsByEvent,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from '../controllers/meetingController.js';

// Router configured with mergeParams: true to inherit :eventId
const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getMeetingsByEvent)
  .post(createMeeting);

router.route('/:meetingId')
  .get(getMeeting)
  .put(updateMeeting)
  .delete(deleteMeeting);

export default router;
