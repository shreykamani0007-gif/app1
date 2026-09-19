import express from 'express';
import {
  getAnnouncementsByEvent,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getAnnouncementsByEvent)
  .post(createAnnouncement);

router.route('/:announcementId')
  .get(getAnnouncement)
  .put(updateAnnouncement)
  .patch(updateAnnouncement)
  .delete(deleteAnnouncement);

export default router;
