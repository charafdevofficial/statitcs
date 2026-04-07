import { prisma } from '@/lib/prisma'

export type TrafficShareRow = {
  country_code: string
  country_name: string
  visits: number
  unique_ips: number
  earnings_eur: number
  share_pct: number
}

/**
 * Country-level traffic breakdown.
 * Expects: visits(user_id, country_code, country_name, ip_hash, earnings_eur, visited_at)
 */
export async function getTrafficShare(
  userId: string,
  days: number = 30
): Promise<TrafficShareRow[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const rows = await prisma.$queryRaw<
    Array<{
      country_code: string
      country_name: string
      visits: bigint
      unique_ips: bigint
      earnings_eur: number
      total_visits: bigint
    }>
  >`
    SELECT
      COALESCE(country_code, 'XX')  AS country_code,
      COALESCE(country_name, 'Unknown') AS country_name,
      COUNT(*)                       AS visits,
      COUNT(DISTINCT ip_hash)        AS unique_ips,
      COALESCE(SUM(earnings_eur), 0)::float AS earnings_eur,
      SUM(COUNT(*)) OVER ()          AS total_visits
    FROM visits
    WHERE user_id = ${userId}
      AND visited_at >= ${since}
    GROUP BY country_code, country_name
    ORDER BY visits DESC
    LIMIT 50
  `

  return rows.map((r) => ({
    country_code: r.country_code,
    country_name: r.country_name,
    visits: Number(r.visits),
    unique_ips: Number(r.unique_ips),
    earnings_eur: r.earnings_eur,
    share_pct:
      Number(r.total_visits) > 0
        ? Math.round((Number(r.visits) / Number(r.total_visits)) * 10000) / 100
        : 0,
  }))
}
