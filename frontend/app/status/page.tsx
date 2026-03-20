import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const BACKEND = 'https://govmind-ai.onrender.com'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const params = new URLSearchParams()
  if (searchParams.get('status')) {
    params.append('status', searchParams.get('status')!)
  }
  params.append('limit', '500')
  params.append('offset', '0')

  // Wake server first
  for (let w = 0; w < 10; w++) {
    try {
      const health = await fetch(`${BACKEND}/health`, { cache: 'no-store' })
      if (health.ok) break
    } catch (_e) { /* keep trying */ }
    await new Promise(r => setTimeout(r, 4000))
  }

  // Now fetch all permits
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(
        `${BACKEND}/api/v1/permits/all?${params}`,
        { cache: 'no-store' }
      )
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data, {
          headers: { 'Cache-Control': 'no-store' }
        })
      }
    } catch (_e) { /* retry */ }
    await new Promise(r => setTimeout(r, 2000))
  }

  return NextResponse.json([], { status: 200 })
}