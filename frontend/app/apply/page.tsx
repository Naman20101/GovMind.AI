'use client';

import Link from 'next/link';

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl">🏛️</div>
            <div className="font-semibold text-3xl text-gray-900">GovMind.AI</div>
          </Link>
        </div>

        <h1 className="text-5xl font-serif text-gray-900 mb-3">Apply for a Permit</h1>
        <p className="text-xl text-gray-600 mb-10">Get an AI-powered decision in minutes.</p>

        {/* Guest Warning */}
        <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl mb-10 flex gap-4">
          <div className="text-yellow-600 text-2xl">ℹ️</div>
          <div>
            <p className="font-medium text-yellow-800">You're applying as a guest</p>
            <p className="text-yellow-700 text-sm mt-1">
              Sign in or create an account to save your applications and track them later.
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center mb-12">
          <div className="flex-1 text-center">
            <div className="w-9 h-9 mx-auto bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
            <p className="mt-3 font-medium text-blue-700">Business Info</p>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-4" />
          <div className="flex-1 text-center">
            <div className="w-9 h-9 mx-auto bg-gray-300 text-gray-400 rounded-full flex items-center justify-center font-bold text-lg">2</div>
            <p className="mt-3 text-gray-400">Location</p>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-4" />
          <div className="flex-1 text-center">
            <div className="w-9 h-9 mx-auto bg-gray-300 text-gray-400 rounded-full flex items-center justify-center font-bold text-lg">3</div>
            <p className="mt-3 text-gray-400">Documents</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow p-10">
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 text-lg" 
                placeholder="e.g. Acme Corporation" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permit Type</label>
              <select className="w-full border border-gray-300 rounded-2xl px-5 py-4 text-lg">
                <option>Select permit type...</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 text-lg" 
                placeholder="Full legal name" 
              />
            </div>
          </div>

          <button className="mt-12 w-full bg-blue-700 hover:bg-blue-800 text-white py-5 rounded-2xl font-semibold text-lg transition">
            Continue to Next Step
          </button>
        </div>
      </div>
    </div>
  );
}