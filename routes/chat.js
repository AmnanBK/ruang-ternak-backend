const express = require('express');
const router = express.Router();

const {
  sendMessage,
  getConversation,
  getConversationsList
} = require('../controllers/chatController');

const authMiddleware = require('../middleware/authMiddleware');

router.get('/conversations', authMiddleware, getConversationsList);

router.post('/:recipient_id', authMiddleware, sendMessage);

router.get('/:recipient_id', authMiddleware, getConversation);

module.exports = router;
