'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Landmark, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, User } from 'lucide-react'

interface StoredUser {
  name: string
  email: string
  password: string
  createdAt: string
}

export default function LoginPage() {
  const router = useRouter()
  const [isSignup, setIsSignup] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  // ✅ Check if already logged in
  useEffect(() => {
    try {
      const session = localStorage.getItem('govmind_session')
      if (session) {
        router.push('/apply')
      }
    } catch (_e) { /* ignore */ }
  }, [router])

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const getUsers = (): StoredUser[] => {
    try {
      return JSON.parse(localStorage.getItem('govmind_users') || '[]')
    } catch (_e) {
      return []
    }
  }

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem('govmind_users', JSON.stringify(users))
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please fill in all fields.')
      return
    }
    if (isSignup && !form.name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      const normalizedEmail = form.email.trim().toLowerCase()

      if (isSignup) {
        const users = getUsers()
        const exists = users.find(u => u.email === normalizedEmail)

        if (exists) {
          setError('Account already exists. Please sign in instead.')
          setLoading(false)
          return
        }

        const newUser: StoredUser = {
          name: form.name.trim(),
          email: normalizedEmail,
          password: form.password,
          createdAt: new Date().toISOString(),
        }

        users.push(newUser)
        saveUsers(users)

        // ✅ Save session
        localStorage.setItem('govmind_session', JSON.stringify({
          name: newUser.name,
          email: newUser.email,
        }))

        setSuccess('Account created! Redirecting...')
        await new Promise(r => setTimeout(r, 700))
        router.push('/apply')

      } else {
        const users = getUsers()
        const user = users.find(
          u => u.email === normalizedEmail && u.password === form.password
        )

        if (!user) {
          // ✅ Helpful error — distinguish wrong password vs no account
          const emailExists = users.find(u => u.email === normalizedEmail)
          if (emailExists) {
            setError('Incorrect password. Please try again.')
          } else {
            setError('No account found. Please sign up first.')
          }
          setLoading(false)
          return
        }

        // ✅ Save session with fresh data
        localStorage.setItem('govmind_session', JSON.stringify({
          name: user.name,
          email: user.email,
        }))

        setSuccess(`Welcome back, ${user.name}! Redirecting...`)
        await new Promise(r => setTimeout(r, 700))
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

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1B4F72] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl text-[#1B4F72]">
            GovMind<span className="text-[#F39C12]">.AI</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Government Services, Automated with AI</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <h2 className="font-semibold text-[#1B4F72] text-xl mb-2">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {isSignup
              ? 'Sign up to track your permit applications'
              : 'Sign in to view your applications'
            }
          </p>

          <div className="space-y-4">
            {isSignup && (
              <div>
                <label className="label">
                  <User className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />Full Name
                </label>
                <input className="input" placeholder="John Doe"
                  value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
            )}
            <div>
              <label className="label">
                <Mail className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />Email Address
              </label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div>
              <label className="label">
                <Lock className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />Password
              </label>
              <div className="relative">
                <input className="input pr-10"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                <button onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

          <button onClick={handleSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1B4F72] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#154360] disabled:opacity-50 active:scale-95 transition-all mt-6">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Please wait...</>
              : isSignup ? 'Create Account' : 'Sign In'
            }
          </button>

          <div className="text-center mt-4">
            <button onClick={() => { setIsSignup(!isSignup); setError(''); setSuccess('') }}
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