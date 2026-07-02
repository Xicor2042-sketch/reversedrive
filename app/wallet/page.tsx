"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import AppNavbar from "@/components/shared/app-navbar"
import { Loader2, Wallet, ArrowLeft, CreditCard, ShieldCheck, AlertCircle, CheckCircle2, DollarSign, RefreshCw } from "lucide-react"

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000]

function WalletPageContent() {
  const searchParams = useSearchParams()
  const success = searchParams.get("success") === "true"
  const canceled = searchParams.get("canceled") === "true"

  const [amount, setAmount] = useState(500)
  const [custom, setCustom] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(success)

  const selectedAmount = custom ? Number(custom) : amount

  const deposit = async () => {
    if (!selectedAmount || selectedAmount < 5) {
      setError("Minimum deposit is $5")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/stripe/wallet-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedAmount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Checkout failed")
      if (data.demo) {
        setShowSuccess(true)
        setRefreshBalance((v) => v + 1)
        setLoading(false)
        return
      }
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setError(err.message || "Failed to start deposit")
      setLoading(false)
    }
  }

  const [refreshBalance, setRefreshBalance] = useState(0)

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <AppNavbar role="buyer" />
      <div className="max-w-xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors mb-6"
          style={{ fontWeight: 510 }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl tracking-tight mb-2" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>Wallet &amp; Escrow</h1>
          <p className="text-sm text-[#8a8f98]">Add money securely to show sellers you&apos;re ready to buy.</p>
        </div>

        {showSuccess && (
          <div className="mb-6 rounded-[10px] border border-[#10b981]/20 bg-[#10b981]/5 px-4 py-3 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-[#10b981] shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] text-[#f7f8f8]" style={{ fontWeight: 510 }}>Deposit successful</p>
              <p className="text-[13px] text-[#8a8f98]">Your wallet will update shortly. You can refresh the page.</p>
            </div>
          </div>
        )}

        {canceled && (
          <div className="mb-6 rounded-[10px] border border-[#f59e0b]/20 bg-[#f59e0b]/5 px-4 py-3 flex items-start gap-3">
            <AlertCircle size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />
            <p className="text-[14px] text-[#f7f8f8]">Deposit was canceled. You can try again.</p>
          </div>
        )}

        <div className="glass-card rounded-[14px] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[10px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center">
              <Wallet size={20} className="text-[#7170ff]" />
            </div>
            <div>
              <div className="text-[12px] text-[#62666d]" style={{ fontWeight: 510 }}>AVAILABLE BALANCE</div>
              <WalletBalance refresh={refreshBalance} />
            </div>
          </div>

          <div className="text-[13px] text-[#8a8f98] mb-6 leading-relaxed">
            Choose an amount to deposit. Funds stay in your wallet until you release them to a seller
            after inspecting the car. You control every dollar.
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setAmount(a)
                  setCustom("")
                }}
                className={`rounded-[8px] border px-3 py-3 text-[14px] transition-all ${
                  amount === a && !custom
                    ? "border-[#5e6ad2]/50 bg-[#5e6ad2]/10 text-[#7170ff]"
                    : "border-white/[0.08] bg-white/[0.02] text-[#f7f8f8] hover:border-white/[0.15]"
                }`}
                style={{ fontWeight: 510 }}
              >
                ${a.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-[12px] text-[#62666d] mb-2" style={{ fontWeight: 510 }}>CUSTOM AMOUNT</label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d]" />
              <input
                type="number"
                min={5}
                placeholder="Enter amount"
                value={custom}
                onChange={(e) => {
                  setCustom(e.target.value)
                  setAmount(0)
                }}
                className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e6ad2]/50 focus:outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-[8px] border border-[#ef4444]/20 bg-[#ef4444]/5 px-4 py-3 text-[13px] text-[#ef4444]">
              {error}
            </div>
          )}

          <button
            onClick={deposit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-[#5e6ad2] hover:bg-[#7170ff] py-3 text-[14px] text-white transition-all disabled:opacity-60"
            style={{ fontWeight: 510 }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Redirecting to Stripe...</>
            ) : (
              <><CreditCard size={18} /> Deposit ${selectedAmount > 0 ? selectedAmount.toLocaleString() : "—"}</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Trust icon={ShieldCheck} title="Held in escrow" desc="Money stays protected until you approve." />
          <Trust icon={CreditCard} title="Card or Apple Pay" desc="Stripe-powered secure checkout." />
          <Trust icon={RefreshCw} title="Refundable" desc="Cancel anytime before releasing funds." />
        </div>
      </div>
    </div>
  )
}

function WalletBalance({ refresh }: { refresh?: number }) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      const { data } = await supabase.from("buyer_wallets").select("balance").eq("id", user.id).maybeSingle()
      setBalance(data?.balance || 0)
      setLoading(false)
    }
    fetchBalance()
  }, [refresh])

  return (
    <div className="text-2xl tracking-tight tabular-nums" style={{ fontWeight: 510 }}>
      {loading ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(balance)}
    </div>
  )
}

function Trust({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-4">
      <Icon size={16} className="text-[#7170ff] mb-3" />
      <div className="text-[13px] text-[#f7f8f8] mb-1" style={{ fontWeight: 510 }}>{title}</div>
      <div className="text-[12px] text-[#8a8f98]">{desc}</div>
    </div>
  )
}

export default function WalletPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08090a] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#5e6ad2]" size={28} />
      </div>
    }>
      <WalletPageContent />
    </Suspense>
  )
}
