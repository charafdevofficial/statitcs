import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { getContainerStats } from '@/lib/analytics'

// GET /api/statistics/containers
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await getContainerStats(user.userId)
    return NextResponse.json({ stats }, { status: 200 })
  } catch (error) {
    console.error('[statistics/containers] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch container stats' }, { status: 500 })
  }
}
