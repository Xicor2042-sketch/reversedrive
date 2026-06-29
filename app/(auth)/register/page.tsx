"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { Loader2, Mail, Lock, User, AlertCircle, Store } from "lucide-react";

type Role = "buyer" | "seller";

export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0D0F14]"><Loader2 className="animate-spin text-[#3B82F6]" size={32} /></div>}>
      <RegisterPage />
    </Suspense>
  );
}

function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read role from URL search params (?role=buyer or ?role=seller)
  const initialRole: Role =
    searchParams.get("role") === "seller" ? "seller" : "buyer";

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

      // If email confirmation is required, data.user exists but no session.
      // If no confirmation required, a session is created immediately.
      if (data.user && !data.session) {
        // Email confirmation required — redirect to login with a note
        router.push("/login?message=check-email");
        return;
      }

      // Session is active — role-based redirect
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="glass-strong rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-gray-400">
            Join the reverse car marketplace
          </p>
        </div>

        {/* Role toggle */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            I want to
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={cn(
                "rounded-lg py-2.5 text-sm font-semibold transition-all",
                role === "buyer"
                  ? "bg-[#3B82F6] text-white glow-blue"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Buy a car
            </button>
            <button
              type="button"
              onClick={() => setRole("seller")}
              className={cn(
                "rounded-lg py-2.5 text-sm font-semibold transition-all",
                role === "seller"
                  ? "bg-[#06B6D4] text-[#0D0F14]"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Sell cars
            </button>
          </div>
        </div>

        {/* Dealer switch (seller only) — animated */}
        <AnimatePresence initial={false}>
          {role === "seller" && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Store size={18} className="text-[#06B6D4]" />
                  <div>
                    <div className="text-sm font-medium text-white">
                      Are you a dealer?
                    </div>
                    <div className="text-xs text-gray-500">
                      Optional — for dealership accounts
                    </div>
                  </div>
                </div>
                {/* Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDealer}
                  onClick={() => setIsDealer((v) => !v)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    isDealer ? "bg-[#06B6D4]" : "bg-white/15"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
                      isDealer ? "translate-x-[22px]" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Display name */}
          <div>
            <label
              htmlFor="display_name"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Display name
            </label>
            <div className="relative">
              <User
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                id="display_name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                placeholder="Your name"
                className={cn(
                  "w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-gray-500",
                  "transition-all focus:border-[#3B82F6]/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20",
                  "disabled:opacity-50"
                )}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                className={cn(
                  "w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-gray-500",
                  "transition-all focus:border-[#3B82F6]/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20",
                  "disabled:opacity-50"
                )}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="At least 6 characters"
                className={cn(
                  "w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-gray-500",
                  "transition-all focus:border-[#3B82F6]/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20",
                  "disabled:opacity-50"
                )}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-all",
              "disabled:cursor-not-allowed disabled:opacity-60",
              role === "buyer"
                ? "bg-[#3B82F6] glow-blue hover:bg-[#2563EB]"
                : "bg-[#06B6D4] text-[#0D0F14] glow-cyan hover:bg-[#0891B2] hover:text-white"
            )}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating account...
              </>
            ) : (
              `Create ${role === "buyer" ? "Buyer" : "Seller"} Account`
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#3B82F6] transition-colors hover:text-[#60A5FA]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}