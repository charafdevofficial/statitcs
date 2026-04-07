import { prisma } from '@/lib/prisma'

export type RedirectStat = {
  referrer: string
  visits: number
  unique_ips: number
  earnings_eur: number
}

/**
 * Referrer breakdown — where visitors came from.
 * Expects: visits(user_id, referrer, ip_hash, earnings_eur)
 * NULL or empty referrer is grouped as 'direct'.
 */
export async function getRedirectStats(
  userId: string,
  days: number = 30,
  limit: number = 25
): Promise<RedirectStat[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const rows = await prisma.$queryRaw<
    Array<{
      referrer: string
      visits: bigint
      unique_ips: bigint
      earnings_eur: number
    }>
  >`
    SELECT
      COALESCE(NULLIF(referrer, ''), 'direct') AS referrer,
      COUNT(*)                AS visits,
      COUNT(DISTINCT ip_hash) AS unique_ips,
      COALESCE(SUM(earnings_eur), 0)::float AS earnings_eur
    FROM visits
    WHERE user_id = ${userId}
      AND visited_at >= ${since}
    GROUP BY COALESCE(NULLIF(referrer, ''), 'direct')
    ORDER BY visits DESC
    LIMIT ${limit}
  `

  return rows.map((r) => ({
    referrer: r.referrer,
    visits: Number(r.visits),
    unique_ips: Number(r.unique_ips),
    earnings_eur: r.earnings_eur,
  }))
}
