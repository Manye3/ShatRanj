import { useCallback, useRef, useEffect } from 'react'

type SoundType = 'move' | 'capture' | 'check' | 'gameEnd'

export function useSound() {
  const audioMap = useRef<Record<string, HTMLAudioElement>>({})

  useEffect(() => {
    // Use free chess.com-style sounds via data URIs or simple beeps
    // For production, replace with actual .mp3 files in /public/sounds/
    audioMap.current = {}
  }, [])

  const play = useCallback((_type: SoundType) => {
    // Sound placeholder — add actual sound files for production
    // const audio = audioMap.current[type]
    // if (audio) { audio.currentTime = 0; audio.play().catch(() => {}) }
  }, [])

  return { play }
}
