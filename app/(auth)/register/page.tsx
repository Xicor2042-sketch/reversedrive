"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, User, AlertCircle, Store, ArrowRight } from "lucide-react";

type Role = "buyer" | "seller";

export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#08090a]"><Loader2 className="animate-spin text-[#5e6ad2]" size={28} /></div>}>
      <RegisterPage />
    </Suspense>
  );
}

function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole: Role = searchParams.get("role") === "seller" ? "seller" : "buyer";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(initialRole);
  const [isDealer, setIsDealer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex flex-col items-center justify-center px-6 py-12" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[#5e6ad2]/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="block text-center mb-10">
          <span className="text-xl font-medium tracking-tight" style={{ fontWeight: 510 }}>
            Reverse<span className="text-[#7170ff]">Drive</span>
          </span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl tracking-tight" style={{ fontWeight: 510, letterSpacing: '-0.02em' }}>
            Create your account
          </h1>
          <p className="text-sm text-[#8a8f98] mt-2">
            Join the reverse car marketplace
          </p>
        </div>

        {/* Role toggle */}
        <div className="mb-6">
          <label className="block text-[13px] text-[#d0d6e0] mb-2" style={{ fontWeight: 510 }}>
            I want to
          </label>
          <div className="grid grid-cols-2 gap-1 rounded-[8px] border border-white/[0.08] bg-white/[0.02] p-1">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`rounded-[6px] py-2 text-[13px] transition-all ${
                role === "buyer"
                  ? "bg-[#5e6ad2] text-white"
                  : "text-[#8a8f98] hover:text-[#f7f8f8]"
              }`}
              style={{ fontWeight: 510 }}
            >
              Buy a car
            </button>
            <button
              type="button"
              onClick={() => setRole("seller")}
              className={`rounded-[6px] py-2 text-[13px] transition-all ${
                role === "seller"
                  ? "bg-[#7170ff] text-white"
                  : "text-[#8a8f98] hover:text-[#f7f8f8]"
              }`}
              style={{ fontWeight: 510 }}
            >
              Sell cars
            </button>
          </div>
        </div>

        {/* Dealer switch (seller only) */}
        <AnimatePresence initial={false}>
          {role === "seller" && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between rounded-[8px] border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                <div className="flex items-center gap-3">
                  <Store size={16} className="text-[#7170ff]" />
                  <div>
                    <div className="text-[13px] text-[#f7f8f8]" style={{ fontWeight: 510 }}>
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
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    isDealer ? "bg-[#7170ff]" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      isDealer ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-[8px] border border-[#ef4444]/20 bg-[#ef4444]/5 px-4 py-3 text-sm text-[#ef4444]">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-[13px] text-[#d0d6e0] mb-2" style={{ fontWeight: 510 }}>
              Display name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d] pointer-events-none" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                placeholder="Your name"
                className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all focus:border-[#5e6ad2]/50 focus:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/20 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] text-[#d0d6e0] mb-2" style={{ fontWeight: 510 }}>
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d] pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all focus:border-[#5e6ad2]/50 focus:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/20 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] text-[#d0d6e0] mb-2" style={{ fontWeight: 510 }}>
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d] pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="At least 6 characters"
                className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 pl-10 pr-4 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all focus:border-[#5e6ad2]/50 focus:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/20 disabled:opacity-50"
              />
            </div>
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

        {/* Login link */}
        <p className="mt-8 text-center text-[13px] text-[#8a8f98]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#7170ff] hover:text-[#828fff] transition-colors" style={{ fontWeight: 510 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}