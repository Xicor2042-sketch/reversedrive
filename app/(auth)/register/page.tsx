"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  Mail,
  Lock,
  User,
  AlertCircle,
  Store,
  ArrowRight,
  Check,
} from "lucide-react";

type Role = "buyer" | "seller";

export default function RegisterPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#08090a]">
          <Loader2 className="animate-spin text-[#5e6ad2]" size={28} />
        </div>
      }
    >
      <RegisterPage />
    </Suspense>
  );
}

function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole: Role =
    searchParams.get("role") === "seller" ? "seller" : "buyer";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(initialRole);
  const [isDealer, setIsDealer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dealerVisible, setDealerVisible] = useState(role === "seller");

  const selectRole = (next: Role) => {
    setRole(next);
    if (next === "seller") {
      setDealerVisible(true);
    } else {
      setDealerVisible(false);
      setIsDealer(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role,
            is_dealer: isDealer,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user && !data.session) {
        router.push("/login?message=check-email");
        return;
      }

      if (role === "seller") {
        router.push("/leads");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google") => {
    setOauthLoading(provider);
    setError(null);

    // signInWithOAuth in this SDK version doesn't accept user metadata, so we
    // stash the chosen role/dealer flag in a short-lived cookie that the
    // /callback route reads and applies to the new profile after sign-in.
    document.cookie = `rd_oauth_intent=${encodeURIComponent(
      JSON.stringify({ role, is_dealer: isDealer, display_name: displayName.trim() })
    )}; path=/; max-age=600; samesite=lax`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex flex-col items-center justify-center px-4 py-12 antialiased"
      style={{ fontFeatureSettings: '"cv01", "ss03"' }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 h-[560px] w-[760px] rounded-full bg-[#5e6ad2]/12 blur-[150px]" />
        <div className="absolute top-1/2 -left-[10%] h-[440px] w-[560px] -translate-y-1/2 rounded-full bg-[#7170ff]/8 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(94,106,210,0.08),transparent_50%)]" />
      </div>

      <div className="relative w-full max-w-[440px]">
        <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-8 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.5)]">
          <div className="mb-6">
            <h1
              className="text-[26px] leading-tight tracking-tight"
              style={{ fontWeight: 510, letterSpacing: "-0.02em" }}
            >
              Create your account
            </h1>
            <p className="mt-2 text-[15px] text-[#8a8f98]">
              Join the reverse car marketplace
            </p>
          </div>

          <div className="mb-5">
            <label
              className="mb-2 block text-[13px] text-[#d0d6e0]"
              style={{ fontWeight: 510 }}
            >
              I want to
            </label>
            <div className="grid grid-cols-2 gap-1 rounded-[10px] border border-white/[0.08] bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => selectRole("buyer")}
                className={`flex h-9 items-center justify-center gap-2 rounded-[8px] text-[13px] transition-all ${
                  role === "buyer"
                    ? "bg-[#5e6ad2] text-white shadow-[0_4px_12px_-4px_rgba(94,106,210,0.45)]"
                    : "text-[#8a8f98] hover:text-[#f7f8f8]"
                }`}
                style={{ fontWeight: 510 }}
              >
                {role === "buyer" && <Check size={14} />}
                Buy a car
              </button>
              <button
                type="button"
                onClick={() => selectRole("seller")}
                className={`flex h-9 items-center justify-center gap-2 rounded-[8px] text-[13px] transition-all ${
                  role === "seller"
                    ? "bg-[#7170ff] text-white shadow-[0_4px_12px_-4px_rgba(113,112,255,0.45)]"
                    : "text-[#8a8f98] hover:text-[#f7f8f8]"
                }`}
                style={{ fontWeight: 510 }}
              >
                {role === "seller" && <Check size={14} />}
                Sell cars
              </button>
            </div>
          </div>

          <div
            className={`grid transition-all duration-300 ease-out ${
              dealerVisible ? "mb-6 grid-rows-[1fr] opacity-100" : "mb-0 grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex items-center justify-between rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#7170ff]/10">
                    <Store size={16} className="text-[#7170ff]" />
                  </div>
                  <div>
                    <div
                      className="text-[13px] text-[#f7f8f8]"
                      style={{ fontWeight: 510 }}
                    >
                      Are you a dealer?
                    </div>
                    <div className="text-[11px] text-[#62666d]">
                      For dealership accounts
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDealer}
                  onClick={() => setIsDealer((v) => !v)}
                  className={`relative h-[22px] w-[38px] rounded-full transition-colors ${
                    isDealer ? "bg-[#7170ff]" : "bg-white/[0.10]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
                      isDealer ? "translate-x-[17px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-[10px] border border-[#ef4444]/25 bg-[#ef4444]/8 px-4 py-3 text-[13px] text-[#ef4444]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-2.5">
            <button
              onClick={() => handleOAuth("google")}
              disabled={oauthLoading !== null}
              className="group flex h-11 w-full items-center justify-center gap-3 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 text-[14px] text-[#f7f8f8] transition-all hover:border-white/[0.12] hover:bg-white/[0.06] active:scale-[0.995] disabled:opacity-50"
              style={{ fontWeight: 510 }}
            >
              {oauthLoading === "google" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>
          </div>

          <div className="relative my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.12]" />
            <span className="text-[12px] text-[#8a8f98]" style={{ fontWeight: 510 }}>
              or use email
            </span>
            <div className="h-px flex-1 bg-white/[0.12]" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                className="mb-2 block text-[13px] text-[#d0d6e0]"
                style={{ fontWeight: 510 }}
              >
                Display name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d]"
                />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                  placeholder="Your name"
                  className="h-11 w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all focus:border-[#7170ff]/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7170ff]/10 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-[13px] text-[#d0d6e0]"
                style={{ fontWeight: 510 }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d]"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all focus:border-[#7170ff]/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7170ff]/10 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-[13px] text-[#d0d6e0]"
                style={{ fontWeight: 510 }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d]"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="At least 6 characters"
                  className="h-11 w-full rounded-[10px] border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all focus:border-[#7170ff]/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#7170ff]/10 disabled:opacity-50"
                />
              </div>
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
                  Creating account...
                </>
              ) : (
                <>
                  Create {role === "buyer" ? "Buyer" : "Seller"} Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[13px] text-[#8a8f98]">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-[#7170ff] hover:text-[#828fff]" style={{ fontWeight: 510 }}>Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#7170ff] hover:text-[#828fff]" style={{ fontWeight: 510 }}>Privacy Policy</Link>.
        </p>

        <p className="mt-4 text-center text-[13px] text-[#8a8f98]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#7170ff] transition-colors hover:text-[#828fff]"
            style={{ fontWeight: 510 }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
