"use client"

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { SettingSection, SettingRow, SelectDropdown } from '@/components/ui/toggle-switch'
import { Spinner } from '@/components/ui/spinner'
import { useNotification } from '@/lib/use-notification'

const payoutHistory = [
  { date: '2025-12-15', amount: '25,00€', method: 'Bitcoin', status: 'Completed', txid: 'abc123...' },
  { date: '2025-11-20', amount: '50,00€', method: 'PayPal', status: 'Completed', txid: 'def456...' },
]

export default function MoneyPayoutsPage() {
  const { success: showSuccess, error: showError } = useNotification()
  const [payoutMethod, setPayoutMethod] = useState('bitcoin')
  const [bitcoinAddress, setBitcoinAddress] = useState('')
  const [paypalEmail, setPaypalEmail] = useState('')
  
  // Form state management
  const [initialState, setInitialState] = useState({
    payoutMethod: 'bitcoin',
    bitcoinAddress: '',
    paypalEmail: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [validationError, setValidationError] = useState<string>('')
  
  // Check if form has changes
  const hasChanges = 
    payoutMethod !== initialState.payoutMethod ||
    bitcoinAddress !== initialState.bitcoinAddress ||
    paypalEmail !== initialState.paypalEmail

  useEffect(() => {
    setInitialState({
      payoutMethod,
      bitcoinAddress,
      paypalEmail,
    })
  }, [])

  // Reset save status after 3 seconds
  useEffect(() => {
    if (saveStatus !== 'idle') {
      const timer = setTimeout(() => setSaveStatus('idle'), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  const validateField = (): boolean => {
    setValidationError('')
    
    if (payoutMethod === 'bitcoin' && bitcoinAddress.trim().length === 0) {
      setValidationError('Bitcoin address is required')
      return false
    }
    
    if (payoutMethod === 'bitcoin' && !/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(bitcoinAddress.trim())) {
      setValidationError('Invalid Bitcoin address format')
      return false
    }
    
    if (payoutMethod === 'paypal' && paypalEmail.trim().length === 0) {
      setValidationError('PayPal email is required')
      return false
    }
    
    if (payoutMethod === 'paypal' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail.trim())) {
      setValidationError('Invalid email format')
      return false
    }
    
    return true
  }

  const handleSavePayoutSettings = async () => {
    if (!hasChanges) {
      showError('No changes to save')
      return
    }

    if (!validateField()) {
      showError(validationError)
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Update initial state to mark changes as saved
      setInitialState({
        payoutMethod,
        bitcoinAddress,
        paypalEmail,
      })
      
      setSaveStatus('success')
      showSuccess('Payout settings saved successfully!')
    } catch {
      setSaveStatus('error')
      showError('Failed to save payout settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetChanges = () => {
    setPayoutMethod(initialState.payoutMethod)
    setBitcoinAddress(initialState.bitcoinAddress)
    setPaypalEmail(initialState.paypalEmail)
    setSaveStatus('idle')
    setValidationError('')
  }

  return (
    <div>
      <h2 className="text-xl font-normal text-[#156594] mb-6">Payouts</h2>

      <SettingSection title="Payout Settings" description="Configure your preferred payout method.">
        <SettingRow label="Payout Method">
          <SelectDropdown
            value={payoutMethod}
            onChange={setPayoutMethod}
            options={[
              { value: 'bitcoin', label: 'Bitcoin' },
              { value: 'paypal', label: 'PayPal' },
              { value: 'bank', label: 'Bank Transfer' },
            ]}
          />
        </SettingRow>
        
        {payoutMethod === 'bitcoin' && (
          <SettingRow label="Bitcoin Address">
            <input
              type="text"
              value={bitcoinAddress}
              onChange={(e) => setBitcoinAddress(e.target.value)}
              className={`border rounded px-3 py-2 text-sm w-80 outline-none transition-all
                ${validationError && bitcoinAddress.trim().length === 0
                  ? 'border-red-400 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-300'
                  : 'border-[#c7d7df] hover:border-[#1b91db] focus:ring-2 focus:ring-blue-300 focus:border-transparent'
                }`}
              placeholder="Enter your Bitcoin address"
              aria-invalid={validationError ? 'true' : 'false'}
            />
            {validationError && bitcoinAddress.trim().length === 0 && (
              <p className="text-xs text-red-600 mt-1">{validationError}</p>
            )}
          </SettingRow>
        )}
        
        {payoutMethod === 'paypal' && (
          <SettingRow label="PayPal Email">
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              className={`border rounded px-3 py-2 text-sm w-80 outline-none transition-all
                ${validationError && paypalEmail.trim().length === 0
                  ? 'border-red-400 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-300'
                  : 'border-[#c7d7df] hover:border-[#1b91db] focus:ring-2 focus:ring-blue-300 focus:border-transparent'
                }`}
              placeholder="Enter your PayPal email"
              aria-invalid={validationError ? 'true' : 'false'}
            />
            {validationError && paypalEmail.trim().length === 0 && (
              <p className="text-xs text-red-600 mt-1">{validationError}</p>
            )}
          </SettingRow>
        )}
      </SettingSection>

      {/* Save Status Banner */}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} />
          <span>Payout settings saved successfully</span>
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <span>Failed to save settings. Please check your input and try again.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={handleSavePayoutSettings}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded text-sm font-medium transition-all
            ${hasChanges && !isSaving
              ? 'bg-[#64ca2f] text-white hover:bg-[#5ab829] active:scale-95' 
              : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-60'
            }`}
        >
          {isSaving && <Spinner size="sm" />}
          <span>{isSaving ? 'Saving...' : 'Save Payout Settings'}</span>
        </button>
        
        {hasChanges && (
          <button
            onClick={handleResetChanges}
            disabled={isSaving}
            className="px-4 py-2.5 text-[#156594] border border-[#156594]/30 rounded text-sm font-medium hover:bg-blue-50 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        )}
      </div>

      <SettingSection title="Payout History" description="Your previous payout requests.">
        <div className="border border-[#dae8ef] rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1b91db] text-white">
                <th className="text-left p-3 text-sm font-medium">Date</th>
                <th className="text-left p-3 text-sm font-medium">Amount</th>
                <th className="text-left p-3 text-sm font-medium">Method</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {payoutHistory.length > 0 ? (
                payoutHistory.map((payout, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f8fbfc]'} hover:bg-[#f0f5f9] transition-colors`}>
                    <td className="p-3 text-sm text-[#58839b]">{payout.date}</td>
                    <td className="p-3 text-sm text-[#156594] font-semibold">{payout.amount}</td>
                    <td className="p-3 text-sm text-[#58839b]">{payout.method}</td>
                    <td className="p-3 text-sm">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                        {payout.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-[#a0b5c2] font-mono">{payout.txid}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#a0b5c2]">
                    No payout history yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SettingSection>
    </div>
  )
}

