import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getSocket } from '@/lib/socket'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

const TIME_CONTROLS = [
  { value: '1+0', label: 'Bullet', icon: '⚡', desc: '1 min' },
  { value: '3+2', label: 'Blitz', icon: '🔥', desc: '3 min + 2s inc' },
  { value: '10+0', label: 'Rapid', icon: '🕐', desc: '10 min' },
]

export default function Lobby() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [timeControl, setTimeControl] = useState('3+2')
  const [roomCode, setRoomCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdRoom, setCreatedRoom] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { if (!loading && !user) navigate('/login') }, [user, loading, navigate])

  const handleCreate = () => {
    if (!user) return
    setCreating(true)
    const socket = getSocket()
    if (!socket.connected) socket.connect()

    socket.emit('createRoom', { username: user.username, timeControl })
    socket.once('roomCreated', (data: { roomId: string }) => {
      setCreating(false)
      setCreatedRoom(data.roomId)
    })
    socket.once('error', (data: { message: string }) => {
      setCreating(false)
      toast.error(data.message)
    })
    setTimeout(() => setCreating(false), 10000)
  }

  const handleJoin = () => {
    if (!roomCode.trim()) return toast.error('Enter a room code')
    let id = roomCode.trim()
    const match = id.match(/\/game\/(.+)$/)
    if (match) id = match[1]
    navigate(`/game/${id}`)
  }

  const copyLink = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(`${window.location.origin}/game/${createdRoom}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading || !user) return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-3xl grid md:grid-cols-2 gap-6 animate-fade-in">
        {/* Create Room */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><span className="text-gold">♔</span> Create Room</h3>
          <p className="text-sm text-gray-500">Select time control</p>
          <div className="space-y-2">
            {TIME_CONTROLS.map(tc => (
              <button key={tc.value} onClick={() => setTimeControl(tc.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  timeControl === tc.value ? 'border-gold bg-gold/10 text-white' : 'border-dark-border bg-dark-bg text-gray-400 hover:border-dark-hover'
                }`}>
                <span className="text-xl">{tc.icon}</span>
                <div><div className="font-medium text-sm">{tc.label}</div><div className="text-xs text-gray-500">{tc.desc}</div></div>
                {timeControl === tc.value && <span className="ml-auto text-gold">✓</span>}
              </button>
            ))}
          </div>

          {createdRoom ? (
            <div className="space-y-3">
              <div className="bg-dark-bg border border-gold/30 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Room Code</p>
                <p className="text-gold font-mono text-lg">{createdRoom}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={copyLink}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-dark-border text-gray-400 hover:text-gold hover:border-gold/30 rounded-lg text-sm transition-all">
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
                </button>
                <button onClick={() => navigate(`/game/${createdRoom}`)}
                  className="flex-1 py-2 bg-gold hover:bg-gold-dark text-black font-semibold rounded-lg text-sm transition-all">
                  Enter Room
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleCreate} disabled={creating}
              className="w-full py-2.5 bg-gold hover:bg-gold-dark text-black font-semibold rounded-lg transition-all disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Room'}
            </button>
          )}
        </div>

        {/* Join Room */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><span className="text-gold">♚</span> Join Room</h3>
          <p className="text-sm text-gray-500">Enter a room code or paste an invite link</p>
          <input value={roomCode} onChange={e => setRoomCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJoin()}
            placeholder="Room code or URL"
            className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-gold/50" />
          <button onClick={handleJoin} disabled={!roomCode.trim()}
            className="w-full py-2.5 border border-gold text-gold hover:bg-gold hover:text-black font-semibold rounded-lg transition-all disabled:opacity-30">
            Join Room
          </button>
        </div>
      </div>
    </div>
  )
}
