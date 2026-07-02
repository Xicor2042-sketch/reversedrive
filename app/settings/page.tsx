"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import AppNavbar from "@/components/shared/app-navbar"
import Link from "next/link"
import { Loader2, Save, User, Mail, Building2, Phone, ShieldCheck, AlertCircle, ArrowLeft, LogOut, Lock } from "lucide-react"

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [pw, setPw] = useState({ next: "", confirm: "" })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [form, setForm] = useState({
    display_name: "",
    email: "",
    phone: "",
    dealer_business_name: "",
    avatar_url: "",
    role: "buyer",
    is_dealer: false,
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const [{ data: profile }, { data: authUser }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.auth.getUser(),
      ])

      if (profile) {
        setForm({
          display_name: profile.display_name || "",
          email: authUser.user?.email || "",
          phone: profile.phone || "",
          dealer_business_name: profile.dealer_business_name || "",
          avatar_url: profile.avatar_url || "",
          role: profile.role || "buyer",
          is_dealer: !!profile.is_dealer,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name.trim(),
        phone: form.phone.trim() || null,
        dealer_business_name: form.dealer_business_name.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
        is_dealer: form.is_dealer,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      setMessage({ type: "error", text: error.message })
    } else {
      setMessage({ type: "success", text: "Profile updated successfully." })
    }
    setSaving(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const switchRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const nextRole = form.role === "buyer" ? "seller" : "buyer"
    setSaving(true)
    setMessage(null)
    const { error } = await supabase
      .from("profiles")
      .update({ role: nextRole, updated_at: new Date().toISOString() })
      .eq("id", user.id)
    setSaving(false)
    if (error) {
      setMessage({ type: "error", text: error.message })
    } else {
      setForm({ ...form, role: nextRole })
      setMessage({ type: "success", text: `You're now in ${nextRole} mode.` })
      router.refresh()
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg(null)
    if (pw.next.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters." })
      return
    }
    if (pw.next !== pw.confirm) {
      setPwMsg({ type: "error", text: "Passwords do not match." })
      return
    }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pw.next })
    setPwSaving(false)
    if (error) {
      setPwMsg({ type: "error", text: error.message })
    } else {
      setPwMsg({ type: "success", text: "Password updated successfully." })
      setPw({ next: "", confirm: "" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090a] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#5e6ad2]" size={28} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <AppNavbar role={(form.role as any) || "buyer"} />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors mb-6"
          style={{ fontWeight: 510 }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl tracking-tight mb-2" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>Account Settings</h1>
          <p className="text-sm text-[#8a8f98]">Manage your profile and preferences.</p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-[10px] border px-4 py-3 text-[13px] flex items-start gap-2 ${
              message.type === "error"
                ? "border-[#ef4444]/20 bg-[#ef4444]/5 text-[#ef4444]"
                : "border-[#10b981]/20 bg-[#10b981]/5 text-[#10b981]"
            }`}
          >
            {message.type === "error" ? <AlertCircle size={15} className="shrink-0 mt-0.5" /> : <ShieldCheck size={15} className="shrink-0 mt-0.5" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={save} className="space-y-6">
          <div className="glass-card rounded-[14px] p-6">
            <h2 className="text-[15px] mb-5" style={{ fontWeight: 510 }}>Profile</h2>

            <div className="space-y-4">
              <Field label="Display Name" icon={User}>
                <input
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e6ad2]/50 focus:outline-none transition-all"
                  required
                />
              </Field>

              <Field label="Email" icon={Mail}>
                <input
                  value={form.email}
                  disabled
                  className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#62666d] cursor-not-allowed"
                />
              </Field>

              <Field label="Phone" icon={Phone}>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Used for verified chat and calls"
                  className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e6ad2]/50 focus:outline-none transition-all"
                />
              </Field>

              <Field label="Business / Dealership Name" icon={Building2}>
                <input
                  value={form.dealer_business_name}
                  onChange={(e) => setForm({ ...form, dealer_business_name: e.target.value })}
                  placeholder="Dealer or business name (optional)"
                  className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e6ad2]/50 focus:outline-none transition-all"
                />
              </Field>

              <Field label="Avatar URL" icon={User}>
                <input
                  value={form.avatar_url}
                  onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                  placeholder="https://... (optional)"
                  className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e6ad2]/50 focus:outline-none transition-all"
                />
              </Field>

              {form.role === "seller" && (
                <label className="flex items-center gap-3 rounded-[8px] border border-white/[0.06] bg-white/[0.02] p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_dealer}
                    onChange={(e) => setForm({ ...form, is_dealer: e.target.checked })}
                    className="accent-[#5e6ad2] h-4 w-4"
                  />
                  <div>
                    <div className="text-[13px]" style={{ fontWeight: 510 }}>I am a licensed dealer</div>
                    <div className="text-[12px] text-[#8a8f98]">Adds a verified dealer badge to your profile.</div>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="glass-card rounded-[14px] p-6">
            <h2 className="text-[15px] mb-4" style={{ fontWeight: 510 }}>Account Type</h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[14px] text-[#d0d6e0] capitalize mb-1" style={{ fontWeight: 510 }}>{form.role}</div>
                <p className="text-[13px] text-[#8a8f98]">
                  {form.role === "buyer"
                    ? "You are looking to buy a car."
                    : "You sell cars and unlock buyer leads."}
                </p>
              </div>
              <button
                type="button"
                onClick={switchRole}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-[6px] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] px-4 py-2 text-[13px] text-[#d0d6e0] transition-all disabled:opacity-60"
                style={{ fontWeight: 510 }}
              >
                Switch to {form.role === "buyer" ? "Seller" : "Buyer"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 text-[13px] text-[#ef4444] hover:text-[#ff6b6b] transition-colors"
              style={{ fontWeight: 510 }}
            >
              <LogOut size={15} /> Sign Out
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] px-5 py-2.5 text-[13px] text-white transition-all disabled:opacity-60"
              style={{ fontWeight: 510 }}
            >
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : (
                <><Save size={16} /> Save Changes</>
              )}
            </button>
          </div>
        </form>

        <form onSubmit={changePassword} className="mt-6 glass-card rounded-[14px] p-6 space-y-4">
          <div>
            <h2 className="text-[15px]" style={{ fontWeight: 510 }}>Change Password</h2>
            <p className="text-[13px] text-[#8a8f98] mt-1">Set a new password for your account.</p>
          </div>
          {pwMsg && (
            <div
              className={`rounded-[10px] border px-4 py-3 text-[13px] flex items-start gap-2 ${
                pwMsg.type === "error"
                  ? "border-[#ef4444]/20 bg-[#ef4444]/5 text-[#ef4444]"
                  : "border-[#10b981]/20 bg-[#10b981]/5 text-[#10b981]"
              }`}
            >
              {pwMsg.type === "error" ? <AlertCircle size={15} className="shrink-0 mt-0.5" /> : <ShieldCheck size={15} className="shrink-0 mt-0.5" />}
              <span>{pwMsg.text}</span>
            </div>
          )}
          <Field label="New Password" icon={Lock}>
            <input
              type="password"
              minLength={6}
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              placeholder="At least 6 characters"
              className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e6ad2]/50 focus:outline-none transition-all"
            />
          </Field>
          <Field label="Confirm New Password" icon={Lock}>
            <input
              type="password"
              minLength={6}
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              placeholder="Re-enter new password"
              className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e6ad2]/50 focus:outline-none transition-all"
            />
          </Field>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwSaving}
              className="inline-flex items-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] px-5 py-2.5 text-[13px] text-white transition-all disabled:opacity-60"
              style={{ fontWeight: 510 }}
            >
              {pwSaving ? (
                <><Loader2 size={16} className="animate-spin" /> Updating...</>
              ) : (
                <><Lock size={15} /> Update Password</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[13px] text-[#d0d6e0] mb-2" style={{ fontWeight: 510 }}>
        <Icon size={13} className="text-[#62666d]" />
        {label}
      </label>
      {children}
    </div>
  )
}
