import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { getTrafficOverview, getDailyTraffic } from '@/lib/analytics'

// GET /api/statistics/overview
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [overview, dailyTraffic] = await Promise.all([
      getTrafficOverview(user.userId),
      getDailyTraffic(user.userId, 30),
    ])

    return NextResponse.json({ overview, dailyTraffic }, { status: 200 })
  } catch (error) {
    console.error('[statistics/overview] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 })
  }
}
