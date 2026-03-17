'use client'

import { useEffect, useState } from 'react'
import {
  FileText, Clock, CheckCircle, AlertTriangle,
  Loader2, X, Check, ChevronDown
} from 'lucide-react'
import AuditTraceViewer from '@/components/AuditTraceViewer'
import {
  getAllPermits, reviewPermit, getPermit,
  type PermitListItem, type PermitResponse
} from '@/lib/api'

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

export default function AdminPage() {
  const [permits, setPermits] = useState<PermitListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [modal, setModal] = useState<Modal | null>(null)
  const [reason, setReason] = useState('')
  const [reviewer, setReviewer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAllPermits(filter || undefined)
      setPermits(data)
    } catch (_e) {
      setPermits([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const openModal = async (
    permit: PermitListItem,
    action: 'APPROVED' | 'REJECTED'
  ) => {
    setModal({ permit, action })
    setReason('')
    setReviewer('')
    setModalError('')
    try {
      const full = await getPermit(permit.id)
      setModal((p) => (p ? { ...p, fullData: full } : null))
    } catch (_e) {
      // open modal without full data
    }
  }

  const handleReview = async () => {
    if (!modal) return
    if (reason.length < 10) {
      setModalError('Reason must be at least 10 characters.')
      return
    }
    if (!reviewer.trim()) {
      setModalError('Please enter your name.')
      return
    }
    setSubmitting(true)
    try {
      await reviewPermit(modal.permit.id, {
        decision: modal.action,
        reason,
        reviewed_by: reviewer,
      })
      setPermits((p) =>
        p.map((x) =>
          x.id === modal.permit.id ? { ...x, status: modal.action } : x
        )
      )
      setModal(null)
    } catch (_e) {
      setModalError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const counts = {
    total:    permits.length,
    pending:  permits.filter((p) => p.status === 'PENDING').length,
    approved: permits.filter((p) => p.status === 'APPROVED').length,
    flagged:  permits.filter((p) =>
      ['FLAGGED', 'REJECTED'].includes(p.status)
    ).length,
  }

  const statCards = [
    { label: 'Total',    value: counts.total,    icon: FileText,      color: 'text-[#1B4F72]', bg: 'bg-[#1B4F72]/5', border: 'border-l-[#1B4F72]' },
    { label: 'Pending',  value: counts.pending,  icon: Clock,         color: 'text-[#F39C12]', bg: 'bg-amber-50',    border: 'border-l-[#F39C12]' },
    { label: 'Approved', value: counts.approved, icon: CheckCircle,   color: 'text-[#27AE60]', bg: 'bg-green-50',    border: 'border-l-[#27AE60]' },
    { label: 'Flagged',  value: counts.flagged,  icon: AlertTriangle, color: 'text-[#E74C3C]', bg: 'bg-red-50',      border: 'border-l-[#E74C3C]' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <div className="mb-8">
        <span className="text-xs font-semibold text-[#F39C12] tracking-widest uppercase mb-2 block">
          Admin Portal
        </span>
        <h1 className="font-serif text-4xl text-[#1B4F72]">
          Applications Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Review and manage permit applications.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((c) => (
          <div
            key={c.label}
            className={`bg-white rounded-2xl shadow-card border-l-4 ${c.border} p-5 flex items-center gap-4`}
          >
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

      {/* Filter */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/20 focus:border-[#1B4F72] cursor-pointer"
          >
            <option value="">All Statuses</option>
            {['PENDING', 'APPROVED', 'FLAGGED', 'REJECTED', 'HUMAN_REVIEW'].map(
              (s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              )
            )}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <button
          onClick={load}
          className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:border-[#1B4F72] hover:text-[#1B4F72] transition-all"
        >
          Refresh
        </button>
        <span className="text-xs text-gray-400 ml-auto">
          {permits.length} application{permits.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#1B4F72] animate-spin" />
          </div>
        ) : permits.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">No applications found</p>
            <p className="text-sm mt-1">Try changing the filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {[
                    'App ID', 'Business', 'Type', 'Status',
                    'AI Decision', 'Confidence', 'Submitted', 'Actions'
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permits.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                      i % 2 === 0 ? '' : 'bg-gray-50/20'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                        {p.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-[#1B4F72]">
                        {p.business_name}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {p.permit_type}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-4">
                      {p.ai_decision ? (
                        <StatusBadge status={p.ai_decision} />
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {p.ai_confidence != null ? (
                        <span className="text-sm font-medium text-[#1B4F72]">
                          {p.ai_confidence}%
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(p.submitted_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(p, 'APPROVED')}
                          disabled={p.status === 'APPROVED'}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#27AE60] text-[#27AE60] hover:bg-[#27AE60] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <Check className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => openModal(p, 'REJECTED')}
                          disabled={p.status === 'REJECTED'}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <X className="w-3 h-3" />
                          Reject
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
            <div
              className={`p-6 border-b border-gray-100 ${
                modal.action === 'APPROVED' ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#1B4F72] text-lg">
                    {modal.action === 'APPROVED' ? '✅ Approve' : '❌ Reject'}{' '}
                    Application
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {modal.permit.business_name}
                  </p>
                </div>
                <button
                  onClick={() => setModal(null)}
                  className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                >
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
                <textarea
                  rows={3}
                  className="input resize-none"
                  placeholder="Provide a clear reason (min 10 characters)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <p
                  className={`text-xs mt-1 ${
                    reason.length < 10 && reason.length > 0
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`}
                >
                  {reason.length}/10 minimum
                </p>
              </div>

              <div>
                <label className="label">Your Name (Reviewer)</label>
                <input
                  className="input"
                  placeholder="Enter your full name"
                  value={reviewer}
                  onChange={(e) => setReviewer(e.target.value)}
                />
              </div>

              {modalError && (
                <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">
                  {modalError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  disabled={submitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 active:scale-95 ${
                    modal.action === 'APPROVED'
                      ? 'bg-[#27AE60] hover:bg-[#229954]'
                      : 'bg-[#E74C3C] hover:bg-[#C0392B]'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm{' '}
                      {modal.action === 'APPROVED' ? 'Approve' : 'Reject'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
      }
