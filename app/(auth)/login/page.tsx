"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Get user role and redirect accordingly
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
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex flex-col items-center justify-center px-6" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
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
            Welcome back
          </h1>
          <p className="text-sm text-[#8a8f98] mt-2">
            Sign in to your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-[8px] border border-[#ef4444]/20 bg-[#ef4444]/5 px-4 py-3 text-sm text-[#ef4444]">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
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
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="mt-8 text-center text-[13px] text-[#8a8f98]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#7170ff] hover:text-[#828fff] transition-colors" style={{ fontWeight: 510 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}