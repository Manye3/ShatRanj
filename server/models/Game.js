const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  white: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  black: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  result: {
    type: String,
    enum: ['white_win', 'black_win', 'draw', 'in_progress'],
    default: 'in_progress',
  },
  termination: {
    type: String,
    enum: [
      'checkmate', 'resignation', 'timeout', 'stalemate',
      'draw_agreement', 'insufficient_material', 'threefold_repetition',
      'fifty_move_rule', 'abandonment',
    ],
  },
  pgn: { type: String, default: '' },
  timeControl: { type: String, required: true },
  moves: { type: Number, default: 0 },
  whiteRatingDelta: { type: Number, default: 0 },
  blackRatingDelta: { type: Number, default: 0 },
  // Phase 2: AI-generated post-match summary
  aiSummary: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Index for fast queries on player game history
GameSchema.index({ 'white.userId': 1, createdAt: -1 });
GameSchema.index({ 'black.userId': 1, createdAt: -1 });

module.exports = mongoose.model('Game', GameSchema);
