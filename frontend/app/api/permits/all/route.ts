import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const BACKEND = 'https://govmind-ai.onrender.com'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = new URLSearchParams()
    if (searchParams.get('status')) {
      params.append('status', searchParams.get('status')!)
    }
    params.append('limit', '500')
    params.append('offset', '0')

    for (let i = 0; i < 8; i++) {
      try {
        const res = await fetch(
          `${BACKEND}/api/v1/permits/all?${params}`,
          { cache: 'no-store' }
        )
        if (res.ok) {
          const data = await res.json()
          return NextResponse.json(data)
        }
      } catch (_e) { /* retry */ }
      await new Promise(r => setTimeout(r, 3000))
    }
    return NextResponse.json([])
  } catch (_e) {
    return NextResponse.json([])
  }
}