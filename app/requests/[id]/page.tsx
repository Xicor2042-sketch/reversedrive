import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, DollarSign, Car, Calendar, Eye, MessageSquare,
  Unlock, Gauge, Fuel, Settings, Zap, Pause, Play, X, Pencil, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadarAnimation } from '@/components/buyer/radar-animation'
import { cn, formatBudget, formatDate, timeAgo } from '@/lib/utils/cn'

interface RequestDetail {
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
  expires_at: string
  view_count: number
  created_at: string
  updated_at: string
}

interface UnlockedLead {
  id: string
  seller_id: string
  unlock_fee: number
  unlocked_at: string
}

interface Conversation {
  id: string
  seller_id: string
  status: string
  last_message_at: string | null
  created_at: string
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Pause }> = {
  active: { label: 'Active', color: 'text-green-400 border-green-500/30 bg-green-500/10', icon: Zap },
  paused: { label: 'Paused', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', icon: Pause },
  closed: { label: 'Closed', color: 'text-gray-400 border-gray-500/30 bg-gray-500/10', icon: X },
  expired: { label: 'Expired', color: 'text-red-400 border-red-500/30 bg-red-500/10', icon: Clock },
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: request } = await supabase
    .from('car_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (!request) notFound()
  const req = request as RequestDetail

  // Ownership check
  if (req.buyer_id !== user.id) {
    redirect('/dashboard')
  }

  // Fetch unlocked leads for this request
  const { data: unlocks } = await supabase
    .from('unlocked_leads')
    .select('id, seller_id, unlock_fee, unlocked_at')
    .eq('request_id', id)
    .order('unlocked_at', { ascending: false })

  const unlockedLeads = (unlocks ?? []) as UnlockedLead[]

  // Fetch conversations started from this request
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, seller_id, status, last_message_at, created_at')
    .eq('request_id', id)
    .order('created_at', { ascending: false })

  const convos = (conversations ?? []) as Conversation[]

  const status = statusConfig[req.status] ?? statusConfig.active
  const StatusIcon = status.icon
  const isActive = req.status === 'active'
  const isPaused = req.status === 'paused'
  const isClosedOrExpired = req.status === 'closed' || req.status === 'expired'
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(req.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header card */}
      <Card className="overflow-hidden border-white/10 bg-[#111827]/60 backdrop-blur-sm">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {req.make} {req.model}
              </h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                  status.color
                )}
              >
                <StatusIcon size={12} />
                {status.label}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Created {timeAgo(req.created_at)} · {formatDate(req.created_at)}
            </p>
            {isActive && daysLeft > 0 && (
              <p className="mt-1 flex items-center gap-1 text-xs text-[#06B6D4]/70">
                <Calendar size={12} />
                Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
              </p>
            )}
          </div>

          {isActive && (
            <RadarAnimation viewCount={req.view_count} size="lg" />
          )}
        </div>

        {/* Closed/Expired banner */}
        {isClosedOrExpired && (
          <div
            className={cn(
              'border-t px-6 py-3 text-sm',
              req.status === 'closed'
                ? 'border-white/5 bg-gray-500/5 text-gray-400'
                : 'border-red-500/20 bg-red-500/5 text-red-400'
            )}
          >
            {req.status === 'closed'
              ? 'This request has been closed. You can reactivate it anytime.'
              : 'This request has expired. Create a new one to continue receiving offers.'}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/5 px-6 py-4">
          <Link href={`/requests/${id}/edit`}>
            <Button variant="ghost" size="sm">
              <Pencil size={14} className="mr-1.5" />
              Edit
            </Button>
          </Link>
          {(isActive || isPaused) && (
            <form>
              <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300">
                {isActive ? (
                  <><Pause size={14} className="mr-1.5" />Pause</>
                ) : (
                  <><Play size={14} className="mr-1.5" />Resume</>
                )}
              </Button>
            </form>
          )}
          {(isActive || isPaused) && (
            <Button variant="ghost" size="sm" className="ml-auto text-red-400 hover:text-red-300">
              <X size={14} className="mr-1.5" />
              Close Request
            </Button>
          )}
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox icon={Eye} label="Total Views" value={req.view_count} color="text-[#06B6D4]" />
        <StatBox icon={Unlock} label="Sellers Unlocked" value={unlockedLeads.length} color="text-[#3B82F6]" />
        <StatBox icon={MessageSquare} label="Conversations" value={convos.length} color="text-[#10B981]" />
        <StatBox
          icon={DollarSign}
          label="Budget"
          value={formatBudget(Number(req.max_budget))}
          color="text-[#06B6D4]"
          isText
        />
      </div>

      {/* Specs grid */}
      <Card className="border-white/10 bg-[#111827]/60 p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">Specifications</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <SpecItem icon={Car} label="Body Type" value={req.body_type ?? 'Any'} />
          <SpecItem icon={Fuel} label="Fuel" value={req.fuel_type ?? 'Any'} capitalize />
          <SpecItem icon={Settings} label="Transmission" value={req.transmission ?? 'Any'} capitalize />
          <SpecItem
            icon={Calendar}
            label="Year Range"
            value={
              req.year_min && req.year_max
                ? `${req.year_min} – ${req.year_max}`
                : req.year_min
                ? `${req.year_min}+`
                : req.year_max
                ? `Up to ${req.year_max}`
                : 'Any'
            }
          />
          <SpecItem
            icon={Gauge}
            label="Max Mileage"
            value={req.mileage_max ? `${req.mileage_max.toLocaleString()} mi` : 'Any'}
          />
          <SpecItem
            icon={DollarSign}
            label="Payment"
            value={req.payment_method ?? 'cash'}
            capitalize
          />
        </div>

        {/* Location */}
        <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4 text-sm text-gray-400">
          <MapPin size={16} className="text-[#06B6D4]" />
          {req.location_zip} · {req.location_radius_miles} mile radius
        </div>

        {/* Notes */}
        {req.notes && (
          <div className="mt-4 border-t border-white/5 pt-4">
            <p className="mb-1 text-xs text-gray-500">Notes</p>
            <p className="text-sm text-gray-300">{req.notes}</p>
          </div>
        )}

        {/* Color preferences */}
        {req.color_preferences && req.color_preferences.length > 0 && (
          <div className="mt-4 border-t border-white/5 pt-4">
            <p className="mb-2 text-xs text-gray-500">Color Preferences</p>
            <div className="flex flex-wrap gap-2">
              {req.color_preferences.map((c) => (
                <Badge key={c} variant="info" className="capitalize">{c}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Unlocked leads */}
      <Card className="border-white/10 bg-[#111827]/60 p-6 backdrop-blur-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Unlock size={18} className="text-[#3B82F6]" />
          Sellers Who Unlocked This Request
        </h2>
        {unlockedLeads.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No sellers have unlocked this request yet. Sit tight — your radar is scanning.
          </p>
        ) : (
          <div className="space-y-2">
            {unlockedLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6]/30 to-[#06B6D4]/30">
                    <Unlock size={14} className="text-[#06B6D4]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Seller #{lead.seller_id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">Unlocked {timeAgo(lead.unlocked_at)}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#06B6D4]">
                  {formatBudget(lead.unlock_fee)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Conversations */}
      <Card className="border-white/10 bg-[#111827]/60 p-6 backdrop-blur-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <MessageSquare size={18} className="text-[#10B981]" />
          Conversations
        </h2>
        {convos.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No conversations started yet. When a seller unlocks and messages you, it&apos;ll appear here.
          </p>
        ) : (
          <div className="space-y-2">
            {convos.map((convo) => (
              <Link
                key={convo.id}
                href={`/conversations/${convo.id}`}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3 transition-colors hover:border-[#3B82F6]/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#10B981]/30 to-[#06B6D4]/30">
                    <MessageSquare size={14} className="text-[#10B981]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Seller #{convo.seller_id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {convo.last_message_at
                        ? `Last message ${timeAgo(convo.last_message_at)}`
                        : `Started ${timeAgo(convo.created_at)}`}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={convo.status === 'active' ? 'success' : 'default'}
                  className="capitalize"
                >
                  {convo.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function StatBox({
  icon: Icon,
  label,
  value,
  color,
  isText,
}: {
  icon: typeof Eye
  label: string
  value: number | string
  color: string
  isText?: boolean
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111827]/60 p-4 backdrop-blur-sm">
      <Icon size={18} className={color} />
      <p className={cn('mt-2 text-xl font-bold text-white', isText && 'text-base')}>
        {value}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function SpecItem({
  icon: Icon,
  label,
  value,
  capitalize,
}: {
  icon: typeof Car
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Icon size={12} />
        {label}
      </div>
      <p className={cn('mt-1 text-sm font-medium text-white', capitalize && 'capitalize')}>
        {value}
      </p>
    </div>
  )
}