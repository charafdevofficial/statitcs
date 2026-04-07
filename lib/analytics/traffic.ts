import { prisma } from '@/lib/prisma'

export type TrafficRow = {
  date: string
  visits: number
  unique_ips: number
  adblock_visits: number
  earnings_eur: number
}

export type TrafficOverview = {
  total_visits: number
  unique_ips: number
  adblock_visits: number
  total_earnings_eur: number
  today_visits: number
  today_earnings_eur: number
}

/**
 * Aggregate daily traffic rows for a given user, date range.
 * Expects a `visits` table with columns:
 *   user_id, visited_at, ip_hash, has_adblock, earnings_eur
 */
export async function getDailyTraffic(
  userId: string,
  days: number = 30
): Promise<TrafficRow[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const rows = await prisma.$queryRaw<
    Array<{
      date: string
      visits: bigint
      unique_ips: bigint
      adblock_visits: bigint
      earnings_eur: number
    }>
  >`
    SELECT
      DATE(visited_at)::text AS date,
      COUNT(*)               AS visits,
      COUNT(DISTINCT ip_hash) AS unique_ips,
      COUNT(*) FILTER (WHERE has_adblock = true) AS adblock_visits,
      COALESCE(SUM(earnings_eur), 0)::float AS earnings_eur
    FROM visits
    WHERE user_id = ${userId}
      AND visited_at >= ${since}
    GROUP BY DATE(visited_at)
    ORDER BY DATE(visited_at) DESC
  `

  return rows.map((r) => ({
    date: r.date,
    visits: Number(r.visits),
    unique_ips: Number(r.unique_ips),
    adblock_visits: Number(r.adblock_visits),
    earnings_eur: r.earnings_eur,
  }))
}

/**
 * Aggregate overview totals for a user.
 */
export async function getTrafficOverview(userId: string): Promise<TrafficOverview> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totals, todayTotals] = await Promise.all([
    prisma.$queryRaw<
      Array<{
        total_visits: bigint
        unique_ips: bigint
        adblock_visits: bigint
        total_earnings_eur: number
      }>
    >`
      SELECT
        COUNT(*)                AS total_visits,
        COUNT(DISTINCT ip_hash) AS unique_ips,
        COUNT(*) FILTER (WHERE has_adblock = true) AS adblock_visits,
        COALESCE(SUM(earnings_eur), 0)::float AS total_earnings_eur
      FROM visits
      WHERE user_id = ${userId}
    `,

    prisma.$queryRaw<
      Array<{
        today_visits: bigint
        today_earnings_eur: number
      }>
    >`
      SELECT
        COUNT(*)                         AS today_visits,
        COALESCE(SUM(earnings_eur), 0)::float AS today_earnings_eur
      FROM visits
      WHERE user_id = ${userId}
        AND visited_at >= ${today}
    `,
  ])

  const t = totals[0] ?? {
    total_visits: BigInt(0),
    unique_ips: BigInt(0),
    adblock_visits: BigInt(0),
    total_earnings_eur: 0,
  }
  const td = todayTotals[0] ?? { today_visits: BigInt(0), today_earnings_eur: 0 }

  return {
    total_visits: Number(t.total_visits),
    unique_ips: Number(t.unique_ips),
    adblock_visits: Number(t.adblock_visits),
    total_earnings_eur: t.total_earnings_eur,
    today_visits: Number(td.today_visits),
    today_earnings_eur: td.today_earnings_eur,
  }
}
