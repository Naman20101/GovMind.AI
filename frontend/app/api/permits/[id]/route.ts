import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const BACKEND = 'https://govmind-ai.onrender.com'

async function wakeBackend() {
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(`${BACKEND}/health`, { cache: 'no-store' })
      if (res.ok) return true
    } catch (_e) { /* keep trying */ }
    await new Promise(r => setTimeout(r, 3000))
  }
  return false
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await wakeBackend()
    const res = await fetch(
      `${BACKEND}/api/v1/permits/${params.id}`,
      { cache: 'no-store' }
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
    await wakeBackend()

    const res = await fetch(
      `${BACKEND}/api/v1/permits/${params.id}/review`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || 'Review failed' },
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