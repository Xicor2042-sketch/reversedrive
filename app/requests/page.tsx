import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AppNavbar from '@/components/shared/app-navbar'
import { Plus, MapPin, Eye, Clock, Filter, Search, Car, ArrowRight } from 'lucide-react'
import { formatBudget, timeAgo } from '@/lib/utils/cn'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RequestsListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: requests } = await supabase
    .from('car_requests')
    .select('*')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  const role = (profile?.role as any) || 'buyer'

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <AppNavbar role={role} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#8a8f98] mb-1.5">
              <Car size={14} />
              <span className="text-[12px] uppercase tracking-wider" style={{ fontWeight: 510 }}>
                Buyer requests
              </span>
            </div>
            <h1
              className="text-[22px] sm:text-[26px] tracking-tight text-[#f7f8f8]"
              style={{ fontWeight: 510, letterSpacing: '-0.02em' }}
            >
              My requests
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#8a8f98] mt-1">
              {requests?.length || 0} active {requests?.length === 1 ? 'request' : 'requests'}
            </p>
          </div>

          <Link href="/requests/new">
            <button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#5e6ad2] px-4 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:bg-[#7170ff] shadow-[0_0_0_0_rgba(94,106,210,0)] hover:shadow-[0_0_20px_rgba(94,106,210,0.25)]">
              <Plus size={16} />
              New request
            </button>
          </Link>
        </div>

        {/* Toolbar */}
        <div className="mb-5 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62666d]" />
            <input
              type="text"
              placeholder="Search by make or model…"
              readOnly
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.02] py-2 pl-9 pr-3 text-[13px] text-[#f7f8f8] placeholder-[#62666d] transition-all duration-200 focus:outline-none focus:border-[#5e6ad2]/50 focus:bg-white/[0.03]"
            />
          </div>
          <button className="hidden sm:inline-flex items-center gap-1.5 rounded-[8px] border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-white/[0.04] transition-all duration-200">
            <Filter size={14} />
            Filter
          </button>
        </div>

        {requests && requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req: any) => {
              const statusConfig = getStatusConfig(req.status)
              return (
                <Link
                  key={req.id}
                  href={`/requests/${req.id}`}
                  className="group block rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.12] hover:shadow-[0_2px_8px_rgba(0,0,0,0.16)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3
                          className="text-[15px] sm:text-[16px] tracking-tight text-[#f7f8f8] truncate"
                          style={{ fontWeight: 510 }}
                        >
                          {req.make} {req.model}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${statusConfig.className}`}
                          style={{ fontWeight: 510 }}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig.dot}`} />
                          {req.status}
                        </span>
                      </div>

                      <div className="text-[13px] text-[#8a8f98]">
                        {req.year_min && req.year_max
                          ? `${req.year_min}–${req.year_max}`
                          : req.year_min
                          ? `${req.year_min}+`
                          : 'Any year'}
                        {req.mileage_max && ` · up to ${req.mileage_max.toLocaleString()} mi`}
                        {req.body_type && ` · ${req.body_type}`}
                        {req.fuel_type && req.fuel_type !== 'any' && ` · ${req.fuel_type}`}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[12px] text-[#62666d]">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} />
                          {req.location_zip} · {req.location_radius_miles} mi
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye size={13} />
                          {req.view_count || 0} views
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} />
                          {timeAgo(req.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-1.5 sm:ml-4 shrink-0">
                      <span
                        className="text-[17px] sm:text-[18px] tabular-nums text-[#f7f8f8]"
                        style={{ fontWeight: 510 }}
                      >
                        {formatBudget(req.max_budget)}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[12px] text-[#7170ff] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        View
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-12 sm:p-16 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#5e6ad2]/10 text-[#7170ff]">
              <Search size={24} />
            </div>
            <h2 className="text-[16px] sm:text-[17px] text-[#f7f8f8] mb-2" style={{ fontWeight: 510 }}>
              No requests yet
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#8a8f98] mb-6 max-w-sm mx-auto leading-relaxed">
              Post your first car request and let verified sellers come to you with their best offers.
            </p>
            <Link href="/requests/new">
              <button className="inline-flex items-center gap-2 rounded-[8px] bg-[#5e6ad2] px-5 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:bg-[#7170ff] shadow-[0_0_0_0_rgba(94,106,210,0)] hover:shadow-[0_0_20px_rgba(94,106,210,0.25)]">
                <Plus size={16} />
                Create your first request
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'active':
      return {
        className: 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20',
        dot: 'bg-[#10b981]',
      }
    case 'paused':
      return {
        className: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
        dot: 'bg-[#f59e0b]',
      }
    case 'expired':
      return {
        className: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
        dot: 'bg-[#ef4444]',
      }
    default:
      return {
        className: 'bg-white/5 text-[#8a8f98] border-white/10',
        dot: 'bg-[#8a8f98]',
      }
  }
}
