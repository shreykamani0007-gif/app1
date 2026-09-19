import express from 'express';
import {
  getVolunteersByEvent,
  getVolunteer,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
} from '../controllers/volunteerController.js';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getVolunteersByEvent)
  .post(createVolunteer);

router.route('/:volunteerId')
  .get(getVolunteer)
  .put(updateVolunteer)
  .patch(updateVolunteer)
  .delete(deleteVolunteer);

export default router;
