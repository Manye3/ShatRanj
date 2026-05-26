const Game = require('../models/Game');

async function getGame(req, res) {
  try {
    const game = await Game.findById(req.params.id).lean();
    if (!game) return res.status(404).json({ message: 'Game not found' });
    return res.json(game);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getGame };
