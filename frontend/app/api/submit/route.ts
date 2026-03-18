import { NextRequest, NextResponse } from 'next/server'

const BACKEND = 'https://govmind-ai.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const response = await fetch(`${BACKEND}/api/v1/permits/submit`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to server' },
      { status: 500 }
    )
  }
}
