const express = require('express');
const router = express.Router();
const { suggestMove } = require('../controllers/aiController');

router.post('/move', suggestMove);

// PHASE 2: POST /api/ai/summary

module.exports = router;
