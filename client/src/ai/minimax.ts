import { Chess } from 'chess.js'

const PIECE_VALUE: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 }

const PST: Record<string, number[]> = {
  p: [
    0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10,
    5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5,
    5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40,
    -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30,
    -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30,
    -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10,
    -10,0,10,10,10,10,0,-10, -10,5,5,10,10,5,5,-10,
    -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10,
    -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
    0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5,
    -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
    -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
    -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0,
  ],
  q: [
    -20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10,
    -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5,
    0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10,
    -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10,
    20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20,
  ],
}

function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -99999 : 99999
  if (chess.isDraw() || chess.isStalemate()) return 0

  let score = 0
  const board = chess.board()
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece) continue
      const val = PIECE_VALUE[piece.type] || 0
      const idx = piece.color === 'w' ? row * 8 + col : (7 - row) * 8 + col
      const pos = PST[piece.type]?.[idx] || 0
      score += piece.color === 'w' ? val + pos : -(val + pos)
    }
  }
  return score
}

function minimax(chess: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): { score: number; move: string | null } {
  if (depth === 0 || chess.isGameOver()) return { score: evaluateBoard(chess), move: null }

  const moves = chess.moves()
  moves.sort((a, b) => {
    const sc = (m: string) => (m.includes('x') ? 2 : 0) + (m.includes('+') ? 1 : 0)
    return sc(b) - sc(a)
  })

  let bestMove = moves[0] || null

  if (maximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      chess.move(move)
      const { score } = minimax(chess, depth - 1, alpha, beta, false)
      chess.undo()
      if (score > maxEval) { maxEval = score; bestMove = move }
      alpha = Math.max(alpha, score)
      if (beta <= alpha) break
    }
    return { score: maxEval, move: bestMove }
  } else {
    let minEval = Infinity
    for (const move of moves) {
      chess.move(move)
      const { score } = minimax(chess, depth - 1, alpha, beta, true)
      chess.undo()
      if (score < minEval) { minEval = score; bestMove = move }
      beta = Math.min(beta, score)
      if (beta <= alpha) break
    }
    return { score: minEval, move: bestMove }
  }
}

export function computeBestMove(chess: Chess, level = 2): string | null {
  const depth = ({ 1: 1, 2: 2, 3: 3, 4: 4 } as Record<number, number>)[level] || 2
  const copy = new Chess(chess.fen())

  // For very low-level bots, occasionally make random moves (simulates blunders)
  if (level <= 1 && Math.random() < 0.3) {
    const moves = copy.moves()
    if (moves.length > 0) return moves[Math.floor(Math.random() * moves.length)]
  }

  const result = minimax(copy, depth, -Infinity, Infinity, copy.turn() === 'w')
  return result.move
}

