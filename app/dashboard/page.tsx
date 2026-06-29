import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppNavbar from '@/components/shared/app-navbar'
import Link from 'next/link'
import { FileText, Plus, MapPin, Eye, Clock, Unlock, DollarSign, TrendingUp, Users, ArrowRight, Activity } from 'lucide-react'
import { formatBudget, timeAgo } from '@/lib/utils/cn'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.is_banned) {
    redirect('/login')
  }

  const isSeller = profile.role === 'seller'

  if (isSeller) {
    // ===== SELLER DASHBOARD =====
    const { data: unlocks } = await supabase
      .from('unlocked_leads')
      .select(`id, unlock_fee, unlocked_at, car_requests!inner(make, model, year_min, year_max, max_budget, status)`)
      .eq('seller_id', user.id)
      .order('unlocked_at', { ascending: false })

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, type, status, created_at')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const { count: activeLeadsCount } = await supabase
      .from('car_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())

    const totalSpent = (transactions || [])
      .filter((t: any) => t.status === 'completed')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)

    const totalUnlocks = unlocks?.length || 0

    return (
      <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
        <AppNavbar role="seller" />
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl tracking-tight" style={{ fontWeight: 510, letterSpacing: '-0.02em' }}>Seller Dashboard</h1>
              <p className="text-sm text-[#8a8f98] mt-1">Welcome back, {profile.display_name}</p>
            </div>
            <Link href="/leads">
              <button className="inline-flex items-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] px-4 py-2 text-[13px] text-white transition-colors" style={{ fontWeight: 510 }}>
                <TrendingUp size={15} />
                Browse Leads
              </button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-12">
            <StatCard label="Total Unlocks" value={totalUnlocks.toString()} icon={Unlock} />
            <StatCard label="Total Spent" value={formatBudget(totalSpent)} icon={DollarSign} />
            <StatCard label="Active Leads" value={activeLeadsCount?.toString() || '0'} icon={Activity} />
            <StatCard label="Available Credits" value="∞" icon={Users} />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unlocked Leads */}
            <div>
              <h2 className="text-[15px] mb-4 text-[#d0d6e0]" style={{ fontWeight: 510 }}>Recent Unlocks</h2>
              {unlocks && unlocks.length > 0 ? (
                <div className="space-y-2">
                  {unlocks.slice(0, 5).map((unlock: any) => (
                    <div key={unlock.id} className="rounded-[8px] border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] truncate" style={{ fontWeight: 510 }}>
                            {unlock.car_requests?.year_min} {unlock.car_requests?.make} {unlock.car_requests?.model}
                          </div>
                          <div className="text-[12px] text-[#62666d] mt-1 flex items-center gap-3">
                            <span>{formatBudget(unlock.car_requests?.max_budget)}</span>
                            <span>·</span>
                            <span>{timeAgo(unlock.unlocked_at)}</span>
                          </div>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                          unlock.car_requests?.status === 'active'
                            ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
                            : 'bg-white/5 text-[#8a8f98] border-white/10'
                        }`}>
                          {unlock.car_requests?.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[8px] border border-white/[0.06] bg-white/[0.02] p-8 text-center">
                  <Users size={24} className="mx-auto text-[#62666d] mb-3" />
                  <p className="text-[13px] text-[#8a8f98] mb-4">No unlocks yet</p>
                  <Link href="/leads">
                    <button className="text-[13px] text-[#7170ff] hover:text-[#828fff] inline-flex items-center gap-1" style={{ fontWeight: 510 }}>
                      Browse available leads
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Transaction History */}
            <div>
              <h2 className="text-[15px] mb-4 text-[#d0d6e0]" style={{ fontWeight: 510 }}>Transaction History</h2>
              {transactions && transactions.length > 0 ? (
                <div className="rounded-[8px] border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  {transactions.map((tx: any, i: number) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-3 ${i !== transactions.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                      <div>
                        <div className="text-[13px] capitalize" style={{ fontWeight: 510 }}>{tx.type.replace('_', ' ')}</div>
                        <div className="text-[11px] text-[#62666d] mt-0.5">{timeAgo(tx.created_at)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                          tx.status === 'completed'
                            ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
                            : 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20'
                        }`}>
                          {tx.status}
                        </span>
                        <span className="text-[13px] tabular-nums" style={{ fontWeight: 510 }}>{formatBudget(parseFloat(tx.amount))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[8px] border border-white/[0.06] bg-white/[0.02] p-8 text-center">
                  <DollarSign size={24} className="mx-auto text-[#62666d] mb-3" />
                  <p className="text-[13px] text-[#8a8f98]">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== BUYER DASHBOARD =====
  const { data: requests } = await supabase
    .from('car_requests')
    .select('*')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  const activeRequests = (requests || []).filter((r: any) => r.status === 'active')
  const totalViews = (requests || []).reduce((sum: number, r: any) => sum + (r.view_count || 0), 0)

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <AppNavbar role="buyer" />
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl tracking-tight" style={{ fontWeight: 510, letterSpacing: '-0.02em' }}>My Garage</h1>
            <p className="text-sm text-[#8a8f98] mt-1">Welcome back, {profile.display_name}</p>
          </div>
          <Link href="/requests/new">
            <button className="inline-flex items-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] px-4 py-2 text-[13px] text-white transition-colors" style={{ fontWeight: 510 }}>
              <Plus size={15} />
              New Request
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12">
          <StatCard label="Active Requests" value={activeRequests.length.toString()} icon={FileText} />
          <StatCard label="Total Views" value={totalViews.toString()} icon={Eye} />
          <StatCard label="Total Requests" value={(requests?.length || 0).toString()} icon={Activity} />
        </div>

        {/* Requests List */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[15px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>Your Requests</h2>
          <Link href="/requests" className="text-[13px] text-[#7170ff] hover:text-[#828fff] inline-flex items-center gap-1" style={{ fontWeight: 510 }}>
            View all
            <ArrowRight size={13} />
          </Link>
        </div>

        {requests && requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requests.slice(0, 6).map((req: any) => (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="block rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] truncate" style={{ fontWeight: 510 }}>
                      {req.make} {req.model}
                    </h3>
                    <div className="text-[12px] text-[#62666d] mt-1">
                      {req.year_min && req.year_max ? `${req.year_min}–${req.year_max}` : req.year_min ? `${req.year_min}+` : 'Any year'}
                      {req.mileage_max && ` · ${req.mileage_max.toLocaleString()} mi`}
                    </div>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap ${
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

                <div className="flex items-end justify-between mb-4">
                  <span className="text-xl text-[#10b981] tabular-nums" style={{ fontWeight: 510 }}>
                    {formatBudget(req.max_budget)}
                  </span>
                  <div className="text-[11px] text-[#62666d] flex items-center gap-1">
                    <MapPin size={11} />
                    {req.location_zip} · {req.location_radius_miles}mi
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center gap-3 text-[11px] text-[#62666d]">
                    <span className="flex items-center gap-1">
                      <Eye size={11} />
                      {req.view_count} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {timeAgo(req.created_at)}
                    </span>
                  </div>
                  <span className="text-[#7170ff] group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-16 text-center">
            <div className="w-12 h-12 rounded-[10px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center mx-auto mb-5">
              <FileText size={22} className="text-[#7170ff]" />
            </div>
            <h2 className="text-lg mb-2" style={{ fontWeight: 510 }}>No requests yet</h2>
            <p className="text-[13px] text-[#8a8f98] mb-6 max-w-sm mx-auto">
              Post your first car request and let sellers come to you with their best offers.
            </p>
            <Link href="/requests/new">
              <button className="inline-flex items-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] px-5 py-2.5 text-[13px] text-white transition-colors" style={{ fontWeight: 510 }}>
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

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] text-[#62666d]" style={{ fontWeight: 510 }}>{label}</span>
        <Icon size={15} className="text-[#62666d]" />
      </div>
      <div className="text-2xl tracking-tight tabular-nums" style={{ fontWeight: 510 }}>{value}</div>
    </div>
  )
}