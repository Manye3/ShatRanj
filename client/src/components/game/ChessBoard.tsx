import { useState, useMemo, useRef, useEffect } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'

interface Props {
  fen: string
  playerColor: 'w' | 'b' | null
  onMoveMade: (from: string, to: string, promotion?: string) => void
  lastMove: { from: string; to: string } | null
  isCheck: boolean
  gameOver: boolean
  isPlayerTurn: boolean
}

export default function ChessBoard({ fen, playerColor, onMoveMade, lastMove, isCheck, gameOver, isPlayerTurn }: Props) {
  const [selectedSq, setSelectedSq] = useState<string | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [boardWidth, setBoardWidth] = useState(480)

  // Responsive board size
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.offsetWidth, 560)
        setBoardWidth(Math.max(280, w))
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const chess = useMemo(() => {
    try { return new Chess(fen) } catch { return new Chess() }
  }, [fen])

  // Custom square styles
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {}

    // Last move highlight
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: 'rgba(196,162,86,0.3)' }
      styles[lastMove.to] = { backgroundColor: 'rgba(196,162,86,0.4)' }
    }

    // Check highlight
    if (isCheck) {
      const board = chess.board()
      const turn = chess.turn()
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c]
          if (p && p.type === 'k' && p.color === turn) {
            const sq = 'abcdefgh'[c] + (8 - r)
            styles[sq] = { background: 'radial-gradient(circle, rgba(255,0,0,0.6) 0%, rgba(255,0,0,0) 70%)' }
          }
        }
      }
    }

    // Selected square
    if (selectedSq) {
      styles[selectedSq] = { ...(styles[selectedSq] || {}), backgroundColor: 'rgba(196,162,86,0.5)' }
    }

    // Legal move dots
    for (const sq of legalMoves) {
      const isOccupied = chess.get(sq as any)
      styles[sq] = {
        ...(styles[sq] || {}),
        background: isOccupied
          ? 'radial-gradient(circle, rgba(0,0,0,0.3) 60%, transparent 60%)'
          : 'radial-gradient(circle, rgba(0,0,0,0.25) 25%, transparent 25%)',
        borderRadius: '50%',
      }
    }

    return styles
  }, [fen, lastMove, isCheck, selectedSq, legalMoves, chess])

  const onSquareClick = (square: string) => {
    if (gameOver || !isPlayerTurn) return

    if (selectedSq) {
      // Try to make the move
      const isLegal = legalMoves.includes(square)
      if (isLegal) {
        // Check for promotion
        const piece = chess.get(selectedSq as any)
        const isPromotion = piece?.type === 'p' &&
          ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'))
        onMoveMade(selectedSq, square, isPromotion ? 'q' : undefined)
      }
      setSelectedSq(null)
      setLegalMoves([])
    } else {
      // Select a piece
      const piece = chess.get(square as any)
      if (piece && piece.color === playerColor) {
        setSelectedSq(square)
        const moves = chess.moves({ square: square as any, verbose: true })
        setLegalMoves(moves.map(m => m.to))
      }
    }
  }

  const onPieceDrop = (from: string, to: string) => {
    if (gameOver || !isPlayerTurn) return false
    const piece = chess.get(from as any)
    const isPromotion = piece?.type === 'p' &&
      ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1'))
    onMoveMade(from, to, isPromotion ? 'q' : undefined)
    setSelectedSq(null)
    setLegalMoves([])
    return true
  }

  return (
    <div ref={containerRef} className="w-full max-w-[560px]">
      <Chessboard
        position={fen}
        onSquareClick={onSquareClick}
        onPieceDrop={onPieceDrop}
        boardOrientation={playerColor === 'b' ? 'black' : 'white'}
        boardWidth={boardWidth}
        customSquareStyles={customSquareStyles}
        customDarkSquareStyle={{ backgroundColor: '#779556' }}
        customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
        animationDuration={200}
        arePiecesDraggable={isPlayerTurn && !gameOver}
      />
    </div>
  )
}
