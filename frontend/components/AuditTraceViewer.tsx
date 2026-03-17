'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Bot, User, Shield } from 'lucide-react'

interface TraceEntry {
  type?: string
  timestamp: string
  decision: string
  reason: string
  confidence?: number
  reversible_by?: string
  reviewed_by?: string
}

interface Props {
  trace: Record<string, unknown> | Record<string, unknown>[] | null | undefined
  applicationId: string
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    })
  } catch { return iso }
}

function DecisionBadge({ decision }: { decision: string }) {
  const map: Record<string, string> = {
    APPROVED:     'bg-green-50 text-green-700 border-green-200',
    FLAGGED:      'bg-red-50 text-red-600 border-red-200',
    REJECTED:     'bg-red-50 text-red-600 border-red-200',
    PENDING:      'bg-amber-50 text-amber-700 border-amber-200',
    HUMAN_REVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
    human_override:'bg-purple-50 text-purple-700 border-purple-200',
  }
  const cls = map[decision] || 'bg-gray-50 text-gray-600 border-gray-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide ${cls}`}>
      {decision.replace('_', ' ')}
    </span>
  )
}

export default function AuditTraceViewer({ trace, applicationId }: Props) {
  const [expanded, setExpanded] = useState(false)

  const entries: TraceEntry[] = !trace
    ? []
    : Array.isArray(trace)
      ? trace as TraceEntry[]
      : [trace as unknown as TraceEntry]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1B4F72]/10 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#1B4F72]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#1B4F72]">Audit Trail</p>
            <p className="text-xs text-gray-400">{entries.length} decision{entries.length !== 1 ? 's' : ''} recorded</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono hidden sm:block">
            ID: {applicationId.slice(0, 8)}...
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          {entries.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No audit trail available yet.
            </div>
          ) : (
            <div className="px-6 py-4 space-y-0">
              {entries.map((entry, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i < entries.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-0 w-px bg-gray-100" />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 z-10 ${
                    entry.type === 'human_override' ? 'bg-purple-100' : 'bg-[#1B4F72]/10'
                  }`}>
                    {entry.type === 'human_override'
                      ? <User className="w-3.5 h-3.5 text-purple-600" />
                      : <Bot className="w-3.5 h-3.5 text-[#1B4F72]" />
                    }
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <DecisionBadge decision={entry.decision || entry.type || 'unknown'} />
                      {entry.reviewed_by && (
                        <span className="text-xs text-gray-400">by {entry.reviewed_by}</span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">{formatDate(entry.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{entry.reason}</p>
                    {entry.confidence !== undefined && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Confidence</span>
                          <span className="font-medium text-[#1B4F72]">{entry.confidence}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1B4F72] rounded-full" style={{ width: `${entry.confidence}%` }} />
                        </div>
                      </div>
                    )}
                    {entry.reversible_by && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                        <Shield className="w-3 h-3" /> Reversible by: {entry.reversible_by}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              🔒 All decisions are immutable and human-reversible
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
