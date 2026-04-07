import { prisma } from '@/lib/prisma'

export type ContainerStat = {
  container_id: string
  container_name: string
  visits: number
  unique_ips: number
  earnings_eur: number
  created_at: string
}

/**
 * Per-container visit and earnings breakdown for a user.
 * Expects:
 *   containers(id, user_id, name, created_at)
 *   visits(container_id, ip_hash, earnings_eur, visited_at)
 */
export async function getContainerStats(
  userId: string,
  limit: number = 50
): Promise<ContainerStat[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      container_id: string
      container_name: string
      visits: bigint
      unique_ips: bigint
      earnings_eur: number
      created_at: string
    }>
  >`
    SELECT
      c.id            AS container_id,
      c.name          AS container_name,
      COUNT(v.id)     AS visits,
      COUNT(DISTINCT v.ip_hash) AS unique_ips,
      COALESCE(SUM(v.earnings_eur), 0)::float AS earnings_eur,
      c.created_at::text AS created_at
    FROM containers c
    LEFT JOIN visits v ON v.container_id = c.id
    WHERE c.user_id = ${userId}
    GROUP BY c.id, c.name, c.created_at
    ORDER BY visits DESC
    LIMIT ${limit}
  `

  return rows.map((r) => ({
    container_id: r.container_id,
    container_name: r.container_name,
    visits: Number(r.visits),
    unique_ips: Number(r.unique_ips),
    earnings_eur: r.earnings_eur,
    created_at: r.created_at,
  }))
}
