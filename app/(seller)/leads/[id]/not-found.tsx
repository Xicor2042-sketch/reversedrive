import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"

export default function LeadNotFound() {
  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex items-center justify-center px-6" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <div className="max-w-sm text-center">
        <div className="w-14 h-14 rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center mx-auto mb-6">
          <Search size={24} className="text-[#7170ff]" />
        </div>
        <h1 className="text-xl tracking-tight mb-3" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>Lead not found</h1>
        <p className="text-[14px] text-[#8a8f98] mb-6">
          This lead may have expired, been closed by the buyer, or the link might be incorrect.
        </p>
        <Link
          href="/leads"
          className="inline-flex items-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] px-5 py-2.5 text-[13px] text-white transition-all"
          style={{ fontWeight: 510 }}
        >
          <ArrowLeft size={14} /> Back to Lead Board
        </Link>
      </div>
    </div>
  )
}
