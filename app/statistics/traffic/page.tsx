"use client"

import { useState, useEffect } from 'react'

type TrafficRow = {
  date: string
  visits: number
  unique_ips: number
  adblock_visits: number
  earnings_eur: number
}

const DAYS_OPTIONS = [7, 30, 90, 365]

function fmtEur(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + ' €'
}

export default function TrafficPage() {
  const [days, setDays] = useState(30)
  const [rows, setRows] = useState<TrafficRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    fetch(`/api/statistics/traffic?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setRows(data.rows)
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [days])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-normal text-[#156594]">Traffic</h2>
        <div className="flex gap-1">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                days === d
                  ? 'bg-[#1b91db] text-white'
                  : 'border border-[#c7d7df] text-[#367294] hover:bg-[#e9f3f9]'
              }`}
            >
              {d === 365 ? '1y' : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded p-4 mb-4 text-sm">
          {error}
        </div>
      )}

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
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fbfc]'}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="p-3">
                      <div className="h-3 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#a0b5c2] text-sm">
                  No traffic in this period
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.date} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#f8fbfc]'} hover:bg-[#f0f5f9] transition-colors`}>
                  <td className="p-3 text-sm text-[#58839b]">{row.date}</td>
                  <td className="p-3 text-sm text-[#a0b5c2] text-center">{row.visits.toLocaleString()}</td>
                  <td className="p-3 text-sm text-[#a0b5c2] text-center">{row.unique_ips.toLocaleString()}</td>
                  <td className="p-3 text-sm text-[#a0b5c2] text-center">{row.adblock_visits.toLocaleString()}</td>
                  <td className="p-3 text-sm text-[#156594] font-semibold text-right">{fmtEur(row.earnings_eur)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
