'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  FileText, Clock, CheckCircle, AlertTriangle,
  Loader2, X, Check, ChevronDown, RefreshCw,
  Lock, Mail, Wifi, WifiOff
} from 'lucide-react'
import AuditTraceViewer from '@/components/AuditTraceViewer'
import { type PermitListItem, type PermitResponse } from '@/lib/api'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING:      'badge badge-pending',
    APPROVED:     'badge badge-approved',
    FLAGGED:      'badge badge-flagged',
    REJECTED:     'badge badge-rejected',
    HUMAN_REVIEW: 'badge badge-human_review',
  }
  return (
    <span className={map[status] || 'badge bg-gray-100 text-gray-600'}>
      {status.replace('_', ' ')}
    </span>
  )
}

interface Modal {
  permit: PermitListItem
  action: 'APPROVED' | 'REJECTED'
  fullData?: PermitResponse
}

const ADMIN_EMAIL = 'namanreddy24@gmail.com'
const ADMIN_PASSWORD = 'GovMind@Naman2026'

export default function AdminPage() {
  const [adminAuth, setAdminAuth] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPass, setAdminPass] = useState('')
  const [adminError, setAdminError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const [permits, setPermits] = useState<PermitListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [serverStatus, setServerStatus] = useState<'unknown' | 'waking' | 'online' | 'offline'>('unknown')
  const [loadingStep, setLoadingStep] = useState('')
  const [filter, setFilter] = useState('')
  const [modal, setModal] = useState<Modal | null>(null)
  const [reason, setReason] = useState('')
  const [reviewer, setReviewer] = useState('Naman Reddy')
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const auth = sessionStorage.getItem('govmind_admin')
    if (auth === 'true') setAdminAuth(true)
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current)
    }
  }, [])

  const handleAdminLogin = () => {
    if (
      adminEmail.trim().toLowerCase() === ADMIN_EMAIL &&
      adminPass === ADMIN_PASSWORD
    ) {
      sessionStorage.setItem('govmind_admin', 'true')
      setAdminAuth(true)
      setAdminError('')
    } else {
      setAdminError('Access denied. Invalid credentials.')
    }
  }

  const handleLock = () => {
    sessionStorage.removeItem('govmind_admin')
    setAdminAuth(false)
    setAdminEmail('')
    setAdminPass('')
    setPermits([])
  }

  const load = useCallback(async (isAutoRetry = false) => {
    if (!isAutoRetry) {
      setLoading(true)
      setServerStatus('waking')
      setLoadingStep('Waking up server...')
    }

    try {
      const params = new URLSearchParams()
      if (filter) params.append('status', filter)

      const res = await fetch(`/api/permits/all?${params}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })

      if (res.status === 202) {
        // Server still waking — auto retry in 5 seconds
        setLoadingStep('Server is waking up... please wait (this takes ~60 seconds)')
        setServerStatus('waking')
        retryRef.current = setTimeout(() => load(true), 5000)
        return
      }

      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setPermits(data)
          setLastRefresh(new Date())
          setServerStatus('online')
          setLoading(false)
          setLoadingStep('')
        } else {
          // Got non-array — retry
          retryRef.current = setTimeout(() => load(true), 5000)
        }
      } else {
        setServerStatus('offline')
        setLoadingStep('Connection failed. Retrying...')
        retryRef.current = setTimeout(() => load(true), 5000)
      }
    } catch (_e) {
      setServerStatus('waking')
      setLoadingStep('Connecting to server... retrying...')
      retryRef.current = setTimeout(() => load(true), 5000)
    }
  }, [filter])

  useEffect(() => {
    if (adminAuth) {
      setLoading(true)
      load()
    }
  }, [filter, adminAuth, load])

  const openModal = async (permit: PermitListItem, action: 'APPROVED' | 'REJECTED') => {
    setModal({ permit, action })
    setReason('')
    setReviewer('Naman Reddy')
    setModalError('')
    try {
      const res = await fetch(`/api/permits/${permit.id}`, { cache: 'no-store' })
      if (res.ok) {
        const full = await res.json()
        setModal(p => p ? { ...p, fullData: full } : null)
      }
    } catch (_e) { /* open without full data */ }
  }

  const handleReview = async () => {
    if (!modal) return
    if (reason.length < 10) { setModalError('Reason must be at least 10 characters.'); return }
    if (!reviewer.trim()) { setModalError('Please enter your name.'); return }
    setSubmitting(true)
    setModalError('')
    try {
      const res = await fetch(`/api/permits/${modal.permit.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: modal.action,
          reason,
          reviewed_by: reviewer,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.detail || 'Submission failed')
      }
      setPermits(p =>
        p.map(x => x.id === modal.permit.id ? { ...x, status: modal.action } : x)
      )
      setModal(null)
    } catch (e) {
      setModalError(e instanceof Error ? e.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Apply filter client-side
  const filteredPermits = filter
    ? permits.filter(p => p.status === filter)
    : permits

  const counts = {
    total:    permits.length,
    pending:  permits.filter(p => p.status === 'PENDING').length,
    approved: permits.filter(p => p.status === 'APPROVED').length,
    flagged:  permits.filter(p => ['FLAGGED','REJECTED','HUMAN_REVIEW'].includes(p.status)).length,
  }

  // Login gate
  if (!adminAuth) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-sm">
          <div className="w-14 h-14 bg-[#1B4F72]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-[#1B4F72]" />
          </div>
          <h1 className="font-serif text-2xl text-[#1B4F72] text-center mb-1">Admin Portal</h1>
          <p className="text-gray-500 text-sm text-center mb-6">GovMind.AI — Creator access only</p>

          <div className="space-y-3">
            <div>
              <label className="label">
                <Mail className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />Admin Email
              </label>
              <input type="email" className="input"
                placeholder="Enter admin email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} />
            </div>
            <div>
              <label className="label">
                <Lock className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-16"
                  placeholder="Enter admin password"
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} />
                <button onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          {adminError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mt-4">
              <X className="w-4 h-4 flex-shrink-0" />{adminError}
            </div>
          )}

          <button onClick={handleAdminLogin}
            className="w-full bg-[#1B4F72] text-white py-3 rounded-xl font-medium hover:bg-[#154360] active:scale-95 transition-all mt-4">
            Access Dashboard
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">
            🔒 Restricted to authorized personnel only
          </p>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total',    value: counts.total,    icon: FileText,      color: 'text-[#1B4F72]', bg: 'bg-[#1B4F72]/5', border: 'border-l-[#1B4F72]' },
    { label: 'Pending',  value: counts.pending,  icon: Clock,         color: 'text-[#F39C12]', bg: 'bg-amber-50',    border: 'border-l-[#F39C12]' },
    { label: 'Approved', value: counts.approved, icon: CheckCircle,   color: 'text-[#27AE60]', bg: 'bg-green-50',    border: 'border-l-[#27AE60]' },
    { label: 'Flagged',  value: counts.flagged,  icon: AlertTriangle, color: 'text-[#E74C3C]', bg: 'bg-red-50',      border: 'border-l-[#E74C3C]' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-[#F39C12] tracking-widest uppercase mb-2 block">
            Admin Portal
          </span>
          <h1 className="font-serif text-4xl text-[#1B4F72]">Applications Dashboard</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500">Review and manage permit applications.</p>
            {serverStatus === 'online' && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Wifi className="w-3 h-3" />Server online
              </span>
            )}
            {serverStatus === 'waking' && (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <Loader2 className="w-3 h-3 animate-spin" />Server waking up...
              </span>
            )}
            {serverStatus === 'offline' && (
              <span className="flex items-center gap-1 text-xs text-red-500">
                <WifiOff className="w-3 h-3" />Reconnecting...
              </span>
            )}
          </div>
          {lastRefresh && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button onClick={handleLock}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 border border-gray-200">
          <Lock className="w-4 h-4" />Lock
        </button>
      </div>

      {/* Waking up banner */}
      {loading && loadingStep && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 px-5 py-4 rounded-xl mb-6">
          <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">{loadingStep}</p>
            <p className="text-xs mt-0.5 text-blue-600">
              Render free tier sleeps after inactivity. First load takes 30-60 seconds.
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(c => (
          <div key={c.label}
            className={`bg-white rounded-2xl shadow-card border-l-4 ${c.border} p-5 flex items-center gap-4`}>
            <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
              <div className="text-xs text-gray-400 font-medium">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/20 focus:border-[#1B4F72] cursor-pointer">
            <option value="">All Statuses</option>
            {['PENDING','APPROVED','FLAGGED','REJECTED','HUMAN_REVIEW'].map(s => (
              <option key={s} value={s}>{s.replace('_',' ')}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <button
          onClick={() => {
            if (retryRef.current) clearTimeout(retryRef.current)
            setLoading(true)
            setServerStatus('waking')
            setLoadingStep('Refreshing...')
            load()
          }}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:border-[#1B4F72] hover:text-[#1B4F72] transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <span className="text-xs text-gray-400 ml-auto">
          {filteredPermits.length} application{filteredPermits.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100">
        {loading && permits.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center max-w-sm">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#1B4F72]/20 border-t-[#1B4F72] animate-spin" />
              </div>
              <p className="text-[#1B4F72] font-semibold text-lg mb-2">
                Loading Applications
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                {loadingStep || 'Connecting to server...'}
              </p>
              <p className="text-gray-400 text-xs mt-3">
                This may take up to 60 seconds on first load
              </p>
            </div>
          </div>
        ) : filteredPermits.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">No applications found</p>
            <p className="text-sm mt-1 mb-4">
              {loading ? 'Still loading...' : 'Try changing the filter or refreshing'}
            </p>
            {!loading && (
              <button
                onClick={() => {
                  setLoading(true)
                  setServerStatus('waking')
                  setLoadingStep('Retrying...')
                  load()
                }}
                className="text-sm text-[#1B4F72] underline">
                Click to retry
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['App ID','Business','Type','Status','AI Decision','Confidence','Submitted','Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPermits.map((p, i) => (
                  <tr key={p.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/20'}`}>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                        {p.id.slice(0,8)}...
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-[#1B4F72]">{p.business_name}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{p.permit_type}</td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4">
                      {p.ai_decision
                        ? <StatusBadge status={p.ai_decision} />
                        : <span className="text-gray-300 text-sm">—</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      {p.ai_confidence != null
                        ? <span className="text-sm font-medium text-[#1B4F72]">{p.ai_confidence}%</span>
                        : <span className="text-gray-300 text-sm">—</span>
                      }
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(p.submitted_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openModal(p, 'APPROVED')}
                          disabled={p.status === 'APPROVED'}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#27AE60] text-[#27AE60] hover:bg-[#27AE60] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                          <Check className="w-3 h-3" />Approve
                        </button>
                        <button onClick={() => openModal(p, 'REJECTED')}
                          disabled={p.status === 'REJECTED'}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                          <X className="w-3 h-3" />Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
            <div className={`p-6 border-b border-gray-100 ${modal.action === 'APPROVED' ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#1B4F72] text-lg">
                    {modal.action === 'APPROVED' ? '✅ Approve' : '❌ Reject'} Application
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{modal.permit.business_name}</p>
                </div>
                <button onClick={() => setModal(null)}
                  className="p-2 rounded-lg hover:bg-white/50 transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {modal.fullData && (
                <AuditTraceViewer
                  trace={modal.fullData.audit_trace}
                  applicationId={modal.permit.id}
                />
              )}

              <div>
                <label className="label">Reason for Decision</label>
                <textarea rows={3} className="input resize-none"
                  placeholder="Provide a clear reason (min 10 characters)..."
                  value={reason} onChange={e => setReason(e.target.value)} />
                <p className={`text-xs mt-1 ${reason.length < 10 && reason.length > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {reason.length}/10 minimum
                </p>
              </div>

              <div>
                <label className="label">Reviewer Name</label>
                <input className="input" value={reviewer} onChange={e => setReviewer(e.target.value)} />
              </div>

              {modalError && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                  <X className="w-4 h-4 flex-shrink-0" />{modalError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(null)}
                  className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button onClick={handleReview} disabled={submitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 active:scale-95 ${
                    modal.action === 'APPROVED' ? 'bg-[#27AE60] hover:bg-[#229954]' : 'bg-[#E74C3C] hover:bg-[#C0392B]'
                  }`}>
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                    : <>Confirm {modal.action === 'APPROVED' ? 'Approve' : 'Reject'}</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}