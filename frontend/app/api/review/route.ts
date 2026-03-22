import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const BACKEND = 'https://govmind-ai.onrender.com'

export async function POST(request: NextRequest) {
  const { id, decision, reason, reviewed_by } = await request.json()

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

  for (let w = 0; w < 10; w++) {
    try {
      const h = await fetch(`${BACKEND}/health`, { cache: 'no-store' })
      if (h.ok) break
    } catch (_e) {}
    await new Promise(r => setTimeout(r, 4000))
  }

  try {
    const res = await fetch(`${BACKEND}/api/v1/permits/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, reason, reviewed_by }),
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (_e) {
    return NextResponse.json({ error: 'Server unavailable' }, { status: 500 })
  }
}