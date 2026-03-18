import { NextRequest, NextResponse } from 'next/server'

const BACKEND = 'https://govmind-ai.onrender.com'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `${BACKEND}/api/v1/permits/${params.id}`,
      { cache: 'no-store' }
    )
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to server' },
      { status: 500 }
    )
  }
}
  export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const response = await fetch(
      `${BACKEND}/api/v1/permits/${params.id}/review`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to connect' }, { status: 500 })
  }
  }
