'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Landmark, ChevronRight } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '/apply', label: 'Apply for Permit' },
    { href: '/status', label: 'Check Status' },
    { href: '/admin', label: 'Admin' },
  ]

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#1B4F72] rounded-lg flex items-center justify-center group-hover:bg-[#154360] transition-colors">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1B4F72] text-lg tracking-tight">
              GovMind<span className="text-[#F39C12]">.AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-[#1B4F72]/10 text-[#1B4F72]'
                    : 'text-gray-600 hover:text-[#1B4F72] hover:bg-gray-50'
                }`}>
                {link.label}
              </Link>
            ))}
            <Link href="/apply"
              className="ml-3 flex items-center gap-1.5 bg-[#1B4F72] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#154360] transition-all shadow-sm">
              Get Started <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </nav>

          <button onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-1 animate-fade-in">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-[#1B4F72]/5 hover:text-[#1B4F72] transition-colors">
                {link.label}
              </Link>
            ))}
            <Link href="/apply" onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 mt-2 bg-[#1B4F72] text-white px-4 py-3 rounded-xl text-sm font-medium">
              Get Started <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
