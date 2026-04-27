import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import CortexLogo from '../components/ui/CortexLogo.jsx'
import { useToast } from '../components/ui/Toast.jsx'

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
    if (!email.trim())              e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email.'
    if (!password)                  e.password = 'Password is required.'
    else if (password.length < 8)   e.password = 'Minimum 8 characters.'
    if (!confirm)                   e.confirm  = 'Please confirm your password.'
    else if (confirm !== password)  e.confirm  = 'Passwords do not match.'
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

  const strength = !password ? 0
      : password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3
          : password.length >= 8  ? 2
              : 1

  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-500', 'bg-amber-400', 'bg-emerald-500'][strength]

  return (
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <CortexLogo size={28} />
            <span className="font-display font-bold text-xl text-zinc-100">Cortex</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-100 mb-1">Create account</h1>
            <p className="text-zinc-600 text-sm">Start building your knowledge base</p>
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
            <div className="flex flex-col gap-1.5">
              <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  autoComplete="new-password"
              />
              {password && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                          className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                          style={{ width: `${(strength / 3) * 100}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono ${['','text-red-400','text-amber-400','text-emerald-400'][strength]}`}>
                  {strengthLabel}
                </span>
                  </div>
              )}
            </div>
            <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={errors.confirm}
                autoComplete="new-password"
            />

            <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-2">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
  )
}