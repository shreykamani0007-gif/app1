import express from 'express';
import {
  getRisksByEvent,
  getRisk,
  createRisk,
  updateRisk,
  deleteRisk,
} from '../controllers/riskController.js';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getRisksByEvent)
  .post(createRisk);

router.route('/:riskId')
  .get(getRisk)
  .put(updateRisk)
  .patch(updateRisk)
  .delete(deleteRisk);

export default router;
