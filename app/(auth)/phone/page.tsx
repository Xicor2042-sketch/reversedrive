"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Phone, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

export default function PhoneLoginWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#08090a]"><Loader2 className="animate-spin text-[#5e6ad2]" size={28} /></div>}>
      <PhoneLoginPage />
    </Suspense>
  );
}

function PhoneLoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setStep("otp");
      setLoading(false);
    } catch (err) {
      setError("Failed to send code. Please try again.");
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Get user role and redirect
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "seller") {
          router.push("/leads");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError("Invalid code. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex flex-col items-center justify-center px-6" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[#5e6ad2]/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <Link href="/" className="block text-center mb-10">
          <span className="text-xl font-medium tracking-tight" style={{ fontWeight: 510 }}>
            Reverse<span className="text-[#7170ff]">Drive</span>
          </span>
        </Link>

        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center gap-1 text-[13px] text-[#62666d] hover:text-[#f7f8f8] transition-colors mb-4">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
          <h1 className="text-2xl tracking-tight" style={{ fontWeight: 510, letterSpacing: '-0.02em' }}>
            {step === "phone" ? "Phone Login" : "Enter Code"}
          </h1>
          <p className="text-sm text-[#8a8f98] mt-2">
            {step === "phone"
              ? "We'll send you a verification code via SMS"
              : `We sent a 6-digit code to ${phone}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-[8px] border border-[#ef4444]/20 bg-[#ef4444]/5 px-4 py-3 text-sm text-[#ef4444]">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-[13px] text-[#d0d6e0] mb-2" style={{ fontWeight: 510 }}>
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d] pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  placeholder="+1 (555) 123-4567"
                  className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all focus:border-[#5e6ad2]/50 focus:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/20 disabled:opacity-50"
                />
              </div>
              <p className="text-[11px] text-[#62666d] mt-2">
                Include country code (e.g. +1 for US)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] py-2.5 text-[14px] text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontWeight: 510 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  Send Code
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label className="block text-[13px] text-[#d0d6e0] mb-2" style={{ fontWeight: 510 }}>
                Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
                placeholder="123456"
                className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 px-4 text-[20px] text-center text-[#f7f8f8] placeholder-[#62666d] tracking-[0.5em] tabular-nums transition-all focus:border-[#5e6ad2]/50 focus:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/20 disabled:opacity-50"
                style={{ fontWeight: 510 }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || token.length !== 6}
              className="w-full flex items-center justify-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] py-2.5 text-[14px] text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontWeight: 510 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-center text-[13px] text-[#62666d] hover:text-[#f7f8f8] transition-colors"
              style={{ fontWeight: 510 }}
            >
              Use a different phone number
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-[13px] text-[#8a8f98]">
          Prefer another method?{" "}
          <Link href="/login" className="text-[#7170ff] hover:text-[#828fff] transition-colors" style={{ fontWeight: 510 }}>
            Sign in with email
          </Link>
        </p>
      </div>
    </div>
  );
}