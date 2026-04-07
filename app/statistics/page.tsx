"use client"

import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import { SkeletonLoader, TableSkeleton } from '@/components/skeleton-loader'

type DailyRow = {
  date: string
  visits: number
  unique_ips: number
  adblock_visits: number
  earnings_eur: number
}

type Overview = {
  total_visits: number
  unique_ips: number
  adblock_visits: number
  total_earnings_eur: number
  today_visits: number
  today_earnings_eur: number
}

function fmt(n: number) {
  return n.toLocaleString('de-DE')
}

function fmtEur(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + ' €'
}

export default function StatisticsOverviewPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [dailyTraffic, setDailyTraffic] = useState<DailyRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/statistics/overview')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setOverview(data.overview)
        setDailyTraffic(data.dailyTraffic)
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div>
      {/* Summary strip */}
      <div className="flex items-end justify-between mb-6">
        {isLoading ? (
          <div className="flex-1">
            <SkeletonLoader variant="rect" className="w-48 h-10 mb-2" />
            <SkeletonLoader variant="line" className="w-64" />
          </div>
        ) : overview ? (
          <div>
            <span className="text-lg text-[#156594]">Total earnings</span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-light text-[#156594]">
                {fmtEur(overview.total_earnings_eur)}
              </span>
              {overview.today_earnings_eur > 0 && (
                <span className="bg-[#64ca2f] text-white text-sm px-2 py-0.5 rounded animate-pulse">
                  +{fmtEur(overview.today_earnings_eur)} today
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-[#156594] text-sm">{error ?? 'No data'}</div>
        )}
      </div>

      {/* KPI cards */}
      {!isLoading && overview && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total visits', value: fmt(overview.total_visits) },
            { label: 'Unique IPs', value: fmt(overview.unique_ips) },
            { label: 'Adblock visits', value: fmt(overview.adblock_visits) },
            { label: "Today's visits", value: fmt(overview.today_visits) },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="border border-[#dae8ef] rounded p-4 text-center"
            >
              <div className="text-2xl font-light text-[#1b91db]">{kpi.value}</div>
              <div className="text-xs text-[#58839b] mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sparkline chart */}
      {isLoading ? (
        <div className="border border-[#dae8ef] rounded p-4 mb-6">
          <div className="h-40 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : dailyTraffic.length > 0 ? (
        <div className="border border-[#dae8ef] rounded p-4 mb-6">
          <SparkChart rows={dailyTraffic} />
        </div>
      ) : null}

      {/* Daily traffic table */}
      {isLoading ? (
        <div className="border border-[#dae8ef] rounded overflow-hidden">
          <TableSkeleton rows={8} columns={5} />
        </div>
      ) : (
        <div className="border border-[#dae8ef] rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1b91db] text-white">
                <th className="text-left p-3 text-sm font-medium">Date</th>
                <th className="text-center p-3 text-sm font-medium">Visits</th>
                <th className="text-center p-3 text-sm font-medium">Unique IPs</th>
                <th className="text-center p-3 text-sm font-medium">Adblock</th>
                <th className="text-right p-3 text-sm font-medium">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {dailyTraffic.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#a0b5c2]">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#c7d7df]" />
                    No traffic recorded yet
                  </td>
                </tr>
              )}
              {dailyTraffic.map((row, i) => (
                <tr
                  key={row.date}
                  className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#f8fbfc]'} hover:bg-[#f0f5f9] transition-colors`}
                >
                  <td className="p-3 text-sm text-[#58839b]">{row.date}</td>
                  <td className="p-3 text-sm text-[#a0b5c2] text-center">{fmt(row.visits)}</td>
                  <td className="p-3 text-sm text-[#a0b5c2] text-center">{fmt(row.unique_ips)}</td>
                  <td className="p-3 text-sm text-[#a0b5c2] text-center">{fmt(row.adblock_visits)}</td>
                  <td className="p-3 text-sm text-[#156594] font-semibold text-right">{fmtEur(row.earnings_eur)}</td>
                </tr>
              ))}
            </tbody>
            {dailyTraffic.length > 0 && (
              <tfoot>
                <tr className="bg-[#f0f5f9] border-t border-[#dae8ef]">
                  <td className="p-3 text-sm text-[#156594] font-semibold">Total</td>
                  <td className="p-3 text-sm text-[#a0b5c2] text-center">
                    {fmt(dailyTraffic.reduce((s, r) => s + r.visits, 0))}
                  </td>
                  <td className="p-3 text-sm text-[#a0b5c2] text-center">—</td>
                  <td className="p-3 text-sm text-[#a0b5c2] text-center">
                    {fmt(dailyTraffic.reduce((s, r) => s + r.adblock_visits, 0))}
                  </td>
                  <td className="p-3 text-sm text-[#156594] font-bold text-right">
                    {fmtEur(dailyTraffic.reduce((s, r) => s + r.earnings_eur, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  )
}

function SparkChart({ rows }: { rows: DailyRow[] }) {
  const maxVisits = Math.max(...rows.map((r) => r.visits), 1)
  const w = 580
  const h = 120
  const pts = [...rows].reverse()

  const x = (i: number) => (i / (pts.length - 1 || 1)) * w
  const y = (v: number) => h - (v / maxVisits) * h * 0.85 - 10

  const d = pts
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(r.visits).toFixed(1)}`)
    .join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full" style={{ height: 120 }}>
      <polyline
        points={pts.map((r, i) => `${x(i)},${y(r.visits)}`).join(' ')}
        fill="none"
        stroke="#1b91db"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((r, i) => (
        <circle key={r.date} cx={x(i)} cy={y(r.visits)} r="2.5" fill="#1b91db" opacity="0.7" />
      ))}
    </svg>
  )
}
