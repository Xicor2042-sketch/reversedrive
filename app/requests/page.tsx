import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AppNavbar from '@/components/shared/app-navbar'
import { FileText, Plus, MapPin, Eye, Clock } from 'lucide-react'
import { formatBudget, timeAgo } from '@/lib/utils/cn'

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

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <AppNavbar role={(profile?.role as any) || 'buyer'} />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-medium tracking-tight" style={{ fontWeight: 510 }}>
              My Requests
            </h1>
            <p className="text-sm text-[#8a8f98] mt-1">
              {requests?.length || 0} total requests
            </p>
          </div>
          <Link href="/requests/new">
            <button className="inline-flex items-center gap-2 rounded-[6px] bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7170ff]">
              <Plus size={16} />
              New Request
            </button>
          </Link>
        </div>

        {requests && requests.length > 0 ? (
          <div className="space-y-2">
            {requests.map((req: any) => (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="block rounded-[8px] border border-white/[0.08] bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04] hover:border-white/[0.12]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium truncate" style={{ fontWeight: 510 }}>
                      {req.make} {req.model}
                    </h3>
                    <div className="text-sm text-[#8a8f98] mt-1">
                      {req.year_min && req.year_max ? `${req.year_min}–${req.year_max}` : req.year_min ? `${req.year_min}+` : 'Any year'}
                      {req.mileage_max && ` · ${req.mileage_max.toLocaleString()} mi max`}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[#62666d]">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {req.location_zip} · {req.location_radius_miles}mi
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {req.view_count} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {timeAgo(req.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className="text-lg font-medium text-[#10b981]" style={{ fontWeight: 510 }}>
                      {formatBudget(req.max_budget)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      req.status === 'active'
                        ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
                        : req.status === 'paused'
                        ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20'
                        : req.status === 'expired'
                        ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'
                        : 'bg-white/5 text-[#8a8f98] border-white/10'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[12px] border border-white/[0.08] bg-white/[0.02] p-16 text-center">
            <FileText size={32} className="mx-auto text-[#62666d] mb-4" />
            <h2 className="text-lg font-medium mb-2" style={{ fontWeight: 510 }}>No requests yet</h2>
            <p className="text-sm text-[#8a8f98] mb-6 max-w-sm mx-auto">
              Post your first car request and let sellers come to you with their best offers.
            </p>
            <Link href="/requests/new">
              <button className="inline-flex items-center gap-2 rounded-[6px] bg-[#5e6ad2] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7170ff]">
                <Plus size={16} />
                Create Your First Request
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}