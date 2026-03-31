import Link from 'next/link'
import { Clock, ShieldCheck, BarChart3, ArrowRight, FileText, Bot, CheckCircle, Zap, Lock, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div>

      {/* HERO */}
      <section className="hero-gradient relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#F39C12]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 w-full">
          <div className="max-w-3xl">

            <div className="animate-fade-up delay-100">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-[#27AE60] rounded-full animate-pulse" />
                Now in Beta — AI-Powered Permit Processing
              </span>
            </div>

            <h1 className="animate-fade-up delay-200 font-serif text-6xl md:text-7xl text-white leading-[1.05] mb-6">
              Government Permits{' '}
              <span className="text-[#F39C12] italic">Automated</span>{' '}
              with AI
            </h1>

            <p className="animate-fade-up delay-300 text-lg text-blue-100/80 leading-relaxed max-w-xl mb-10">
              Submit your business permit application and receive an AI-powered decision in minutes — fully auditable, always human-reversible.
            </p>

            <div className="animate-fade-up delay-400 flex flex-wrap gap-4 mb-12">
              <Link href="/apply"
                className="flex items-center gap-2 bg-white text-[#1B4F72] px-8 py-3.5 rounded-2xl font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-lg">
                Apply for Permit <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/status"
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-3.5 rounded-2xl font-semibold hover:bg-white/20 active:scale-95 transition-all">
                Check Status
              </Link>
            </div>

            <div className="animate-fade-up delay-500 flex flex-wrap items-center gap-6 text-sm text-blue-200/70">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[#F39C12]" />Free to use</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#F39C12]" />Decision in &lt; 5 mins</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#F39C12]" />100% Auditable</span>
            </div>
          </div>

          <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2">
            <div className="glass rounded-2xl p-6 w-64 animate-fade-up delay-600">
              <div className="space-y-4">
                {[
                  { label: 'Applications today', value: '142', color: 'text-white' },
                  { label: 'Avg. processing time', value: '3.2 min', color: 'text-[#27AE60]' },
                  { label: 'AI accuracy rate', value: '92%', color: 'text-[#F39C12]' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">{s.label}</span>
                    <span className={`font-bold text-sm ${s.color}`}>{s.value}</span>
                  </div>
                ))}
                <div className="h-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#27AE60] rounded-full animate-pulse" />
                  <span className="text-white/50 text-xs">System operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { value: '< 5 min', label: 'Average processing time', icon: Clock, color: 'text-[#1B4F72]', bg: 'bg-[#1B4F72]/5' },
            { value: '92%', label: 'AI decision accuracy', icon: BarChart3, color: 'text-[#27AE60]', bg: 'bg-green-50' },
            { value: '100%', label: 'Decisions fully auditable', icon: ShieldCheck, color: 'text-[#F39C12]', bg: 'bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-5 p-6 rounded-2xl border border-gray-100 hover:shadow-card-hover transition-shadow">
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <div className={`text-3xl font-bold ${s.color} leading-none mb-1`}>{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-[#F4F6F9]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-[#F39C12] tracking-widest uppercase mb-3 block">Simple Process</span>
            <h2 className="font-serif text-4xl text-[#1B4F72]">How GovMind.AI Works</h2>
            <p className="text-gray-500 mt-4 max-w-lg mx-auto">From application to decision in minutes. Every step transparent, every decision auditable.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: FileText, title: 'Submit Application', desc: 'Fill out our simple form and upload your documents. Takes less than 3 minutes.', color: 'text-[#1B4F72]', bg: 'bg-[#1B4F72]/5' },
              { step: '02', icon: Bot, title: 'AI Reviews Instantly', desc: 'Our AI checks compliance, validates documents, and generates a reasoned decision.', color: 'text-[#F39C12]', bg: 'bg-amber-50' },
              { step: '03', icon: CheckCircle, title: 'Get Your Decision', desc: 'Receive approval or detailed feedback with a full audit trail — always reversible.', color: 'text-[#27AE60]', bg: 'bg-green-50' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 relative">
                <span className="absolute top-6 right-6 text-xs font-bold text-gray-200 font-mono">{item.step}</span>
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-5`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-[#1B4F72] text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BANNER */}
      <section className="bg-[#1B4F72] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Globe className="w-10 h-10 text-[#F39C12] mx-auto mb-6" />
          <h2 className="font-serif text-4xl text-white mb-4">
            Built for transparency.<br />
            <span className="italic text-blue-200">Designed for trust.</span>
          </h2>
          <p className="text-blue-200/70 text-lg mb-10 max-w-xl mx-auto">
            Every AI decision includes a full reasoning trace. Humans stay in control — always.
          </p>
          <Link href="/apply"
            className="inline-flex items-center gap-2 bg-[#F39C12] text-white px-10 py-4 rounded-2xl font-semibold hover:bg-[#E67E22] active:scale-95 transition-all shadow-lg">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  )
}
