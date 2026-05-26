import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useChessGame } from '@/hooks/useChessGame'
import { getSocket } from '@/lib/socket'
import ChessBoard from '@/components/game/ChessBoard'
import ChessClock from '@/components/game/ChessClock'
import PlayerCard from '@/components/game/PlayerCard'
import MoveHistory from '@/components/game/MoveHistory'
import GameChat from '@/components/game/GameChat'
import GameControls from '@/components/game/GameControls'
import GameOverModal from '@/components/game/GameOverModal'
import VideoChat from '@/components/game/VideoChat'
import { useState, useEffect } from 'react'

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'moves' | 'chat' | 'video'>('moves')

  useEffect(() => { if (!loading && !user) navigate('/login') }, [user, loading, navigate])

  const game = useChessGame(roomId || '', user || null)

  if (loading || !user || !roomId) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (game.waitingForOpponent) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center max-w-md animate-fade-in">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Waiting for opponent</h3>
        <p className="text-sm text-gray-500 mb-4">Share this room code with your friend:</p>
        <div className="bg-dark-bg border border-gold/30 rounded-lg p-3 mb-4">
          <span className="text-gold font-mono text-xl">{roomId}</span>
        </div>
        <p className="text-xs text-gray-600">Or share the URL from your browser</p>
      </div>
    </div>
  )

  const isWhite = game.playerColor === 'w'
  const myUsername = user.username
  const oppUsername = game.opponent?.username || 'Opponent'
  const oppRating = game.opponent?.rating || 1200

  // Top = opponent (inverted perspective)
  const topColor = isWhite ? 'b' : 'w'
  const bottomColor = isWhite ? 'w' : 'b'
  const topClockMs = isWhite ? game.clocks.blackMs : game.clocks.whiteMs
  const bottomClockMs = isWhite ? game.clocks.whiteMs : game.clocks.blackMs
  const topName = oppUsername
  const bottomName = myUsername
  const topRating = oppRating
  const bottomRating = user.rating

  return (
    <div className="min-h-[calc(100vh-4rem)] flex justify-center px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-4 max-w-5xl w-full animate-fade-in">
        {/* Left: Board */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {/* Top player */}
          <div className="w-full max-w-[560px] flex items-center gap-3">
            <div className="flex-1"><PlayerCard username={topName} rating={topRating} color={topColor} isActive={game.turn === topColor} /></div>
            <ChessClock timeMs={topClockMs} isActive={game.turn === topColor && !game.isGameOver} isPlayerClock={false} />
          </div>

          <ChessBoard
            fen={game.fen}
            playerColor={game.playerColor}
            onMoveMade={game.makeMove}
            lastMove={game.lastMove}
            isCheck={game.isCheck}
            gameOver={game.isGameOver}
            isPlayerTurn={game.turn === game.playerColor}
          />

          {/* Bottom player */}
          <div className="w-full max-w-[560px] flex items-center gap-3">
            <div className="flex-1"><PlayerCard username={bottomName} rating={bottomRating} color={bottomColor} isActive={game.turn === bottomColor} /></div>
            <ChessClock timeMs={bottomClockMs} isActive={game.turn === bottomColor && !game.isGameOver} isPlayerClock={true} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-full lg:w-80 space-y-3">
          {/* Tab switcher */}
          <div className="flex bg-dark-card border border-dark-border rounded-lg p-1">
            {(['moves', 'chat', 'video'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded text-xs font-medium transition-all capitalize ${
                  tab === t ? 'bg-gold text-black' : 'text-gray-500 hover:text-gray-300'
                }`}>{t}</button>
            ))}
          </div>

          {tab === 'moves' && <MoveHistory moves={game.moveHistory} />}
          {tab === 'chat' && <GameChat messages={game.messages} onSend={game.sendMessage} username={myUsername} />}
          {tab === 'video' && <VideoChat socket={getSocket()} roomId={roomId} />}

          <GameControls
            onResign={game.resign}
            onOfferDraw={game.offerDraw}
            onAcceptDraw={game.acceptDraw}
            onDeclineDraw={game.declineDraw}
            drawOfferedToMe={game.drawOfferedToMe}
            myDrawOffered={game.myDrawOffered}
            gameOver={game.isGameOver}
          />
        </div>
      </div>

      {game.isGameOver && game.gameOverData && (
        <GameOverModal
          data={game.gameOverData}
          playerColor={game.playerColor}
          onRematch={game.requestRematch}
          onBackToLobby={() => navigate('/lobby')}
          waitingForRematch={game.waitingForRematch}
        />
      )}
    </div>
  )
}
