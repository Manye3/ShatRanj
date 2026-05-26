const express = require('express');
const router = express.Router();
const { suggestMove, getPersonalities, getPersonalityChat, explainMove } = require('../controllers/aiController');

// Existing: Compute AI move (Minimax engine)
router.post('/move', suggestMove);

// Phase 2: Bot personality endpoints
router.get('/personalities', getPersonalities);
router.post('/personality/chat', getPersonalityChat);

// Phase 2: RAG-powered coaching (add ?agent=true for agent mode)
router.post('/coach/explain', explainMove);

module.exports = router;
