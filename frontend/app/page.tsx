import Link from 'next/link';
import { Clock, ShieldCheck, BarChart3, ArrowRight, FileText, Bot, CheckCircle, Zap, Lock, Globe, Users } from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const [country, setCountry] = useState('UAE');
  const [language, setLanguage] = useState('English');

  return (
    <div>
      {/* HERO — Honest & Global */}
      <section className="hero-gradient relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#F39C12]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 w-full">
          <div className="max-w-3xl">
            <div className="animate-fade-up delay-100">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-[#27AE60] rounded-full animate-pulse" />
                Beta — Real Groq Llama-3.3-70B Powered
              </span>
            </div>

            <h1 className="animate-fade-up delay-200 font-serif text-6xl md:text-7xl text-white leading-[1.05] mb-6">
              Government Permits{' '}
              <span className="text-[#F39C12] italic">Automated</span>{' '}
              with AI
            </h1>

            <p className="animate-fade-up delay-300 text-lg text-blue-100/80 leading-relaxed max-w-xl mb-10">
              Real LLM-powered review for UAE, India & USA permits. 
              Decision in seconds • Fully auditable • Supports English, العربية, हिंदी.
            </p>

            {/* New Country + Language Toggles */}
            <div className="animate-fade-up delay-350 flex flex-wrap gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-blue-200/70">Country</label>
                <select 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm"
                >
                  <option value="UAE">🇦🇪 UAE (Dubai DED)</option>
                  <option value="India">🇮🇳 India (MCA)</option>
                  <option value="USA">🇺🇸 USA (Federal + State)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-blue-200/70">Response Language</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm"
                >
                  <option value="English">English</option>
                  <option value="Arabic">العربية (Arabic)</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                </select>
              </div>
            </div>

            <div className="animate-fade-up delay-400 flex flex-wrap gap-4 mb-12">
              <Link 
                href="/apply"
                className="flex items-center gap-2 bg-white text-[#1B4F72] px-8 py-3.5 rounded-2xl font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-lg"
              >
                Test Permit Review <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/status"
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-3.5 rounded-2xl font-semibold hover:bg-white/20 active:scale-95 transition-all"
              >
                Check Status
              </Link>
            </div>

            <div className="animate-fade-up delay-500 flex flex-wrap items-center gap-6 text-sm text-blue-200/70">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[#F39C12]" />Free prototype</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#F39C12]" />Real LLM decision</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#F39C12]" />100% Auditable</span>
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#F39C12]" />UAE • India • USA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Stats — No fake numbers */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { value: 'Real Groq Llama-3.3', label: 'Powered by industry LLM', icon: Bot, color: 'text-[#1B4F72]', bg: 'bg-[#1B4F72]/5' },
            { value: 'Full Audit Trail', label: 'Every decision logged', icon: ShieldCheck, color: 'text-[#27AE60]', bg: 'bg-green-50' },
            { value: 'Multi-Country', label: 'UAE • India • USA', icon: Globe, color: 'text-[#F39C12]', bg: 'bg-amber-50' },
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

      {/* HOW IT WORKS — Updated for real AI */}
      <section className="py-20 bg-[#F4F6F9]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-[#F39C12] tracking-widest uppercase mb-3 block">How It Works</span>
            <h2 className="font-serif text-4xl text-[#1B4F72]">From Upload to Decision</h2>
            <p className="text-gray-500 mt-4 max-w-lg mx-auto">Real Groq LLM + UAE/India/USA rules. Transparent, auditable, human-reversible.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: FileText, title: 'Submit Documents', desc: 'Upload your permit PDFs. Select country & preferred language.', color: 'text-[#1B4F72]', bg: 'bg-[#1B4F72]/5' },
              { step: '02', icon: Bot, title: 'AI Reviews Instantly', desc: 'Groq Llama-3.3-70B checks regulations and gives reasoned decision.', color: 'text-[#F39C12]', bg: 'bg-amber-50' },
              { step: '03', icon: CheckCircle, title: 'Get Full Audit Trail', desc: 'Receive decision + complete reasoning trace. Always reversible by human.', color: 'text-[#27AE60]', bg: 'bg-green-50' },
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

      {/* TRUST BANNER — Updated */}
      <section className="bg-[#1B4F72] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Globe className="w-10 h-10 text-[#F39C12] mx-auto mb-6" />
          <h2 className="font-serif text-4xl text-white mb-4">
            Real AI for Real Governments.<br />
            <span className="italic text-blue-200">Transparency First.</span>
          </h2>
          <p className="text-blue-200/70 text-lg mb-10 max-w-xl mx-auto">
            Every decision includes full reasoning trace and audit log. Built as a prototype — ready for pilots.
          </p>
          <Link 
            href="/apply"
            className="inline-flex items-center gap-2 bg-[#F39C12] text-white px-10 py-4 rounded-2xl font-semibold hover:bg-[#E67E22] active:scale-95 transition-all shadow-lg"
          >
            Test the AI Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}