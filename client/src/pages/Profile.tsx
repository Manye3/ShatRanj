import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { User, GameRecord } from '@/types'
import * as api from '@/lib/api'
import { Trophy, TrendingDown, Minus, Clock } from 'lucide-react'

export default function Profile() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<User | null>(null)
  const [games, setGames] = useState<GameRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!username) return
    setLoading(true)
    Promise.all([
      api.getProfile(username),
      api.getGameHistory(username, 1),
    ]).then(([u, g]) => {
      setProfile(u)
      setGames(g.games)
      setTotalPages(g.pages)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [username])

  const loadPage = async (p: number) => {
    if (!username) return
    const g = await api.getGameHistory(username, p)
    setGames(g.games)
    setPage(p)
    setTotalPages(g.pages)
  }

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!profile) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <p className="text-gray-500">Player not found</p>
    </div>
  )

  const winRate = profile.gamesPlayed > 0
    ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* Profile header */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-2xl border border-gold/30">♛</div>
          <div>
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-gray-500 text-sm">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-bold text-gold">{profile.rating}</div>
            <div className="text-xs text-gray-500">Elo Rating</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Games', value: profile.gamesPlayed, icon: <Clock size={14} /> },
            { label: 'Wins', value: profile.wins, icon: <Trophy size={14} className="text-green-400" /> },
            { label: 'Losses', value: profile.losses, icon: <TrendingDown size={14} className="text-red-400" /> },
            { label: 'Win Rate', value: `${winRate}%`, icon: <Minus size={14} className="text-yellow-400" /> },
          ].map((s, i) => (
            <div key={i} className="bg-dark-bg rounded-lg p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Match history */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Match History</h3>
        {games.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8">No games played yet</p>
        ) : (
          <div className="space-y-2">
            {games.map(g => {
              const isWhite = g.white.username === username
              const won = (isWhite && g.result === 'white_win') || (!isWhite && g.result === 'black_win')
              const lost = (isWhite && g.result === 'black_win') || (!isWhite && g.result === 'white_win')
              const delta = isWhite ? g.whiteRatingDelta : g.blackRatingDelta
              const opponent = isWhite ? g.black.username : g.white.username

              return (
                <div key={g._id} className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg border border-dark-border/50 text-sm">
                  <div className={`w-2 h-2 rounded-full ${won ? 'bg-green-500' : lost ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <span className="text-gray-400">vs</span>
                  <span className="font-medium flex-1">{opponent}</span>
                  <span className="text-xs text-gray-500">{g.timeControl}</span>
                  <span className="text-xs text-gray-500">{g.moves} moves</span>
                  <span className={`text-xs font-mono font-bold ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {delta >= 0 ? '+' : ''}{delta}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => loadPage(page - 1)} disabled={page <= 1}
              className="px-3 py-1 text-sm border border-dark-border rounded disabled:opacity-30 hover:border-gold/30 text-gray-400">
              ←
            </button>
            <span className="text-sm text-gray-500 flex items-center">{page} / {totalPages}</span>
            <button onClick={() => loadPage(page + 1)} disabled={page >= totalPages}
              className="px-3 py-1 text-sm border border-dark-border rounded disabled:opacity-30 hover:border-gold/30 text-gray-400">
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
