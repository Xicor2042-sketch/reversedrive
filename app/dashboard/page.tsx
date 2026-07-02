import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AppNavbar from "@/components/shared/app-navbar"
import Link from "next/link"
import {
  FileText,
  Plus,
  MapPin,
  Eye,
  Clock,
  Unlock,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  Activity,
  Wallet,
  MessageSquare,
  ShieldCheck,
  Zap,
  Car,
} from "lucide-react"
import { formatBudget, timeAgo } from "@/lib/utils/cn"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.is_banned) redirect("/login")

  const isSeller = profile.role === "seller"

  if (isSeller) {
    // ===== SELLER DASHBOARD =====
    const { data: unlocks } = await supabase
      .from("unlocked_leads")
      .select("id, unlock_fee, unlocked_at, request_id")
      .eq("seller_id", user.id)
      .order("unlocked_at", { ascending: false })

    const requestIds = (unlocks || []).map((u) => u.request_id).filter(Boolean)
    let requestMap: Record<string, any> = {}
    if (requestIds.length > 0) {
      const { data: reqRows } = await supabase
        .from("car_requests")
        .select("id, make, model, year_min, year_max, max_budget, status")
        .in("id", requestIds)
      requestMap = Object.fromEntries((reqRows || []).map((r) => [r.id, r]))
    }

    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .eq("seller_id", user.id)

    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount, type, status, created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    const { count: activeLeadsCount } = await supabase
      .from("car_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())

    const totalSpent = (transactions || [])
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const totalUnlocks = unlocks?.length || 0

    return (
      <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
        <AppNavbar role="seller" />
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-[#5e6ad2]/8 blur-[140px]" />
          <div className="absolute bottom-[5%] right-[8%] h-[260px] w-[260px] rounded-full bg-[#7170ff]/5 blur-[110px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-2xl tracking-tight" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>Seller Dashboard</h1>
              <p className="text-sm text-[#8a8f98] mt-1">Welcome back, {profile.display_name}</p>
            </div>
            <Link href="/leads">
              <button className="inline-flex items-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] px-4 py-2 text-[13px] text-white transition-colors" style={{ fontWeight: 510 }}>
                <TrendingUp size={15} />
                Browse Leads
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            <StatCard label="Total Unlocks" value={totalUnlocks.toString()} icon={Unlock} />
            <StatCard label="Total Spent" value={formatBudget(totalSpent)} icon={DollarSign} accent="green" />
            <StatCard label="Active Leads" value={activeLeadsCount?.toString() || "0"} icon={Activity} accent="amber" />
            <StatCard label="Messages" value={(conversations || []).length.toString()} icon={MessageSquare} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-[14px] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[15px]" style={{ fontWeight: 510 }}>Recent Unlocks</h2>
                  <Link href="/conversations" className="text-[13px] text-[#7170ff] hover:text-[#828fff] inline-flex items-center gap-1" style={{ fontWeight: 510 }}>
                    Messages <ArrowRight size={13} />
                  </Link>
                </div>
                {unlocks && unlocks.length > 0 ? (
                  <div className="space-y-2">
                    {unlocks.slice(0, 5).map((unlock) => {
                      const req = requestMap[unlock.request_id]
                      return (
                        <Link
                          key={unlock.id}
                          href={`/leads/${unlock.request_id}`}
                          className="block rounded-[10px] border border-white/[0.05] bg-white/[0.015] p-4 hover:bg-white/[0.03] hover:border-white/[0.10] transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="text-[14px] truncate" style={{ fontWeight: 510 }}>
                                {req ? `${req.year_min || ""} ${req.make} ${req.model}`.trim() : "Lead request"}
                              </div>
                              <div className="text-[12px] text-[#62666d] mt-1 flex items-center gap-3">
                                <span>{req ? formatBudget(req.max_budget) : "—"}</span>
                                <span>·</span>
                                <span>{timeAgo(unlock.unlocked_at)}</span>
                              </div>
                            </div>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full border ${
                                req?.status === "active"
                                  ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20"
                                  : "bg-white/5 text-[#8a8f98] border-white/10"
                              }`}
                            >
                              {req?.status || "unknown"}
                            </span>
                            <ArrowRight size={14} className="text-[#7170ff] group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-10 text-center">
                    <Users size={24} className="mx-auto text-[#62666d] mb-3" />
                    <p className="text-[13px] text-[#8a8f98] mb-4">No unlocks yet</p>
                    <Link href="/leads">
                      <button className="text-[13px] text-[#7170ff] hover:text-[#828fff] inline-flex items-center gap-1" style={{ fontWeight: 510 }}>
                        Browse available leads <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card rounded-[14px] p-6">
                <h2 className="text-[15px] mb-5" style={{ fontWeight: 510 }}>Transaction History</h2>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.map((tx, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-[8px] border border-white/[0.05] bg-white/[0.015] px-4 py-3"
                      >
                        <div>
                          <div className="text-[13px] capitalize" style={{ fontWeight: 510 }}>{tx.type.replace("_", " ")}</div>
                          <div className="text-[11px] text-[#62666d] mt-0.5">{timeAgo(tx.created_at)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full border ${
                              tx.status === "completed"
                                ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20"
                                : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"
                            }`}
                          >
                            {tx.status}
                          </span>
                          <span className="text-[13px] tabular-nums" style={{ fontWeight: 510 }}>{formatBudget(parseFloat(tx.amount))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign size={24} className="mx-auto text-[#62666d] mb-3" />
                    <p className="text-[13px] text-[#8a8f98]">No transactions yet</p>
                  </div>
                )}
              </div>

              <div className="rounded-[14px] border border-[#5e6ad2]/15 bg-gradient-to-b from-[#5e6ad2]/[0.06] to-transparent p-6">
                <div className="w-10 h-10 rounded-[10px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center mb-4">
                  <Zap size={20} className="text-[#7170ff]" />
                </div>
                <h3 className="text-[15px] mb-2" style={{ fontWeight: 510 }}>How selling works</h3>
                <ul className="space-y-3 text-[13px] text-[#8a8f98]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#7170ff]">1.</span> Browse active buyer requests.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#7170ff]">2.</span> Pay $9.99 to unlock a lead.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#7170ff]">3.</span> Chat and close the deal.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== BUYER DASHBOARD =====
  const { data: requests } = await supabase
    .from("car_requests")
    .select("*")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, seller_id, status, last_message_at, request_id")
    .eq("buyer_id", user.id)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(5)

  const sellerIds = Array.from(new Set((conversations || []).map((c) => c.seller_id).filter(Boolean) as string[]))
  let sellerMap: Record<string, any> = {}
  if (sellerIds.length > 0) {
    const { data: sellers } = await supabase
      .from("public_profiles")
      .select("id, display_name")
      .in("id", sellerIds)
    sellerMap = Object.fromEntries((sellers || []).map((s) => [s.id, s]))
  }

  const activeRequests = (requests || []).filter((r) => r.status === "active")
  const totalViews = (requests || []).reduce((sum, r) => sum + (r.view_count || 0), 0)

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <AppNavbar role="buyer" />
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-[#5e6ad2]/8 blur-[140px]" />
        <div className="absolute bottom-[5%] right-[8%] h-[260px] w-[260px] rounded-full bg-[#7170ff]/5 blur-[110px]" />
      </div>
      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl tracking-tight" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>My Garage</h1>
            <p className="text-sm text-[#8a8f98] mt-1">Welcome back, {profile.display_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/wallet">
              <button className="inline-flex items-center gap-2 rounded-[6px] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] px-4 py-2 text-[13px] text-[#d0d6e0] transition-colors" style={{ fontWeight: 510 }}>
                <Wallet size={15} />
                Wallet
              </button>
            </Link>
            <Link href="/requests/new">
              <button className="inline-flex items-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] px-4 py-2 text-[13px] text-white transition-colors" style={{ fontWeight: 510 }}>
                <Plus size={15} />
                New Request
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          <StatCard label="Active Requests" value={activeRequests.length.toString()} icon={FileText} />
          <StatCard label="Total Views" value={totalViews.toString()} icon={Eye} accent="amber" />
          <StatCard label="Conversations" value={(conversations || []).length.toString()} icon={MessageSquare} accent="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-[14px] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[15px]" style={{ fontWeight: 510 }}>Your Requests</h2>
                <Link href="/requests" className="text-[13px] text-[#7170ff] hover:text-[#828fff] inline-flex items-center gap-1" style={{ fontWeight: 510 }}>
                  View all <ArrowRight size={13} />
                </Link>
              </div>

              {requests && requests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {requests.slice(0, 6).map((req) => (
                    <Link
                      key={req.id}
                      href={`/requests/${req.id}`}
                      className="block rounded-[12px] border border-white/[0.05] bg-white/[0.015] p-5 hover:bg-white/[0.03] hover:border-white/[0.10] transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[15px] truncate" style={{ fontWeight: 510 }}>
                            {req.make} {req.model}
                          </h3>
                          <div className="text-[12px] text-[#62666d] mt-1">
                            {req.year_min && req.year_max ? `${req.year_min}–${req.year_max}` : req.year_min ? `${req.year_min}+` : "Any year"}
                            {req.mileage_max && ` · ${req.mileage_max.toLocaleString()} mi`}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap ${
                            req.status === "active"
                              ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20"
                              : req.status === "paused"
                              ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"
                              : req.status === "expired"
                              ? "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20"
                              : "bg-white/5 text-[#8a8f98] border-white/10"
                          }`}
                        >
                          {req.status === "active" && (
                            <span className="w-1 h-1 rounded-full bg-[#10b981] animate-pulse" />
                          )}
                          {req.status === "active" ? "Live" : req.status}
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

                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
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
                        <ArrowRight size={14} className="text-[#7170ff] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-[12px] p-16 text-center">
                  <div className="w-12 h-12 rounded-[10px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center mx-auto mb-5">
                    <Car size={22} className="text-[#7170ff]" />
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

          <div className="space-y-6">
            <div className="rounded-[14px] border border-[#5e6ad2]/15 bg-gradient-to-b from-[#5e6ad2]/[0.06] to-transparent p-6">
              <div className="w-10 h-10 rounded-[10px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center mb-4">
                <ShieldCheck size={20} className="text-[#7170ff]" />
              </div>
              <h3 className="text-[15px] mb-2" style={{ fontWeight: 510 }}>Secure your next car</h3>
              <p className="text-[13px] text-[#8a8f98] mb-5 leading-relaxed">
                Add money to your wallet so sellers know you&apos;re serious. Funds stay in escrow until you approve.
              </p>
              <Link href="/wallet">
                <button className="w-full flex items-center justify-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] py-2.5 text-[13px] text-white transition-all" style={{ fontWeight: 510 }}>
                  <Wallet size={15} />
                  Add Money
                </button>
              </Link>
            </div>

            <div className="glass-card rounded-[14px] p-6">
              <h2 className="text-[15px] mb-5" style={{ fontWeight: 510 }}>Recent Messages</h2>
              {conversations && conversations.length > 0 ? (
                <div className="space-y-2">
                  {conversations.map((convo) => (
                    <Link
                      key={convo.id}
                      href={`/deal-room/${convo.id}`}
                      className="flex items-center gap-3 rounded-[10px] border border-white/[0.05] bg-white/[0.015] p-3 hover:bg-white/[0.03] hover:border-white/[0.10] transition-all group"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#7170ff] flex items-center justify-center text-[12px] text-white shrink-0">
                        {(sellerMap[convo.seller_id]?.display_name || "S").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] truncate" style={{ fontWeight: 510 }}>
                          {sellerMap[convo.seller_id]?.display_name || `Seller #${convo.seller_id.slice(0, 8)}`}
                        </div>
                        <div className="text-[11px] text-[#62666d]">
                          {convo.last_message_at ? `Last message ${timeAgo(convo.last_message_at)}` : "No messages yet"}
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-[#7170ff] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare size={22} className="mx-auto text-[#62666d] mb-3" />
                  <p className="text-[13px] text-[#8a8f98]">No messages yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const STAT_ACCENTS: Record<string, { text: string; glow: string }> = {
  indigo: { text: "text-[#7170ff]", glow: "rgba(113,112,255,0.14)" },
  green: { text: "text-[#10b981]", glow: "rgba(16,185,129,0.12)" },
  amber: { text: "text-[#f5a623]", glow: "rgba(245,166,35,0.10)" },
}

function StatCard({ label, value, icon: Icon, accent = "indigo" }: { label: string; value: string; icon: any; accent?: string }) {
  const a = STAT_ACCENTS[accent] ?? STAT_ACCENTS.indigo
  return (
    <div className="glass-card relative overflow-hidden rounded-[14px] p-5 transition-all hover:border-white/[0.14]">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-[36px]"
        style={{ background: a.glow }}
      />
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-3 text-[#8a8f98]">
          <Icon size={13} className={a.text} strokeWidth={1.75} />
          <span className="text-[12px]" style={{ fontWeight: 510 }}>{label}</span>
        </div>
        <div className="text-[28px] leading-none tracking-tight tabular-nums" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>{value}</div>
      </div>
    </div>
  )
}
