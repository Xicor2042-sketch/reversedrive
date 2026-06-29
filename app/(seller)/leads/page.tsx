"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Unlock, MapPin, Filter, Search, Eye, Calendar, DollarSign, Fuel, Settings as SettingsIcon, ArrowRight, Loader2, CheckCircle2, Lock } from 'lucide-react'
import { formatBudget, timeAgo } from '@/lib/utils/cn'

interface Lead {
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

export default function LeadBoard() {
  const supabase = createClient()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMake, setFilterMake] = useState('')
  const [filterMinBudget, setFilterMinBudget] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'highest_budget'>('newest')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    let query = supabase
      .from('car_requests')
      .select('*')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())

    if (filterMake) {
      query = query.ilike('make', `%${filterMake}%`)
    }
    if (filterMinBudget) {
      query = query.gte('max_budget', parseFloat(filterMinBudget))
    }

    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order('max_budget', { ascending: false })
    }

    const { data, error } = await query.limit(50)

    if (error) {
      console.error('Error fetching leads:', error)
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#0f1011]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-[15px] font-medium tracking-tight" style={{ fontWeight: 510 }}>
            Reverse<span className="text-[#7170ff]">Drive</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="px-3 py-1.5 rounded-[6px] text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-white/[0.03] transition-all" style={{ fontWeight: 510 }}>Dashboard</Link>
            <Link href="/leads" className="px-3 py-1.5 rounded-[6px] text-[13px] text-[#f7f8f8] bg-white/[0.05] transition-all" style={{ fontWeight: 510 }}>Lead Board</Link>
            <Link href="/conversations" className="px-3 py-1.5 rounded-[6px] text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-white/[0.03] transition-all" style={{ fontWeight: 510 }}>Messages</Link>
          </div>
          <Link href="/dashboard" className="text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors" style={{ fontWeight: 510 }}>Back</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl tracking-tight mb-2" style={{ fontWeight: 510, letterSpacing: '-0.02em' }}>
            Lead Board
          </h1>
          <p className="text-sm text-[#8a8f98]">
            {loading ? 'Loading...' : `${leads.length} active ${leads.length === 1 ? 'lead' : 'leads'} available`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62666d] pointer-events-none" />
            <input
              placeholder="Make (e.g. Toyota)"
              value={filterMake}
              onChange={(e) => setFilterMake(e.target.value)}
              className="rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2 pl-9 pr-4 text-[13px] text-[#f7f8f8] placeholder-[#62666d] w-44 focus:border-[#5e6ad2]/50 focus:outline-none transition-all"
            />
          </div>
          <input
            placeholder="Min budget $"
            type="number"
            value={filterMinBudget}
            onChange={(e) => setFilterMinBudget(e.target.value)}
            className="rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2 px-3 text-[13px] text-[#f7f8f8] placeholder-[#62666d] w-36 focus:border-[#5e6ad2]/50 focus:outline-none transition-all"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2 px-3 text-[13px] text-[#f7f8f8] focus:border-[#5e6ad2]/50 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="highest_budget">Highest Budget</option>
          </select>
          <button
            onClick={fetchLeads}
            className="inline-flex items-center gap-2 rounded-[6px] border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] px-3 py-2 text-[13px] text-[#d0d6e0] transition-all"
            style={{ fontWeight: 510 }}
          >
            <Filter size={14} />
            Apply
          </button>
        </div>

        {/* Lead Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="text-[#5e6ad2] animate-spin" size={24} />
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-16 text-center">
            <p className="text-[15px] text-[#d0d6e0] mb-2" style={{ fontWeight: 510 }}>No active leads match your filters</p>
            <p className="text-[13px] text-[#62666d]">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {leads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.3 }}
                >
                  <LeadCard lead={lead} onView={() => router.push(`/leads/${lead.id}`)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

function LeadCard({ lead, onView }: { lead: Lead; onView: () => void }) {
  return (
    <div
      onClick={onView}
      className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all cursor-pointer group"
    >
      {/* Blurred buyer avatar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5e6ad2]/20 to-[#7170ff]/20 blur-[3px]" />
        <div className="min-w-0 flex-1">
          <div className="text-[12px] text-[#8a8f98] blur-[2px] select-none" style={{ fontWeight: 510 }}>Verified Buyer</div>
          <div className="flex items-center gap-1 text-[11px] text-[#62666d] mt-0.5">
            <MapPin size={10} />
            {lead.location_zip} · {lead.location_radius_miles}mi
          </div>
        </div>
      </div>

      {/* Car details */}
      <h3 className="text-[15px] mb-1" style={{ fontWeight: 510 }}>
        {lead.make} {lead.model}
      </h3>
      <div className="text-[12px] text-[#62666d] mb-3">
        {lead.year_min && lead.year_max ? `${lead.year_min}–${lead.year_max}` : lead.year_min ? `${lead.year_min}+` : 'Any year'}
        {lead.mileage_max && ` · ${lead.mileage_max.toLocaleString()} mi max`}
      </div>

      {/* Tags */}
      {(lead.fuel_type || lead.transmission) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {lead.fuel_type && lead.fuel_type !== 'any' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-[#8a8f98]" style={{ fontWeight: 510 }}>
              <Fuel size={9} className="inline mr-1" />
              {lead.fuel_type}
            </span>
          )}
          {lead.transmission && lead.transmission !== 'any' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-[#8a8f98]" style={{ fontWeight: 510 }}>
              <SettingsIcon size={9} className="inline mr-1" />
              {lead.transmission}
            </span>
          )}
        </div>
      )}

      {/* Budget */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg text-[#10b981] tabular-nums" style={{ fontWeight: 510 }}>
          {formatBudget(lead.max_budget)}
        </span>
        {lead.payment_method && lead.payment_method !== 'cash' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#5e6ad2]/20 bg-[#5e6ad2]/10 text-[#7170ff]" style={{ fontWeight: 510 }}>
            {lead.payment_method === 'financing' ? 'Pre-Approved' : 'Flexible'}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-3 text-[11px] text-[#62666d]">
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {timeAgo(lead.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={10} />
            {lead.view_count}
          </span>
        </div>
        <span className="text-[12px] text-[#7170ff] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform" style={{ fontWeight: 510 }}>
          View
          <ArrowRight size={12} />
        </span>
      </div>
    </div>
  )
}