import { Link } from 'react-router-dom'
import { Cpu, Swords, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Chess pattern BG */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c4a256'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 text-center animate-fade-in">
        <span className="text-7xl md:text-8xl block mb-4">♛</span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-3">
          <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
            ShatRanj
          </span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 tracking-[0.3em] uppercase mb-12">
          Play. Compete. Evolve.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/lobby"
            className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gold hover:bg-gold-dark text-black font-semibold rounded-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(196,162,86,0.3)]">
            <Swords size={18} /> Play Online
          </Link>
          <Link to="/play-ai"
            className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-dark-border text-gray-300 hover:border-gold hover:text-gold rounded-lg transition-all hover:scale-105">
            <Cpu size={18} /> Play vs AI
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { icon: <Zap size={20} />, title: 'Real-time', desc: 'Socket.IO multiplayer with server clocks' },
            { icon: <Cpu size={20} />, title: 'Custom AI', desc: 'Minimax engine with alpha-beta pruning' },
            { icon: <Swords size={20} />, title: 'Elo Ratings', desc: 'FIDE-style competitive rating system' },
          ].map((f, i) => (
            <div key={i} className="bg-dark-card/50 border border-dark-border rounded-lg p-4 text-center hover:border-gold/20 transition-colors">
              <div className="text-gold mb-2 flex justify-center">{f.icon}</div>
              <div className="text-sm font-medium text-white">{f.title}</div>
              <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
