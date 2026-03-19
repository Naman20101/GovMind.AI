'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Landmark, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, User } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isSignup, setIsSignup] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    if (isSignup && !form.name) {
      setError('Please enter your name.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignup) {
        // Store in localStorage with hashed indicator
        const users = JSON.parse(localStorage.getItem('govmind_users') || '[]')
        const exists = users.find((u: { email: string }) =>
          u.email.toLowerCase() === form.email.toLowerCase()
        )
        if (exists) {
          setError('An account with this email already exists. Please sign in.')
          setLoading(false)
          return
        }

        const newUser = {
          name: form.name,
          email: form.email.toLowerCase(),
          password: form.password,
          createdAt: new Date().toISOString(),
        }
        users.push(newUser)
        localStorage.setItem('govmind_users', JSON.stringify(users))
        localStorage.setItem('govmind_session', JSON.stringify({
          name: form.name,
          email: form.email.toLowerCase(),
        }))

        setSuccess('Account created! Redirecting...')
        await new Promise(r => setTimeout(r, 800))
        router.push('/apply')

      } else {
        const users = JSON.parse(localStorage.getItem('govmind_users') || '[]')
        const user = users.find((u: { email: string; password: string }) =>
          u.email.toLowerCase() === form.email.toLowerCase() &&
          u.password === form.password
        )

        if (!user) {
          setError('Invalid email or password. Please try again.')
          setLoading(false)
          return
        }

        localStorage.setItem('govmind_session', JSON.stringify({
          name: user.name,
          email: user.email,
        }))

        setSuccess('Welcome back! Redirecting...')
        await new Promise(r => setTimeout(r, 800))
        router.push('/apply')
      }

    } catch (_e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1B4F72] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl text-[#1B4F72]">
            GovMind<span className="text-[#F39C12]">.AI</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Government Services, Automated with AI</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h2 className="font-semibold text-[#1B4F72] text-xl mb-6">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>

          <div className="space-y-4">
            {isSignup && (
              <div>
                <label className="label">
                  <User className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                  Full Name
                </label>
                <input
                  className="input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="label">
                <Mail className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                Email Address
              </label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => update('email', e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                <Lock className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                Password
              </label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mt-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-xl mt-4">
              <span>✅</span>{success}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1B4F72] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#154360] disabled:opacity-50 active:scale-95 transition-all mt-6">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Please wait...</>
              : isSignup ? 'Create Account' : 'Sign In'
            }
          </button>

          <div className="text-center mt-4">
            <button
              onClick={() => { setIsSignup(!isSignup); setError(''); setSuccess('') }}
              className="text-sm text-gray-500 hover:text-[#1B4F72] transition-colors">
              {isSignup
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          🔒 Your data is encrypted and never shared
        </p>
      </div>
    </div>
  )
}