import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const BACKEND = 'https://govmind-ai.onrender.com'

async function wakeBackend() {
  for (let i = 0; i < 8; i++) {
    try {
      const r = await fetch(`${BACKEND}/health`, { cache: 'no-store' })
      if (r.ok) return
    } catch (_e) { /* keep trying */ }
    await new Promise(r => setTimeout(r, 4000))
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  // ✅ Fix: await params for Next.js 14
  const params = await Promise.resolve(context.params)
  const id = params.id

  if (!id || id === 'undefined') {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    await wakeBackend()
    const res = await fetch(`${BACKEND}/api/v1/permits/${id}`, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (_e) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  // ✅ Fix: await params for Next.js 14
  const params = await Promise.resolve(context.params)
  const id = params.id

  if (!id || id === 'undefined') {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    await wakeBackend()

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

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || `Error ${res.status}` },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 }
    )
  }
}