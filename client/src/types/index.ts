export interface User {
  id: string
  username: string
  rating: number
  wins: number
  losses: number
  draws: number
  gamesPlayed: number
  createdAt: string
}

export interface GameRecord {
  _id: string
  white: { userId: string; username: string; rating: number }
  black: { userId: string; username: string; rating: number }
  result: 'white_win' | 'black_win' | 'draw' | 'in_progress'
  termination: string
  pgn: string
  timeControl: string
  moves: number
  whiteRatingDelta: number
  blackRatingDelta: number
  aiSummary: string | null
  createdAt: string
}

export interface ChatMessage {
  username: string
  text: string
  timestamp: string
}

export interface GameOverData {
  result: string
  termination: string
  pgn: string
  moves: number
  whiteRatingDelta: number
  blackRatingDelta: number
  whiteNewRating: number
  blackNewRating: number
}
