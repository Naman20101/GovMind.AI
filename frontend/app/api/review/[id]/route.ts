import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const BACKEND = 'https://govmind-ai.onrender.com'

export async function POST(request: NextRequest) {
  // ✅ Extract ID from URL directly — no params dependency
  const url = request.nextUrl.pathname
  const id = url.split('/api/review/')[1]?.replace(/\/$/, '')

  if (!id || id === 'undefined') {
    return NextResponse.json({ error: 'Missing permit ID' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (_e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Wake backend
  for (let w = 0; w < 10; w++) {
    try {
      const health = await fetch(`${BACKEND}/health`, { cache: 'no-store' })
      if (health.ok) break
    } catch (_e) { /* keep trying */ }
    await new Promise(r => setTimeout(r, 4000))
  }

  // Submit with retries
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(
        `${BACKEND}/api/v1/permits/${id}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          cache: 'no-store',
        }
      )
      const data = await res.json()
      if (res.ok) return NextResponse.json(data, { status: 200 })
      return NextResponse.json(
        { error: data.detail || data.error || 'Review failed' },
        { status: res.status }
      )
    } catch (_e) {
      await new Promise(r => setTimeout(r, 3000))
    }
  }

  return NextResponse.json({ error: 'Server unavailable' }, { status: 500 })
}