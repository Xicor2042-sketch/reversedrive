'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Eye, Clock, Calendar, Pause, Play, X, Pencil } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RadarAnimation } from '@/components/buyer/radar-animation'
import { cn, formatBudget, timeAgo } from '@/lib/utils/cn'

export interface CarRequest {
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

interface RequestCardProps {
  request: CarRequest
  onTogglePause?: (id: string) => void
  onClose?: (id: string) => void
}

const statusConfig: Record<string, { label: string; variant: string; color: string }> = {
  active: { label: 'Active', variant: 'success', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
  paused: { label: 'Paused', variant: 'warning', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  closed: { label: 'Closed', variant: 'default', color: 'text-gray-400 border-gray-500/30 bg-gray-500/10' },
  expired: { label: 'Expired', variant: 'destructive', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
}

export function RequestCard({ request, onTogglePause, onClose }: RequestCardProps) {
  const status = statusConfig[request.status] ?? statusConfig.active
  const isActive = request.status === 'active'
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(request.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card className="relative overflow-hidden p-5 border-white/10 bg-[#111827]/60 backdrop-blur-sm">
        {/* Top row: car info + radar */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link href={`/requests/${request.id}`} className="block">
              <h3 className="truncate text-lg font-semibold text-white hover:text-[#06B6D4] transition-colors">
                {request.make} {request.model}
              </h3>
            </Link>
            <div className="mt-1 space-y-0.5 text-sm text-gray-400">
              {(request.year_min || request.year_max) && (
                <div>
                  {request.year_min && request.year_max
                    ? `${request.year_min} – ${request.year_max}`
                    : request.year_min
                    ? `${request.year_min}+`
                    : `Up to ${request.year_max}`}
                </div>
              )}
              {request.body_type && (
                <div className="capitalize">{request.body_type}</div>
              )}
              {request.mileage_max && (
                <div>{request.mileage_max.toLocaleString()} mi max</div>
              )}
            </div>
          </div>

          {isActive && (
            <RadarAnimation viewCount={request.view_count} size="md" />
          )}
        </div>

        {/* Budget */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
            {formatBudget(Number(request.max_budget))}
          </span>
          {request.payment_method && request.payment_method !== 'cash' && (
            <Badge variant="info" className="ml-1 capitalize">
              {request.payment_method === 'financing' ? 'Financing' : 'Flexible'}
            </Badge>
          )}
        </div>

        {/* Location */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin size={12} />
          {request.location_zip} · {request.location_radius_miles} mi radius
        </div>

        {/* Status + meta */}
        <div className="mt-4 flex items-center justify-between">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
              status.color
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status.label}
          </span>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {request.view_count} sellers viewed
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {timeAgo(request.created_at)}
            </span>
          </div>
        </div>

        {/* Expiry */}
        {isActive && daysLeft > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-[#06B6D4]/70">
            <Calendar size={12} />
            Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4">
          <Link href={`/requests/${request.id}`}>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Pencil size={14} className="mr-1.5" />
              Edit
            </Button>
          </Link>

          {(request.status === 'active' || request.status === 'paused') && onTogglePause && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePause(request.id)}
              className="text-gray-400 hover:text-amber-400"
            >
              {isActive ? (
                <>
                  <Pause size={14} className="mr-1.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play size={14} className="mr-1.5" />
                  Resume
                </>
              )}
            </Button>
          )}

          {(request.status === 'active' || request.status === 'paused') && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClose(request.id)}
              className="ml-auto text-gray-400 hover:text-red-400"
            >
              <X size={14} className="mr-1.5" />
              Close
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}