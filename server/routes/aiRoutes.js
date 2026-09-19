import express from 'express';
import { handleAiChat, getAiStatus } from '../controllers/aiController.js';
import { executeAction } from '../controllers/actionController.js';
import { protect } from '../middleware/authMiddleware.js';

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

/**
 * @route   POST /api/ai/execute-action
 * @desc    Execute confirmed AI action in MongoDB
 * @access  Private
 */
router.post('/execute-action', protect, executeAction);

export default router;
