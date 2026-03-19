//submit/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const BACKEND = 'https://govmind-ai.onrender.com'

async function wakeBackend() {
  for (let i = 0; i < 8; i++) {
    try {
      const res = await fetch(`${BACKEND}/health`, { cache: 'no-store' })
      if (res.ok) return true
    } catch (_e) { /* keep trying */ }
    await new Promise(r => setTimeout(r, 4000))
  }
  return false
}

export async function POST(request: NextRequest) {
  try {
    await wakeBackend()

    const formData = await request.formData()

    const res = await fetch(
      `${BACKEND}/api/v1/permits/submit`,
      {
        method: 'POST',
        body: formData,
        cache: 'no-store',
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || 'Submission failed' },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server unavailable' },
      { status: 500 }
    )
  }
}