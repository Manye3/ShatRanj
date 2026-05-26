import { GameOverData } from '@/types'
import { Trophy, X, Handshake, RotateCcw, ArrowLeft } from 'lucide-react'

interface Props {
  data: GameOverData
  playerColor: 'w' | 'b' | null
  onRematch: () => void
  onBackToLobby: () => void
  waitingForRematch: boolean
}

export default function GameOverModal({ data, playerColor, onRematch, onBackToLobby, waitingForRematch }: Props) {
  const isWhiteWin = data.result === 'white_win'
  const isBlackWin = data.result === 'black_win'
  const isDraw = data.result === 'draw'

  const playerWon = (playerColor === 'w' && isWhiteWin) || (playerColor === 'b' && isBlackWin)
  const playerLost = (playerColor === 'w' && isBlackWin) || (playerColor === 'b' && isWhiteWin)

  const ratingDelta = playerColor === 'w' ? data.whiteRatingDelta : data.blackRatingDelta
  const newRating = playerColor === 'w' ? data.whiteNewRating : data.blackNewRating

  const termLabels: Record<string, string> = {
    checkmate: 'Checkmate', resignation: 'Resignation', timeout: 'Timeout',
    stalemate: 'Stalemate', draw_agreement: 'Mutual Agreement',
    insufficient_material: 'Insufficient Material', abandonment: 'Abandonment',
    threefold_repetition: 'Threefold Repetition', fifty_move_rule: '50-Move Rule',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-sm mx-4 text-center space-y-4">
        {/* Icon */}
        <div className={`inline-flex p-3 rounded-full ${playerWon ? 'bg-green-500/10' : playerLost ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
          {playerWon ? <Trophy className="text-green-400" size={32} /> :
           playerLost ? <X className="text-red-400" size={32} /> :
           <Handshake className="text-yellow-400" size={32} />}
        </div>

        {/* Result */}
        <h2 className={`text-2xl font-bold ${playerWon ? 'text-green-400' : playerLost ? 'text-red-400' : 'text-yellow-400'}`}>
          {playerWon ? 'You Won!' : playerLost ? 'You Lost' : 'Draw'}
        </h2>

        {/* Termination */}
        <p className="text-gray-500 text-sm">{termLabels[data.termination] || data.termination}</p>

        {/* Rating change */}
        {newRating > 0 && (
          <div className="py-2">
            <span className={`text-lg font-bold ${ratingDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {ratingDelta >= 0 ? '+' : ''}{ratingDelta}
            </span>
            <span className="text-gray-500 text-sm ml-2">({newRating})</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onRematch}
            disabled={waitingForRematch}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-dark text-black font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            {waitingForRematch ? (
              <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Waiting...</>
            ) : (
              <><RotateCcw size={16} /> Rematch</>
            )}
          </button>
          <button
            onClick={onBackToLobby}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-dark-border text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft size={16} /> Back to Lobby
          </button>
        </div>
      </div>
    </div>
  )
}
