"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Unlock, DollarSign, MapPin, Calendar, Filter, Search, Eye, TrendingUp } from 'lucide-react'
import { formatBudget, timeAgo, cn } from '@/lib/utils/cn'

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
  const [filters, setFilters] = useState({
    make: '',
    minBudget: '',
    maxDistance: '',
  })
  const [sortBy, setSortBy] = useState<'newest' | 'highest_budget' | 'closest'>('newest')

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

    if (filters.make) {
      query = query.ilike('make', `%${filters.make}%`)
    }
    if (filters.minBudget) {
      query = query.gte('max_budget', parseFloat(filters.minBudget))
    }

    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sortBy === 'highest_budget') {
      query = query.order('max_budget', { ascending: false })
    } else {
      query = query.order('location_radius_miles', { ascending: true })
    }

    const { data, error } = await query.limit(50)

    if (error) {
      console.error('Error fetching leads:', error)
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }

  const handleUnlock = async (leadId: string) => {
    // This will be replaced with Stripe checkout flow
    router.push(`/leads/${leadId}`)
  }

  return (
    <div className="min-h-screen bg-[#0D0F14] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-[#06B6D4]">Lead</span> Board
          </h1>
          <p className="text-gray-400">
            Active buyer requests in your area. Unlock leads to start chatting.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input
              placeholder="Make (e.g. Toyota)"
              value={filters.make}
              onChange={(e) => setFilters({ ...filters, make: e.target.value })}
              className="pl-10 w-48"
            />
          </div>
          <Input
            placeholder="Min budget ($)"
            type="number"
            value={filters.minBudget}
            onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
            className="w-40"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
          >
            <option value="newest">Newest</option>
            <option value="highest_budget">Highest Budget</option>
            <option value="closest">Closest</option>
          </select>
          <Button onClick={fetchLeads} variant="secondary" size="sm">
            <Filter size={16} className="mr-2" />
            Apply Filters
          </Button>
          <div className="ml-auto text-sm text-gray-400">
            {leads.length} active {leads.length === 1 ? 'lead' : 'leads'}
          </div>
        </div>

        {/* Lead Cards */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-400">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No active leads match your filters.</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {leads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, stiffness: 300, damping: 30 }}
                >
                  <LeadCard lead={lead} onUnlock={() => handleUnlock(lead.id)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

function LeadCard({ lead, onUnlock }: { lead: Lead; onUnlock: () => void }) {
  return (
    <Card className="p-5 hover:border-[#3B82F6]/50 transition-all">
      {/* Blurred buyer info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6]/30 to-[#06B6D4]/30 blur-sm" />
        <div>
          <div className="text-sm text-gray-400 blur-sm select-none">Verified Buyer</div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} />
            {lead.location_zip} · {lead.location_radius_miles}mi radius
          </div>
        </div>
      </div>

      {/* Car details */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {lead.make} {lead.model}
        </h3>
        <div className="text-sm text-gray-400 mt-1">
          {lead.year_min && lead.year_max
            ? `${lead.year_min} - ${lead.year_max}`
            : lead.year_min
            ? `${lead.year_min}+`
            : 'Any year'}
          {lead.mileage_max && ` · ${lead.mileage_max.toLocaleString()} mi max`}
        </div>
        {lead.body_type && (
          <div className="text-xs text-gray-500 mt-1">Body: {lead.body_type}</div>
        )}
        {lead.fuel_type && lead.fuel_type !== 'any' && (
          <div className="text-xs text-gray-500">Fuel: {lead.fuel_type}</div>
        )}
        {lead.transmission && lead.transmission !== 'any' && (
          <div className="text-xs text-gray-500">Transmission: {lead.transmission}</div>
        )}
      </div>

      {/* Budget badge */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant="success" className="text-base px-3 py-1">
          <DollarSign size={14} className="mr-1" />
          {formatBudget(lead.max_budget)}
        </Badge>
        {lead.payment_method && lead.payment_method !== 'cash' && (
          <Badge variant="info">
            {lead.payment_method === 'financing' ? 'Pre-Approved' : 'Flexible'}
          </Badge>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          {timeAgo(lead.created_at)}
        </div>
        <div className="flex items-center gap-1">
          <Eye size={12} />
          {lead.view_count} views
        </div>
      </div>

      {/* Unlock button */}
      <Button
        onClick={onUnlock}
        variant="primary"
        className="w-full"
      >
        <Unlock size={16} className="mr-2" />
        Unlock Lead · $9.99
      </Button>
    </Card>
  )
}