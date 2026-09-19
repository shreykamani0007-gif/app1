import express from 'express';
import {
  getTasksByEvent,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

// Router configured with mergeParams: true to inherit :eventId from parent router
const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getTasksByEvent)
  .post(createTask);

router.route('/:taskId')
  .put(updateTask)
  .delete(deleteTask);

export default router;
