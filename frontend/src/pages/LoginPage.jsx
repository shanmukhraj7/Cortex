import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { useToast } from '../components/ui/Toast.jsx'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const { login, isLoading }    = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const toast    = useToast()
  const from     = location.state?.from?.pathname || '/dashboard'

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email = 'Email is required.'
    if (!password)     e.password = 'Password is required.'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    if (!validate()) return
    const res = await login(email.trim(), password)
    if (res.success) navigate(from, { replace: true })
    else toast.error(res.error)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-10 animate-fade-in">
        
        {/* Massive Header like the image */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full border border-carbon-500 bg-carbon-800/50">
             <span className="w-1.5 h-1.5 rounded-full bg-coral-500"></span>
             <span className="text-[10px] font-bold text-carbon-200 uppercase tracking-widest">Personal Knowledge Base</span>
          </div>
          
          <h1 className="font-display text-5xl sm:text-7xl font-bold leading-[1.1] tracking-wide text-white">
            Knowledge
          </h1>
          <h1 className="font-display text-5xl sm:text-7xl font-bold leading-[1.1] tracking-wide text-brand-gradient">
            Cortex
          </h1>
          
          <p className="text-carbon-200 mt-6 text-sm sm:text-base max-w-lg leading-relaxed">
            Paste any idea or research and get an accurate, semantic retrieval system — powered by a two-stage ML pipeline.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <span className="px-3 py-1.5 rounded-full border border-carbon-500 bg-carbon-800 text-xs text-carbon-200 flex items-center gap-2 font-medium">
              📁 Semantic Search
            </span>
            <span className="px-3 py-1.5 rounded-full border border-carbon-500 bg-carbon-800 text-xs text-carbon-200 flex items-center gap-2 font-medium">
              ⚡ Cross-encoder
            </span>
            <span className="px-3 py-1.5 rounded-full border border-carbon-500 bg-carbon-800 text-xs text-carbon-200 flex items-center gap-2 font-medium">
              🧬 Local Embeddings
            </span>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-carbon-900 border border-carbon-500 rounded-2xl p-6 sm:p-8 relative">
          <div className="flex items-center justify-between border-b border-carbon-500/50 pb-4 mb-6">
            <span className="text-xs font-bold text-carbon-200 uppercase tracking-widest">Sign In</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />
            <Input
              type="password"
              placeholder="Enter your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between pt-2">
              <Link to="/register" className="text-xs font-bold text-carbon-400 hover:text-white uppercase tracking-widest transition-colors">
                Create Account
              </Link>
              <Button type="submit" isLoading={isLoading} size="lg" rightIcon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14m-7-7l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }>
                Sign in
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}