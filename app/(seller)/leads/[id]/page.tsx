"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Lock, Unlock, DollarSign, MapPin, CheckCircle2, Loader2 } from 'lucide-react'
import { formatBudget, timeAgo } from '@/lib/utils/cn'
import Link from 'next/link'

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
  const [fetched, setFetched] = useState(false)

  // Fetch lead data on mount
  useState(() => {
    if (!fetched) {
      fetchLead()
    }
  })

  const fetchLead = async () => {
    const { data, error } = await supabase
      .from('car_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (data) {
      setLead(data as LeadDetail)
    }
    setFetched(true)
  }

  const handleUnlock = async () => {
    setLoading(true)

    // In production, this will create a Stripe checkout session
    // For now, we'll simulate the payment flow
    // TODO: Replace with Stripe checkout when Stripe is configured

    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from('unlocked_leads')
        .select('id')
        .eq('request_id', params.id)
        .eq('seller_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (existing) {
        // Already unlocked, go to chat
        router.push(`/deal-room/${existing.id}`)
        return
      }

      // Simulate payment success (replace with Stripe)
      // For now, just create the unlock record
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }

      // Create unlock record
      const { data: unlockRecord, error: unlockError } = await supabase
        .from('unlocked_leads')
        .insert({
          seller_id: userData.user.id,
          request_id: params.id,
          unlock_fee: 9.99,
          stripe_payment_intent_id: 'simulated_payment_' + Date.now(),
        })
        .select()
        .single()

      if (unlockError) {
        console.error('Unlock error:', unlockError)
        setLoading(false)
        return
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
          stripe_payment_id: 'simulated_payment_' + Date.now(),
          status: 'completed',
          related_request_id: params.id,
        })

      // Lock shatter animation
      setUnlocked(true)

      // Redirect to deal room after animation
      setTimeout(() => {
        if (conv) {
          router.push(`/deal-room/${conv.id}`)
        } else {
          router.push('/dashboard')
        }
      }, 1500)
    } catch (err) {
      console.error('Unlock failed:', err)
      setLoading(false)
    }
  }

  if (!lead && fetched) {
    return (
      <div className="min-h-screen bg-[#0D0F14] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Lead not found or no longer active.</p>
          <Link href="/leads">
            <Button variant="secondary">Back to Lead Board</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-[#0D0F14] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0F14] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/leads" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Lead Board
        </Link>

        {/* Lead detail card */}
        <Card className="p-8 mb-6">
          {/* Blurred buyer info */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3B82F6]/30 to-[#06B6D4]/30 blur-md" />
            <div>
              <div className="text-gray-400 blur-sm select-none">Verified Buyer</div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <MapPin size={14} />
                {lead.location_zip} · {lead.location_radius_miles}mi radius
              </div>
            </div>
          </div>

          {/* Car details */}
          <h1 className="text-2xl font-bold mb-4">
            {lead.make} {lead.model}
          </h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <DetailRow label="Year Range" value={lead.year_min && lead.year_max ? `${lead.year_min} - ${lead.year_max}` : lead.year_min ? `${lead.year_min}+` : 'Any'} />
            <DetailRow label="Max Mileage" value={lead.mileage_max ? `${lead.mileage_max.toLocaleString()} mi` : 'Any'} />
            <DetailRow label="Body Type" value={lead.body_type || 'Any'} />
            <DetailRow label="Fuel Type" value={lead.fuel_type || 'Any'} />
            <DetailRow label="Transmission" value={lead.transmission || 'Any'} />
            <DetailRow label="Payment Method" value={lead.payment_method || 'Cash'} />
          </div>

          {/* Budget */}
          <div className="flex items-center justify-between mb-6 p-4 bg-[#10B981]/10 rounded-lg border border-[#10B981]/20">
            <span className="text-gray-400">Maximum Budget</span>
            <span className="text-2xl font-bold text-[#10B981]">
              {formatBudget(lead.max_budget)}
            </span>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">Buyer Notes</div>
              <div className="text-gray-300 p-4 bg-white/5 rounded-lg">
                {lead.notes}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
            <span>Posted {timeAgo(lead.created_at)}</span>
            <span>·</span>
            <span>{lead.view_count} sellers viewed</span>
          </div>

          {/* Unlock button */}
          <AnimatePresence mode="wait">
            {!unlocked ? (
              <motion.div
                key="locked"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Button
                  onClick={handleUnlock}
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Unlock size={20} className="mr-2" />
                      Unlock This Lead · $9.99
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Unlock to reveal buyer contact info and start chatting in the Deal Room
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="unlocked"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="inline-block mb-4"
                >
                  <Lock
                    size={64}
                    className="text-[#3B82F6]"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))' }}
                  />
                </motion.div>
                <h2 className="text-2xl font-bold text-[#10B981] mb-2">
                  <CheckCircle2 className="inline mr-2" size={28} />
                  Lead Unlocked!
                </h2>
                <p className="text-gray-400">Opening Deal Room...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-white font-medium mt-1">{value}</div>
    </div>
  )
}