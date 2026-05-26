import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import ChessBoard from '@/components/game/ChessBoard'
import MoveHistory from '@/components/game/MoveHistory'
import GameChat from '@/components/game/GameChat'
import { computeBestMove } from '@/ai/minimax'
import { ChatMessage } from '@/types'
import * as api from '@/lib/api'
import { Cpu, RotateCcw, Loader2, ChevronLeft, ChevronRight, MessageSquare, List, Brain } from 'lucide-react'

interface Personality {
  id: string
  name: string
  title: string
  emoji: string
  rating: number
  description: string
  depth: number
}

export default function PlayAI() {
  const [game, setGame] = useState(new Chess())
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w')
  const [thinking, setThinking] = useState(false)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [gameResult, setGameResult] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [sidebarTab, setSidebarTab] = useState<'moves' | 'chat'>('chat')
  const [selectedBot, setSelectedBot] = useState<Personality | null>(null)
  const [personalities, setPersonalities] = useState<Personality[]>([])
  const [loadingPersonalities, setLoadingPersonalities] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const chatPendingRef = useRef(false)

  const moveHistory = useMemo(() => game.history({ verbose: true }), [game.fen()])
  const isPlayerTurn = game.turn() === playerColor
  const isCheck = game.isCheck()

  // Load personalities on mount
  useEffect(() => {
    api.getPersonalities()
      .then(setPersonalities)
      .catch(() => {
        // Fallback personalities if API is down
        setPersonalities([
          { id: 'vishy', name: 'Viswanathan Anand', title: 'The Legend', emoji: '🇮🇳', rating: 2780, description: 'The Tiger of Madras. Elegant, fast, and deeply positional.', depth: 3 },
          { id: 'pragg', name: 'Praggnanandhaa R', title: 'The Prodigy', emoji: '⚡', rating: 2750, description: 'India\'s youngest GM. Aggressive and fearless.', depth: 3 },
          { id: 'gukesh', name: 'Gukesh D', title: 'The Challenger', emoji: '🎯', rating: 2760, description: 'Cold-blooded precision. The youngest world championship challenger.', depth: 3 },
          { id: 'vidit', name: 'Vidit Gujrathi', title: 'Streamer GM', emoji: '🎮', rating: 2720, description: 'Strong GM who loves streaming. Funny and tactical.', depth: 3 },
          { id: 'magnus', name: 'Magnus Carlsen', title: 'World Champion', emoji: '👑', rating: 2820, description: 'The GOAT. Universal style, endgame wizard.', depth: 4 },
          { id: 'hikaru', name: 'Hikaru Nakamura', title: 'Speed Demon', emoji: '💨', rating: 2750, description: 'Fastest hands in chess. Twitch legend.', depth: 3 },
          { id: 'beth', name: 'Beth Harmon', title: 'The Prodigy', emoji: '♛', rating: 2400, description: 'Fierce, focused, and brilliant. From The Queen\'s Gambit.', depth: 2 },
          { id: 'danny', name: 'Street Hustler Danny', title: 'Park Shark', emoji: '🎲', rating: 1500, description: 'Tricks, traps, and trash talk. Washington Square Park legend.', depth: 1 },
          { id: 'coach', name: 'GM Coach', title: 'Your Mentor', emoji: '📚', rating: 1800, description: 'Patient and instructive. Explains every move.', depth: 2 },
          { id: 'bob', name: 'Beginner Bob', title: 'Learning!', emoji: '😅', rating: 800, description: 'Just started playing. Makes lots of mistakes. Very wholesome.', depth: 1 },
        ])
      })
      .finally(() => setLoadingPersonalities(false))
  }, [])

  // Request bot chat commentary
  const requestBotChat = useCallback(async (context: {
    event: string
    playerMove?: string
    aiMove?: string
    fen: string
    moveNumber: number
    capturedPiece?: string
  }) => {
    if (!selectedBot || chatPendingRef.current) return
    chatPendingRef.current = true
    try {
      const result = await api.getPersonalityChat(selectedBot.id, context)
      if (result.message) {
        setChatMessages(prev => [...prev, {
          username: selectedBot.name,
          text: result.message,
          timestamp: new Date().toISOString(),
        }])
      }
    } catch { /* silently fail */ }
    chatPendingRef.current = false
  }, [selectedBot])

  const checkGameEnd = useCallback((g: Chess) => {
    if (g.isCheckmate()) {
      const result = g.turn() === playerColor ? 'AI wins by checkmate' : 'You win by checkmate!'
      setGameResult(result)
      requestBotChat({
        event: g.turn() === playerColor ? 'ai_wins' : 'player_wins',
        fen: g.fen(),
        moveNumber: g.moveNumber(),
      })
    } else if (g.isStalemate()) {
      setGameResult('Stalemate — Draw')
    } else if (g.isDraw()) {
      setGameResult('Draw')
    }
  }, [playerColor, requestBotChat])

  const aiMove = useCallback((g: Chess) => {
    if (g.isGameOver()) return
    setThinking(true)
    setTimeout(() => {
      const depth = selectedBot?.depth || 2
      const best = computeBestMove(g, depth)
      if (best) {
        const result = g.move(best)
        if (result) {
          setLastMove({ from: result.from, to: result.to })
          setGame(new Chess(g.fen()))
          checkGameEnd(g)

          // Request bot commentary on AI's own move (occasionally)
          const moveNum = g.moveNumber()
          const shouldComment = result.captured || g.isCheck() || moveNum <= 3 || moveNum % 4 === 0
          if (shouldComment && !g.isGameOver()) {
            requestBotChat({
              event: result.captured ? 'ai_captures' : g.isCheck() ? 'ai_checks' : 'ai_moves',
              aiMove: result.san,
              fen: g.fen(),
              moveNumber: moveNum,
              capturedPiece: result.captured || undefined,
            })
          }
        }
      }
      setThinking(false)
    }, 300)
  }, [selectedBot, checkGameEnd, requestBotChat])

  const handleMove = useCallback((from: string, to: string, promotion?: string) => {
    const g = new Chess(game.fen())
    try {
      const result = g.move({ from, to, promotion: promotion as any })
      if (result) {
        setLastMove({ from, to })
        setGame(new Chess(g.fen()))
        checkGameEnd(g)

        // Request bot commentary on player's move (occasionally)
        const shouldComment = result.captured || g.isCheck() || g.moveNumber() <= 2
        if (shouldComment && !g.isGameOver()) {
          requestBotChat({
            event: result.captured ? 'player_captures' : g.isCheck() ? 'player_checks' : 'player_moves',
            playerMove: result.san,
            fen: g.fen(),
            moveNumber: g.moveNumber(),
            capturedPiece: result.captured || undefined,
          })
        }

        if (!g.isGameOver()) {
          aiMove(g)
        }
      }
    } catch { /* invalid move */ }
  }, [game, aiMove, checkGameEnd, requestBotChat])

  const startGame = (bot: Personality) => {
    setSelectedBot(bot)
    const g = new Chess()
    setGame(g)
    setLastMove(null)
    setGameResult(null)
    setChatMessages([])
    setThinking(false)
    setGameStarted(true)
    setSidebarTab('chat')

    // Bot greets the player
    requestBotChat({
      event: 'game_start',
      fen: g.fen(),
      moveNumber: 1,
    })

    if (playerColor === 'b') {
      setTimeout(() => aiMove(g), 500)
    }
  }

  const reset = () => {
    if (!selectedBot) return
    const g = new Chess()
    setGame(g)
    setLastMove(null)
    setGameResult(null)
    setChatMessages([])
    setThinking(false)

    requestBotChat({
      event: 'game_start',
      fen: g.fen(),
      moveNumber: 1,
    })

    if (playerColor === 'b') {
      setTimeout(() => aiMove(g), 500)
    }
  }

  const goBackToSelection = () => {
    setSelectedBot(null)
    setGameStarted(false)
    setGameResult(null)
    setChatMessages([])
    const g = new Chess()
    setGame(g)
    setLastMove(null)
    setThinking(false)
  }

  const switchColor = () => {
    const newColor = playerColor === 'w' ? 'b' : 'w'
    setPlayerColor(newColor)
    if (selectedBot) {
      const g = new Chess()
      setGame(g)
      setLastMove(null)
      setGameResult(null)
      setChatMessages([])
      if (newColor === 'b') setTimeout(() => aiMove(g), 500)
    }
  }

  const handleChatSend = (text: string) => {
    setChatMessages(prev => [...prev, {
      username: 'You',
      text,
      timestamp: new Date().toISOString(),
    }])
    // Bot reacts to player's chat
    if (selectedBot) {
      requestBotChat({
        event: 'player_chat',
        fen: game.fen(),
        moveNumber: game.moveNumber(),
      })
    }
  }

  // ── Character Selection Screen ──
  if (!gameStarted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] px-4 py-8 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-gold">♛</span> Choose Your Opponent
            </h1>
            <p className="text-gray-500 text-sm">Each bot has a unique playstyle and personality</p>
          </div>

          {/* Color picker */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => setPlayerColor('w')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                playerColor === 'w'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'
              }`}
            >
              ♔ Play as White
            </button>
            <button
              onClick={() => setPlayerColor('b')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                playerColor === 'b'
                  ? 'bg-gray-800 text-white shadow-lg shadow-white/5 border border-gray-600'
                  : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'
              }`}
            >
              ♚ Play as Black
            </button>
          </div>

          {/* Bot Grid */}
          {loadingPersonalities ? (
            <div className="flex justify-center py-16">
              <Loader2 className="text-gold animate-spin" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {personalities.map(bot => (
                <button
                  key={bot.id}
                  onClick={() => startGame(bot)}
                  className="group bg-dark-card border border-dark-border rounded-xl p-4 text-left hover:border-gold/40 hover:bg-dark-card/80 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="text-3xl mb-2">{bot.emoji}</div>
                  <h3 className="font-semibold text-sm text-white group-hover:text-gold transition-colors leading-tight">
                    {bot.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{bot.title}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs font-mono text-gold">{bot.rating}</span>
                    <span className="text-[10px] text-gray-600">Elo</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-2 leading-relaxed line-clamp-2">
                    {bot.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Game Screen ──
  return (
    <div className="min-h-[calc(100vh-4rem)] flex justify-center px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-4 max-w-5xl w-full animate-fade-in">
        {/* Board column */}
        <div className="flex flex-col items-center gap-3 flex-1">
          {/* AI label */}
          <div className="w-full max-w-[560px] flex items-center gap-2 px-3 py-2 bg-dark-card border border-dark-border rounded-lg">
            <span className="text-xl">{selectedBot?.emoji}</span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium">{selectedBot?.name}</span>
              <span className="text-xs text-gray-500 ml-2">{selectedBot?.title}</span>
            </div>
            <span className="text-xs font-mono text-gold">{selectedBot?.rating}</span>
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
        <div className="w-full lg:w-80 space-y-3">
          {/* Game result */}
          {gameResult && (
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 text-center animate-fade-in">
              <p className="text-gold font-semibold">{gameResult}</p>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex gap-1 bg-dark-card border border-dark-border rounded-lg p-1">
            <button
              onClick={() => setSidebarTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all ${
                sidebarTab === 'chat' ? 'bg-gold/15 text-gold' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <MessageSquare size={12} /> Chat
            </button>
            <button
              onClick={() => setSidebarTab('moves')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all ${
                sidebarTab === 'moves' ? 'bg-gold/15 text-gold' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <List size={12} /> Moves
            </button>
          </div>

          {/* Tab content */}
          {sidebarTab === 'chat' ? (
            <GameChat
              messages={chatMessages}
              onSend={handleChatSend}
              username="You"
            />
          ) : (
            <MoveHistory moves={moveHistory} />
          )}

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
          <button onClick={goBackToSelection}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-gray-400 hover:text-gold hover:border-gold/30 transition-all">
            <ChevronLeft size={14} /> Choose Another Bot
          </button>
        </div>
      </div>
    </div>
  )
}
