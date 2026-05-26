const { Chess } = require('chess.js');

// ── Piece-square tables (centipawn bonuses for piece positioning) ──
// Encourages good piece placement: knights in center, pawns advancing, etc.
const PST = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
};

const PIECE_VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

/**
 * Evaluate board position from white's perspective.
 * Combines material count with positional piece-square table bonuses.
 */
function evaluateBoard(chess) {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw() || chess.isStalemate()) return 0;

  const board = chess.board();
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const value = PIECE_VALUE[piece.type] || 0;
      const pstIndex = piece.color === 'w' ? row * 8 + col : (7 - row) * 8 + col;
      const positional = PST[piece.type]?.[pstIndex] || 0;

      if (piece.color === 'w') {
        score += value + positional;
      } else {
        score -= value + positional;
      }
    }
  }

  return score;
}

/**
 * Minimax with alpha-beta pruning.
 * Returns { score, move } where move is the best SAN move found.
 */
function minimax(chess, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || chess.isGameOver()) {
    return { score: evaluateBoard(chess) };
  }

  const moves = chess.moves();
  // Move ordering: captures and checks first for better pruning
  moves.sort((a, b) => {
    const aCapture = a.includes('x') ? 1 : 0;
    const bCapture = b.includes('x') ? 1 : 0;
    const aCheck = a.includes('+') ? 1 : 0;
    const bCheck = b.includes('+') ? 1 : 0;
    return (bCapture + bCheck) - (aCapture + aCheck);
  });

  let bestMove = moves[0] || null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const result = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      if (result.score > maxEval) {
        maxEval = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, result.score);
      if (beta <= alpha) break; // Beta cutoff
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const result = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      if (result.score < minEval) {
        minEval = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, result.score);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return { score: minEval, move: bestMove };
  }
}

/**
 * Compute the best move for the current position.
 * Level 1 = depth 1 (easy), Level 2 = depth 2, Level 3 = depth 3 (hard)
 */
function computeBestMove(chess, level = 2) {
  const depthMap = { 1: 1, 2: 2, 3: 3 };
  const depth = depthMap[level] || 2;
  const copy = new Chess(chess.fen());
  const isMaximizing = copy.turn() === 'w';
  const result = minimax(copy, depth, -Infinity, Infinity, isMaximizing);
  return result.move;
}

module.exports = { computeBestMove, evaluateBoard };
