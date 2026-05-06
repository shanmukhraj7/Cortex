import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { useToast } from '../components/ui/Toast.jsx'

// Decorative node graph background
function NeuralBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 1200 800" fill="none">
        <circle cx="200" cy="150" r="120" stroke="#ffb3b0" strokeWidth="0.5" />
        <circle cx="900" cy="600" r="200" stroke="#abcdcd" strokeWidth="0.5" />
        <circle cx="1050" cy="200" r="80"  stroke="#c8bfff" strokeWidth="0.5" />
        <line x1="200" y1="150" x2="900" y2="600" stroke="#ffb3b0" strokeWidth="0.3" />
        <line x1="200" y1="150" x2="1050" y2="200" stroke="#abcdcd" strokeWidth="0.3" />
        <line x1="900" y1="600" x2="1050" y2="200" stroke="#c8bfff" strokeWidth="0.3" />
        <line x1="600" y1="400" x2="200" y2="150" stroke="#ffb3b0" strokeWidth="0.3" />
        <circle cx="600" cy="400" r="6" fill="#e26c6c" opacity="0.4" />
        <circle cx="200" cy="150" r="4" fill="#ffb3b0" opacity="0.6" />
        <circle cx="900" cy="600" r="5" fill="#abcdcd" opacity="0.5" />
        <circle cx="1050" cy="200" r="3" fill="#c8bfff" opacity="0.5" />
      </svg>
      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-[80px]" />
    </div>
  )
}

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
    if (!email.trim()) e.email    = 'Email is required.'
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
    <div className="min-h-dvh flex flex-col items-center justify-center p-md relative bg-background dark">
      <NeuralBackground />

      <div className="relative w-full max-w-2xl mx-auto flex flex-col gap-lg animate-fade-in">

        {/* Hero text */}
        <div className="flex flex-col items-start gap-xs">
          <div className="flex items-center gap-xs mb-sm px-sm py-xs rounded-full border border-white/10 bg-surface-container-low/50 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
              Personal Knowledge Base
            </span>
          </div>

          <h1 className="font-h1 text-h1 text-on-surface leading-[1.05] tracking-tight">
            Knowledge
          </h1>
          <h1
            className="font-h1 text-h1 leading-[1.05] tracking-tight"
            style={{ color: '#ffb3b0' }}
          >
            Cortex
          </h1>

          <p className="text-on-surface-variant font-body-md mt-md max-w-lg leading-relaxed">
            Write, organise, and retrieve notes using natural language — powered by a two-stage semantic ML pipeline.
          </p>

          <div className="flex flex-wrap gap-sm mt-md">
            {[
              { icon: '⚡', label: 'Bi-encoder Retrieval' },
              { icon: '🎯', label: 'Cross-encoder Reranking' },
              { icon: '🧬', label: 'Local Embeddings' },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-xs px-sm py-xs rounded-full border border-white/10 bg-surface-container-low text-xs text-on-surface-variant font-code"
              >
                {icon} {label}
              </span>
            ))}
          </div>
        </div>

        {/* Login form */}
        <div className="glass-panel rounded-xl p-md relative">
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="flex items-center justify-between border-b border-white/5 pb-sm mb-md">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Sign In
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
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

            <div className="flex items-center justify-between pt-xs">
              <Link
                to="/register"
                className="font-label-caps text-[11px] text-on-surface-variant/60 hover:text-primary uppercase tracking-widest transition-colors"
              >
                Create Account
              </Link>
              <Button
                type="submit"
                isLoading={isLoading}
                size="lg"
                rightIcon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14m-7-7l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              >
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}