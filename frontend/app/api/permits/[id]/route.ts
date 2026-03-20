import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const BACKEND = 'https://govmind-ai.onrender.com'

async function wakeAndFetch(url: string, options?: RequestInit): Promise<Response> {
  // Wake server first
  for (let w = 0; w < 8; w++) {
    try {
      const health = await fetch(`${BACKEND}/health`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000)
      })
      if (health.ok) break
    } catch (_e) { /* keep trying */ }
    await new Promise(r => setTimeout(r, 4000))
  }

  // Now make the actual request with retries
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) return res
      if (res.status === 404) {
        // Genuine not found — return as-is
        return res
      }
    } catch (_e) { /* retry */ }
    await new Promise(r => setTimeout(r, 3000))
  }
  throw new Error('Server unavailable after retries')
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const res = await wakeAndFetch(
      `${BACKEND}/api/v1/permits/${params.id}`
    )
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (_e) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const res = await wakeAndFetch(
      `${BACKEND}/api/v1/permits/${params.id}/review`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || `Server error ${res.status}` },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Review failed' },
      { status: 500 }
    )
  }
}