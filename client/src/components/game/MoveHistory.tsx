import { Move } from 'chess.js'
import { useRef, useEffect } from 'react'

interface Props { moves: Move[] }

export default function MoveHistory({ moves }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [moves])

  const pairs: [Move, Move | undefined][] = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1]])
  }

  return (
    <div ref={scrollRef} className="h-64 overflow-y-auto bg-dark-bg rounded-lg p-3 border border-dark-border">
      {pairs.length === 0 ? (
        <p className="text-gray-600 text-sm text-center mt-8">No moves yet</p>
      ) : (
        <div className="space-y-0.5">
          {pairs.map(([w, b], i) => (
            <div key={i} className="flex text-sm font-mono">
              <span className="w-8 text-gray-600 shrink-0">{i + 1}.</span>
              <span className={`w-20 ${i * 2 + 1 === moves.length ? 'text-gold font-semibold' : 'text-gray-300'}`}>
                {w.san}
              </span>
              {b && (
                <span className={`w-20 ${i * 2 + 2 === moves.length ? 'text-gold font-semibold' : 'text-gray-300'}`}>
                  {b.san}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
