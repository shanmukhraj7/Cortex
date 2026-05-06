import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { useToast } from '../components/ui/Toast.jsx'

function NeuralBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 1200 800" fill="none">
        <circle cx="300" cy="200" r="140" stroke="#abcdcd" strokeWidth="0.5" />
        <circle cx="950" cy="550" r="180" stroke="#ffb3b0" strokeWidth="0.5" />
        <circle cx="1100" cy="150" r="90"  stroke="#c8bfff" strokeWidth="0.5" />
        <line x1="300" y1="200" x2="950" y2="550" stroke="#abcdcd" strokeWidth="0.3" />
        <line x1="300" y1="200" x2="1100" y2="150" stroke="#ffb3b0" strokeWidth="0.3" />
        <line x1="950" y1="550" x2="1100" y2="150" stroke="#c8bfff" strokeWidth="0.3" />
        <circle cx="650" cy="380" r="6" fill="#abcdcd" opacity="0.4" />
        <circle cx="300" cy="200" r="4" fill="#ffb3b0" opacity="0.6" />
      </svg>
      <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
    </div>
  )
}

export default function RegisterPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [errors,   setErrors]   = useState({})
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const toast    = useToast()

  const validate = () => {
    const e = {}
    if (!email.trim())                    e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email.'
    if (!password)                        e.password = 'Password is required.'
    else if (password.length < 8)         e.password = 'Minimum 8 characters.'
    if (!confirm)                         e.confirm  = 'Please confirm your password.'
    else if (confirm !== password)        e.confirm  = 'Passwords do not match.'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    if (!validate()) return
    const res = await register(email.trim(), password)
    if (res.success) {
      toast.success('Account created! Sign in to continue.')
      navigate('/login')
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-md relative bg-background dark">
      <NeuralBackground />

      <div className="relative w-full max-w-2xl mx-auto flex flex-col gap-lg animate-fade-in">

        {/* Hero text */}
        <div className="flex flex-col items-start gap-xs">
          <div className="flex items-center gap-xs mb-sm px-sm py-xs rounded-full border border-white/10 bg-surface-container-low/50 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
              Join Cortex
            </span>
          </div>

          <h1 className="font-h1 text-h1 text-on-surface leading-[1.05] tracking-tight">
            Create
          </h1>
          <h1
            className="font-h1 text-h1 leading-[1.05] tracking-tight"
            style={{ color: '#ffb3b0' }}
          >
            Account
          </h1>

          <p className="text-on-surface-variant font-body-md mt-md max-w-lg leading-relaxed">
            Start building your personal knowledge graph today. Every note becomes a semantic node.
          </p>
        </div>

        {/* Register form */}
        <div className="glass-panel rounded-xl p-md relative">
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />

          <div className="flex items-center justify-between border-b border-white/5 pb-sm mb-md">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Sign Up
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
              placeholder="Create a password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              type="password"
              placeholder="Confirm your password..."
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
              autoComplete="new-password"
            />

            <div className="flex items-center justify-between pt-xs border-t border-white/5 mt-xs">
              <Link
                to="/login"
                className="font-label-caps text-[11px] text-on-surface-variant/60 hover:text-primary uppercase tracking-widest transition-colors"
              >
                Back to Sign in
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
                Create Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}