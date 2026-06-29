"use client"

import Link from "next/link"
import { ArrowRight, Target, Shield, Zap, TrendingDown, Check } from "lucide-react"

const tickerItems = [
  "2021 Toyota Tacoma found in 4 hours",
  "7 offers on a Mustang request overnight",
  "$4,200 saved on a BMW X5 deal",
  "RAV4 closed in 2 days",
  "12 competing offers in 6 hours",
  "Tesla Model 3 found in 3 hours",
  "4Runner below market in 1 day",
  "Sellers bidding within 30 minutes",
]

const features = [
  {
    icon: Target,
    title: "Post Your Request",
    description: "Tell us exactly what you want — make, model, budget, specs. One post replaces hours of scrolling.",
  },
  {
    icon: Zap,
    title: "Sellers Come to You",
    description: "Verified sellers see your request and compete. No haggling, no chasing — let them bring their best offer.",
  },
  {
    icon: Shield,
    title: "Secure In-App Chat",
    description: "Negotiate and finalize in a private deal room. Your contact info stays protected until you're ready.",
  },
]

const stats = [
  { value: "4 hrs", label: "Average time to first offer" },
  { value: "7+", label: "Average competing offers" },
  { value: "$4.2k", label: "Average savings per deal" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-30 animate-gradient"
            style={{
              background: 'radial-gradient(ellipse at 20% 30%, rgba(94, 106, 210, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(113, 112, 255, 0.1) 0%, transparent 50%)',
            }}
          />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#5e6ad2]/8 rounded-full blur-[120px] animate-float-1" />
          <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-[#7170ff]/6 rounded-full blur-[100px] animate-float-2" />
          <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] bg-[#5e6ad2]/5 rounded-full blur-[90px] animate-float-1" style={{ animationDelay: '3s' }} />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[12px] text-[#8a8f98]" style={{ fontWeight: 510 }}>Now accepting early access users</span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight animate-fade-in-up"
            style={{ fontWeight: 510, letterSpacing: "-0.04em", animationDelay: "50ms" }}
          >
            Don&apos;t search.
            <br />
            <span className="text-[#8a8f98]">Let the car</span>
            <br />
            <span
              className="text-transparent bg-clip-text animate-shimmer"
              style={{
                backgroundImage: "linear-gradient(90deg, #7170ff, #5e6ad2, #828fff, #5e6ad2, #7170ff)",
              }}
            >
              come to you.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mt-8 text-lg md:text-xl text-[#8a8f98] max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            Post your dream car with your budget. Let sellers compete for your money.
            No scrolling, no haggling, no stress.
          </p>

          {/* CTAs */}
          <div
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            <Link href="/register?role=buyer" className="group inline-flex items-center gap-2 bg-[#5e6ad2] hover:bg-[#7170ff] text-white px-6 py-3 rounded-[8px] text-[14px] transition-all animate-pulse-glow" style={{ fontWeight: 510 }}>
              I Want to Buy
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/register?role=seller" className="group inline-flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] text-[#f7f8f8] border border-white/[0.08] hover:border-[#5e6ad2]/30 px-6 py-3 rounded-[8px] text-[14px] transition-all hover:shadow-[0_0_20px_rgba(94,106,210,0.15)]" style={{ fontWeight: 510 }}>
              I Want to Sell
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl tracking-tight" style={{ fontWeight: 510 }}>{stat.value}</div>
                <div className="text-[12px] text-[#62666d] mt-1" style={{ fontWeight: 510 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticker */}
      <section className="border-y border-white/[0.05] bg-white/[0.01] py-4 overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="text-[13px] text-[#62666d] flex items-center gap-3 pr-12" style={{ fontWeight: 510 }}>
              <span className="w-1 h-1 rounded-full bg-[#10b981]" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontWeight: 510, letterSpacing: '-0.03em' }}>
              How it works
            </h2>
            <p className="mt-4 text-[#8a8f98] text-base">
              Three steps between you and your next car.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-[12px] border border-white/[0.08] bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-[#5e6ad2]/30 transition-all animate-slide-up"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="absolute inset-0 rounded-[12px] opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-[#5e6ad2]/5 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-[8px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center mb-5 group-hover:bg-[#5e6ad2]/15 transition-colors">
                    <feature.icon size={18} className="text-[#7170ff]" />
                  </div>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] text-[#7170ff] mb-3" style={{ fontWeight: 510 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg mb-2" style={{ fontWeight: 510 }}>{feature.title}</h3>
                  <p className="text-sm text-[#8a8f98] leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-6 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontWeight: 510, letterSpacing: '-0.03em' }}>
              Why ReverseDrive
            </h2>
            <p className="mt-4 text-[#8a8f98] text-base">
              The traditional model is broken. We fixed it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Traditional */}
            <div className="rounded-[12px] border border-white/[0.05] bg-white/[0.01] p-6">
              <div className="flex items-center gap-2 mb-4 text-[#62666d]">
                <TrendingDown size={18} />
                <span className="text-sm" style={{ fontWeight: 510 }}>Traditional Marketplaces</span>
              </div>
              <ul className="space-y-3">
                {["Scroll through thousands of listings", "Many listings are outdated or sold", "Contact info exposed to scrapers", "Sellers wait passively for clicks", "No quality control on leads"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#8a8f98]">
                    <span className="text-[#ef4444] mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ReverseDrive */}
            <div className="rounded-[12px] border border-[#5e6ad2]/20 bg-[#5e6ad2]/[0.03] p-6">
              <div className="flex items-center gap-2 mb-4 text-[#7170ff]">
                <Check size={18} />
                <span className="text-sm" style={{ fontWeight: 510 }}>ReverseDrive</span>
              </div>
              <ul className="space-y-3">
                {["Post one request — sellers come to you", "Active buyers with real budgets only", "Contact info hidden until you choose", "Sellers compete for your business", "Every lead is verified and budget-confirmed"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#d0d6e0]">
                    <Check size={16} className="text-[#10b981] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl tracking-tight mb-4" style={{ fontWeight: 510, letterSpacing: '-0.03em' }}>
            Ready to flip the script?
          </h2>
          <p className="text-[#8a8f98] mb-10 text-base">
            Join the reverse marketplace. Post your request in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register?role=buyer" className="group inline-flex items-center gap-2 bg-[#5e6ad2] hover:bg-[#7170ff] text-white px-6 py-3 rounded-[8px] text-[14px] transition-all animate-pulse-glow" style={{ fontWeight: 510 }}>
              Get Started as a Buyer
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/register?role=seller" className="group inline-flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] text-[#f7f8f8] border border-white/[0.08] hover:border-[#5e6ad2]/30 px-6 py-3 rounded-[8px] text-[14px] transition-all hover:shadow-[0_0_20px_rgba(94,106,210,0.15)]" style={{ fontWeight: 510 }}>
              Start Selling
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}