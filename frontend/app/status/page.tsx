'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Clock, CheckCircle, AlertTriangle,
  XCircle, Users, FileText, ArrowRight, Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Session { name: string; email: string }
interface LocalPermit {
  id: string
  business_name: string
  permit_type: string
  status: string
  submitted_at: string
}
interface LivePermit extends LocalPermit {
  ai_decision: string | null
  ai_confidence: number | null
}

function StatusIcon({ status }: { status: string }) {
  const map: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
    PENDING:      { icon: Clock,         color: 'text-[#F39C12]', bg: 'bg-amber-50' },
    APPROVED:     { icon: CheckCircle,   color: 'text-[#27AE60]', bg: 'bg-green-50' },
    FLAGGED:      { icon: AlertTriangle, color: 'text-[#E74C3C]', bg: 'bg-red-50' },
    REJECTED:     { icon: XCircle,       color: 'text-[#E74C3C]', bg: 'bg-red-50' },
    HUMAN_REVIEW: { icon: Users,         color: 'text-blue-600',  bg: 'bg-blue-50' },
  }
  const cfg = map[status] || map.PENDING
  const Icon = cfg.icon
  return (
    <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-5 h-5 ${cfg.color}`} />
    </div>
  )
}

export default function StatusPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [permits, setPermits] = useState<LivePermit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchId, setSearchId] = useState('')

  useEffect(() => {
    try {
      const s = localStorage.getItem('govmind_session')
      if (s) {
        const parsed = JSON.parse(s)
        setSession(parsed)
        loadUserPermits(parsed.email)
      } else {
        setLoading(false)
      }
    } catch (_e) {
      setLoading(false)
    }
  }, [])

  const loadUserPermits = async (email: string) => {
    setLoading(true)
    try {
      const key = `govmind_permits_${email}`
      const local: LocalPermit[] = JSON.parse(localStorage.getItem(key) || '[]')

      if (local.length === 0) {
        setPermits([])
        setLoading(false)
        return
      }

      const livePermits: LivePermit[] = []
      for (const p of local.slice(0, 20)) {
        try {
          const res = await fetch(`/api/permits/${p.id}`, { cache: 'no-store' })
          if (res.ok) {
            const data = await res.json()
            livePermits.push({
              id: data.id,
              business_name: data.business_name,
              permit_type: data.permit_type,
              status: data.status,
              submitted_at: data.submitted_at,
              ai_decision: data.ai_decision,
              ai_confidence: data.ai_confidence,
            })
          } else {
            livePermits.push({ ...p, ai_decision: null, ai_confidence: null })
          }
        } catch (_e) {
          livePermits.push({ ...p, ai_decision: null, ai_confidence: null })
        }
      }
      setPermits(livePermits)
    } catch (_e) {
      setPermits([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchId.trim()) {
      router.push(`/status/${searchId.trim()}`)
    }
  }

  if (!session && !loading) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="w-14 h-14 bg-[#1B4F72]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-7 h-7 text-[#1B4F72]" />
        </div>
        <h1 className="font-serif text-4xl text-[#1B4F72] mb-3">Check Status</h1>
        <p className="text-gray-500 mb-8">
          Sign in to see your applications, or enter an application ID below.
        </p>
        <div className="flex gap-3 mb-6">
          <input className="input flex-1" placeholder="Enter Application ID..."
            value={searchId} onChange={e => setSearchId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <button onClick={handleSearch} disabled={!searchId.trim()}
            className="flex items-center gap-2 bg-[#1B4F72] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#154360] disabled:opacity-40 active:scale-95 transition-all">
            <Search className="w-4 h-4" />
          </button>
        </div>
        <Link href="/login"
          className="flex items-center justify-center gap-2 bg-[#1B4F72] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#154360] transition-all">
          Sign in to view your applications
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <span className="text-xs font-semibold text-[#F39C12] tracking-widest uppercase mb-2 block">
          My Applications
        </span>
        <h1 className="font-serif text-4xl text-[#1B4F72]">Application Status</h1>
        {session && (
          <p className="text-gray-500 mt-1">Showing applications for {session.email}</p>
        )}
      </div>

      <div className="flex gap-3 mb-8">
        <input className="input flex-1" placeholder="Search by Application ID..."
          value={searchId} onChange={e => setSearchId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button onClick={handleSearch} disabled={!searchId.trim()}
          className="flex items-center gap-2 bg-[#1B4F72] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#154360] disabled:opacity-40 active:scale-95 transition-all">
          <Search className="w-4 h-4" />Check
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#1B4F72] animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading your applications...</p>
          </div>
        </div>
      ) : permits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-600 mb-2">No applications yet</h3>
          <p className="text-gray-400 text-sm mb-6">Submit your first permit application to get started.</p>
          <Link href="/apply"
            className="inline-flex items-center gap-2 bg-[#1B4F72] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#154360] transition-all">
            Apply for a Permit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {permits.map(p => (
            <Link key={p.id} href={`/status/${p.id}`}
              className="block bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-all hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <StatusIcon status={p.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-[#1B4F72] truncate">{p.business_name}</h3>
                    <span className={`badge flex-shrink-0 ${
                      p.status === 'APPROVED' ? 'badge-approved' :
                      p.status === 'FLAGGED' || p.status === 'REJECTED' ? 'badge-flagged' :
                      p.status === 'HUMAN_REVIEW' ? 'badge-human_review' : 'badge-pending'
                    }`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{p.permit_type}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 font-mono">
                      APP-{p.id.slice(0,8).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-3">
                      {p.ai_confidence != null && (
                        <span className="text-xs text-gray-400">AI: {p.ai_confidence}%</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(p.submitted_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/apply"
          className="inline-flex items-center gap-2 text-sm text-[#1B4F72] hover:underline">
          + Submit a new application
        </Link>
      </div>
    </div>
  )
}