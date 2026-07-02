import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import LeadUnlockButton from "../_components/lead-unlock-button"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Eye,
  DollarSign,
  Fuel,
  Settings,
  Car,
  Gauge,
  ShieldCheck,
  Lock,
  Tag,
} from "lucide-react"
import { formatBudget, timeAgo } from "@/lib/utils/cn"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface Props {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "seller") redirect("/dashboard")

  // Fetch the lead. Sellers can only read active requests via RLS.
  const { data: lead, error: leadError } = await supabase
    .from("car_requests")
    .select("*")
    .eq("id", id)
    .single()

  if (leadError || !lead) notFound()

  // Count this seller's view for the buyer's "sellers viewed" radar stat.
  // Fire-and-forget: the RPC (migrations/002) may not exist yet — ignore errors.
  await supabase.rpc("increment_request_views", { p_request_id: id }).then(
    () => undefined,
    () => undefined
  )

  // Check if this seller already unlocked this lead.
  const { data: existingUnlock } = await supabase
    .from("unlocked_leads")
    .select("id")
    .eq("request_id", id)
    .eq("seller_id", user.id)
    .maybeSingle()

  let conversationId: string | null = null
  if (existingUnlock) {
    const { data: conv } = await supabase
      .from("conversations")
      .select("id")
      .eq("request_id", id)
      .eq("seller_id", user.id)
      .maybeSingle()
    if (conv) conversationId = conv.id
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#0f1011]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-[15px] tracking-tight" style={{ fontWeight: 510 }}>
            Reverse<span className="text-[#7170ff]">Drive</span>
          </Link>
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
            style={{ fontWeight: 510 }}
          >
            <ArrowLeft size={14} /> Back to Leads
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="glass-card rounded-[14px] overflow-hidden">
          <div className="p-8">
            {/* Buyer header */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/[0.05]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#5e6ad2]/20 to-[#7170ff]/20 flex items-center justify-center shrink-0">
                <span className="text-[18px] text-[#7170ff]" style={{ fontWeight: 510 }}>B</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[16px] text-[#f7f8f8]" style={{ fontWeight: 510 }}>
                  Verified Buyer
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#62666d] mt-1">
                  <MapPin size={13} />
                  {lead.location_zip} · {lead.location_radius_miles}mi radius
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981] whitespace-nowrap">
                Active now
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl tracking-tight mb-2" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>
              {lead.make} {lead.model}
            </h1>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#8a8f98] mb-8">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> Posted {timeAgo(lead.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={13} /> {lead.view_count} sellers viewed
              </span>
            </div>

            {/* Spec grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <Spec label="Year" value={formatYear(lead.year_min, lead.year_max)} icon={Car} />
              <Spec label="Max Mileage" value={lead.mileage_max ? `${lead.mileage_max.toLocaleString()} mi` : "Any"} icon={Gauge} />
              <Spec label="Body Type" value={lead.body_type || "Any"} icon={Car} />
              <Spec label="Fuel" value={lead.fuel_type || "Any"} icon={Fuel} />
              <Spec label="Transmission" value={lead.transmission || "Any"} icon={Settings} />
              <Spec label="Payment" value={lead.payment_method || "Cash"} icon={Tag} />
            </div>

            {/* Budget */}
            <div className="rounded-[12px] border border-[#10b981]/15 bg-[#10b981]/[0.03] p-5 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] border border-[#10b981]/20 bg-[#10b981]/10 flex items-center justify-center">
                    <DollarSign size={20} className="text-[#10b981]" />
                  </div>
                  <div>
                    <div className="text-[12px] text-[#8a8f98]" style={{ fontWeight: 510 }}>Maximum Budget</div>
                    <div className="text-[13px] text-[#f7f8f8]" style={{ fontWeight: 510 }}>
                      {lead.payment_method === "financing" ? "Pre-approved financing" : "Cash / ready to buy"}
                    </div>
                  </div>
                </div>
                <span className="text-2xl text-[#10b981] tabular-nums" style={{ fontWeight: 510 }}>
                  {formatBudget(lead.max_budget)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="mb-8">
                <div className="text-[11px] text-[#62666d] uppercase tracking-wider mb-2" style={{ fontWeight: 510 }}>
                  Buyer Notes
                </div>
                <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-4 text-[14px] text-[#d0d6e0]">
                  {lead.notes}
                </div>
              </div>
            )}

            {/* Trust signals */}
            <div className="flex flex-wrap gap-3 mb-8">
              <TrustBadge icon={ShieldCheck} text="Buyer contact verified" />
              <TrustBadge icon={Lock} text="Info stays private until unlocked" />
            </div>
          </div>

          {/* Unlock section */}
          <div className="border-t border-white/[0.06] bg-white/[0.01] p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-[10px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center shrink-0">
                <DollarSign size={20} className="text-[#7170ff]" />
              </div>
              <div className="flex-1">
                <div className="text-[15px] text-[#f7f8f8] mb-1" style={{ fontWeight: 510 }}>
                  Unlock this lead for $9.99
                </div>
                <p className="text-[13px] text-[#8a8f98] leading-relaxed">
                  Get the buyer&apos;s full contact details and start a Deal Room chat. Only pay once per
                  lead — no subscription required.
                </p>
              </div>
            </div>
            <LeadUnlockButton
              requestId={id}
              alreadyUnlocked={!!existingUnlock}
              conversationId={conversationId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Spec({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-[10px] border border-white/[0.05] bg-white/[0.015] p-4">
      <div className="flex items-center gap-1.5 text-[11px] text-[#62666d] mb-1" style={{ fontWeight: 510 }}>
        <Icon size={11} /> {label}
      </div>
      <div className="text-[14px] text-[#f7f8f8] capitalize" style={{ fontWeight: 510 }}>{value}</div>
    </div>
  )
}

function TrustBadge({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-[#8a8f98] px-2.5 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
      <Icon size={11} /> {text}
    </span>
  )
}

function formatYear(min: number | null, max: number | null) {
  if (min && max) return `${min}–${max}`
  if (min) return `${min}+`
  if (max) return `Up to ${max}`
  return "Any"
}
