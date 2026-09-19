import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
} from '../controllers/userController.js';

const router = express.Router();

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser);

export default router;
