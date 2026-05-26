const express = require('express');
const router = express.Router();
const { getGame } = require('../controllers/gameController');

router.get('/:id', getGame);

module.exports = router;
