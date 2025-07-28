import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    const response = await fetch('http://211.188.52.248:8002/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    return NextResponse.json(result)
  } catch (err) {
    console.error('Proxy API error:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
