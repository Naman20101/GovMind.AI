'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, Upload, ArrowRight } from 'lucide-react';

const translations = {
  English: {
    title: "Apply for a Permit",
    subtitle: "Get an AI-powered decision in minutes",
    guestWarning: "You're applying as a guest. Sign in to save and track applications.",
    step1: "Business Info",
    step2: "Location",
    step3: "Documents",
    businessName: "Business Name",
    permitType: "Permit Type",
    ownerName: "Owner Name",
    countryLabel: "Country",
    scanBtn: "Scan with Camera",
    uploadBtn: "Upload PDF",
    nextBtn: "Continue to Documents",
    uaeDocs: "Required: Emirates ID, Trade License, Lease Contract, Insurance",
    indiaDocs: "Required: PAN, Aadhaar, DIN, Registered Office Proof",
    usaDocs: "Required: EIN, Passport/ID, State Registration, Business Address Proof",
  },
  Arabic: {
    title: "التقدم بطلب تصريح",
    subtitle: "احصل على قرار مدعوم بالذكاء الاصطناعي في دقائق",
    guestWarning: "أنت تتقدم كضيف. سجل الدخول لحفظ طلباتك وتتبعها.",
    step1: "معلومات الأعمال",
    step2: "الموقع",
    step3: "المستندات",
    businessName: "اسم العمل",
    permitType: "نوع التصريح",
    ownerName: "اسم المالك",
    countryLabel: "الدولة",
    scanBtn: "مسح بالكاميرا",
    uploadBtn: "رفع PDF",
    nextBtn: "المتابعة إلى المستندات",
    uaeDocs: "المطلوب: بطاقة الهوية الإماراتية، رخصة التجارة، عقد الإيجار، التأمين",
    indiaDocs: "المطلوب: PAN، Aadhaar، DIN، إثبات المكتب المسجل",
    usaDocs: "المطلوب: EIN، جواز السفر/الهوية، تسجيل الولاية، إثبات العنوان",
  },
  Hindi: {
    title: "परमिट के लिए आवेदन करें",
    subtitle: "मिनटों में AI-संचालित निर्णय प्राप्त करें",
    guestWarning: "आप अतिथि के रूप में आवेदन कर रहे हैं। आवेदनों को सहेजने और ट्रैक करने के लिए साइन इन करें।",
    step1: "व्यवसाय जानकारी",
    step2: "स्थान",
    step3: "दस्तावेज़",
    businessName: "व्यवसाय का नाम",
    permitType: "परमिट प्रकार",
    ownerName: "मालिक का नाम",
    countryLabel: "देश",
    scanBtn: "कैमरा से स्कैन करें",
    uploadBtn: "PDF अपलोड करें",
    nextBtn: "दस्तावेज़ पर जारी रखें",
    uaeDocs: "आवश्यक: Emirates ID, ट्रेड लाइसेंस, लीज कॉन्ट्रैक्ट, इंश्योरेंस",
    indiaDocs: "आवश्यक: PAN, Aadhaar, DIN, रजिस्टर्ड ऑफिस प्रूफ",
    usaDocs: "आवश्यक: EIN, पासपोर्ट/ID, स्टेट रजिस्ट्रेशन, बिजनेस एड्रेस प्रूफ",
  }
};

export default function ApplyPage() {
  const [country, setCountry] = useState('UAE');
  const [language, setLanguage] = useState('English');
  const t = translations[language as keyof typeof translations];

  const docsHint = country === 'UAE' ? t.uaeDocs : country === 'India' ? t.indiaDocs : t.usaDocs;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1B4F72] rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🏛️</span>
            </div>
            <div className="font-semibold text-xl text-[#1B4F72]">GovMind.AI</div>
          </div>
          <div className="flex gap-4">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-white border border-gray-300 px-4 py-2 rounded-xl text-sm">
              <option value="English">English</option>
              <option value="Arabic">العربية</option>
              <option value="Hindi">हिंदी</option>
            </select>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-white border border-gray-300 px-4 py-2 rounded-xl text-sm">
              <option value="UAE">🇦🇪 UAE</option>
              <option value="India">🇮🇳 India</option>
              <option value="USA">🇺🇸 USA</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/" className="flex items-center gap-2 text-gray-500 mb-8 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>

        <h1 className="text-4xl font-serif text-[#1B4F72] mb-2">{t.title}</h1>
        <p className="text-gray-600 mb-8">{t.subtitle}</p>

        {/* Guest warning */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl mb-8 flex gap-3">
          <div className="text-yellow-600 mt-0.5">ℹ️</div>
          <div>
            <p className="font-medium text-yellow-800">{t.guestWarning}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-8 h-8 bg-[#1B4F72] text-white rounded-full flex items-center justify-center font-semibold">1</div>
          <div className="h-px flex-1 bg-gray-200" />
          <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-semibold">2</div>
          <div className="h-px flex-1 bg-gray-200" />
          <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-semibold">3</div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-6">{t.step1}</h2>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-2">{t.businessName}</label>
              <input type="text" placeholder="e.g. Acme Corporation" className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#1B4F72]" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.permitType}</label>
              <select className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#1B4F72]">
                <option>Select permit type...</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.ownerName}</label>
              <input type="text" placeholder="Full legal name" className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#1B4F72]" />
            </div>

            {/* Country-specific hint */}
            <div className="bg-blue-50 p-5 rounded-2xl text-sm">
              <strong>Required Documents for {country}:</strong><br />
              {docsHint}
            </div>

            {/* Camera Scan Button */}
            <button 
              onClick={() => alert('Camera opened - scan Emirates ID / Aadhaar / Passport (demo)')}
              className="w-full flex items-center justify-center gap-3 bg-[#1B4F72] text-white py-4 rounded-2xl font-semibold hover:bg-[#0F3A5A] transition-all"
            >
              <Camera className="w-5 h-5" />
              {t.scanBtn} (Emirates ID / Aadhaar / Passport)
            </button>

            <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-4 rounded-2xl font-semibold hover:bg-gray-50">
              <Upload className="w-5 h-5" />
              {t.uploadBtn}
            </button>
          </div>

          <button className="mt-10 w-full bg-[#F39C12] text-white py-4 rounded-2xl font-semibold hover:bg-[#E67E22] transition-all flex items-center justify-center gap-2">
            {t.nextBtn} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}