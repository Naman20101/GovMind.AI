'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Lock, Globe, Bot, ShieldCheck, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';

const translations = {
  English: {
    beta: "Beta — Real AI-Powered Permit Processing",
    title: "Government Permits",
    subtitle: "Automated with AI",
    desc: "Submit your business permit application and receive an AI-powered decision in minutes — fully auditable, always human-reversible.",
    countryLabel: "Country",
    langLabel: "Response Language",
    testBtn: "Test AI Review Now",
    free: "Free prototype",
    auditable: "Auditable",
    countries: "UAE • India • USA",
    howItWorks: "How It Works",
    step1: "Upload Documents",
    step2: "AI Reviews Instantly",
    step3: "Get Decision + Trace",
  },
  Arabic: {
    beta: "بيتا — معالجة التصاريح المدعومة بالذكاء الاصطناعي",
    title: "تصاريح الحكومة",
    subtitle: "مؤتمتة بالذكاء الاصطناعي",
    desc: "قدم طلب تصريح عملك واحصل على قرار مدعوم بالذكاء الاصطناعي في دقائق — قابل للتدقيق بالكامل، وقابل للرجوع إلى الإنسان دائمًا.",
    countryLabel: "الدولة",
    langLabel: "لغة الرد",
    testBtn: "اختبر مراجعة الذكاء الاصطناعي الآن",
    free: "نموذج مجاني",
    auditable: "قابل للتدقيق",
    countries: "الإمارات • الهند • الولايات المتحدة",
    howItWorks: "كيف يعمل",
    step1: "رفع المستندات",
    step2: "الذكاء الاصطناعي يراجع فورًا",
    step3: "احصل على القرار + السجل",
  },
  Hindi: {
    beta: "बीटा — वास्तविक AI-संचालित परमिट प्रोसेसिंग",
    title: "सरकारी परमिट",
    subtitle: "AI के साथ स्वचालित",
    desc: "अपना व्यवसाय परमिट आवेदन जमा करें और मिनटों में AI-संचालित निर्णय प्राप्त करें — पूरी तरह ऑडिटेबल, हमेशा मानव-रिवर्सिबल।",
    countryLabel: "देश",
    langLabel: "प्रतिक्रिया भाषा",
    testBtn: "अभी AI समीक्षा परीक्षण करें",
    free: "मुफ्त प्रोटोटाइप",
    auditable: "ऑडिटेबल",
    countries: "UAE • भारत • USA",
    howItWorks: "यह कैसे काम करता है",
    step1: "दस्तावेज़ अपलोड करें",
    step2: "AI तुरंत समीक्षा करता है",
    step3: "निर्णय + ट्रेस प्राप्त करें",
  }
};

export default function HomePage() {
  const [country, setCountry] = useState('UAE');
  const [language, setLanguage] = useState('English');
  const t = translations[language as keyof typeof translations];

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
                {t.beta}
              </span>
            </div>

            <h1 className="animate-fade-up delay-200 font-serif text-6xl md:text-7xl text-white leading-[1.05] mb-6">
              {t.title}{' '}
              <span className="text-[#F39C12] italic">{t.subtitle}</span>
            </h1>

            <p className="animate-fade-up delay-300 text-lg text-blue-100/80 leading-relaxed max-w-xl mb-10">
              {t.desc}
            </p>

            {/* Toggles */}
            <div className="animate-fade-up delay-350 flex flex-wrap gap-6 mb-10">
              <div>
                <label className="block text-xs text-blue-200/70 mb-1">{t.countryLabel}</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-white/10 backdrop-blur border border-white/30 text-white px-5 py-3 rounded-2xl text-base w-full min-w-[200px]">
                  <option value="UAE">🇦🇪 UAE (Dubai DED)</option>
                  <option value="India">🇮🇳 India (MCA)</option>
                  <option value="USA">🇺🇸 USA</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-blue-200/70 mb-1">{t.langLabel}</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-white/10 backdrop-blur border border-white/30 text-white px-5 py-3 rounded-2xl text-base w-full min-w-[200px]">
                  <option value="English">English</option>
                  <option value="Arabic">العربية</option>
                  <option value="Hindi">हिंदी</option>
                </select>
              </div>
            </div>

            <div className="animate-fade-up delay-400 flex flex-wrap gap-4">
              <Link href="/apply" className="flex items-center gap-3 bg-white text-[#1B4F72] px-10 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all">
                {t.testBtn} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="mt-10 flex gap-8 text-sm text-blue-200/70">
              <span className="flex items-center gap-2"><Zap className="w-4 h-4" />{t.free}</span>
              <span className="flex items-center gap-2"><Lock className="w-4 h-4" />{t.auditable}</span>
              <span className="flex items-center gap-2"><Globe className="w-4 h-4" />{t.countries}</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#F4F6F9]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif mb-4">{t.howItWorks}</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[ 
              { num: "1", title: t.step1, desc: "Upload your documents" },
              { num: "2", title: t.step2, desc: "AI checks rules instantly" },
              { num: "3", title: t.step3, desc: "Get decision + full trace" }
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow">
                <div className="text-5xl font-bold text-[#F39C12] mb-4">{s.num}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}