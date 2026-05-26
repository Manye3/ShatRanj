const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getProfile, getGameHistory, getLeaderboard } = require('../controllers/userController');

router.get('/leaderboard', getLeaderboard);
router.get('/:username', getProfile);
router.get('/:username/games', getGameHistory);

module.exports = router;
