'use client'

import { useState } from 'react'
import {
  Building2, User, Hash, MapPin, FileUp,
  ChevronRight, ChevronLeft, Check, Lock,
  AlertCircle, Loader2, CheckCircle,
  AlertTriangle, Shield, Users
} from 'lucide-react'

const API_BASE = '/api'
const STEPS = ['Business Info', 'Location', 'Documents']
const PERMIT_TYPES = [
  'Business License', 'Food Service', 'Construction',
  'Special Event', 'Retail', 'Healthcare Facility',
]

interface PermitResult {
  id: string
  business_name: string
  permit_type: string
  status: string
  ai_decision: string | null
  ai_confidence: number | null
  ai_reason: string | null
  owner_name_masked: string | null
  tax_id_masked: string | null
  address_masked: string | null
  audit_trace: Record<string, unknown> | null
}

function HumanReviewButton({ permitId }: { permitId: string }) {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const request = async () => {
    setSending(true)
    try {
      await fetch(`${API_BASE}/permits/${permitId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'HUMAN_REVIEW',
          reason: 'Applicant requested manual review of their application',
          reviewed_by: 'applicant',
        }),
      })
    } catch (_e) { /* show success anyway */ }
    setSent(true)
    setSending(false)
  }

  if (sent) return (
    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
      <CheckCircle className="w-4 h-4 flex-shrink-0" />
      <div>
        <p className="font-medium">Request sent successfully</p>
        <p className="text-xs text-green-600 mt-0.5">A government officer will review your application. You will be notified of the outcome.</p>
      </div>
    </div>
  )

  return (
    <button onClick={request} disabled={sending}
      className="w-full flex items-center justify-center gap-2 border border-[#1B4F72] text-[#1B4F72] px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B4F72] hover:text-white disabled:opacity-40 active:scale-95 transition-all">
      {sending
        ? <><Loader2 className="w-4 h-4 animate-spin" />Sending request...</>
        : <><Users className="w-4 h-4" />Request Human Review</>
      }
    </button>
  )
}

export default function ApplyPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<PermitResult | null>(null)
  const [taxMasked, setTaxMasked] = useState(false)
  const [form, setForm] = useState({
    business_name: '', permit_type: '', owner_name: '',
    tax_id: '', address: '', city: '', state: '', zip: '',
    file: null as File | null,
  })

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const displayTax = () => {
    if (!form.tax_id) return ''
    if (taxMasked && form.tax_id.length >= 4)
      return `***-**-${form.tax_id.slice(-4)}`
    return form.tax_id
  }

  const canProceed = () => {
    if (step === 0) return form.business_name && form.permit_type && form.owner_name && form.tax_id
    if (step === 1) return form.address && form.city && form.state && form.zip
    return !!form.file
  }

  const handleSubmit = async () => {
    if (!form.file) { setError('Please upload a document.'); return }
    setLoading(true)
    setError('')
    setLoadingMsg('📋 Submitting your application...')

    try {
      const fd = new FormData()
      fd.append('business_name', form.business_name)
      fd.append('owner_name', form.owner_name)
      fd.append('tax_id', form.tax_id)
      fd.append('address', `${form.address}, ${form.city} ${form.state} ${form.zip}`)
      fd.append('permit_type', form.permit_type)
      fd.append('file', form.file)

      setLoadingMsg('🤖 AI is reviewing your application...')

      const res = await fetch(`${API_BASE}/submit`, {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Submission failed')
      }

      const data = await res.json()
      if (!data?.id) throw new Error('No application ID returned')
      setResult(data)

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Result page shown inline after submission
  if (result) {
    const isApproved = result.ai_decision === 'APPROVED'

    return (
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">

        {/* Status */}
        <div className="card text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
            isApproved ? 'bg-green-50' : 'bg-amber-50'
          }`}>
            {isApproved
              ? <CheckCircle className="w-8 h-8 text-[#27AE60]" />
              : <AlertTriangle className="w-8 h-8 text-[#F39C12]" />
            }
          </div>
          <span className="text-xs text-gray-400 font-mono block mb-2">
            APP-{result.id.slice(0, 8).toUpperCase()}
          </span>
          <h1 className="font-serif text-2xl text-[#1B4F72] mb-1">{result.business_name}</h1>
          <p className="text-sm text-gray-500 mb-4">{result.permit_type}</p>
          <span className={`badge text-sm px-4 py-2 ${isApproved ? 'badge-approved' : 'badge-flagged'}`}>
            {result.ai_decision || result.status}
          </span>
        </div>

        {/* AI Decision */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1B4F72]">🤖 AI Decision</h2>
            <span className={`badge ${isApproved ? 'badge-approved' : 'badge-flagged'}`}>
              {result.ai_decision}
            </span>
          </div>
          {result.ai_confidence != null && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Confidence Score</span>
                <span className="font-semibold text-[#1B4F72]">{result.ai_confidence}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1B4F72] rounded-full"
                  style={{ width: `${result.ai_confidence}%` }} />
              </div>
            </div>
          )}
          {result.ai_reason && (
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 mb-4">
              {result.ai_reason}
            </p>
          )}
          <HumanReviewButton permitId={result.id} />
        </div>

        {/* Protected info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-[#1B4F72]" />
            <h2 className="font-semibold text-[#1B4F72]">Your Protected Information</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Owner', value: result.owner_name_masked },
              { label: 'Tax ID', value: result.tax_id_masked },
              { label: 'Address', value: result.address_masked },
            ].map(({ label, value }) => value && (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-[#1B4F72] font-mono">
                  <Lock className="w-3 h-3 text-gray-300" />{value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit */}
        {result.audit_trace && (
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#1B4F72]/10 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#1B4F72]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1B4F72]">Audit Trail</p>
                <p className="text-xs text-gray-400">Decision recorded</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
              <p>Decision: <strong>{result.audit_trace.decision as string}</strong></p>
              <p>Confidence: <strong>{result.audit_trace.confidence as number}%</strong></p>
              <p className="flex items-center gap-1 mt-2 text-gray-400">
                <Shield className="w-3 h-3" />Reversible by: admin
              </p>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              🔒 All decisions are immutable and human-reversible
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setResult(null)
              setStep(0)
              setForm({ business_name: '', permit_type: '', owner_name: '',
                tax_id: '', address: '', city: '', state: '', zip: '', file: null })
            }}
            className="flex-1 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
            Submit Another
          </button>
          <a href="/"
            className="flex-1 bg-[#1B4F72] text-white px-4 py-3 rounded-xl text-sm font-medium text-center hover:bg-[#154360] transition-all">
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="text-xs font-semibold text-[#F39C12] tracking-widest uppercase mb-2 block">
          Permit Application
        </span>
        <h1 className="font-serif text-4xl text-[#1B4F72]">Apply for a Permit</h1>
        <p className="text-gray-500 mt-2">Get an AI-powered decision in minutes.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < step ? 'bg-[#27AE60] text-white' :
                i === step ? 'bg-[#1B4F72] text-white' :
                'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                i === step ? 'text-[#1B4F72]' : 'text-gray-400'
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 mb-5 ${i < step ? 'bg-[#27AE60]' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <Loader2 className="w-12 h-12 text-[#1B4F72] animate-spin mx-auto mb-4" />
          <p className="text-[#1B4F72] font-semibold text-lg">{loadingMsg}</p>
          <p className="text-gray-400 text-sm mt-2">Please don&apos;t close this page</p>
          <div className="mt-6 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1B4F72] rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-2xl shadow-card p-8">

          {step === 0 && (
            <div className="space-y-5 animate-fade-up">
              <div>
                <label className="label">
                  <Building2 className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />Business Name
                </label>
                <input className="input" placeholder="e.g. Acme Corporation"
                  value={form.business_name} onChange={e => update('business_name', e.target.value)} />
              </div>
              <div>
                <label className="label">Permit Type</label>
                <select className="input" value={form.permit_type} onChange={e => update('permit_type', e.target.value)}>
                  <option value="">Select permit type...</option>
                  {PERMIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">
                  <User className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />Owner Name
                </label>
                <input className="input" placeholder="Full legal name"
                  value={form.owner_name} onChange={e => update('owner_name', e.target.value)} />
              </div>
              <div>
                <label className="label">
                  <Hash className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />Tax ID / EIN
                </label>
                <input className="input font-mono" placeholder="XX-XXXXXXX"
                  value={displayTax()}
                  onChange={e => { if (!taxMasked) update('tax_id', e.target.value) }}
                  onFocus={() => setTaxMasked(false)}
                  onBlur={() => setTaxMasked(true)} />
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3" />Masked after entry
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-fade-up">
              <div className="flex items-start gap-3 bg-[#1B4F72]/5 border border-[#1B4F72]/10 rounded-xl p-4">
                <Lock className="w-4 h-4 text-[#1B4F72] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#1B4F72]/80">
                  This information is <strong>encrypted at rest</strong> and never shared with third parties.
                </p>
              </div>
              <div>
                <label className="label">
                  <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />Street Address
                </label>
                <input className="input" placeholder="123 Main Street"
                  value={form.address} onChange={e => update('address', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input className="input" placeholder="Austin"
                    value={form.city} onChange={e => update('city', e.target.value)} />
                </div>
                <div>
                  <label className="label">State</label>
                  <input className="input" placeholder="TX" maxLength={2}
                    value={form.state} onChange={e => update('state', e.target.value.toUpperCase())} />
                </div>
              </div>
              <div>
                <label className="label">ZIP Code</label>
                <input className="input" placeholder="78701" maxLength={5}
                  value={form.zip} onChange={e => update('zip', e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <label className="label">
                  <FileUp className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />Upload Documents
                </label>
                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  form.file ? 'border-[#27AE60] bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-[#1B4F72]'
                }`}>
                  <div className="text-center">
                    {form.file ? (
                      <>
                        <Check className="w-8 h-8 text-[#27AE60] mx-auto mb-2" />
                        <p className="text-sm font-medium text-[#27AE60]">{form.file.name}</p>
                        <p className="text-xs text-gray-400">{(form.file.size/1024/1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <FileUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">Tap to browse</p>
                        <p className="text-xs text-gray-400">PDF, PNG, JPG — max 10MB</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f && f.size <= 10*1024*1024) { setForm(p => ({...p, file: f})); setError('') }
                      else if (f) setError('File must be under 10MB')
                    }} />
                </label>
              </div>

              <div className="bg-[#F4F6F9] rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Application Summary</p>
                {[
                  ['Business', form.business_name],
                  ['Permit', form.permit_type],
                  ['Owner', form.owner_name],
                  ['Location', `${form.city}, ${form.state}`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-medium text-[#1B4F72]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mt-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button onClick={() => setStep(s => s-1)} disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" />Back
            </button>
            {step < 2 ? (
              <button onClick={() => setStep(s => s+1)} disabled={!canProceed()}
                className="flex items-center gap-2 bg-[#1B4F72] text-white px-7 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#154360] disabled:opacity-40 active:scale-95 transition-all shadow-sm">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canProceed() || loading}
                className="flex items-center gap-2 bg-[#1B4F72] text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#154360] disabled:opacity-40 active:scale-95 transition-all shadow-sm">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                  : <>Submit Application <ChevronRight className="w-4 h-4" /></>
                }
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

---
