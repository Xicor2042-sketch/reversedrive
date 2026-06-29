import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex items-center justify-center px-6" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <div className="max-w-sm text-center">
        <div className="text-[64px] leading-none mb-4 tracking-tighter" style={{ fontWeight: 510 }}>404</div>
        <h1 className="text-xl tracking-tight mb-3" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>Page not found</h1>
        <p className="text-[14px] text-[#8a8f98] mb-6">The page you’re looking for doesn’t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] px-5 py-2.5 text-[13px] text-white transition-all"
          style={{ fontWeight: 510 }}
        >
          <ArrowLeft size={14} /> Back Home
        </Link>
      </div>
    </div>
  )
}
