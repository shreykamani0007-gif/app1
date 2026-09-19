import express from 'express';
import {
  getTasksByEvent,
  getTask,
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
  .get(getTask)
  .put(updateTask)
  .patch(updateTask)
  .delete(deleteTask);

export default router;
