const { Chess } = require('chess.js');
const { computeBestMove } = require('../utils/minimax');

async function suggestMove(req, res) {
  try {
    const { fen, level } = req.body;
    if (!fen) return res.status(400).json({ error: 'FEN string required' });

    const chess = new Chess(fen);
    if (chess.isGameOver()) {
      return res.status(400).json({ error: 'Game is already over' });
    }

    const move = computeBestMove(chess, level || 2);
    if (!move) {
      return res.status(400).json({ error: 'No legal moves available' });
    }

    return res.json({ move, fen: chess.fen() });
  } catch (err) {
    console.error('AI error:', err);
    return res.status(500).json({ error: 'Failed to compute move' });
  }
}

// PHASE 2: POST /api/ai/summary — AI-generated post-match analysis

module.exports = { suggestMove };
