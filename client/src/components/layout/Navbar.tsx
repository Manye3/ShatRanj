import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LogOut, Menu, X, Cpu, Swords, User as UserIcon } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">♛</span>
          <span className="text-xl font-bold bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
            ShatRanj
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-5">
          {user && (
            <>
              <Link to="/lobby" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                <Swords size={16} /> Play Online
              </Link>
              <Link to="/play-ai" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                <Cpu size={16} /> vs AI
              </Link>
              <Link to={`/profile/${user.username}`} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                <UserIcon size={16} /> Profile
              </Link>
            </>
          )}
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <div className="px-3 py-1.5 bg-dark-card border border-dark-border rounded-lg text-sm">
                <span className="text-gold mr-1">♔</span>
                {user.username}
                <span className="text-gray-500 ml-1.5 text-xs">({user.rating})</span>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-4 py-1.5 bg-gold hover:bg-gold-dark text-black text-sm font-semibold rounded-lg transition-all">
              Login
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-gray-400" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-dark-bg border-b border-dark-border px-4 py-3 space-y-2 animate-fade-in">
          {user ? (
            <>
              <Link to="/lobby" onClick={() => setOpen(false)} className="block py-2 text-gray-400 hover:text-white">Play Online</Link>
              <Link to="/play-ai" onClick={() => setOpen(false)} className="block py-2 text-gray-400 hover:text-white">vs AI</Link>
              <Link to={`/profile/${user.username}`} onClick={() => setOpen(false)} className="block py-2 text-gray-400 hover:text-white">Profile</Link>
              <button onClick={() => { handleLogout(); setOpen(false) }} className="block py-2 text-red-400">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="block py-2 text-gold">Login</Link>
          )}
        </div>
      )}
    </nav>
  )
}
