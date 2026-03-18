'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, User, Hash, MapPin, FileUp,
  ChevronRight, ChevronLeft, Check, Lock,
  AlertCircle, Loader2
} from 'lucide-react'
import { submitPermit } from '@/lib/api'

const STEPS = ['Business Info', 'Location', 'Documents']
const PERMIT_TYPES = [
  'Business License',
  'Food Service',
  'Construction',
  'Special Event',
  'Retail',
  'Healthcare Facility',
]

export default function ApplyPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [taxMasked, setTaxMasked] = useState(false)
  const [form, setForm] = useState({
    business_name: '',
    permit_type: '',
    owner_name: '',
    tax_id: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    file: null as File | null,
  })

  const update = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }))

  const displayTax = () => {
    if (!form.tax_id) return ''
    if (taxMasked && form.tax_id.length >= 4)
      return `***-**-${form.tax_id.slice(-4)}`
    return form.tax_id
  }

  const canProceed = () => {
    if (step === 0)
      return (
        form.business_name &&
        form.permit_type &&
        form.owner_name &&
        form.tax_id
      )
    if (step === 1)
      return form.address && form.city && form.state && form.zip
    return !!form.file
  }
  const handleSubmit = async () => {
    if (!form.file) {
      setError('Please upload a document.')
      return
    }
    setLoading(true)
    setError('')

    // Wake up Render before submitting
    try {
      setError('Connecting to server...')
      await fetch('https://govmind-ai.onrender.com/health')
      setError('')
    } catch (_e) {
      // continue anyway
    }

    try {
      const fd = new FormData()
      fd.append('business_name', form.business_name)
      fd.append('owner_name', form.owner_name)
      fd.append('tax_id', form.tax_id)
      fd.append(
        'address',
        `${form.address}, ${form.city} ${form.state} ${form.zip}`
      )
      fd.append('permit_type', form.permit_type)
      fd.append('file', form.file)
      const result = await submitPermit(fd)
      router.push(`/status/${result.id}`)
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Submission failed. Please try again in 30 seconds.')
      }
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="text-xs font-semibold text-[#F39C12] tracking-widest uppercase mb-2 block">
          Permit Application
        </span>
        <h1 className="font-serif text-4xl text-[#1B4F72]">
          Apply for a Permit
        </h1>
        <p className="text-gray-500 mt-2">
          Get an AI-powered decision in minutes.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < step
                    ? 'bg-[#27AE60] text-white'
                    : i === step
                    ? 'bg-[#1B4F72] text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                  i === step ? 'text-[#1B4F72]' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 mb-5 transition-all duration-300 ${
                  i < step ? 'bg-[#27AE60]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-8">

        {/* STEP 0 */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-up">
            <div>
              <label className="label">
                <Building2 className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                Business Name
              </label>
              <input
                className="input"
                placeholder="e.g. Acme Corporation"
                value={form.business_name}
                onChange={(e) => update('business_name', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Permit Type</label>
              <select
                className="input"
                value={form.permit_type}
                onChange={(e) => update('permit_type', e.target.value)}
              >
                <option value="">Select permit type...</option>
                {PERMIT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">
                <User className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                Owner Name
              </label>
              <input
                className="input"
                placeholder="Full legal name"
                value={form.owner_name}
                onChange={(e) => update('owner_name', e.target.value)}
              />
            </div>
            <div>
              <label className="label">
                <Hash className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                Tax ID / EIN
              </label>
              <input
                className="input font-mono"
                placeholder="XX-XXXXXXX"
                value={displayTax()}
                onChange={(e) => {
                  if (!taxMasked) update('tax_id', e.target.value)
                }}
                onFocus={() => setTaxMasked(false)}
                onBlur={() => setTaxMasked(true)}
              />
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Masked after entry for your security
              </p>
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-start gap-3 bg-[#1B4F72]/5 border border-[#1B4F72]/10 rounded-xl p-4">
              <Lock className="w-4 h-4 text-[#1B4F72] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#1B4F72]/80 leading-relaxed">
                This information is{' '}
                <strong>encrypted at rest</strong> and never shared
                with third parties.
              </p>
            </div>
            <div>
              <label className="label">
                <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                Street Address
              </label>
              <input
                className="input"
                placeholder="123 Main Street"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">City</label>
                <input
                  className="input"
                  placeholder="Austin"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                />
              </div>
              <div>
                <label className="label">State</label>
                <input
                  className="input"
                  placeholder="TX"
                  maxLength={2}
                  value={form.state}
                  onChange={(e) =>
                    update('state', e.target.value.toUpperCase())
                  }
                />
              </div>
            </div>
            <div>
              <label className="label">ZIP Code</label>
              <input
                className="input"
                placeholder="78701"
                maxLength={5}
                value={form.zip}
                onChange={(e) => update('zip', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <label className="label">
                <FileUp className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                Upload Documents
              </label>
              <label
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                  form.file
                    ? 'border-[#27AE60] bg-green-50'
                    : 'border-gray-200 bg-gray-50 hover:border-[#1B4F72] hover:bg-[#1B4F72]/5'
                }`}
              >
                <div className="text-center">
                  {form.file ? (
                    <>
                      <Check className="w-8 h-8 text-[#27AE60] mx-auto mb-2" />
                      <p className="text-sm font-medium text-[#27AE60]">
                        {form.file.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {(form.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <FileUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF, PNG, JPG — max 10MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f && f.size <= 10 * 1024 * 1024) {
                      setForm((p) => ({ ...p, file: f }))
                      setError('')
                    } else if (f) {
                      setError('File must be under 10MB')
                    }
                  }}
                />
              </label>
            </div>

            {/* Summary */}
            <div className="bg-[#F4F6F9] rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Application Summary
              </p>
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

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mt-5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-[#1B4F72] text-white px-7 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#154360] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="flex items-center gap-2 bg-[#1B4F72] text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#154360] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
                }
