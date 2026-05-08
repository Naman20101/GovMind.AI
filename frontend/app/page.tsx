import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Permit {
  id: string;
  name: string;
  department: string;
  confidence: number;
  risk: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Permit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchPermit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/permit/search?q=${query}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>GovMind.AI – Transparent AI for Government Permits</title>
        <meta name="description" content="Explainable AI for permit applications" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold text-center mb-4">GovMind.AI</h1>
          <p className="text-xl text-center text-gray-300 mb-12">No black boxes. Just transparent AI decisions.</p>

          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchPermit()}
                placeholder="Enter permit type, e.g., 'building permit'"
                className="flex-1 p-4 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={searchPermit}
                disabled={loading}
                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>

            {error && <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">{error}</div>}

            {result && (
              <div className="mt-8 p-6 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700">
                <h2 className="text-2xl font-semibold mb-2">{result.name}</h2>
                <p className="text-gray-300">Department: {result.department}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm">AI Confidence:</span>
                  <div className="w-2/3 bg-gray-700 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${result.confidence * 100}%` }}></div>
                  </div>
                  <span>{Math.round(result.confidence * 100)}%</span>
                </div>
                <p className="mt-3 text-sm text-yellow-300">Risk Level: {result.risk}</p>
                <button className="mt-4 text-blue-400 hover:underline">View Explainability Report →</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}