"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Search, Target, Shield, Zap, TrendingDown, Check } from "lucide-react"

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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#08090a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[15px] font-medium tracking-tight" style={{ fontWeight: 510 }}>
            Reverse<span className="text-[#7170ff]">Drive</span>
          </span>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors" style={{ fontWeight: 510 }}>
              Log In
            </Link>
            <Link href="/register?role=buyer" className="text-[13px] text-white bg-[#5e6ad2] hover:bg-[#7170ff] px-3 py-1.5 rounded-[6px] transition-colors" style={{ fontWeight: 510 }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#5e6ad2]/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-[#7170ff]/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[12px] text-[#8a8f98]" style={{ fontWeight: 510 }}>Now accepting early access users</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-5xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight"
            style={{ fontWeight: 510, letterSpacing: '-0.04em' }}
          >
            Don&apos;t search.
            <br />
            <span className="text-[#8a8f98]">Let the car</span>
            <br />
            <span className="text-[#7170ff]">come to you.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 text-lg md:text-xl text-[#8a8f98] max-w-2xl mx-auto leading-relaxed"
          >
            Post your dream car with your budget. Let sellers compete for your money.
            No scrolling, no haggling, no stress.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/register?role=buyer" className="group inline-flex items-center gap-2 bg-[#5e6ad2] hover:bg-[#7170ff] text-white px-6 py-3 rounded-[8px] text-[14px] transition-all" style={{ fontWeight: 510 }}>
              I Want to Buy
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/register?role=seller" className="inline-flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] text-[#f7f8f8] border border-white/[0.08] px-6 py-3 rounded-[8px] text-[14px] transition-all" style={{ fontWeight: 510 }}>
              I Want to Sell
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl tracking-tight" style={{ fontWeight: 510 }}>{stat.value}</div>
                <div className="text-[12px] text-[#62666d] mt-1" style={{ fontWeight: 510 }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Ticker */}
      <section className="border-y border-white/[0.05] bg-white/[0.01] py-4 overflow-hidden">
        <div className="flex gap-12 animate-scroll whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="text-[13px] text-[#62666d] flex items-center gap-3" style={{ fontWeight: 510 }}>
              <span className="w-1 h-1 rounded-full bg-[#10b981]" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
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
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-[12px] border border-white/[0.08] bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all"
              >
                <div className="w-10 h-10 rounded-[8px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center mb-5">
                  <feature.icon size={18} className="text-[#7170ff]" />
                </div>
                <h3 className="text-lg mb-2" style={{ fontWeight: 510 }}>{feature.title}</h3>
                <p className="text-sm text-[#8a8f98] leading-relaxed">{feature.description}</p>
              </motion.div>
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
                <Search size={18} />
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
            <Link href="/register?role=buyer" className="inline-flex items-center gap-2 bg-[#5e6ad2] hover:bg-[#7170ff] text-white px-6 py-3 rounded-[8px] text-[14px] transition-all" style={{ fontWeight: 510 }}>
              Get Started as a Buyer
              <ArrowRight size={16} />
            </Link>
            <Link href="/register?role=seller" className="inline-flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] text-[#f7f8f8] border border-white/[0.08] px-6 py-3 rounded-[8px] text-[14px] transition-all" style={{ fontWeight: 510 }}>
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-[15px] font-medium tracking-tight" style={{ fontWeight: 510 }}>
            Reverse<span className="text-[#7170ff]">Drive</span>
          </span>
          <div className="flex items-center gap-6 text-[13px] text-[#62666d]" style={{ fontWeight: 510 }}>
            <a href="#" className="hover:text-[#f7f8f8] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#f7f8f8] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#f7f8f8] transition-colors">Contact</a>
          </div>
          <span className="text-[12px] text-[#62666d]">© 2026 ReverseDrive</span>
        </div>
      </footer>
    </div>
  )
}