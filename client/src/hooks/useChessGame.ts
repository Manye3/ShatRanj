import { useState, useEffect, useCallback, useRef } from 'react'
import { Chess, Move } from 'chess.js'
import { getSocket } from '@/lib/socket'
import { useSound } from '@/hooks/useSound'
import { User, GameOverData, ChatMessage } from '@/types'
import { Socket } from 'socket.io-client'

interface GameState {
  fen: string
  pgn: string
  moveHistory: Move[]
  playerColor: 'w' | 'b' | null
  opponent: { username: string; rating: number } | null
  clocks: { whiteMs: number; blackMs: number }
  isGameOver: boolean
  gameOverData: GameOverData | null
  drawOfferedToMe: boolean
  myDrawOffered: boolean
  waitingForRematch: boolean
  waitingForOpponent: boolean
  turn: 'w' | 'b'
  lastMove: { from: string; to: string } | null
  isCheck: boolean
  messages: ChatMessage[]
}

export function useChessGame(roomId: string, user: User | null) {
  const chessRef = useRef(new Chess())
  const socketRef = useRef<Socket | null>(null)
  const { play } = useSound()

  const [state, setState] = useState<GameState>({
    fen: new Chess().fen(), pgn: '', moveHistory: [],
    playerColor: null, opponent: null,
    clocks: { whiteMs: 0, blackMs: 0 },
    isGameOver: false, gameOverData: null,
    drawOfferedToMe: false, myDrawOffered: false,
    waitingForRematch: false, waitingForOpponent: true,
    turn: 'w', lastMove: null, isCheck: false, messages: [],
  })

  useEffect(() => {
    const socket = getSocket()
    if (!socket.connected) socket.connect()
    socketRef.current = socket

    socket.emit('joinRoom', { roomId, username: user?.username })

    const onGameStart = (data: any) => {
      const isWhite = data.white.username === user?.username
      const color = isWhite ? 'w' : 'b'
      const opp = isWhite ? data.black : data.white
      chessRef.current = new Chess(data.fen)
      setState(prev => ({
        ...prev, fen: data.fen, playerColor: color,
        opponent: { username: opp.username, rating: opp.rating },
        clocks: { whiteMs: data.whiteTimeMs, blackMs: data.blackTimeMs },
        waitingForOpponent: false, turn: chessRef.current.turn(),
        moveHistory: chessRef.current.history({ verbose: true }),
        pgn: chessRef.current.pgn(),
        isGameOver: false, gameOverData: null,
        lastMove: null, isCheck: chessRef.current.isCheck(),
        drawOfferedToMe: false, myDrawOffered: false, waitingForRematch: false,
      }))
    }

    const onMoveMade = (data: any) => {
      try { chessRef.current.load(data.fen) } catch { chessRef.current = new Chess(data.fen) }
      const isCheck = chessRef.current.isCheck()
      if (data.move.captured) play('capture')
      else if (isCheck) play('check')
      else play('move')
      setState(prev => ({
        ...prev, fen: data.fen, pgn: data.pgn,
        moveHistory: chessRef.current.history({ verbose: true }),
        turn: data.turn, lastMove: { from: data.move.from, to: data.move.to },
        isCheck, clocks: { whiteMs: data.whiteTimeMs, blackMs: data.blackTimeMs },
        drawOfferedToMe: false, myDrawOffered: false,
      }))
    }

    const onClockTick = (data: any) => {
      setState(prev => ({ ...prev, clocks: { whiteMs: data.whiteTimeMs, blackMs: data.blackTimeMs } }))
    }

    const onGameOver = (data: GameOverData) => {
      play('gameEnd')
      setState(prev => ({ ...prev, isGameOver: true, gameOverData: data, waitingForRematch: false }))
    }

    const onDrawOffered = () => setState(prev => ({ ...prev, drawOfferedToMe: true }))
    const onRematchRequested = () => {} // UI shows in gameOverData
    const onChatMessage = (data: ChatMessage) => {
      setState(prev => ({ ...prev, messages: [...prev.messages, data] }))
    }
    const onError = (data: any) => console.error('[Socket]', data.message)

    socket.on('gameStart', onGameStart)
    socket.on('moveMade', onMoveMade)
    socket.on('clockTick', onClockTick)
    socket.on('gameOver', onGameOver)
    socket.on('drawOffered', onDrawOffered)
    socket.on('rematchRequested', onRematchRequested)
    socket.on('chatMessage', onChatMessage)
    socket.on('error', onError)

    return () => {
      socket.off('gameStart', onGameStart)
      socket.off('moveMade', onMoveMade)
      socket.off('clockTick', onClockTick)
      socket.off('gameOver', onGameOver)
      socket.off('drawOffered', onDrawOffered)
      socket.off('rematchRequested', onRematchRequested)
      socket.off('chatMessage', onChatMessage)
      socket.off('error', onError)
    }
  }, [roomId, user, play])

  const makeMove = useCallback((from: string, to: string, promotion?: string) => {
    socketRef.current?.emit('makeMove', { roomId, move: { from, to, promotion } })
  }, [roomId])

  const resign = useCallback(() => socketRef.current?.emit('resign', { roomId }), [roomId])
  const offerDraw = useCallback(() => {
    socketRef.current?.emit('offerDraw', { roomId })
    setState(prev => ({ ...prev, myDrawOffered: true }))
  }, [roomId])
  const acceptDraw = useCallback(() => socketRef.current?.emit('acceptDraw', { roomId }), [roomId])
  const declineDraw = useCallback(() => {
    socketRef.current?.emit('declineDraw', { roomId })
    setState(prev => ({ ...prev, drawOfferedToMe: false }))
  }, [roomId])
  const requestRematch = useCallback(() => {
    socketRef.current?.emit('requestRematch', { roomId })
    setState(prev => ({ ...prev, waitingForRematch: true }))
  }, [roomId])
  const sendMessage = useCallback((text: string) => {
    socketRef.current?.emit('sendMessage', { roomId, text })
  }, [roomId])

  return {
    ...state, chess: chessRef.current,
    makeMove, resign, offerDraw, acceptDraw, declineDraw, requestRematch, sendMessage,
  }
}
