import { Landmark } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0D2B3E] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">
              GovMind<span className="text-[#F39C12]">.AI</span>
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-white/70 text-sm">Government Services, Automated.</p>
            <p className="text-white/40 text-xs">All decisions are auditable and human-reversible</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <Link href="/apply" className="hover:text-white transition-colors">Apply</Link>
            <Link href="/status" className="hover:text-white transition-colors">Status</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/30">
          © 2026 GovMind.AI — Built for transparency. Designed for trust.
        </div>
      </div>
    </footer>
  )
}
