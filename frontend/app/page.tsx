'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Lock, Globe } from 'lucide-react';
import { useState } from 'react';

const translations = {
  English: { beta: "Beta — AI-Powered Permit Processing", title: "Government Permits", subtitle: "Automated with AI", desc: "Submit your business permit and get an AI decision in minutes — fully auditable, always human-reversible.", testBtn: "Apply for Permit", free: "Free to try", auditable: "100% Auditable", countries: "UAE • India • USA" },
  Arabic: { beta: "بيتا — معالجة التصاريح بالذكاء الاصطناعي", title: "تصاريح الحكومة", subtitle: "مؤتمتة بالذكاء الاصطناعي", desc: "قدم طلب تصريحك واحصل على قرار ذكاء اصطناعي في دقائق — قابل للتدقيق بالكامل.", testBtn: "تقدم بطلب تصريح", free: "مجاني للتجربة", auditable: "قابل للتدقيق 100%", countries: "الإمارات • الهند • أمريكا" },
  Hindi: { beta: "बीटा — AI-संचालित परमिट प्रोसेसिंग", title: "सरकारी परमिट", subtitle: "AI के साथ स्वचालित", desc: "अपना परमिट आवेदन जमा करें और मिनटों में AI निर्णय प्राप्त करें — पूरी तरह ऑडिटेबल।", testBtn: "परमिट के लिए आवेदन करें", free: "मुफ्त आजमाइश", auditable: "100% ऑडिटेबल", countries: "UAE • भारत • USA" }
};

export default function HomePage() {
  const [country, setCountry] = useState('UAE');
  const [language, setLanguage] = useState('English');
  const t = translations[language as keyof typeof translations];

  return (
    <div className="min-h-screen bg-[#0A2540] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">🏛️</div>
            <div className="font-semibold text-2xl">GovMind.AI</div>
          </div>
          <div className="flex gap-4">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-white/10 border border-white/30 px-4 py-2 rounded-xl">
              <option value="English">English</option>
              <option value="Arabic">العربية</option>
              <option value="Hindi">हिंदी</option>
            </select>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full mb-8">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          {t.beta}
        </div>

        <h1 className="text-6xl md:text-7xl font-serif leading-tight mb-6">
          {t.title} <span className="text-[#F39C12]">{t.subtitle}</span>
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-blue-100/90 mb-12">{t.desc}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/apply" className="bg-white text-[#0A2540] px-10 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition">
            {t.testBtn} <ArrowRight className="w-6 h-6" />
          </Link>
        </div>

        <div className="flex justify-center gap-8 text-sm text-blue-200">
          <span className="flex items-center gap-2"><Zap className="w-5 h-5" />{t.free}</span>
          <span className="flex items-center gap-2"><Lock className="w-5 h-5" />{t.auditable}</span>
          <span className="flex items-center gap-2"><Globe className="w-5 h-5" />{t.countries}</span>
        </div>
      </section>
    </div>
  );
}