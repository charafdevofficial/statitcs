"use client"

import { SettingSection, SettingRow, ToggleSwitch } from '@/components/ui/toggle-switch'
import { useState } from 'react'

const referrerStats = [
  { source: 'google.com', visits: 1250, earnings: '15,50€' },
  { source: 'facebook.com', visits: 820, earnings: '9,20€' },
  { source: 'twitter.com', visits: 340, earnings: '4,10€' },
  { source: 'reddit.com', visits: 215, earnings: '2,80€' },
  { source: 'direct', visits: 1890, earnings: '22,40€' },
]

export default function MoneyReferrerPage() {
  const [trackReferrer, setTrackReferrer] = useState(true)

  return (
    <div>
      <h2 className="text-xl font-normal text-[#156594] mb-6">Referrer Statistics</h2>

      <SettingSection title="Referrer Tracking">
        <SettingRow 
          label="Enable Referrer Tracking" 
          description="Track where your visitors come from"
        >
          <ToggleSwitch checked={trackReferrer} onChange={setTrackReferrer} />
        </SettingRow>
      </SettingSection>

      {/* Stats Table */}
      <div className="border border-[#dae8ef] rounded overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1b91db] text-white">
              <th className="text-left p-3 text-sm font-medium">Referrer Source</th>
              <th className="text-center p-3 text-sm font-medium">Visits</th>
              <th className="text-right p-3 text-sm font-medium">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {referrerStats.map((stat, index) => (
              <tr key={stat.source} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f8fbfc]'}>
                <td className="p-3 text-sm text-[#156594]">{stat.source}</td>
                <td className="p-3 text-sm text-[#58839b] text-center">{stat.visits.toLocaleString()}</td>
                <td className="p-3 text-sm text-[#156594] font-semibold text-right">{stat.earnings}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#f0f5f9] border-t border-[#dae8ef]">
              <td className="p-3 text-sm text-[#156594] font-semibold">Total</td>
              <td className="p-3 text-sm text-[#58839b] text-center font-semibold">4,515</td>
              <td className="p-3 text-sm text-[#156594] font-bold text-right">54,00€</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Info */}
      <div className="bg-[#e9f3f9] border border-[#c7d7df] rounded p-4">
        <p className="text-sm text-[#367294]">
          <strong className="text-[#156594]">Tip:</strong> Use referrer tracking to understand which traffic sources bring the most valuable visitors to your folders.
        </p>
      </div>
    </div>
  )
}

