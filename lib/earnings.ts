/**
 * CPM Rates by Country Tier
 * Tier 1 (High-Value): $4 per 1000 impressions
 * Tier 2 (Medium-Value): $2 per 1000 impressions
 * Tier 3 (Low-Value): $1 per 1000 impressions
 */

const CPM_TIERS = {
  tier1: {
    rate: 4.00,
    countries: ['US', 'CA', 'GB', 'DE', 'FR', 'NL', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI']
  },
  tier2: {
    rate: 2.00,
    countries: [
      'MX', 'PL', 'RU', 'UA', 'BR', 'TR', 'GR', 'CZ', 'SK', 'HU', 'RO', 
      'BG', 'LT', 'LV', 'EE', 'IS', 'PT', 'ES', 'IT'
    ]
  },
  tier3: {
    rate: 1.00,
    countries: [
      'IN', 'VN', 'TH', 'ID', 'PH', 'AR', 'CL', 'CO', 'PE', 'EC',
      'ZA', 'EG', 'NG', 'KE', 'CN', 'BD', 'PK', 'SG', 'MY', 'HK'
    ]
  }
}

/**
 * Get CPM rate based on country code
 */
export function getCpmRate(countryCode: string): number {
  const code = (countryCode || 'XX').toUpperCase()

  if (CPM_TIERS.tier1.countries.includes(code)) {
    return CPM_TIERS.tier1.rate
  }
  if (CPM_TIERS.tier2.countries.includes(code)) {
    return CPM_TIERS.tier2.rate
  }
  return CPM_TIERS.tier3.rate // Default to tier 3
}

/**
 * Get country tier
 */
export function getCountryTier(countryCode: string): 'tier1' | 'tier2' | 'tier3' {
  const code = (countryCode || 'XX').toUpperCase()

  if (CPM_TIERS.tier1.countries.includes(code)) return 'tier1'
  if (CPM_TIERS.tier2.countries.includes(code)) return 'tier2'
  return 'tier3'
}

/**
 * Calculate earnings for a visitor
 */
export function calculateEarnings(
  countryCode: string,
  hasAdblock: boolean = false,
  couponMultiplier: number = 1.0
): number {
  const baseCpm = getCpmRate(countryCode)
  const adblockMultiplier = hasAdblock ? 0.1 : 1.0
  
  // CPM is per 1000 visitors, so we return the value for 1 visitor
  return (baseCpm * adblockMultiplier * couponMultiplier) / 1000
}

/**
 * Get payout processing fee
 */
export function getPayoutFee(amount: number, method: string): number {
  const feePercentage = method === 'bitcoin' ? 0.01 : 0.02
  return amount * feePercentage
}

/**
 * Check if user meets minimum payout threshold
 */
export function meetsPayoutThreshold(
  userEarnings: number,
  threshold: number = 20.0
): boolean {
  return userEarnings >= threshold
}

/**
 * Calculate referral commission
 */
export function calculateReferralCommission(
  refereeEarnings: number,
  commissionPercentage: number = 20
): number {
  return (refereeEarnings * commissionPercentage) / 100
}

/**
 * Validate payout address format
 */
export function isValidPayoutAddress(address: string, method: string): boolean {
  switch (method) {
    case 'paypal':
      // Simple email validation
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)
    
    case 'bitcoin':
      // Bitcoin address format (simplified)
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address)
    
    case 'bank_transfer':
      // IBAN format (simplified)
      return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(address)
    
    case 'stripe':
      // Stripe connected account ID
      return /^acct_[a-zA-Z0-9]{16,}$/.test(address)
    
    default:
      return false
  }
}
