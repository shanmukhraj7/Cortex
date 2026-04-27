import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import CortexLogo from '../components/ui/CortexLogo.jsx'
import { useToast } from '../components/ui/Toast.jsx'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const { login, isLoading } = useAuthStore()
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
      <div className="min-h-dvh bg-zinc-950 flex border-grid">
        {/* Left panel — branding */}
        <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 border-r border-zinc-800/60 relative overflow-hidden">
          {/* BG geometric decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-400/3 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-400/5 blur-2xl" />
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M48 0H0v48" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3 relative">
            <CortexLogo size={32} />
            <span className="font-display font-bold text-2xl text-zinc-100">Cortex</span>
          </div>

          {/* Tagline */}
          <div className="relative">
            <p className="text-[11px] text-amber-400/60 font-mono uppercase tracking-[0.25em] mb-4">
              — Personal Knowledge Base
            </p>
            <h2 className="font-display text-5xl font-bold text-zinc-100 leading-tight mb-6">
              Think in<br />
              <span className="text-gradient-amber italic">connections,</span><br />
              not keywords.
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
              Cortex uses a two-stage semantic search pipeline to surface what you know,
              even when you can't remember exactly how you wrote it.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {[
                ['⌖', 'Semantic search across all your notes'],
                ['◈', 'Two-stage retrieval: bi-encoder + reranker'],
                ['⬡', 'Organise with tags, find with language'],
              ].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-zinc-500">
                    <span className="text-amber-400/60 font-mono text-base w-5 text-center">{icon}</span>
                    {text}
                  </div>
              ))}
            </div>
          </div>

          <p className="text-zinc-800 text-xs font-mono relative">
            CORTEX · {new Date().getFullYear()}
          </p>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="w-full max-w-sm animate-slide-up">
            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-10 lg:hidden">
              <CortexLogo size={28} />
              <span className="font-display font-bold text-xl text-zinc-100">Cortex</span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-zinc-100 mb-1">Welcome back</h1>
              <p className="text-zinc-600 text-sm">Sign in to access your knowledge base</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  autoComplete="email"
                  autoFocus
              />
              <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  autoComplete="current-password"
              />

              <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-2">
                Sign in
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-600 mt-6">
              No account?{' '}
              <Link to="/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Create one →
              </Link>
            </p>
          </div>
        </div>
      </div>
  )
}