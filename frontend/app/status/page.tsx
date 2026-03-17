'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'

export default function StatusLandingPage() {
  const [id, setId] = useState('')
  const router = useRouter()

  const handleCheck = () => {
    if (id.trim()) router.push(`/status/${id.trim()}`)
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-24 text-center">
      <div className="w-14 h-14 bg-[#1B4F72]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Search className="w-7 h-7 text-[#1B4F72]" />
      </div>
      <h1 className="font-serif text-4xl text-[#1B4F72] mb-3">Check Your Status</h1>
      <p className="text-gray-500 mb-8">Enter your application ID to view the current status and audit trail.</p>
      <div className="flex gap-3">
        <input className="input flex-1" placeholder="Enter Application ID..."
          value={id} onChange={e => setId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCheck()} />
        <button onClick={handleCheck} disabled={!id.trim()}
          className="flex items-center gap-2 bg-[#1B4F72] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#154360] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all">
          Check <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
