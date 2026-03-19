import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const BACKEND = 'https://govmind-ai.onrender.com'

async function fetchWithRetry(url: string, options?: RequestInit, retries = 5): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...options, cache: 'no-store' })
      if (res.ok) return res
    } catch (_e) { /* retry */ }
    await new Promise(r => setTimeout(r, 4000))
  }
  throw new Error('Server unavailable after retries')
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const res = await fetchWithRetry(
      `${BACKEND}/api/v1/permits/${params.id}`
    )
    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (_e) {
    return NextResponse.json(
      { error: 'Application not found' },
      { status: 404 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const res = await fetchWithRetry(
      `${BACKEND}/api/v1/permits/${params.id}/review`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (_e) {
    return NextResponse.json(
      { error: 'Review failed' },
      { status: 500 }
    )
  }
}