"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

// When the Supabase recovery email template contains {{ .Token }} (6-digit
// code — needs a paid plan or custom SMTP to edit), set NEXT_PUBLIC_RESET_OTP
// =true and this page routes users to the code-entry form. Until then the
// default email contains a one-time link, so we show "check your email".
const OTP_EMAIL_ENABLED = process.env.NEXT_PUBLIC_RESET_OTP === "true";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (OTP_EMAIL_ENABLED) {
      router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="text-[#f7f8f8] antialiased">
      {/* The (auth) layout renders the page shell + logo */}
      <div className="relative w-full max-w-[400px] mx-auto">
        <div className="glass-card rounded-[14px] p-8 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.5)]">
          <Link
            href="/login"
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
            style={{ fontWeight: 510 }}
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>

          <div className="mb-6">
            <h1
              className="text-[26px] leading-tight tracking-tight"
              style={{ fontWeight: 510, letterSpacing: "-0.02em" }}
            >
              Reset password
            </h1>
            <p className="mt-2 text-[15px] text-[#8a8f98]">
              {OTP_EMAIL_ENABLED
                ? "Enter your email and we'll send you a 6-digit code to set a new password."
                : "Enter your email and we'll send you a link to set a new password."}
            </p>
          </div>

          {sent && (
            <div className="mb-6 flex items-start gap-2.5 rounded-[10px] border border-[#10b981]/25 bg-[#10b981]/8 px-4 py-3 text-[13px] text-[#10b981]">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>
                Check your email — if an account exists for {email.trim()}, a reset
                link is on its way. Open it on this device. If the link says it
                expired, request a new one and click it as soon as it arrives.
              </span>
            </div>
          )}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-[10px] border border-[#ef4444]/25 bg-[#ef4444]/8 px-4 py-3 text-[13px] text-[#ef4444]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#7170ff]/40 focus:outline-none focus:ring-2 focus:ring-[#7170ff]/10 disabled:opacity-50"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#5e6ad2] px-4 text-[14px] text-white shadow-[0_0_24px_-6px_rgba(94,106,210,0.45)] transition-all hover:bg-[#7170ff] active:scale-[0.995] disabled:opacity-60"
              style={{ fontWeight: 510 }}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Sending…</>
              ) : (
                <>{sent ? "Resend email" : OTP_EMAIL_ENABLED ? "Send reset code" : "Send reset link"}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}