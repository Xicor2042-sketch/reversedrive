"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, AlertCircle, ArrowRight, Phone } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
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

  const handleOAuth = async (provider: "google" | "apple") => {
    setOauthLoading(provider);
    setError(null);

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

  const handlePhone = () => {
    router.push("/phone");
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
          <h1 className="text-2xl tracking-tight" style={{ fontWeight: 510, letterSpacing: '-0.02em' }}>
            Welcome back
          </h1>
          <p className="text-sm text-[#8a8f98] mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-[8px] border border-[#ef4444]/20 bg-[#ef4444]/5 px-4 py-3 text-sm text-[#ef4444]">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* OAuth buttons */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => handleOAuth("google")}
            disabled={oauthLoading !== null}
            className="w-full flex items-center justify-center gap-3 rounded-[6px] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] py-2.5 text-[14px] text-[#f7f8f8] transition-all disabled:opacity-50"
            style={{ fontWeight: 510 }}
          >
            {oauthLoading === "google" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuth("apple")}
            disabled={oauthLoading !== null}
            className="w-full flex items-center justify-center gap-3 rounded-[6px] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] py-2.5 text-[14px] text-[#f7f8f8] transition-all disabled:opacity-50"
            style={{ fontWeight: 510 }}
          >
            {oauthLoading === "apple" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <AppleIcon />
            )}
            Continue with Apple
          </button>

          <button
            onClick={handlePhone}
            disabled={oauthLoading !== null}
            className="w-full flex items-center justify-center gap-3 rounded-[6px] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] py-2.5 text-[14px] text-[#f7f8f8] transition-all disabled:opacity-50"
            style={{ fontWeight: 510 }}
          >
            <Phone size={16} className="text-[#8a8f98]" />
            Continue with Phone
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[12px] text-[#62666d]" style={{ fontWeight: 510 }}>or</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[13px] text-[#d0d6e0] mb-2" style={{ fontWeight: 510 }}>Email</label>
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
            <label className="block text-[13px] text-[#d0d6e0] mb-2" style={{ fontWeight: 510 }}>Password</label>
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

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 12.04c-.03-2.7 2.21-3.99 2.31-4.06-1.26-1.84-3.22-2.09-3.91-2.12-1.67-.17-3.26.98-4.11.98-.85 0-2.15-.96-3.54-.93-1.82.03-3.5 1.06-4.43 2.69-1.89 3.27-.48 8.11 1.35 10.77.9 1.31 1.97 2.78 3.37 2.73 1.35-.05 1.86-.87 3.49-.87 1.63 0 2.1.87 3.54.84 1.46-.02 2.39-1.34 3.28-2.66 1.04-1.52 1.47-2.99 1.49-3.07-.03-.01-2.85-1.09-2.88-4.32zM14.52 4.27c.75-.9 1.25-2.16 1.11-3.41-1.08.04-2.38.72-3.15 1.62-.69.8-1.3 2.08-1.14 3.31 1.2.09 2.43-.61 3.18-1.52z" />
    </svg>
  );
}