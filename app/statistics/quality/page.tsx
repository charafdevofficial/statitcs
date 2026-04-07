"use client"

import { useState } from 'react'
import { Copy, CheckCircle2 } from 'lucide-react'
import { useNotification } from '@/lib/use-notification'

const invitedUsers = [
  { username: 'user123', date: '2025-12-10', earnings: '5,20€', status: 'Active' },
  { username: 'downloader99', date: '2025-11-28', earnings: '12,40€', status: 'Active' },
  { username: 'newbie2025', date: '2025-10-15', earnings: '0,00€', status: 'Inactive' },
]

export default function MoneyInvitesPage() {
  const { success: showSuccess } = useNotification()
  const [copied, setCopied] = useState(false)
  const inviteLink = 'https://filecrypt.cc/ref/abc123xyz'

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      showSuccess('Referral link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showSuccess('Could not copy to clipboard. Please copy manually.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-normal text-[#156594] mb-6">Invite Friends</h2>

      {/* Referral Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-[#dae8ef] rounded p-4 text-center hover:bg-[#f8fbfd] transition-colors">
          <div className="text-3xl font-light text-[#1b91db] mb-1">3</div>
          <div className="text-sm text-[#58839b]">Invited Users</div>
        </div>
        <div className="border border-[#dae8ef] rounded p-4 text-center hover:bg-[#f8fbfd] transition-colors">
          <div className="text-3xl font-light text-[#64ca2f] mb-1">17,60€</div>
          <div className="text-sm text-[#58839b]">Total Earnings</div>
        </div>
        <div className="border border-[#dae8ef] rounded p-4 text-center hover:bg-[#f8fbfd] transition-colors">
          <div className="text-3xl font-light text-[#156594] mb-1">5%</div>
          <div className="text-sm text-[#58839b]">Commission Rate</div>
        </div>
      </div>

      {/* Invite Link */}
      <div className="border border-[#dae8ef] rounded p-6 mb-8 hover:border-[#1b91db] transition-colors">
        <h3 className="text-lg text-[#156594] mb-4">Your Referral Link</h3>
        <p className="text-sm text-[#58839b] mb-4">
          Share this link with friends. You will earn 5% of their earnings for life!
        </p>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 bg-[#f0f5f9] border border-[#c7d7df] rounded px-4 py-2.5 text-sm text-[#367294] cursor-pointer hover:border-[#1b91db] focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
            onClick={() => {
              navigator.clipboard.writeText(inviteLink)
              showSuccess('Referral link copied!')
            }}
          />
          <button 
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-6 py-2.5 rounded text-sm font-medium transition-all active:scale-95
              ${copied 
                ? 'bg-green-500 text-white' 
                : 'bg-[#1b91db] text-white hover:bg-[#156594]'
              }`}
          >
            {copied ? (
              <>
                <CheckCircle2 size={18} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={18} />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Invited Users Table */}
      <div className="border border-[#dae8ef] rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1b91db] text-white">
              <th className="text-left p-3 text-sm font-medium">Username</th>
              <th className="text-left p-3 text-sm font-medium">Joined Date</th>
              <th className="text-left p-3 text-sm font-medium">Status</th>
              <th className="text-right p-3 text-sm font-medium">Your Earnings</th>
            </tr>
          </thead>
          <tbody>
            {invitedUsers.length > 0 ? (
              invitedUsers.map((user, index) => (
                <tr key={user.username} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f8fbfc]'} hover:bg-[#f0f5f9] transition-colors`}>
                  <td className="p-3 text-sm text-[#156594] font-medium">{user.username}</td>
                  <td className="p-3 text-sm text-[#58839b]">{user.date}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                      user.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-[#156594] font-semibold text-right">{user.earnings}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[#a0b5c2]">
                  No invited users yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="mt-8 bg-[#e9f3f9] border border-[#c7d7df] rounded p-4">
        <h4 className="text-sm font-semibold text-[#156594] mb-2">Referral Program</h4>
        <ul className="text-sm text-[#58839b] list-disc list-inside space-y-1">
          <li>Earn 5% commission on all earnings from users you invite</li>
          <li>Commission is paid out for the lifetime of the referred user</li>
          <li>No limit on the number of users you can invite</li>
          <li>Your referrals must generate at least 1,000 visits to count</li>
        </ul>
      </div>
    </div>
  )
}
