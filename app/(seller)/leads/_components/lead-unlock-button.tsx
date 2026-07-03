"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Unlock, ShieldCheck, Lock, CheckCircle2, ArrowLeft, CreditCard } from "lucide-react"

export default function LeadUnlockButton({
  requestId,
  alreadyUnlocked,
  conversationId,
}: {
  requestId: string
  alreadyUnlocked: boolean
  conversationId?: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [unlocked, setUnlocked] = useState(alreadyUnlocked)
  const [error, setError] = useState<string | null>(null)

  const handleUnlock = async () => {
    if (alreadyUnlocked || unlocked) {
      if (conversationId) router.push(`/deal-room/${conversationId}`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.alreadyUnlocked) {
          setUnlocked(true)
          setLoading(false)
          if (data.conversationId) router.push(`/deal-room/${data.conversationId}`)
          return
        }
        throw new Error(data.error || "Failed to start checkout")
      }

      if (data.demo) {
        setUnlocked(true)
        if (data.conversationId) {
          router.push(`/deal-room/${data.conversationId}`)
        }
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  if (unlocked || alreadyUnlocked) {
    return (
      <div className="space-y-4">
        <div className="rounded-[10px] border border-[#10b981]/20 bg-[#10b981]/5 p-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-[#10b981] shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] text-[#f7f8f8]" style={{ fontWeight: 510 }}>
              Lead unlocked
            </p>
            <p className="text-[13px] text-[#8a8f98] mt-1">
              You can now message the buyer in the Deal Room.
            </p>
          </div>
        </div>
        {conversationId ? (
          <Link
            href={`/deal-room/${conversationId}`}
            className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-[#5e6ad2] hover:bg-[#7170ff] py-3 text-[14px] text-white transition-all"
            style={{ fontWeight: 510 }}
          >
            Open Deal Room
            <ArrowLeft size={16} className="rotate-180" />
          </Link>
        ) : (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-white/[0.05] py-3 text-[14px] text-[#8a8f98] cursor-not-allowed"
            style={{ fontWeight: 510 }}
          >
            <CheckCircle2 size={18} />
            Already Unlocked
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-[8px] border border-[#ef4444]/20 bg-[#ef4444]/5 px-4 py-3 text-[13px] text-[#ef4444]">
          {error}
        </div>
      )}
      <button
        onClick={handleUnlock}
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-[8px] bg-[#5e6ad2] hover:bg-[#7170ff] py-3 text-[14px] text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontWeight: 510 }}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Redirecting to secure checkout...
            </>
          ) : (
            <>
              <Unlock size={18} />
              Unlock This Lead · $9.99
            </>
          )}
        </span>
      </button>
      <div className="flex items-center justify-center gap-5 text-[11px] text-[#62666d]">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={12} />
          Secure card payment
        </span>
        <span className="flex items-center gap-1.5">
          <Lock size={12} />
          Buyer info protected
        </span>
        <span className="flex items-center gap-1.5">
          <CreditCard size={12} />
          Stripe checkout
        </span>
      </div>
    </div>
  )
}
