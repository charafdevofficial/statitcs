import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { generateId } from '@/lib/id-generator'

// GET /api/coupons - Get available coupons for user
export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Query database for coupons valid for user
    // SELECT * FROM coupons WHERE is_active = TRUE AND
    // (is_global = TRUE OR applicable_to_user_id = $1) AND
    // (valid_until IS NULL OR valid_until > NOW()) AND
    // (max_uses IS NULL OR times_used < max_uses)

    const coupons = [
      {
        id: generateId(),
        code: 'BOOST50',
        description: '50% earnings boost for 7 days',
        multiplier: 1.5,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxUses: 100,
        timesUsed: 45,
        isGlobal: true
      },
      {
        id: generateId(),
        code: 'WELCOME20',
        description: 'Welcome bonus: 20% boost',
        multiplier: 1.2,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maxUses: null, // Unlimited
        timesUsed: 234,
        isGlobal: true
      }
    ]

    return NextResponse.json(
      { success: true, coupons },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Get coupons error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// POST /api/coupons/validate - Validate coupon code
export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code required' },
        { status: 400 }
      )
    }

    // TODO: Query database for coupon
    // SELECT * FROM coupons WHERE code = $1 AND is_active = TRUE

    const coupon = {
      code: code.toUpperCase(),
      valid: true,
      multiplier: 1.5,
      description: '50% earnings boost',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }

    if (!coupon.valid) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Invalid or expired coupon code'
        },
        { status: 400 }
      )
    }

    // TODO: Check if user has already used this coupon (if limited uses)
    // TODO: Apply coupon to user's account
    // INSERT INTO user_coupons (user_id, coupon_id, applied_at)
    // VALUES ($1, $2, NOW())

    return NextResponse.json(
      {
        success: true,
        valid: true,
        coupon,
        message: 'Coupon applied successfully'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Validate coupon error:', error)
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}

