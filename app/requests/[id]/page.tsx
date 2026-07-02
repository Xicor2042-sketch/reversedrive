import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import AppNavbar from "@/components/shared/app-navbar"
import { updateRequestStatus, deleteRequest } from "../_actions"
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Car,
  Calendar,
  Eye,
  MessageSquare,
  Unlock,
  Gauge,
  Fuel,
  Settings,
  Zap,
  Pause,
  Play,
  X,
  Pencil,
  Clock,
  Shield,
  AlertTriangle,
  ChevronRight,
  Trash2,
} from "lucide-react"
import { cn, formatBudget, formatDate, timeAgo } from "@/lib/utils/cn"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface Props {
  params: Promise<{ id: string }>
}

export default async function RequestDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single()

  const { data: request } = await supabase
    .from("car_requests")
    .select("*")
    .eq("id", id)
    .single()

  if (!request) notFound()
  if (request.buyer_id !== user.id) redirect("/dashboard")

  const { data: unlocks } = await supabase
    .from("unlocked_leads")
    .select("id, seller_id, unlock_fee, unlocked_at")
    .eq("request_id", id)
    .order("unlocked_at", { ascending: false })

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, seller_id, status, last_message_at, created_at")
    .eq("request_id", id)
    .order("last_message_at", { ascending: false, nullsFirst: false })

  const sellerIds = Array.from(new Set(
    [...(unlocks || []).map((u) => u.seller_id), ...(conversations || []).map((c) => c.seller_id)].filter(Boolean) as string[]
  ))
  let sellerMap: Record<string, any> = {}
  if (sellerIds.length > 0) {
    const { data: sellers } = await supabase
      .from("public_profiles")
      .select("id, display_name, is_dealer, dealer_business_name")
      .in("id", sellerIds)
    sellerMap = Object.fromEntries((sellers || []).map((s) => [s.id, s]))
  }

  const isActive = request.status === "active"
  const isPaused = request.status === "paused"
  const isClosedOrExpired = request.status === "closed" || request.status === "expired"

  const statusStyle =
    request.status === "active"
      ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20"
      : request.status === "paused"
      ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"
      : request.status === "expired"
      ? "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20"
      : "bg-white/5 text-[#8a8f98] border-white/10"

  const daysLeft = isActive
    ? Math.max(0, Math.ceil((new Date(request.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <AppNavbar role={(profile?.role as any) || "buyer"} />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors mb-6"
          style={{ fontWeight: 510 }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Header card */}
        <div className="glass-card rounded-[14px] overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl tracking-tight" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>
                    {request.make} {request.model}
                  </h1>
                  <span className={cn("text-[11px] px-2.5 py-1 rounded-full border capitalize", statusStyle)}>
                    {request.status}
                  </span>
                </div>
                <p className="text-[13px] text-[#8a8f98]">
                  Created {timeAgo(request.created_at)} · {formatDate(request.created_at)}
                </p>
                {isActive && daysLeft > 0 && (
                  <p className="text-[12px] text-[#62666d] mt-1 flex items-center gap-1">
                    <Clock size={12} /> Expires in {daysLeft} {daysLeft === 1 ? "day" : "days"}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl text-[#10b981] tabular-nums" style={{ fontWeight: 510 }}>
                  {formatBudget(request.max_budget)}
                </div>
                <div className="text-[12px] text-[#62666d] mt-1">
                  {request.payment_method === "financing" ? "Pre-approved financing" : "Cash buyer"}
                </div>
              </div>
            </div>

            {isClosedOrExpired && (
              <div className="rounded-[8px] border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-6 flex items-start gap-3">
                <AlertTriangle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#8a8f98]">
                  {request.status === "closed"
                    ? "This request is closed. You can reactivate it anytime."
                    : "This request expired. Reactivate it to start receiving offers again."}
                </p>
              </div>
            )}

            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/requests/${id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-[6px] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] px-3 py-2 text-[13px] text-[#d0d6e0] transition-all"
                style={{ fontWeight: 510 }}
              >
                <Pencil size={14} /> Edit
              </Link>

              {(isActive || isPaused) && (
                <form action={updateRequestStatus.bind(null, id, isActive ? "paused" : "active")}>
                  <button
                    type="submit"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-[6px] border px-3 py-2 text-[13px] transition-all",
                      isActive
                        ? "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-[#d0d6e0]"
                        : "border-[#10b981]/20 bg-[#10b981]/10 hover:bg-[#10b981]/15 text-[#10b981]"
                    )}
                    style={{ fontWeight: 510 }}
                  >
                    {isActive ? (
                      <><Pause size={14} /> Pause</>
                    ) : (
                      <><Play size={14} /> Resume</>
                    )}
                  </button>
                </form>
              )}

              {(isActive || isPaused) && (
                <form action={updateRequestStatus.bind(null, id, "closed")} className="ml-auto">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#ef4444]/20 bg-[#ef4444]/10 hover:bg-[#ef4444]/15 px-3 py-2 text-[13px] text-[#ef4444] transition-all"
                    style={{ fontWeight: 510 }}
                  >
                    <X size={14} /> Close Request
                  </button>
                </form>
              )}

              {isClosedOrExpired && (
                <>
                  <form action={updateRequestStatus.bind(null, id, "active")}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#10b981]/20 bg-[#10b981]/10 hover:bg-[#10b981]/15 px-3 py-2 text-[13px] text-[#10b981] transition-all"
                      style={{ fontWeight: 510 }}
                    >
                      <Play size={14} /> Reactivate
                    </button>
                  </form>
                  <form action={deleteRequest.bind(null, id)} className="ml-auto">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#ef4444]/20 bg-[#ef4444]/10 hover:bg-[#ef4444]/15 px-3 py-2 text-[13px] text-[#ef4444] transition-all"
                      style={{ fontWeight: 510 }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Eye} label="Total Views" value={request.view_count} />
          <StatCard icon={Unlock} label="Sellers Unlocked" value={(unlocks || []).length} />
          <StatCard icon={MessageSquare} label="Conversations" value={(conversations || []).length} />
          <StatCard icon={DollarSign} label="Budget" value={formatBudget(request.max_budget)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Specs */}
            <div className="glass-card rounded-[14px] p-6">
              <h2 className="text-[15px] mb-5" style={{ fontWeight: 510 }}>Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Spec icon={Car} label="Body Type" value={request.body_type || "Any"} />
                <Spec icon={Fuel} label="Fuel" value={request.fuel_type || "Any"} />
                <Spec icon={Settings} label="Transmission" value={request.transmission || "Any"} />
                <Spec
                  icon={Calendar}
                  label="Year Range"
                  value={
                    request.year_min && request.year_max
                      ? `${request.year_min} – ${request.year_max}`
                      : request.year_min
                      ? `${request.year_min}+`
                      : request.year_max
                      ? `Up to ${request.year_max}`
                      : "Any"
                  }
                />
                <Spec icon={Gauge} label="Max Mileage" value={request.mileage_max ? `${request.mileage_max.toLocaleString()} mi` : "Any"} />
                <Spec icon={DollarSign} label="Payment" value={request.payment_method || "Cash"} />
              </div>
              <div className="mt-5 pt-5 border-t border-white/[0.05] flex items-center gap-2 text-[13px] text-[#8a8f98]">
                <MapPin size={14} className="text-[#7170ff]" />
                {request.location_zip} · {request.location_radius_miles} mile radius
              </div>
              {request.notes && (
                <div className="mt-5 pt-5 border-t border-white/[0.05]">
                  <div className="text-[11px] text-[#62666d] uppercase tracking-wider mb-2" style={{ fontWeight: 510 }}>
                    Notes
                  </div>
                  <p className="text-[14px] text-[#d0d6e0]">{request.notes}</p>
                </div>
              )}
            </div>

            {/* Sellers who unlocked */}
            <div className="glass-card rounded-[14px] p-6">
              <h2 className="text-[15px] mb-5 flex items-center gap-2" style={{ fontWeight: 510 }}>
                <Unlock size={16} className="text-[#7170ff]" />
                Sellers Who Unlocked This Request
              </h2>
              {(unlocks || []).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[13px] text-[#8a8f98]">No sellers have unlocked this yet. Your request is live and visible.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unlocks?.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between rounded-[10px] border border-white/[0.05] bg-white/[0.015] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5e6ad2]/30 to-[#7170ff]/30 flex items-center justify-center text-[11px] text-white">
                          {(sellerMap[lead.seller_id]?.display_name || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px]" style={{ fontWeight: 510 }}>
                            {sellerMap[lead.seller_id]?.display_name || `Seller #${lead.seller_id.slice(0, 8)}`}
                          </p>
                          <p className="text-[11px] text-[#62666d]">
                            {sellerMap[lead.seller_id]?.is_dealer && sellerMap[lead.seller_id]?.dealer_business_name
                              ? `${sellerMap[lead.seller_id].dealer_business_name} · `
                              : ""}
                            Unlocked {timeAgo(lead.unlocked_at)}
                          </p>
                        </div>
                      </div>
                      <span className="text-[13px] tabular-nums text-[#7170ff]" style={{ fontWeight: 510 }}>
                        {formatBudget(lead.unlock_fee)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Conversations */}
            <div className="glass-card rounded-[14px] p-6">
              <h2 className="text-[15px] mb-5 flex items-center gap-2" style={{ fontWeight: 510 }}>
                <MessageSquare size={16} className="text-[#10b981]" />
                Conversations
              </h2>
              {(conversations || []).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[13px] text-[#8a8f98]">No conversations yet. Sellers will message you after unlocking.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations?.map((convo) => (
                    <Link
                      key={convo.id}
                      href={`/deal-room/${convo.id}`}
                      className="flex items-center justify-between rounded-[10px] border border-white/[0.05] bg-white/[0.015] px-4 py-3 hover:bg-white/[0.03] hover:border-white/[0.10] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10b981]/30 to-[#5e6ad2]/30 flex items-center justify-center text-[11px] text-white">
                          {(sellerMap[convo.seller_id]?.display_name || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px]" style={{ fontWeight: 510 }}>
                            {sellerMap[convo.seller_id]?.display_name || `Seller #${convo.seller_id.slice(0, 8)}`}
                          </p>
                          <p className="text-[11px] text-[#62666d]">
                            {convo.last_message_at ? `Last message ${timeAgo(convo.last_message_at)}` : `Started ${timeAgo(convo.created_at)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[11px] px-2 py-0.5 rounded-full border capitalize",
                          convo.status === "active"
                            ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20"
                            : "bg-white/5 text-[#8a8f98] border-white/10"
                        )}>
                          {convo.status}
                        </span>
                        <ChevronRight size={14} className="text-[#7170ff] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-[14px] border border-[#5e6ad2]/15 bg-gradient-to-b from-[#5e6ad2]/[0.06] to-transparent p-6">
              <div className="w-10 h-10 rounded-[10px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center mb-4">
                <Shield size={20} className="text-[#7170ff]" />
              </div>
              <h3 className="text-[15px] mb-2" style={{ fontWeight: 510 }}>Secure your deal</h3>
              <p className="text-[13px] text-[#8a8f98] mb-5 leading-relaxed">
                Add funds to escrow to show sellers you&apos;re serious. Only released when you get the car.
              </p>
              <Link
                href="/wallet"
                className="block w-full text-center rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] py-2.5 text-[13px] text-white transition-all"
                style={{ fontWeight: 510 }}
              >
                Add Money to Wallet
              </Link>
            </div>

            <div className="glass-card rounded-[14px] p-6">
              <h3 className="text-[15px] mb-4" style={{ fontWeight: 510 }}>Need help?</h3>
              <ul className="space-y-3 text-[13px] text-[#8a8f98]">
                <li className="flex items-start gap-2">
                  <span className="text-[#7170ff]">·</span>
                  Sellers pay $9.99 to unlock your contact info.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7170ff]">·</span>
                  Chat in the Deal Room before paying anything.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7170ff]">·</span>
                  Use escrow when you&apos;re ready to buy.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-5">
      <Icon size={16} className="text-[#62666d] mb-3" />
      <div className="text-2xl tracking-tight tabular-nums" style={{ fontWeight: 510 }}>{value}</div>
      <div className="text-[12px] text-[#62666d] mt-1">{label}</div>
    </div>
  )
}

function Spec({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-white/[0.05] bg-white/[0.015] p-4">
      <div className="flex items-center gap-1.5 text-[11px] text-[#62666d] mb-1" style={{ fontWeight: 510 }}>
        <Icon size={11} /> {label}
      </div>
      <div className="text-[14px] text-[#f7f8f8] capitalize" style={{ fontWeight: 510 }}>{value}</div>
    </div>
  )
}
