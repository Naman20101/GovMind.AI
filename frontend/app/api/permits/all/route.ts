import { NextResponse } from 'next/server'

export const maxDuration = 60

const BACKEND = 'https://govmind-ai.onrender.com'

export async function GET() {
  // Try to get data — keep trying for up to 55 seconds
  const deadline = Date.now() + 55000

  while (Date.now() < deadline) {
    try {
      const res = await fetch(
        `${BACKEND}/api/v1/permits/all?limit=500&offset=0`,
        {
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        }
      )
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          return NextResponse.json(data, {
            headers: { 'Cache-Control': 'no-store, no-cache' }
          })
        }
      }
    } catch (_e) {
      // server sleeping — keep trying
    }
    await new Promise(r => setTimeout(r, 4000))
  }

  // Return special signal so frontend knows to retry
  return NextResponse.json(
    { retrying: true, message: 'Server waking up' },
    { status: 202 }
  )
}