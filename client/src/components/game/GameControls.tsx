import { Flag, Handshake } from 'lucide-react'
import { useState } from 'react'

interface Props {
  onResign: () => void
  onOfferDraw: () => void
  onAcceptDraw: () => void
  onDeclineDraw: () => void
  drawOfferedToMe: boolean
  myDrawOffered: boolean
  gameOver: boolean
}

export default function GameControls({ onResign, onOfferDraw, onAcceptDraw, onDeclineDraw, drawOfferedToMe, myDrawOffered, gameOver }: Props) {
  const [confirmResign, setConfirmResign] = useState(false)

  if (gameOver) return null

  return (
    <div className="space-y-2">
      {drawOfferedToMe && (
        <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 text-sm animate-fade-in">
          <p className="text-gold mb-2">Opponent offers a draw</p>
          <div className="flex gap-2">
            <button onClick={onAcceptDraw} className="px-3 py-1 bg-gold text-black rounded text-xs font-semibold hover:bg-gold-dark">
              Accept
            </button>
            <button onClick={onDeclineDraw} className="px-3 py-1 border border-dark-border text-gray-400 rounded text-xs hover:text-white">
              Decline
            </button>
          </div>
        </div>
      )}

      {confirmResign ? (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-sm animate-fade-in">
          <p className="text-red-400 mb-2">Are you sure?</p>
          <div className="flex gap-2">
            <button onClick={() => { onResign(); setConfirmResign(false) }}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700">
              Confirm Resign
            </button>
            <button onClick={() => setConfirmResign(false)}
              className="px-3 py-1 border border-dark-border text-gray-400 rounded text-xs hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmResign(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all"
          >
            <Flag size={14} /> Resign
          </button>
          <button
            onClick={onOfferDraw}
            disabled={myDrawOffered}
            className="flex items-center gap-1.5 px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-gray-400 hover:text-gold hover:border-gold/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Handshake size={14} /> {myDrawOffered ? 'Draw Offered' : 'Offer Draw'}
          </button>
        </div>
      )}
    </div>
  )
}
