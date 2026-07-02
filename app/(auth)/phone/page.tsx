"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  Phone,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

export default function PhoneLoginWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#08090a]">
          <Loader2 className="animate-spin text-[#5e6ad2]" size={28} />
        </div>
      }
    >
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
    <div className="text-[#f7f8f8] antialiased">
      {/* The (auth) layout renders the page shell + logo */}
      <div className="relative w-full max-w-[400px] mx-auto">

        <div className="glass-card rounded-[14px] p-8 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.5)]">
          <div className="mb-8">
            <Link
              href="/login"
              className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-[#62666d] transition-colors hover:text-[#f7f8f8]"
              style={{ fontWeight: 510 }}
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.03]">
                {step === "phone" ? (
                  <MessageSquare size={18} className="text-[#7170ff]" />
                ) : (
                  <ShieldCheck size={18} className="text-[#7170ff]" />
                )}
              </div>
              <div>
                <h1
                  className="text-[24px] leading-tight tracking-tight"
                  style={{ fontWeight: 510, letterSpacing: "-0.02em" }}
                >
                  {step === "phone" ? "Phone sign in" : "Enter the code"}
                </h1>
                <p className="text-[14px] text-[#8a8f98]">
                  {step === "phone"
                    ? "We’ll send you a one-time verification code"
                    : `We texted a code to ${phone}`}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2">
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step === "phone" ? "bg-[#7170ff]" : "bg-[#5e6ad2]"
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step === "otp" ? "bg-[#7170ff]" : "bg-white/[0.06]"
              }`}
            />
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-[10px] border border-[#ef4444]/25 bg-[#ef4444]/8 px-4 py-3 text-[13px] text-[#ef4444]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label
                  className="mb-2 block text-[13px] text-[#d0d6e0]"
                  style={{ fontWeight: 510 }}
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d]"
                  />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    placeholder="+1 (555) 123-4567"
                    className="h-11 w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all focus:border-[#7170ff]/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7170ff]/10 disabled:opacity-50"
                  />
                </div>
                <p className="mt-2 text-[12px] text-[#62666d]">
                  Include country code (e.g. +1 for US)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#5e6ad2] px-4 text-[14px] text-white shadow-[0_0_24px_-6px_rgba(94,106,210,0.45)] transition-all hover:bg-[#7170ff] hover:shadow-[0_0_28px_-4px_rgba(113,112,255,0.55)] active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-60"
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
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label
                  className="mb-2 block text-[13px] text-[#d0d6e0]"
                  style={{ fontWeight: 510 }}
                >
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
                  autoFocus
                  className="h-14 w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 text-center text-[22px] tracking-[0.55em] text-[#f7f8f8] placeholder-[#62666d] tabular-nums transition-all focus:border-[#7170ff]/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7170ff]/10 disabled:opacity-50"
                  style={{ fontWeight: 510 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || token.length !== 6}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#5e6ad2] px-4 text-[14px] text-white shadow-[0_0_24px_-6px_rgba(94,106,210,0.45)] transition-all hover:bg-[#7170ff] hover:shadow-[0_0_28px_-4px_rgba(113,112,255,0.55)] active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ fontWeight: 510 }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify &; Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-center text-[13px] text-[#62666d] transition-colors hover:text-[#f7f8f8]"
                style={{ fontWeight: 510 }}
              >
                Use a different phone number
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-[13px] text-[#8a8f98]">
          Prefer another method?{" "}
          <Link
            href="/login"
            className="text-[#7170ff] transition-colors hover:text-[#828fff]"
            style={{ fontWeight: 510 }}
          >
            Sign in with email
          </Link>
        </p>
      </div>
    </div>
  );
}
