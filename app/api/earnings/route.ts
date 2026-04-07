import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'

// GET /api/earnings - Get user's earnings summary
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Query database for earnings summary
    // SELECT 
    //   SUM(total_earnings) as total_earnings,
    //   SUM(CASE WHEN source_type = 'direct' THEN total_earnings ELSE 0 END) as direct_earnings,
    //   SUM(CASE WHEN source_type = 'referral' THEN total_earnings ELSE 0 END) as referral_earnings,
    //   COUNT(*) as total_transactions
    // FROM earnings WHERE user_id = $1

    const earnings = {
      total_earnings: 1250.75,
      direct_earnings: 950.50,
      referral_earnings: 300.25,
      pending_earnings: 125.00,
      total_visitors: 2500,
      total_transactions: 342,
      pending_payout: false,
      currency: 'USD'
    }

    // TODO: Get daily earnings trend for last 30 days
    // SELECT DATE(created_at) as date, SUM(total_earnings) as daily_earnings
    // FROM earnings WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
    // GROUP BY DATE(created_at) ORDER BY date DESC

    const dailyEarnings = [
      { date: new Date(), amount: 25.50 },
      { date: new Date(Date.now() - 86400000), amount: 18.75 }
    ]

    return NextResponse.json(
      { success: true, earnings, dailyEarnings },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Get earnings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}

