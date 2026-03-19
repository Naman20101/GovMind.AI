import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const BACKEND = 'https://govmind-ai.onrender.com'

async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = 8
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        cache: 'no-store',
      })
      if (res.ok) return res
      if (res.status === 404) throw new Error('Not found')
    } catch (e) {
      if (e instanceof Error && e.message === 'Not found') throw e
    }
    await new Promise(r => setTimeout(r, 3000))
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

    // Wake server first
    for (let i = 0; i < 5; i++) {
      try {
        const health = await fetch(`${BACKEND}/health`, { cache: 'no-store' })
        if (health.ok) break
      } catch (_e) { /* keep trying */ }
      await new Promise(r => setTimeout(r, 3000))
    }

    // Submit review
    const res = await fetch(
      `${BACKEND}/api/v1/permits/${params.id}/review`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.detail || 'Review failed' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 200 })

  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Review failed' },
      { status: 500 }
    )
  }
}