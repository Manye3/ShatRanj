import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from '@/types'
import { Send } from 'lucide-react'

interface Props {
  messages: ChatMessage[]
  onSend: (text: string) => void
  username: string
}

export default function GameChat({ messages, onSend, username }: Props) {
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="flex flex-col h-64 bg-dark-bg rounded-lg border border-dark-border">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-600 text-sm text-center mt-8">No messages yet. Say hi!</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="text-sm">
              <span className={`font-semibold ${msg.username === username ? 'text-gold' : 'text-blue-400'}`}>
                {msg.username}
              </span>
              <span className="text-gray-300 ml-1.5">{msg.text}</span>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2 p-2 border-t border-dark-border">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-dark-card border border-dark-border rounded px-3 py-1.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/40"
        />
        <button onClick={handleSend} className="p-2 text-gold hover:text-gold-light transition-colors">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
