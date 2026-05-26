import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export default function Login() {
  const { user, login, register, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { if (!loading && user) navigate('/lobby') }, [user, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    if (tab === 'register' && password !== confirmPw) {
      toast.error('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      if (tab === 'login') await login(username, password)
      else await register(username, password)
      navigate('/lobby')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-xl p-6 animate-fade-in">
        <div className="text-center mb-6">
          <span className="text-4xl block mb-2">♛</span>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
            Welcome to ShatRanj
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-dark-bg rounded-lg p-1">
          {(['login', 'register'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'}`}>
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username"
              className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-gold/50" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"
              className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-gold/50" />
          </div>
          {tab === 'register' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm password"
                className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-gold/50" />
            </div>
          )}
          <button type="submit" disabled={submitting}
            className="w-full py-2.5 bg-gold hover:bg-gold-dark text-black font-semibold rounded-lg transition-all disabled:opacity-50">
            {submitting ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> {tab === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
