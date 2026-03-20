import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const BACKEND = 'https://govmind-ai.onrender.com'

export async function POST(request: NextRequest) {
  for (let w = 0; w < 12; w++) {
    try {
      const h = await fetch(`${BACKEND}/health`, { cache: 'no-store' })
      if (h.ok) break
    } catch (_e) { /* keep trying */ }
    await new Promise(r => setTimeout(r, 5000))
  }

  try {
    const formData = await request.formData()
    const res = await fetch(`${BACKEND}/api/v1/permits/submit`, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server unavailable' },
      { status: 500 }
    )
  }
}