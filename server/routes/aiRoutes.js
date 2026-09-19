import express from 'express';
import { handleAiChat, getAiStatus } from '../controllers/aiController.js';

const router = express.Router();

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with ClubOps AI copilot with active event context
 * @access  Public
 */
router.post('/chat', handleAiChat);

/**
 * @route   GET /api/ai/status
 * @desc    Get AI backend configuration status
 * @access  Public
 */
router.get('/status', getAiStatus);

export default router;
