interface Props {
  username: string
  rating: number
  color: 'w' | 'b'
  isActive: boolean
}

export default function PlayerCard({ username, rating, color, isActive }: Props) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
      isActive ? 'border-gold/40 bg-dark-card shadow-[0_0_10px_rgba(196,162,86,0.1)]' : 'border-dark-border bg-dark-card/50'
    }`}>
      <span className="text-lg">{color === 'w' ? '♔' : '♚'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{username}</div>
      </div>
      <span className="text-xs px-2 py-0.5 bg-gold/10 text-gold rounded font-mono">
        {rating}
      </span>
    </div>
  )
}
