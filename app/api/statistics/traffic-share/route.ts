import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { getTrafficShare } from '@/lib/analytics'

// GET /api/statistics/traffic-share?days=30
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Math.min(parseInt(searchParams.get('days') ?? '30', 10), 365)

    const rows = await getTrafficShare(user.userId, days)
    return NextResponse.json({ rows }, { status: 200 })
  } catch (error) {
    console.error('[statistics/traffic-share] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch traffic share' }, { status: 500 })
  }
}
