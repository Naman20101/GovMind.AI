'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, Upload, ArrowRight } from 'lucide-react';

const translations = {
  English: {
    title: "Apply for a Permit",
    subtitle: "Get an AI-powered decision in minutes",
    guestWarning: "You're applying as a guest. Sign in to save and track applications.",
    businessInfo: "Business Info",
    businessName: "Business Name",
    permitType: "Permit Type",
    ownerName: "Owner Name",
    countryLabel: "Country",
    scanBtn: "Scan with Camera",
    uploadBtn: "Upload PDF",
    nextBtn: "Continue",
    uaeDocs: "Emirates ID, Trade License, Lease Contract, Insurance",
    indiaDocs: "PAN, Aadhaar, DIN, Registered Office Proof",
    usaDocs: "EIN, Passport/ID, State Registration, Address Proof",
  },
  Arabic: {
    title: "التقدم بطلب تصريح",
    subtitle: "احصل على قرار مدعوم بالذكاء الاصطناعي في دقائق",
    guestWarning: "أنت تتقدم كضيف. سجل الدخول لحفظ طلباتك وتتبعها.",
    businessInfo: "معلومات الأعمال",
    businessName: "اسم العمل",
    permitType: "نوع التصريح",
    ownerName: "اسم المالك",
    countryLabel: "الدولة",
    scanBtn: "مسح بالكاميرا",
    uploadBtn: "رفع PDF",
    nextBtn: "المتابعة",
    uaeDocs: "بطاقة الهوية الإماراتية، رخصة التجارة، عقد الإيجار، التأمين",
    indiaDocs: "PAN، Aadhaar، DIN، إثبات المكتب المسجل",
    usaDocs: "EIN، جواز السفر/الهوية، تسجيل الولاية، إثبات العنوان",
  },
  Hindi: {
    title: "परमिट के लिए आवेदन करें",
    subtitle: "मिनटों में AI-संचालित निर्णय प्राप्त करें",
    guestWarning: "आप अतिथि के रूप में आवेदन कर रहे हैं। आवेदनों को सहेजने और ट्रैक करने के लिए साइन इन करें।",
    businessInfo: "व्यवसाय जानकारी",
    businessName: "व्यवसाय का नाम",
    permitType: "परमिट प्रकार",
    ownerName: "मालिक का नाम",
    countryLabel: "देश",
    scanBtn: "कैमरा से स्कैन करें",
    uploadBtn: "PDF अपलोड करें",
    nextBtn: "जारी रखें",
    uaeDocs: "Emirates ID, ट्रेड लाइसेंस, लीज कॉन्ट्रैक्ट, इंश्योरेंस",
    indiaDocs: "PAN, Aadhaar, DIN, रजिस्टर्ड ऑफिस प्रूफ",
    usaDocs: "EIN, पासपोर्ट/ID, स्टेट रजिस्ट्रेशन, बिजनेस एड्रेस प्रूफ",
  }
};

export default function ApplyPage() {
  const [country, setCountry] = useState('UAE');
  const [language, setLanguage] = useState('English');
  const t = translations[language as keyof typeof translations];

  const docsHint = country === 'UAE' ? t.uaeDocs : country === 'India' ? t.indiaDocs : t.usaDocs;

  const openCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => alert("Camera opened — point at your ID document (demo)"))
      .catch(() => alert("Camera access denied or not available on this device"));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1B4F72] rounded-2xl flex items-center justify-center text-white text-xl">🏛️</div>
            <span className="font-semibold text-2xl text-[#1B4F72]">GovMind.AI</span>
          </Link>
          <div className="flex gap-3">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-4 py-2 border rounded-xl text-sm">
              <option value="English">English</option>
              <option value="Arabic">العربية</option>
              <option value="Hindi">हिंदी</option>
            </select>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="px-4 py-2 border rounded-xl text-sm">
              <option value="UAE">🇦🇪 UAE</option>
              <option value="India">🇮🇳 India</option>
              <option value="USA">🇺🇸 USA</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="flex items-center gap-2 text-gray-500 mb-8 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>

        <h1 className="text-4xl font-serif text-[#1B4F72] mb-2">{t.title}</h1>
        <p className="text-gray-600 mb-10">{t.subtitle}</p>

        <div className="bg-white rounded-3xl shadow p-8 md:p-12">
          <h2 className="text-2xl font-semibold mb-8">{t.businessInfo}</h2>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-2">{t.businessName}</label>
              <input type="text" className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#1B4F72]" placeholder="e.g. Acme Corporation" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.permitType}</label>
              <select className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#1B4F72]">
                <option>Select permit type...</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.ownerName}</label>
              <input type="text" className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#1B4F72]" placeholder="Full legal name" />
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl text-sm">
              <strong>Required Documents for {country}:</strong><br />
              {docsHint}
            </div>

            <button 
              onClick={openCamera}
              className="w-full flex items-center justify-center gap-3 bg-[#1B4F72] hover:bg-[#0F3A5A] text-white py-4 rounded-2xl font-semibold transition-all"
            >
              <Camera className="w-6 h-6" />
              {t.scanBtn} (Emirates ID / Aadhaar / Passport)
            </button>

            <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all">
              <Upload className="w-6 h-6" />
              {t.uploadBtn}
            </button>
          </div>

          <button className="mt-12 w-full bg-[#F39C12] hover:bg-[#E67E22] text-white py-5 rounded-2xl font-semibold text-lg transition-all">
            {t.nextBtn} <ArrowRight className="inline ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}