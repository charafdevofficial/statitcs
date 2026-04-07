"use client"

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { SkeletonLoader, TableSkeleton } from '@/components/skeleton-loader'
import { useNotification } from '@/lib/use-notification'

// Demo data for earnings
const earningsData = [
  { date: 'March 26, 2026', visits: '0 + 0 / 0', container: '0,0000 €', webmaster: '0,0000 €', earnings: '0,0000 €' },
  { date: 'March 25, 2026', visits: '0 + 0 / 0', container: '0,0000 €', webmaster: '0,0000 €', earnings: '0,0000 €' },
  { date: 'March 24, 2026', visits: '0 + 0 / 0', container: '0,0000 €', webmaster: '0,0000 €', earnings: '0,0000 €' },
  { date: 'March 23, 2026', visits: '0 + 0 / 0', container: '0,0000 €', webmaster: '0,0000 €', earnings: '0,0000 €' },
  { date: 'March 22, 2026', visits: '0 + 0 / 0', container: '0,0000 €', webmaster: '0,0000 €', earnings: '0,0000 €' },
  { date: 'March 21, 2026', visits: '0 + 0 / 0', container: '0,0000 €', webmaster: '0,0000 €', earnings: '0,0000 €' },
  { date: 'March 20, 2026', visits: '0 + 0 / 0', container: '0,0000 €', webmaster: '0,0000 €', earnings: '0,0000 €' },
  { date: 'March 19, 2026', visits: '0 + 0 / 0', container: '0,0000 €', webmaster: '0,0000 €', earnings: '0,0000 €' },
  { date: 'March 18, 2026', visits: '0 + 0 / 0', container: '0,0000 €', webmaster: '0,0000 €', earnings: '0,0000 €' },
  { date: 'March 17, 2026', visits: '0 + 0 / 0', container: '0,0000 €', webmaster: '0,0000 €', earnings: '0,0000 €' },
  { date: 'Year 2025', visits: '5 + 1 / 18', container: '0,020 €', webmaster: '0,000 €', earnings: '0,020 €' },
]

export default function MoneyEarningsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasEarnings, setHasEarnings] = useState(true)
  const [isRequestingPayout, setIsRequestingPayout] = useState(false)
  const { success: showSuccess, error: showError } = useNotification()

  // Simulate loading on mount
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleRequestPayout = async () => {
    setIsRequestingPayout(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      showSuccess('Payout request submitted successfully!')
    } catch {
      showError('Failed to request payout')
    } finally {
      setIsRequestingPayout(false)
    }
  }

  return (
    <div>
      {/* Balance Header */}
      <div className="flex items-center justify-between mb-6">
        {isLoading ? (
          <>
            <div className="flex-1">
              <span className="text-lg text-[#156594]">Balance:</span>
              <div className="flex items-center gap-4 mt-2">
                <SkeletonLoader variant="rect" className="w-40 h-10" />
                <SkeletonLoader variant="rect" className="w-24 h-6" />
              </div>
            </div>
            <div className="flex gap-2">
              <SkeletonLoader variant="rect" className="w-32 h-10" />
              <SkeletonLoader variant="rect" className="w-32 h-10" />
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="text-lg text-[#156594]">Balance:</span>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-light text-[#156594]">0,020€</span>
                <span className="bg-[#64ca2f] text-white text-sm px-2 py-0.5 rounded animate-pulse">+0,000</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="border border-[#1b91db] text-[#1b91db] px-4 py-2 rounded text-sm hover:bg-[#1b91db] hover:text-white active:scale-95 transition-all">
                Activate NonProfit
              </button>
              <button
                onClick={handleRequestPayout}
                disabled={isRequestingPayout}
                className="bg-[#64ca2f] text-white px-4 py-2 rounded text-sm hover:bg-[#5ab829] disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center gap-2"
              >
                {isRequestingPayout && <Spinner size="sm" />}
                Request Payout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Empty State - No Earnings Yet */}
      {!isLoading && !hasEarnings && (
        <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-12 text-center mb-6">
          <TrendingUp className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#156594] mb-2">No earnings yet</h3>
          <p className="text-[#367294] text-sm mb-4">
            Start creating containers and adding links to earn money
          </p>
          <button className="px-6 py-2.5 bg-[#1fa1e1] text-white rounded-sm font-medium hover:bg-[#1b91db] active:scale-95 transition-all">
            Create Container
          </button>
        </div>
      )}

      {/* Chart */}
      {isLoading ? (
        <div className="border border-[#dae8ef] rounded p-4 mb-6">
          <div className="h-64 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <div className="border border-[#dae8ef] rounded p-4 mb-6">
          <div className="h-64 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-[#a0b5c2] w-8">
              <span>1.0</span>
              <span>0.9</span>
              <span>0.8</span>
              <span>0.7</span>
              <span>0.6</span>
              <span>0.5</span>
              <span>0.4</span>
              <span>0.3</span>
              <span>0.2</span>
              <span>0.1</span>
              <span>0</span>
            </div>
            
            {/* Grid */}
            <div className="absolute left-10 right-0 top-0 bottom-8 border-l border-b border-[#e9f3f9]">
              {/* Grid lines */}
              {[...Array(10)].map((_, i) => (
                <div key={i} className="absolute w-full border-t border-[#f0f5f9]" style={{ top: `${i * 10}%` }} />
              ))}
              {/* Data line (flat at bottom for demo) */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b91db]" />
            </div>
            
            {/* X-axis labels */}
            <div className="absolute left-10 right-0 bottom-0 flex justify-between text-xs text-[#a0b5c2]">
              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'].map(d => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Earnings Table */}
      {isLoading ? (
        <div className="border border-[#dae8ef] rounded overflow-hidden">
          <div className="bg-[#1b91db] text-white p-3">
            <div className="grid grid-cols-5 gap-4">
              <SkeletonLoader variant="line" />
              <SkeletonLoader variant="line" />
              <SkeletonLoader variant="line" />
              <SkeletonLoader variant="line" />
              <SkeletonLoader variant="line" />
            </div>
          </div>
          <TableSkeleton rows={8} columns={5} />
        </div>
      ) : (
        <div className="border border-[#dae8ef] rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1b91db] text-white">
                <th className="text-left p-3 text-sm font-medium">Date</th>
                <th className="text-center p-3 text-sm font-medium">earn. + AB / Visits</th>
                <th className="text-center p-3 text-sm font-medium">Container</th>
                <th className="text-center p-3 text-sm font-medium">Webmaster</th>
                <th className="text-right p-3 text-sm font-medium">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {earningsData.map((day, index) => (
                <tr key={day.date} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f8fbfc]'} hover:bg-[#f0f5f9] transition-colors`}>
                  <td className="p-3 text-sm text-[#58839b]">{day.date}</td>
                  <td className="p-3 text-sm text-[#a0b5c2] text-center">{day.visits}</td>
                  <td className="p-3 text-sm text-[#a0b5c2] text-center">{day.container}</td>
                  <td className="p-3 text-sm text-[#a0b5c2] text-center">{day.webmaster}</td>
                  <td className="p-3 text-sm text-[#156594] font-semibold text-right">{day.earnings}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#f0f5f9] border-t border-[#dae8ef]">
                <td className="p-3 text-sm text-[#156594] font-semibold text-right" colSpan={2}>Total:</td>
                <td className="p-3 text-sm text-[#a0b5c2] text-center">0,020 €</td>
                <td className="p-3 text-sm text-[#a0b5c2] text-center">0,000 €</td>
                <td className="p-3 text-sm text-[#156594] font-bold text-right">0,020 €</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

