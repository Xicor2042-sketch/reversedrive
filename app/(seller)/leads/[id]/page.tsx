"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lock, Unlock, MapPin, CheckCircle2, Loader2, DollarSign, Fuel, Settings as SettingsIcon, Eye, Calendar, Shield } from 'lucide-react'
import { formatBudget, timeAgo } from '@/lib/utils/cn'

interface LeadDetail {
  id: string
  buyer_id: string
  make: string
  model: string
  year_min: number | null
  year_max: number | null
  mileage_max: number | null
  transmission: string | null
  fuel_type: string | null
  body_type: string | null
  color_preferences: string[] | null
  max_budget: number
  payment_method: string | null
  location_zip: string
  location_radius_miles: number
  notes: string | null
  status: string
  view_count: number
  created_at: string
  expires_at: string
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLead()
  }, [])

  const fetchLead = async () => {
    const { data, error } = await supabase
      .from('car_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (data) {
      setLead(data as LeadDetail)
    } else if (error) {
      setError('Lead not found or no longer available.')
    }
  }

  const handleUnlock = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }

      // Check if already unlocked
      const { data: existing } = await supabase
        .from('unlocked_leads')
        .select('id')
        .eq('request_id', params.id)
        .eq('seller_id', userData.user.id)
        .single()

      if (existing) {
        // Already unlocked — find the conversation
        const { data: conv } = await supabase
          .from('conversations')
          .select('id')
          .eq('request_id', params.id)
          .eq('seller_id', userData.user.id)
          .single()

        if (conv) {
          router.push(`/deal-room/${conv.id}`)
          return
        }
      }

      // Create unlock record (simulated payment — will be replaced with Stripe checkout)
      const { data: unlockRecord, error: unlockError } = await supabase
        .from('unlocked_leads')
        .insert({
          seller_id: userData.user.id,
          request_id: params.id,
          unlock_fee: 9.99,
          stripe_payment_intent_id: 'simulated_' + Date.now(),
        })
        .select()
        .single()

      if (unlockError) {
        // Check if it's a unique constraint violation (already unlocked)
        if (unlockError.code === '23505') {
          setError('You already unlocked this lead.')
          setLoading(false)
          return
        }
        throw unlockError
      }

      // Create conversation
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({
          request_id: params.id,
          buyer_id: lead?.buyer_id,
          seller_id: userData.user.id,
          unlock_id: unlockRecord.id,
        })
        .select()
        .single()

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          seller_id: userData.user.id,
          type: 'lead_unlock',
          amount: 9.99,
          stripe_payment_id: 'simulated_' + Date.now(),
          status: 'completed',
          related_request_id: params.id,
        })

      // Show unlock animation
      setUnlocked(true)

      // Redirect to deal room
      setTimeout(() => {
        if (conv) {
          router.push(`/deal-room/${conv.id}`)
        } else {
          router.push('/dashboard')
        }
      }, 1500)
    } catch (err: any) {
      console.error('Unlock failed:', err)
      setError(err.message || 'Failed to unlock lead. Please try again.')
      setLoading(false)
    }
  }

  if (error && !lead) {
    return (
      <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex items-center justify-center" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
        <div className="text-center max-w-sm">
          <p className="text-[15px] text-[#d0d6e0] mb-4" style={{ fontWeight: 510 }}>{error}</p>
          <Link href="/leads" className="inline-flex items-center gap-2 text-[13px] text-[#7170ff] hover:text-[#828fff]" style={{ fontWeight: 510 }}>
            <ArrowLeft size={14} /> Back to Lead Board
          </Link>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex items-center justify-center">
        <Loader2 className="text-[#5e6ad2] animate-spin" size={24} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#0f1011]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-[15px] font-medium tracking-tight" style={{ fontWeight: 510 }}>
            Reverse<span className="text-[#7170ff]">Drive</span>
          </Link>
          <Link href="/leads" className="inline-flex items-center gap-2 text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors" style={{ fontWeight: 510 }}>
            <ArrowLeft size={14} /> Back to Leads
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Lead detail card */}
        <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-8 mb-6">
          {/* Blurred buyer */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/[0.05]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5e6ad2]/20 to-[#7170ff]/20 blur-[4px]" />
            <div>
              <div className="text-[14px] text-[#8a8f98] blur-[2px] select-none" style={{ fontWeight: 510 }}>Verified Buyer</div>
              <div className="flex items-center gap-2 text-[12px] text-[#62666d] mt-1">
                <MapPin size={12} />
                {lead.location_zip} · {lead.location_radius_miles}mi radius
              </div>
            </div>
          </div>

          {/* Car title */}
          <h1 className="text-2xl mb-6" style={{ fontWeight: 510, letterSpacing: '-0.02em' }}>
            {lead.make} {lead.model}
          </h1>

          {/* Spec grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-8">
            <SpecItem label="Year Range" value={lead.year_min && lead.year_max ? `${lead.year_min}–${lead.year_max}` : lead.year_min ? `${lead.year_min}+` : 'Any'} />
            <SpecItem label="Max Mileage" value={lead.mileage_max ? `${lead.mileage_max.toLocaleString()} mi` : 'Any'} />
            <SpecItem label="Body Type" value={lead.body_type || 'Any'} />
            <SpecItem label="Fuel Type" value={lead.fuel_type || 'Any'} />
            <SpecItem label="Transmission" value={lead.transmission || 'Any'} />
            <SpecItem label="Payment Method" value={lead.payment_method || 'Cash'} />
          </div>

          {/* Budget highlight */}
          <div className="flex items-center justify-between p-4 rounded-[10px] border border-[#10b981]/20 bg-[#10b981]/[0.03] mb-6">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-[#10b981]" />
              <span className="text-[13px] text-[#8a8f98]" style={{ fontWeight: 510 }}>Maximum Budget</span>
            </div>
            <span className="text-2xl text-[#10b981] tabular-nums" style={{ fontWeight: 510 }}>
              {formatBudget(lead.max_budget)}
            </span>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="mb-6">
              <div className="text-[12px] text-[#62666d] mb-2" style={{ fontWeight: 510 }}>BUYER NOTES</div>
              <div className="text-[14px] text-[#d0d6e0] p-4 rounded-[8px] border border-white/[0.06] bg-white/[0.02]">
                {lead.notes}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-[12px] text-[#62666d] mb-8">
            <span className="flex items-center gap-1"><Calendar size={12} /> Posted {timeAgo(lead.created_at)}</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {lead.view_count} sellers viewed</span>
          </div>

          {/* Unlock section */}
          <AnimatePresence mode="wait">
            {!unlocked ? (
              <motion.div key="locked" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                {error && (
                  <div className="mb-4 rounded-[8px] border border-[#ef4444]/20 bg-[#ef4444]/5 px-4 py-3 text-[13px] text-[#ef4444]">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleUnlock}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-[#5e6ad2] hover:bg-[#7170ff] py-3 text-[14px] text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontWeight: 510 }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Unlock size={18} />
                      Unlock This Lead · $9.99
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-[#62666d]">
                  <span className="flex items-center gap-1"><Shield size={11} /> Secure Payment</span>
                  <span className="flex items-center gap-1"><Lock size={11} /> Buyer info protected</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="unlocked"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="inline-block mb-4"
                >
                  <CheckCircle2 size={56} className="text-[#10b981]" style={{ filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.4))' }} />
                </motion.div>
                <h2 className="text-xl mb-2" style={{ fontWeight: 510 }}>Lead Unlocked!</h2>
                <p className="text-[13px] text-[#8a8f98]">Opening Deal Room...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-[#62666d] uppercase tracking-wider" style={{ fontWeight: 510 }}>{label}</div>
      <div className="text-[14px] text-[#f7f8f8] mt-1" style={{ fontWeight: 510 }}>{value}</div>
    </div>
  )
}