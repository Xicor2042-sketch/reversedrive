"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Filter,
  Search,
  Eye,
  Calendar,
  DollarSign,
  Fuel,
  ArrowUpDown,
  Settings2,
  ArrowRight,
  Loader2,
  SlidersHorizontal,
  Car,
  Gauge,
  BadgeCheck,
  Inbox,
} from "lucide-react"
import { formatBudget, timeAgo } from "@/lib/utils/cn"

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

const pageEnter = `
  @keyframes page-enter {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const cardStagger = `
  .lead-card {
    opacity: 0;
    transform: translateY(12px);
    animation: card-enter 0.35s ease-out forwards;
    animation-delay: calc(var(--stagger-index) * 40ms);
  }
  @keyframes card-enter {
    to { opacity: 1; transform: translateY(0); }
  }
`

export default function LeadBoard() {
  const supabase = createClient()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMake, setFilterMake] = useState("")
  const [filterMinBudget, setFilterMinBudget] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "highest_budget">("newest")

  useEffect(() => {
    fetchLeads()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    let query = supabase
      .from("car_requests")
      .select("*")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())

    if (filterMake) {
      query = query.ilike("make", `%${filterMake}%`)
    }
    if (filterMinBudget) {
      query = query.gte("max_budget", parseFloat(filterMinBudget))
    }

    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false })
    } else {
      query = query.order("max_budget", { ascending: false })
    }

    const { data, error } = await query.limit(50)

    if (error) {
      console.error("Error fetching leads:", error)
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen bg-[#08090a] text-[#f7f8f8] antialiased"
      style={{ fontFeatureSettings: '"cv01", "ss03"' }}
    >
      <style>{`${pageEnter}\n${cardStagger}`}</style>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#08090a]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-[56px] flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-[15px] tracking-tight text-[#f7f8f8] hover:opacity-80 transition-opacity"
            style={{ fontWeight: 510 }}
          >
            Reverse<span className="text-[#7170ff]">Drive</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/leads" label="Lead Board" active />
            <NavLink href="/conversations" label="Messages" />
          </div>
          <Link
            href="/dashboard"
            className="text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
            style={{ fontWeight: 510 }}
          >
            Back
          </Link>
        </div>
      </nav>

      <main
        className="max-w-7xl mx-auto px-6 py-10"
        style={{
          animation: "page-enter 0.4s ease-out forwards",
        }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-[3px] rounded-full bg-[#5e6ad2]" />
            <h1
              className="text-[26px] tracking-tight text-[#f7f8f8]"
              style={{ fontWeight: 510, letterSpacing: "-0.02em" }}
            >
              Lead Board
            </h1>
          </div>
          <p className="text-[13px] text-[#8a8f98] pl-5">
            {loading
              ? "Loading active leads..."
              : `${leads.length} active ${leads.length === 1 ? "lead" : "leads"} available now`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-[12px] border border-white/[0.06] bg-white/[0.015] p-1.5 flex flex-wrap items-center gap-1.5">
          <div className="relative flex-1 min-w-[180px] max-w-[260px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62666d] pointer-events-none"
            />
            <input
              placeholder="Filter by make (e.g. Toyota)"
              value={filterMake}
              onChange={(e) => setFilterMake(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchLeads()}
              className="w-full rounded-[8px] border border-white/[0.06] bg-white/[0.02] py-2 pl-9 pr-3 text-[13px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e6ad2]/50 focus:bg-white/[0.03] focus:outline-none transition-all"
            />
          </div>
          <div className="relative flex-1 min-w-[160px] max-w-[200px]">
            <DollarSign
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62666d] pointer-events-none"
            />
            <input
              placeholder="Min budget"
              type="number"
              min="0"
              value={filterMinBudget}
              onChange={(e) => setFilterMinBudget(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchLeads()}
              className="w-full rounded-[8px] border border-white/[0.06] bg-white/[0.02] py-2 pl-9 pr-3 text-[13px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e6ad2]/50 focus:bg-white/[0.03] focus:outline-none transition-all"
            />
          </div>
          <div className="relative">
            <ArrowUpDown
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62666d] pointer-events-none"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "highest_budget")}
              className="appearance-none rounded-[8px] border border-white/[0.06] bg-white/[0.02] py-2 pl-9 pr-8 text-[13px] text-[#f7f8f8] focus:border-[#5e6ad2]/50 focus:outline-none cursor-pointer transition-all hover:bg-white/[0.03]"
            >
              <option value="newest">Newest first</option>
              <option value="highest_budget">Highest budget</option>
            </select>
            <SlidersHorizontal
              size={12}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#62666d] pointer-events-none"
            />
          </div>
          <button
            onClick={fetchLeads}
            className="ml-auto inline-flex items-center gap-2 rounded-[8px] bg-[#5e6ad2] hover:bg-[#7170ff] px-3.5 py-2 text-[13px] text-white transition-colors"
            style={{ fontWeight: 510 }}
          >
            <Filter size={13} />
            Apply
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.015] flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="text-[#5e6ad2] animate-spin" size={24} />
            <p className="text-[13px] text-[#8a8f98]">Loading active leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.015] px-8 py-20 text-center">
            <div className="mx-auto mb-5 h-12 w-12 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Inbox size={22} className="text-[#5e6ad2]" />
            </div>
            <p
              className="text-[16px] text-[#d0d6e0] mb-1"
              style={{ fontWeight: 510 }}
            >
              No active leads match your filters
            </p>
            <p className="text-[13px] text-[#62666d] max-w-xs mx-auto">
              Try loosening your filters or come back later when new buyers post requests.
            </p>
            <button
              onClick={() => {
                setFilterMake("")
                setFilterMinBudget("")
                setSortBy("newest")
                fetchLeads()
              }}
              className="mt-5 inline-flex items-center gap-1.5 rounded-[8px] border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] px-3.5 py-2 text-[13px] text-[#d0d6e0] transition-all"
              style={{ fontWeight: 510 }}
            >
              <Settings2 size={13} />
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {leads.map((lead, index) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={index}
                onView={() => router.push(`/leads/${lead.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-[6px] text-[13px] transition-all ${
        active
          ? "text-[#f7f8f8] bg-white/[0.06]"
          : "text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-white/[0.03]"
      }`}
      style={{ fontWeight: 510 }}
    >
      {label}
    </Link>
  )
}

function LeadCard({
  lead,
  index,
  onView,
}: {
  lead: Lead
  index: number
  onView: () => void
}) {
  const budgetTag =
    lead.payment_method === "financing"
      ? "Pre-approved financing"
      : lead.payment_method && lead.payment_method !== "cash"
      ? "Flexible payment"
      : null

  const yearDisplay = lead.year_min && lead.year_max
    ? `${lead.year_min}–${lead.year_max}`
    : lead.year_min
    ? `${lead.year_min}+`
    : "Any year"

  return (
    <div
      onClick={onView}
      className="lead-card group relative rounded-[12px] border border-white/[0.06] bg-[#0c0d0e] hover:bg-white/[0.03] hover:border-white/[0.12] p-5 cursor-pointer transition-all duration-200"
      style={{ ["--stagger-index" as any]: index }}
    >
      {/* Accent line */}
      <div className="absolute left-0 top-5 bottom-5 w-[2px] rounded-full bg-[#5e6ad2]/0 group-hover:bg-[#5e6ad2]/60 transition-colors" />

      {/* Buyer row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-[#5e6ad2]/20 to-[#7170ff]/10 border border-white/[0.06] flex items-center justify-center">
            <Car size={16} className="text-[#7170ff]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>
              <span className="blur-[2px] select-none">Verified Buyer</span>
              <BadgeCheck size={13} className="text-[#5e6ad2] shrink-0" />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#62666d] mt-0.5 truncate">
              <MapPin size={10} />
              <span className="truncate">
                {lead.location_zip} · {lead.location_radius_miles}mi radius
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle headline */}
      <h3
        className="text-[17px] text-[#f7f8f8] mb-1 truncate"
        style={{ fontWeight: 510, letterSpacing: "-0.01em" }}
      >
        {lead.make} {lead.model}
      </h3>
      <p className="text-[12px] text-[#8a8f98] mb-4 leading-relaxed line-clamp-2">
        {yearDisplay}
        {lead.mileage_max && ` · Under ${lead.mileage_max.toLocaleString()} miles`}
        {lead.body_type && lead.body_type !== "any" && ` · ${capitalize(lead.body_type)}`}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {lead.fuel_type && lead.fuel_type !== "any" && (
          <Tag icon={<Fuel size={10} />} label={capitalize(lead.fuel_type)} />
        )}
        {lead.transmission && lead.transmission !== "any" && (
          <Tag icon={<Settings2 size={10} />} label={capitalize(lead.transmission)} />
        )}
        {lead.mileage_max && (
          <Tag icon={<Gauge size={10} />} label={`${(lead.mileage_max / 1000).toFixed(0)}k mi max`} />
        )}
      </div>

      {/* Budget */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#62666d] mb-0.5" style={{ fontWeight: 510 }}>
            Max Budget
          </div>
          <div
            className="text-[20px] text-[#f7f8f8] tabular-nums tracking-tight"
            style={{ fontWeight: 510 }}
          >
            {formatBudget(lead.max_budget)}
          </div>
        </div>
        {budgetTag && (
          <span
            className="text-[10px] px-2.5 py-1 rounded-full border border-[#5e6ad2]/25 bg-[#5e6ad2]/10 text-[#a2a3ff]"
            style={{ fontWeight: 510 }}
          >
            {budgetTag}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-3 text-[11px] text-[#62666d]">
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {timeAgo(lead.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={10} />
            {lead.view_count} view{lead.view_count === 1 ? "" : "s"}
          </span>
        </div>
        <span
          className="text-[12px] text-[#7170ff] inline-flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ fontWeight: 510 }}
        >
          View lead
          <ArrowRight size={12} />
        </span>
      </div>
    </div>
  )
}

function Tag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-[6px] border border-white/[0.06] bg-white/[0.025] text-[#8a8f98]"
      style={{ fontWeight: 510 }}
    >
      {icon}
      {label}
    </span>
  )
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
