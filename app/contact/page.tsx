import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "raaerjeamllaul@gmail.com"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] px-6 py-24" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
          style={{ fontWeight: 510 }}
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="text-3xl tracking-tight mb-6" style={{ fontWeight: 510 }}>Contact us</h1>
        <p className="text-[#8a8f98] mb-8 leading-relaxed">
          Questions about a request, an unlock, or your wallet? We read every
          message and reply as fast as we can — usually the same day.
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=ReverseDrive%20support`}
          className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#5e6ad2] px-5 text-[14px] text-white shadow-[0_0_24px_-6px_rgba(94,106,210,0.45)] transition-all hover:bg-[#7170ff]"
          style={{ fontWeight: 510 }}
        >
          <Mail size={16} /> Email support
        </a>
        <p className="mt-4 text-[13px] text-[#62666d]">{SUPPORT_EMAIL}</p>
      </div>
    </div>
  )
}
