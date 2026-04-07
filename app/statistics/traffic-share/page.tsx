"use client"

import { useState } from 'react'

export default function MoneyCouponsPage() {
  const [couponCode, setCouponCode] = useState('')

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle coupon redemption
  }

  return (
    <div>
      <h2 className="text-xl font-normal text-[#156594] mb-6">Coupons</h2>

      {/* Redeem Coupon */}
      <div className="border border-[#dae8ef] rounded p-6 mb-8">
        <h3 className="text-lg text-[#156594] mb-4">Redeem Coupon</h3>
        <p className="text-sm text-[#58839b] mb-4">
          Enter a coupon code to add credits to your account.
        </p>
        
        <form onSubmit={handleRedeem} className="flex gap-3">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 max-w-md border border-[#c7d7df] rounded px-4 py-2.5 text-sm"
            placeholder="Enter coupon code"
          />
          <button 
            type="submit"
            className="bg-[#1b91db] text-white px-6 py-2.5 rounded text-sm hover:bg-[#156594]"
          >
            Redeem
          </button>
        </form>
      </div>

      {/* Coupon History */}
      <div className="border border-[#dae8ef] rounded overflow-hidden">
        <div className="bg-[#1b91db] text-white p-3">
          <h3 className="text-sm font-medium">Redeemed Coupons</h3>
        </div>
        <div className="p-8 text-center text-[#a0b5c2]">
          No coupons redeemed yet
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 bg-[#e9f3f9] border border-[#c7d7df] rounded p-4">
        <h4 className="text-sm font-semibold text-[#156594] mb-2">How to get coupons?</h4>
        <ul className="text-sm text-[#58839b] list-disc list-inside space-y-1">
          <li>Participate in community events</li>
          <li>Follow us on social media for giveaways</li>
          <li>Refer new users to FileCrypt</li>
          <li>Check our newsletter for exclusive codes</li>
        </ul>
      </div>
    </div>
  )
}
