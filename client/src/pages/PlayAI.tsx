import { useState, useCallback, useEffect, useRef } from 'react'
import { Chess, Move } from 'chess.js'
import ChessBoard from '@/components/game/ChessBoard'
import MoveHistory from '@/components/game/MoveHistory'
import GameChat from '@/components/game/GameChat'
import { computeBestMove } from '@/ai/minimax'
import { ChatMessage } from '@/types'
import * as api from '@/lib/api'
import { RotateCcw, Loader2, ChevronLeft, MessageSquare, List, Brain, Sparkles } from 'lucide-react'

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
  // Use a ref for the chess instance so history is never lost
  const chessRef = useRef(new Chess())
  const [fen, setFen] = useState(chessRef.current.fen())
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w')
  const [thinking, setThinking] = useState(false)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [gameResult, setGameResult] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [sidebarTab, setSidebarTab] = useState<'moves' | 'chat'>('chat')
  const [selectedBot, setSelectedBot] = useState<Personality | null>(null)
  const selectedBotRef = useRef<Personality | null>(null)
  const [personalities, setPersonalities] = useState<Personality[]>([])
  const [loadingPersonalities, setLoadingPersonalities] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [moveList, setMoveList] = useState<Move[]>([])
  const chatPendingRef = useRef(false)

  // Analysis state
  const [selectedMoveIdx, setSelectedMoveIdx] = useState<number | null>(null)
  const [coachResult, setCoachResult] = useState<string | null>(null)
  const [coachLoading, setCoachLoading] = useState(false)

  const isPlayerTurn = chessRef.current.turn() === playerColor
  const isCheck = chessRef.current.isCheck()

  // Keep selectedBotRef in sync
  useEffect(() => { selectedBotRef.current = selectedBot }, [selectedBot])

  // Load personalities on mount
  useEffect(() => {
    api.getPersonalities()
      .then(setPersonalities)
      .catch(() => {
        setPersonalities([
          { id: 'vishy', name: 'Viswanathan Anand', title: 'The Legend', emoji: '🐯', rating: 2780, description: 'Five-time World Champion. Elegant, fast, positional.', depth: 3 },
          { id: 'pragg', name: 'Praggnanandhaa R', title: 'The Prodigy', emoji: '⚡', rating: 2750, description: 'India\'s teenage prodigy. Aggressive and fearless.', depth: 3 },
          { id: 'gukesh', name: 'Gukesh D', title: 'The Ice Man', emoji: '🧊', rating: 2760, description: 'Cold-blooded precision under pressure.', depth: 3 },
          { id: 'vidit', name: 'Vidit Gujrathi', title: 'Streamer GM', emoji: '🎙️', rating: 2720, description: 'Strong GM who loves streaming. Funny and tactical.', depth: 3 },
          { id: 'magnus', name: 'Magnus Carlsen', title: 'The GOAT', emoji: '👑', rating: 2820, description: 'Highest-rated ever. Endgame wizard.', depth: 4 },
          { id: 'hikaru', name: 'Hikaru Nakamura', title: 'Speed Demon', emoji: '🚀', rating: 2750, description: 'King of online blitz. Twitch legend.', depth: 3 },
          { id: 'beth', name: 'Beth Harmon', title: 'The Queen\'s Gambit', emoji: '♛', rating: 2400, description: 'Fierce 1960s prodigy. Brilliant attacker.', depth: 2 },
          { id: 'danny', name: 'Street Hustler Danny', title: 'Park Shark', emoji: '🎲', rating: 1500, description: 'Tricks, traps, and trash talk.', depth: 1 },
          { id: 'coach', name: 'GM Coach', title: 'The Teacher', emoji: '📚', rating: 1800, description: 'Patient and instructive. Explains every move.', depth: 2 },
          { id: 'bob', name: 'Beginner Bob', title: 'The Rookie', emoji: '😅', rating: 800, description: 'Just learned chess. Makes lots of mistakes.', depth: 1 },
        ])
      })
      .finally(() => setLoadingPersonalities(false))
  }, [])

  // Request bot chat — uses ref so it always has the latest bot
  const requestBotChat = useCallback(async (bot: Personality, context: {
    event: string
    playerMove?: string
    aiMove?: string
    fen: string
    moveNumber: number
    capturedPiece?: string
  }) => {
    if (chatPendingRef.current) return
    chatPendingRef.current = true
    try {
      const result = await api.getPersonalityChat(bot.id, context)
      if (result.message) {
        setChatMessages(prev => [...prev, {
          username: bot.name,
          text: result.message,
          timestamp: new Date().toISOString(),
        }])
      }
    } catch { /* silently fail */ }
    chatPendingRef.current = false
  }, [])

  const checkGameEnd = useCallback((g: Chess, bot: Personality, pColor: string) => {
    if (g.isCheckmate()) {
      const playerWins = g.turn() !== pColor
      setGameResult(playerWins ? 'You win by checkmate!' : 'AI wins by checkmate')
      requestBotChat(bot, {
        event: playerWins ? 'player_wins' : 'ai_wins',
        fen: g.fen(),
        moveNumber: g.moveNumber(),
      })
    } else if (g.isStalemate()) {
      setGameResult('Stalemate — Draw')
    } else if (g.isDraw()) {
      setGameResult('Draw')
    }
  }, [requestBotChat])

  const aiMove = useCallback((g: Chess, bot: Personality, pColor: string) => {
    if (g.isGameOver()) return
    setThinking(true)
    setTimeout(() => {
      const depth = bot.depth || 2
      const best = computeBestMove(g, depth)
      if (best) {
        const result = g.move(best)
        if (result) {
          setLastMove({ from: result.from, to: result.to })
          setFen(g.fen())
          setMoveList(g.history({ verbose: true }))
          checkGameEnd(g, bot, pColor)

          // Bot commentary on its own move
          const moveNum = g.moveNumber()
          const shouldComment = result.captured || g.isCheck() || moveNum <= 3 || moveNum % 4 === 0
          if (shouldComment && !g.isGameOver()) {
            requestBotChat(bot, {
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
  }, [checkGameEnd, requestBotChat])

  const handleMove = useCallback((from: string, to: string, promotion?: string) => {
    const g = chessRef.current
    const bot = selectedBotRef.current
    if (!bot) return
    try {
      const result = g.move({ from, to, promotion: promotion as any })
      if (result) {
        setLastMove({ from, to })
        setFen(g.fen())
        setMoveList(g.history({ verbose: true }))
        checkGameEnd(g, bot, playerColor)

        // Bot commentary on player's move
        const shouldComment = result.captured || g.isCheck() || g.moveNumber() <= 2
        if (shouldComment && !g.isGameOver()) {
          requestBotChat(bot, {
            event: result.captured ? 'player_captures' : g.isCheck() ? 'player_checks' : 'player_moves',
            playerMove: result.san,
            fen: g.fen(),
            moveNumber: g.moveNumber(),
            capturedPiece: result.captured || undefined,
          })
        }

        if (!g.isGameOver()) {
          aiMove(g, bot, playerColor)
        }
      }
    } catch { /* invalid move */ }
  }, [aiMove, checkGameEnd, playerColor, requestBotChat])

  const startGame = (bot: Personality) => {
    setSelectedBot(bot)
    selectedBotRef.current = bot
    const g = new Chess()
    chessRef.current = g
    setFen(g.fen())
    setLastMove(null)
    setGameResult(null)
    setChatMessages([])
    setMoveList([])
    setThinking(false)
    setGameStarted(true)
    setSidebarTab('chat')
    setSelectedMoveIdx(null)
    setCoachResult(null)

    // Bot greeting
    requestBotChat(bot, { event: 'game_start', fen: g.fen(), moveNumber: 1 })

    if (playerColor === 'b') {
      setTimeout(() => aiMove(g, bot, 'b'), 500)
    }
  }

  const reset = () => {
    const bot = selectedBotRef.current
    if (!bot) return
    const g = new Chess()
    chessRef.current = g
    setFen(g.fen())
    setLastMove(null)
    setGameResult(null)
    setChatMessages([])
    setMoveList([])
    setThinking(false)
    setSelectedMoveIdx(null)
    setCoachResult(null)

    requestBotChat(bot, { event: 'game_start', fen: g.fen(), moveNumber: 1 })
    if (playerColor === 'b') setTimeout(() => aiMove(g, bot, 'b'), 500)
  }

  const goBackToSelection = () => {
    setSelectedBot(null)
    selectedBotRef.current = null
    setGameStarted(false)
    setGameResult(null)
    setChatMessages([])
    setMoveList([])
    chessRef.current = new Chess()
    setFen(chessRef.current.fen())
    setLastMove(null)
    setThinking(false)
    setSelectedMoveIdx(null)
    setCoachResult(null)
  }

  const switchColor = () => {
    const newColor = playerColor === 'w' ? 'b' : 'w'
    setPlayerColor(newColor)
    const bot = selectedBotRef.current
    if (bot) {
      const g = new Chess()
      chessRef.current = g
      setFen(g.fen())
      setLastMove(null)
      setGameResult(null)
      setChatMessages([])
      setMoveList([])
      setSelectedMoveIdx(null)
      setCoachResult(null)
      if (newColor === 'b') setTimeout(() => aiMove(g, bot, 'b'), 500)
    }
  }

  const handleChatSend = (text: string) => {
    setChatMessages(prev => [...prev, {
      username: 'You',
      text,
      timestamp: new Date().toISOString(),
    }])
    const bot = selectedBotRef.current
    if (bot) {
      requestBotChat(bot, { event: 'player_chat', fen: chessRef.current.fen(), moveNumber: chessRef.current.moveNumber() })
    }
  }

  // In-game analysis
  const handleAnalyze = async (moveIdx: number, useAgent = false) => {
    setSelectedMoveIdx(moveIdx)
    setCoachLoading(true)
    setCoachResult(null)
    try {
      const pgn = chessRef.current.pgn()
      const result = await api.explainMove(pgn, moveIdx, useAgent)
      setCoachResult(result.analysis)
    } catch {
      setCoachResult('Unable to analyze right now. Please try again.')
    }
    setCoachLoading(false)
  }

  // ── Character Selection Screen ──
  if (!gameStarted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] px-4 py-8 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-gold">♛</span> Choose Your Opponent
            </h1>
            <p className="text-gray-500 text-sm">Each bot has a unique playstyle and personality</p>
          </div>

          <div className="flex justify-center gap-3 mb-8">
            <button onClick={() => setPlayerColor('w')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                playerColor === 'w' ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'
              }`}>♔ Play as White</button>
            <button onClick={() => setPlayerColor('b')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                playerColor === 'b' ? 'bg-gray-800 text-white shadow-lg shadow-white/5 border border-gray-600' : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'
              }`}>♚ Play as Black</button>
          </div>

          {loadingPersonalities ? (
            <div className="flex justify-center py-16"><Loader2 className="text-gold animate-spin" size={32} /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {personalities.map(bot => (
                <button key={bot.id} onClick={() => startGame(bot)}
                  className="group bg-dark-card border border-dark-border rounded-xl p-4 text-left hover:border-gold/40 hover:bg-dark-card/80 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  <div className="text-3xl mb-2">{bot.emoji}</div>
                  <h3 className="font-semibold text-sm text-white group-hover:text-gold transition-colors leading-tight">{bot.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{bot.title}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs font-mono text-gold">{bot.rating}</span>
                    <span className="text-[10px] text-gray-600">Elo</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-2 leading-relaxed line-clamp-2">{bot.description}</p>
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
            fen={fen}
            playerColor={playerColor}
            onMoveMade={handleMove}
            lastMove={lastMove}
            isCheck={isCheck}
            gameOver={chessRef.current.isGameOver()}
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
          {gameResult && (
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 text-center animate-fade-in">
              <p className="text-gold font-semibold">{gameResult}</p>
            </div>
          )}

          <div className="flex gap-1 bg-dark-card border border-dark-border rounded-lg p-1">
            <button onClick={() => setSidebarTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all ${
                sidebarTab === 'chat' ? 'bg-gold/15 text-gold' : 'text-gray-500 hover:text-gray-300'
              }`}><MessageSquare size={12} /> Chat</button>
            <button onClick={() => setSidebarTab('moves')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all ${
                sidebarTab === 'moves' ? 'bg-gold/15 text-gold' : 'text-gray-500 hover:text-gray-300'
              }`}><List size={12} /> Moves</button>
          </div>

          {sidebarTab === 'chat' ? (
            <GameChat messages={chatMessages} onSend={handleChatSend} username="You" />
          ) : (
            <div className="space-y-2">
              <MoveHistory moves={moveList} />
              {/* In-game analysis (available when game is over) */}
              {gameResult && moveList.length > 0 && (
                <div className="bg-dark-card border border-dark-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-medium text-gray-400">Analyze a move</h4>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {moveList.map((m, idx) => (
                      <button key={idx} onClick={() => handleAnalyze(idx)}
                        className={`px-1.5 py-0.5 rounded text-xs font-mono transition-all ${
                          selectedMoveIdx === idx ? 'bg-gold/20 text-gold border border-gold/30' : 'text-gray-400 hover:text-white hover:bg-dark-hover/50'
                        }`}>
                        {idx % 2 === 0 && <span className="text-gray-600 mr-0.5">{Math.floor(idx / 2) + 1}.</span>}
                        {m.san}
                      </button>
                    ))}
                  </div>
                  {/* Analyze buttons */}
                  {selectedMoveIdx !== null && (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleAnalyze(selectedMoveIdx, false)} disabled={coachLoading}
                        className="flex items-center gap-1 px-2 py-1 bg-gold/10 border border-gold/30 rounded text-[11px] text-gold hover:bg-gold/20 transition-all disabled:opacity-50">
                        {coachLoading ? <Loader2 size={10} className="animate-spin" /> : <Brain size={10} />} RAG Coach
                      </button>
                      <button onClick={() => handleAnalyze(selectedMoveIdx, true)} disabled={coachLoading}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-[11px] text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-50">
                        {coachLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Agent
                      </button>
                    </div>
                  )}
                  {/* Coach result */}
                  {coachResult && (
                    <div className="bg-dark-bg border border-dark-border rounded p-2 animate-fade-in">
                      <div className="flex items-center gap-1 mb-1">
                        <Brain size={10} className="text-gold" />
                        <span className="text-[10px] font-medium text-gold">AI Coach</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{coachResult}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
