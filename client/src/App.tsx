import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Lobby from './pages/Lobby'
import GamePage from './pages/GamePage'
import PlayAI from './pages/PlayAI'
import Profile from './pages/Profile'
import { Toaster } from 'sonner'

export default function App() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/game/:roomId" element={<GamePage />} />
          <Route path="/play-ai" element={<PlayAI />} />
          <Route path="/profile/:username" element={<Profile />} />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0f0f0' },
        }}
      />
    </div>
  )
}
