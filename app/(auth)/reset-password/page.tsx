"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Lock, Mail, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

// Mirrors app/(auth)/forgot-password: true once the Supabase recovery email
// template contains {{ .Token }} so users actually receive a 6-digit code.
const OTP_EMAIL_ENABLED = process.env.NEXT_PUBLIC_RESET_OTP === "true";

function ResetPasswordInner() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const initialEmail = params.get("email") ?? "";
  const codeParam = params.get("code");

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // "link" = arrived via the emailed magic link and the session is established,
  // so only the new password is needed. "otp" = type the emailed 6-digit code.
  const [linkSession, setLinkSession] = useState(false);
  const [checkingLink, setCheckingLink] = useState(Boolean(codeParam));

  useEffect(() => {
    if (!codeParam) return;
    let cancelled = false;
    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(codeParam);
      if (cancelled) return;
      if (!error) {
        setLinkSession(true);
        setCheckingLink(false);
        return;
      }
      // The client may have auto-exchanged the code on page load, in which
      // case a recovery session already exists even though our call failed.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        setLinkSession(true);
      } else {
        setError(
          OTP_EMAIL_ENABLED
            ? "That reset link is invalid or was already used. Enter the code from your email below, or request a new reset email."
            : "That reset link is invalid or was already used. Please request a new reset email and open it as soon as it arrives."
        );
      }
      setCheckingLink(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeParam]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!linkSession && !email.trim()) {
      setError("Enter your email.");
      return;
    }
    if (!linkSession && code.trim().length < 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    if (pw.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (pw !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);

    if (!linkSession) {
      // 1. Verify the recovery code — establishes a session for this user.
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "recovery",
      });
      if (otpError) {
        setSaving(false);
        const m = otpError.message.toLowerCase();
        if (m.includes("expire") || m.includes("invalid") || m.includes("token") || m.includes("code")) {
          setError("That code is invalid or expired. Please request a new one.");
        } else {
          setError(otpError.message);
        }
        return;
      }
    }

    // 2. Update the password using the recovery session.
    const { error: updError } = await supabase.auth.updateUser({ password: pw });
    if (updError) {
      setSaving(false);
      setError(updError.message);
      return;
    }

    // 3. Sign out of the recovery session, send to login.
    await supabase.auth.signOut();
    setSaving(false);
    setDone(true);
    setTimeout(() => router.push("/login?message=password-reset"), 1500);
  };

  const shell = (children: React.ReactNode) => (
    <div
      className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex flex-col items-center justify-center px-4 py-12 antialiased"
      style={{ fontFeatureSettings: '"cv01", "ss03"' }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 h-[520px] w-[720px] rounded-full bg-[#5e6ad2]/12 blur-[140px]" />
      </div>
      <div className="relative w-full max-w-[400px]">
        <Link href="/login" className="mb-8 block text-center">
          <span className="text-xl tracking-tight" style={{ fontWeight: 510 }}>
            Reverse<span className="text-[#7170ff]">Drive</span>
          </span>
        </Link>
        <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-8 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.5)]">
          {children}
        </div>
      </div>
    </div>
  );

  // No emailed code exists yet (default link template) and no valid link
  // session — the code form would be a dead end, so point back to the email.
  if (!OTP_EMAIL_ENABLED && !linkSession && !checkingLink && !done) {
    return shell(
      <div className="flex flex-col items-center text-center py-6">
        <AlertCircle size={26} className="text-[#f59e0b] mb-3" />
        <h1 className="text-[22px] tracking-tight mb-2" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>
          {error ? "Reset link didn't work" : "Check your email"}
        </h1>
        <p className="text-[13px] text-[#8a8f98] mb-6 max-w-[300px]">
          {error ??
            "Open the password reset link from your email on this device. If you haven't requested one yet, do that first."}
        </p>
        <Link
          href="/forgot-password"
          className="flex h-10 items-center justify-center rounded-[10px] bg-[#5e6ad2] px-5 text-[13px] text-white transition-all hover:bg-[#7170ff]"
          style={{ fontWeight: 510 }}
        >
          Request a reset email
        </Link>
      </div>
    );
  }

  if (checkingLink) {
    return shell(
      <div className="flex flex-col items-center text-center py-6">
        <Loader2 size={24} className="animate-spin text-[#5e6ad2] mb-3" />
        <p className="text-[13px] text-[#8a8f98]">Verifying your reset link…</p>
      </div>
    );
  }

  if (done) {
    return shell(
      <div className="flex flex-col items-center text-center py-6">
        <CheckCircle2 size={28} className="text-[#10b981] mb-3" />
        <h1 className="text-[22px] tracking-tight mb-2" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>
          Password updated
        </h1>
        <p className="text-[13px] text-[#8a8f98]">You can now sign in with your new password. Redirecting…</p>
      </div>
    );
  }

  return shell(
    <>
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
        style={{ fontWeight: 510 }}
      >
        <ArrowLeft size={14} /> Back to sign in
      </Link>
      <div className="mb-6">
        <h1 className="text-[26px] leading-tight tracking-tight" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>
          Set new password
        </h1>
        <p className="mt-2 text-[15px] text-[#8a8f98]">
          {linkSession
            ? "Choose a new password for your account."
            : "Enter the 6-digit code we sent to your email, then choose a new password."}
        </p>
      </div>
      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-[10px] border border-[#ef4444]/25 bg-[#ef4444]/8 px-4 py-3 text-[13px] text-[#ef4444]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        {!linkSession && (
        <>
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
              disabled={saving}
              placeholder="you@example.com"
              className="h-11 w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#7170ff]/40 focus:outline-none focus:ring-2 focus:ring-[#7170ff]/10 disabled:opacity-50"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>
            Reset code
          </label>
          <div className="relative">
            <KeyRound size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d]" />
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
              disabled={saving}
              placeholder="6-digit code"
              className="h-11 w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-[14px] tracking-[4px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#7170ff]/40 focus:outline-none focus:ring-2 focus:ring-[#7170ff]/10 disabled:opacity-50"
            />
          </div>
          <p className="mt-2 text-[12px] text-[#62666d]">
            Didn&apos;t get it?{" "}
            <Link href="/forgot-password" className="text-[#8a8f98] hover:text-[#f7f8f8] underline underline-offset-2">
              Resend code
            </Link>
          </p>
        </div>
        </>
        )}
        <div>
          <label className="mb-2 block text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>
            New password
          </label>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d]" />
            <input
              type="password"
              required
              minLength={6}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              disabled={saving}
              placeholder="At least 6 characters"
              className="h-11 w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#7170ff]/40 focus:outline-none focus:ring-2 focus:ring-[#7170ff]/10 disabled:opacity-50"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>
            Confirm password
          </label>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d]" />
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={saving}
              placeholder="Re-enter new password"
              className="h-11 w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#7170ff]/40 focus:outline-none focus:ring-2 focus:ring-[#7170ff]/10 disabled:opacity-50"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#5e6ad2] px-4 text-[14px] text-white shadow-[0_0_24px_-6px_rgba(94,106,210,0.45)] transition-all hover:bg-[#7170ff] active:scale-[0.995] disabled:opacity-60"
          style={{ fontWeight: 510 }}
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Updating…</>
          ) : (
            <>Update password</>
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090a] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#5e6ad2]" size={28} />
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}