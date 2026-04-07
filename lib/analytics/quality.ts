import { prisma } from '@/lib/prisma'

export type QualityMetrics = {
  adblock_rate_pct: number
  unique_ip_rate_pct: number
  avg_earnings_per_visit: number
  tier1_pct: number
  tier2_pct: number
  tier3_pct: number
  total_visits: number
}

const TIER1_COUNTRIES = [
  'US','CA','GB','DE','FR','NL','AT','CH','SE','NO','DK','FI'
]
const TIER2_COUNTRIES = [
  'MX','PL','RU','UA','BR','TR','GR','CZ','SK','HU','RO',
  'BG','LT','LV','EE','IS','PT','ES','IT'
]

/**
 * Traffic quality metrics for a user over a date window.
 * Expects: visits(user_id, has_adblock, ip_hash, earnings_eur, country_code, visited_at)
 */
export async function getQualityMetrics(
  userId: string,
  days: number = 30
): Promise<QualityMetrics> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const rows = await prisma.$queryRaw<
    Array<{
      total_visits: bigint
      adblock_visits: bigint
      unique_ips: bigint
      total_earnings: number
      tier1_visits: bigint
      tier2_visits: bigint
    }>
  >`
    SELECT
      COUNT(*)                                    AS total_visits,
      COUNT(*) FILTER (WHERE has_adblock = true)  AS adblock_visits,
      COUNT(DISTINCT ip_hash)                      AS unique_ips,
      COALESCE(SUM(earnings_eur), 0)::float        AS total_earnings,
      COUNT(*) FILTER (WHERE country_code = ANY(${TIER1_COUNTRIES})) AS tier1_visits,
      COUNT(*) FILTER (WHERE country_code = ANY(${TIER2_COUNTRIES})) AS tier2_visits
    FROM visits
    WHERE user_id = ${userId}
      AND visited_at >= ${since}
  `

  const r = rows[0] ?? {
    total_visits: BigInt(0),
    adblock_visits: BigInt(0),
    unique_ips: BigInt(0),
    total_earnings: 0,
    tier1_visits: BigInt(0),
    tier2_visits: BigInt(0),
  }

  const total = Number(r.total_visits)
  const t1 = Number(r.tier1_visits)
  const t2 = Number(r.tier2_visits)
  const t3 = total - t1 - t2

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 10000) / 100 : 0

  return {
    adblock_rate_pct: pct(Number(r.adblock_visits)),
    unique_ip_rate_pct: pct(Number(r.unique_ips)),
    avg_earnings_per_visit: total > 0 ? r.total_earnings / total : 0,
    tier1_pct: pct(t1),
    tier2_pct: pct(t2),
    tier3_pct: pct(t3),
    total_visits: total,
  }
}
