'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, Upload, ArrowRight } from 'lucide-react';

const translations = { /* same as before — copy from my previous message if needed */ };

export default function ApplyPage() {
  const [country, setCountry] = useState('UAE');
  const [language, setLanguage] = useState('English');
  const t = translations[language as keyof typeof translations];   // add translations object here same as homepage

  const docsHint = country === 'UAE' ? "Emirates ID, Trade License, Lease, Insurance" : 
                   country === 'India' ? "PAN, Aadhaar, DIN, Office Proof" : 
                   "EIN, Passport/ID, State Registration, Address Proof";

  const openCamera = () => {
    // Real camera access (works on phone and laptop)
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        alert("Camera opened — point at your Emirates ID / Aadhaar / Passport (demo mode)");
        // In real app you would show live video + capture button
      })
      .catch(() => alert("Camera access denied or not available"));
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
            <select value={language} onChange={e => setLanguage(e.target.value)} className="px-4 py-2 border rounded-xl">
              <option value="English">English</option>
              <option value="Arabic">العربية</option>
              <option value="Hindi">हिंदी</option>
            </select>
            <select value={country} onChange={e => setCountry(e.target.value)} className="px-4 py-2 border rounded-xl">
              <option value="UAE">🇦🇪 UAE</option>
              <option value="India">🇮🇳 India</option>
              <option value="USA">🇺🇸 USA</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="flex items-center gap-2 text-gray-500 mb-8"><ArrowLeft /> Back to Home</Link>

        <h1 className="text-4xl font-serif mb-2">{t.title || "Apply for a Permit"}</h1>
        <p className="text-gray-600 mb-10">{t.subtitle || "Get an AI-powered decision in minutes"}</p>

        {/* Progress steps */}
        <div className="flex mb-12">
          <div className="flex-1 text-center">
            <div className="w-10 h-10 mx-auto bg-[#1B4F72] text-white rounded-full flex items-center justify-center font-bold">1</div>
            <p className="mt-2 text-sm font-medium">Business Info</p>
          </div>
          <div className="flex-1 text-center opacity-40">
            <div className="w-10 h-10 mx-auto bg-gray-300 text-gray-500 rounded-full flex items-center justify-center font-bold">2</div>
            <p className="mt-2 text-sm">Location</p>
          </div>
          <div className="flex-1 text-center opacity-40">
            <div className="w-10 h-10 mx-auto bg-gray-300 text-gray-500 rounded-full flex items-center justify-center font-bold">3</div>
            <p className="mt-2 text-sm">Documents</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-8 md:p-12">
          {/* Form fields ... keep your existing fields or add simple ones */}
          <div className="space-y-8">
            <div>
              <label className="block font-medium mb-2">Business Name</label>
              <input type="text" className="w-full border border-gray-300 rounded-2xl px-6 py-4" placeholder="e.g. Acme Corporation" />
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl">
              <strong>Required for {country}:</strong><br />
              {docsHint}
            </div>

            <button onClick={openCamera} className="w-full bg-[#1B4F72] text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold hover:bg-[#0F3A5A]">
              <Camera className="w-6 h-6" />
              Scan with Camera (Emirates ID / Aadhaar / Passport)
            </button>

            <button className="w-full border border-gray-300 py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold hover:bg-gray-50">
              <Upload className="w-6 h-6" />
              Upload PDF instead
            </button>
          </div>

          <button className="mt-12 w-full bg-[#F39C12] text-white py-5 rounded-2xl font-semibold text-lg hover:bg-[#E67E22]">
            Continue to Next Step <ArrowRight className="inline ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}