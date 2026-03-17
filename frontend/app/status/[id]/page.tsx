'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Clock, CheckCircle, XCircle, AlertTriangle,
  Users, Lock, Loader2, RefreshCw, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import AuditTraceViewer from '@/components/AuditTraceViewer'
import { getPermit, reviewPermit, type PermitResponse } from '@/lib/api'

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
    <div className={`w-14 h-14 ${cfg.bg} rounded-2xl flex items-center justify-center`}>
      <Icon className={`w-7 h-7 ${cfg.color}`} />
    </div>
  )
}

const statusColor: Record<string, string> = {
  PENDING:      'text-[#F39C12]',
  APPROVED:     'text-[#27AE60]',
  FLAGGED:      'text-[#E74C3C]',
  REJECTED:     'text-[#E74C3C]',
  HUMAN_REVIEW: 'text-blue-600',
}

export default function StatusPage() {
  const params = useParams()
  const id = params?.id as string
  const [permit, setPermit] = useState<PermitResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getPermit(id)
      setPermit(data)
    } catch (_e) {
      setError('Application not found or server is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) load()
  }, [id])

  const requestReview = async () => {
    setReviewLoading(true)
    try {
      const updated = await reviewPermit(id, {
        decision: 'HUMAN_REVIEW',
        reason: 'Requested by applicant for manual review',
        reviewed_by: 'applicant',
      })
      setPermit(updated)
      setReviewed(true)
    } catch (_e) {
      setError('Could not request review. Please try again.')
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#1B4F72] animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading application...</p>
        <p className="text-gray-400 text-xs mt-1">This may take up to 30 seconds</p>
      </div>
    </div>
  )

  if (error || !permit) return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <XCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Application Not Found
      </h2>
      <p className="text-gray-400 mb-6">{error}</p>
      <Link
        href="/apply"
        className="bg-[#1B4F72] text-white px-6 py-2.5 rounded-xl font-medium inline-flex hover:bg-[#154360] transition-all"
      >
        Apply for a Permit
      </Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B4F72] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Header card */}
      <div className="card animate-fade-up">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs text-gray-400 font-mono">
              APP-{permit.id.slice(0, 8).toUpperCase()}
            </span>
            <h1 className="font-serif text-2xl text-[#1B4F72] mt-1">
              {permit.business_name}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{permit.permit_type}</p>
          </div>
          <StatusIcon status={permit.status} />
        </div>
        <span className={`text-lg font-bold ${statusColor[permit.status] || 'text-gray-600'}`}>
          {permit.status.replace('_', ' ')}
        </span>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Submitted{' '}
            {new Date(permit.submitted_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* AI Decision */}
      {permit.ai_decision && (
        <div className="card animate-fade-up delay-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1B4F72]">🤖 AI Decision</h2>
            <span
              className={`badge ${
                permit.ai_decision === 'APPROVED'
                  ? 'badge-approved'
                  : permit.ai_decision === 'FLAGGED'
                  ? 'badge-flagged'
                  : 'badge-pending'
              }`}
            >
              {permit.ai_decision}
            </span>
          </div>

          {permit.ai_confidence != null && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Confidence Score</span>
                <span className="font-semibold text-[#1B4F72]">
                  {permit.ai_confidence}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1B4F72] rounded-full transition-all duration-700"
                  style={{ width: `${permit.ai_confidence}%` }}
                />
              </div>
            </div>
          )}

          {permit.ai_reason && (
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 mb-4">
              {permit.ai_reason}
            </p>
          )}

          {reviewed ? (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-3 rounded-xl">
              <CheckCircle className="w-4 h-4" />
              Human review requested. An officer will contact you shortly.
            </div>
          ) : (
            <button
              onClick={requestReview}
              disabled={reviewLoading || permit.status === 'HUMAN_REVIEW'}
              className="w-full flex items-center justify-center gap-2 border border-[#1B4F72] text-[#1B4F72] px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B4F72] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              {reviewLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Request Human Review
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Protected info */}
      <div className="card animate-fade-up delay-200">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-[#1B4F72]" />
          <h2 className="font-semibold text-[#1B4F72]">
            Your Protected Information
          </h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Owner', value: permit.owner_name_masked },
            { label: 'Tax ID', value: permit.tax_id_masked },
            { label: 'Address', value: permit.address_masked },
          ].map(
            ({ label, value }) =>
              value && (
                <div
                  key={label}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-[#1B4F72] font-mono">
                    <Lock className="w-3 h-3 text-gray-300" />
                    {value}
                  </span>
                </div>
              )
          )}
        </div>
      </div>

      {/* Audit trace */}
      <div className="animate-fade-up delay-300">
        <AuditTraceViewer
          trace={permit.audit_trace}
          applicationId={permit.id}
        />
      </div>

      {/* Refresh */}
      <button
        onClick={load}
        className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-[#1B4F72] py-3 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Refresh status
      </button>
    </div>
  )
}
