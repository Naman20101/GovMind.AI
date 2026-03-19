'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Landmark, ChevronRight, User, LogOut } from 'lucide-react'

interface Session { name: string; email: string }

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    try {
      const s = localStorage.getItem('govmind_session')
      if (s) setSession(JSON.parse(s))
      else setSession(null)
    } catch (_e) { setSession(null) }
  }, [pathname])

  const logout = () => {
    localStorage.removeItem('govmind_session')
    setSession(null)
    router.push('/')
  }

  const links = [
    { href: '/apply', label: 'Apply for Permit' },
    { href: '/status', label: 'Check Status' },
  ]

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#1B4F72] rounded-lg flex items-center justify-center group-hover:bg-[#154360] transition-colors">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1B4F72] text-lg tracking-tight">
              GovMind<span className="text-[#F39C12]">.AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link key={link.href} href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-[#1B4F72]/10 text-[#1B4F72]'
                    : 'text-gray-600 hover:text-[#1B4F72] hover:bg-gray-50'
                }`}>
                {link.label}
              </Link>
            ))}

            {session ? (
              <div className="flex items-center gap-2 ml-3">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                  <div className="w-6 h-6 bg-[#1B4F72] rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-[#1B4F72]">
                    {session.name.split(' ')[0]}
                  </span>
                </div>
                <button onClick={logout}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-3">
                <Link href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-[#1B4F72] transition-all">
                  Sign In
                </Link>
                <Link href="/login"
                  className="flex items-center gap-1.5 bg-[#1B4F72] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#154360] transition-all shadow-sm">
                  Get Started <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-1 animate-fade-in">
            {links.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-[#1B4F72]/5 hover:text-[#1B4F72] transition-colors">
                {link.label}
              </Link>
            ))}

            {session ? (
              <div className="px-4 py-3 border-t border-gray-100 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#1B4F72] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1B4F72]">{session.name}</p>
                    <p className="text-xs text-gray-400">{session.email}</p>
                  </div>
                </div>
                <button onClick={() => { logout(); setOpen(false) }}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 px-2 py-1">
                  <LogOut className="w-4 h-4" />Sign out
                </button>
              </div>
            ) : (
              <div className="pt-2 space-y-2">
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 bg-[#1B4F72] text-white px-4 py-3 rounded-xl text-sm font-medium">
                  Get Started <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex items-center justify-center text-sm text-gray-500 py-2">
                  Already have an account? Sign in
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}