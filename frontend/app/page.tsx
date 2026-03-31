
'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Lock, Globe, Bot, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const [country, setCountry] = useState('UAE');
  const [language, setLanguage] = useState('English');

  return (
    <div>
      {/* HERO */}
      <section className="hero-gradient relative overflow-hidden min-h-[90vh] flex items-center bg-[#0A2540]">
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
              Real LLM-powered permit review for UAE, India & USA. 
              Decision in seconds • Fully auditable • English, العربية, हिंदी support.
            </p>

            {/* Country & Language Toggles */}
            <div className="animate-fade-up delay-350 flex flex-wrap gap-6 mb-10">
              <div>
                <label className="block text-xs text-blue-200/70 mb-1">Country</label>
                <select 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-white/10 backdrop-blur border border-white/30 text-white px-5 py-3 rounded-2xl text-base w-full min-w-[200px]"
                >
                  <option value="UAE">🇦🇪 UAE (Dubai DED)</option>
                  <option value="India">🇮🇳 India (MCA)</option>
                  <option value="USA">🇺🇸 USA (Federal + State)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-blue-200/70 mb-1">Response Language</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white/10 backdrop-blur border border-white/30 text-white px-5 py-3 rounded-2xl text-base w-full min-w-[200px]"
                >
                  <option value="English">English</option>
                  <option value="Arabic">العربية (Arabic)</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                </select>
              </div>
            </div>

            <div className="animate-fade-up delay-400 flex flex-wrap gap-4">
              <Link 
                href="/apply"
                className="flex items-center gap-3 bg-white text-[#1B4F72] px-10 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all"
              >
                Test AI Review Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="mt-10 flex gap-8 text-sm text-blue-200/70">
              <span className="flex items-center gap-2"><Zap className="w-4 h-4" />Free prototype</span>
              <span className="flex items-center gap-2"><Lock className="w-4 h-4" />Auditable</span>
              <span className="flex items-center gap-2"><Globe className="w-4 h-4" />UAE • India • USA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Honest Stats */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { icon: Bot, label: "Real Groq LLM", desc: "Llama-3.3-70B" },
            { icon: ShieldCheck, label: "Full Audit Trail", desc: "Every decision logged" },
            { icon: Globe, label: "Multi-Country", desc: "UAE, India, USA rules" },
          ].map((item, i) => (
            <div key={i} className="flex gap-5 p-6 rounded-3xl border">
              <item.icon className="w-10 h-10 text-[#F39C12] flex-shrink-0" />
              <div>
                <div className="font-semibold text-lg">{item.label}</div>
                <div className="text-gray-500 text-sm">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}