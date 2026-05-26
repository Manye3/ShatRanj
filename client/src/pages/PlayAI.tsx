import { useState, useMemo, useCallback } from 'react'
import { Chess, Move } from 'chess.js'
import ChessBoard from '@/components/game/ChessBoard'
import MoveHistory from '@/components/game/MoveHistory'
import { computeBestMove } from '@/ai/minimax'
import { Cpu, RotateCcw, Loader2 } from 'lucide-react'

export default function PlayAI() {
  const [game, setGame] = useState(new Chess())
  const [level, setLevel] = useState(2)
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w')
  const [thinking, setThinking] = useState(false)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [gameResult, setGameResult] = useState<string | null>(null)

  const moveHistory = useMemo(() => game.history({ verbose: true }), [game.fen()])
  const isPlayerTurn = game.turn() === playerColor
  const isCheck = game.isCheck()

  const checkGameEnd = useCallback((g: Chess) => {
    if (g.isCheckmate()) {
      setGameResult(g.turn() === playerColor ? 'AI wins by checkmate' : 'You win by checkmate!')
    } else if (g.isStalemate()) {
      setGameResult('Stalemate — Draw')
    } else if (g.isDraw()) {
      setGameResult('Draw')
    }
  }, [playerColor])

  const aiMove = useCallback((g: Chess) => {
    if (g.isGameOver()) return
    setThinking(true)
    // Use setTimeout to not block the UI thread
    setTimeout(() => {
      const best = computeBestMove(g, level)
      if (best) {
        const result = g.move(best)
        if (result) {
          setLastMove({ from: result.from, to: result.to })
          setGame(new Chess(g.fen()))
          checkGameEnd(g)
        }
      }
      setThinking(false)
    }, 100)
  }, [level, checkGameEnd])

  const handleMove = useCallback((from: string, to: string, promotion?: string) => {
    const g = new Chess(game.fen())
    try {
      const result = g.move({ from, to, promotion: promotion as any })
      if (result) {
        setLastMove({ from, to })
        setGame(new Chess(g.fen()))
        checkGameEnd(g)
        // AI responds
        if (!g.isGameOver()) {
          aiMove(g)
        }
      }
    } catch { /* invalid move */ }
  }, [game, aiMove, checkGameEnd])

  const reset = () => {
    const g = new Chess()
    setGame(g)
    setLastMove(null)
    setGameResult(null)
    setThinking(false)
    // If player chose black, AI moves first
    if (playerColor === 'b') aiMove(g)
  }

  const switchColor = () => {
    const newColor = playerColor === 'w' ? 'b' : 'w'
    setPlayerColor(newColor)
    const g = new Chess()
    setGame(g)
    setLastMove(null)
    setGameResult(null)
    if (newColor === 'b') aiMove(g)
  }

  const levelInfo = [
    { label: 'Easy', desc: 'Depth 1', emoji: '🟢' },
    { label: 'Medium', desc: 'Depth 2', emoji: '🟡' },
    { label: 'Hard', desc: 'Depth 3', emoji: '🔴' },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] flex justify-center px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6 max-w-5xl w-full animate-fade-in">
        {/* Board */}
        <div className="flex flex-col items-center gap-3 flex-1">
          {/* AI label */}
          <div className="w-full max-w-[560px] flex items-center gap-2 px-3 py-2 bg-dark-card border border-dark-border rounded-lg">
            <Cpu size={16} className="text-gold" />
            <span className="text-sm font-medium">ShatRanj AI</span>
            <span className="text-xs text-gray-500 ml-auto">{levelInfo[level - 1].emoji} {levelInfo[level - 1].label}</span>
            {thinking && <Loader2 size={14} className="text-gold animate-spin ml-1" />}
          </div>

          <ChessBoard
            fen={game.fen()}
            playerColor={playerColor}
            onMoveMade={handleMove}
            lastMove={lastMove}
            isCheck={isCheck}
            gameOver={game.isGameOver()}
            isPlayerTurn={isPlayerTurn && !thinking}
          />

          <div className="w-full max-w-[560px] flex items-center gap-2 px-3 py-2 bg-dark-card border border-gold/30 rounded-lg">
            <span className="text-lg">♔</span>
            <span className="text-sm font-medium">You</span>
            <span className="text-xs text-gray-500 ml-auto">Playing as {playerColor === 'w' ? 'White' : 'Black'}</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 space-y-3">
          {/* Game result */}
          {gameResult && (
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 text-center animate-fade-in">
              <p className="text-gold font-semibold">{gameResult}</p>
            </div>
          )}

          {/* Difficulty */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-400">Difficulty</h4>
            <div className="space-y-2">
              {levelInfo.map((l, i) => (
                <button key={i} onClick={() => setLevel(i + 1)}
                  className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-all ${
                    level === i + 1 ? 'bg-gold/10 border border-gold/30 text-white' : 'text-gray-400 hover:text-gray-300'
                  }`}>
                  <span>{l.emoji}</span>
                  <span className="font-medium">{l.label}</span>
                  <span className="text-xs text-gray-500 ml-auto">{l.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Move history */}
          <MoveHistory moves={moveHistory} />

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={reset}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-gray-400 hover:text-gold hover:border-gold/30 transition-all">
              <RotateCcw size={14} /> New Game
            </button>
            <button onClick={switchColor}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-gray-400 hover:text-gold hover:border-gold/30 transition-all">
              {playerColor === 'w' ? '♚' : '♔'} Switch Color
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
