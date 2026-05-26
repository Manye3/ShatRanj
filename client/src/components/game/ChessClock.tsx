import { useMemo } from 'react'

interface Props {
  timeMs: number
  isActive: boolean
  isPlayerClock: boolean
}

export default function ChessClock({ timeMs, isActive, isPlayerClock }: Props) {
  const formatted = useMemo(() => {
    const totalSec = Math.max(0, Math.floor(timeMs / 1000))
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    if (timeMs < 10000 && timeMs > 0) {
      const tenths = Math.floor((timeMs % 1000) / 100)
      return `${min}:${sec.toString().padStart(2, '0')}.${tenths}`
    }
    return `${min}:${sec.toString().padStart(2, '0')}`
  }, [timeMs])

  const isLow = timeMs < 30000 && timeMs > 0
  const isCritical = timeMs < 10000 && timeMs > 0

  return (
    <div className={`
      px-4 py-2 rounded-lg font-mono text-xl font-bold text-center transition-all
      ${isActive
        ? isCritical
          ? 'bg-red-900/40 text-red-400 border border-red-500/50 animate-pulse'
          : isLow
            ? 'bg-dark-card text-red-400 border border-red-500/30'
            : 'bg-dark-card text-white border border-gold/40 shadow-[0_0_12px_rgba(196,162,86,0.15)]'
        : 'bg-dark-card/50 text-gray-500 border border-dark-border'
      }
    `}>
      {formatted}
    </div>
  )
}
