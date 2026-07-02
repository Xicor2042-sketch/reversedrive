"use client"

import Link from "next/link"
import Reveal from "@/components/shared/reveal"
import {
  ArrowRight,
  Target,
  Shield,
  Zap,
  TrendingDown,
  Check,
  Car,
  BadgeCheck,
  MapPin,
  Radar,
  MessageSquare,
  Plus,
  Wallet,
  Building2,
  Sparkles,
} from "lucide-react"

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

const faqs = [
  {
    q: "How is my privacy protected?",
    a: "Your name, phone, and email are hidden at the database level. Sellers see your request — the car, budget, and area — never your contact details. A seller only gets to talk to you after paying to unlock the lead, and even then everything stays inside the in-app Deal Room until you choose otherwise.",
  },
  {
    q: "How much does it cost for buyers?",
    a: "Nothing. Posting requests, receiving offers, and chatting with sellers is completely free for buyers. Sellers pay to reach you — not the other way around.",
  },
  {
    q: "What does a seller pay?",
    a: "A flat $9.99 to unlock a single lead. No subscription, no percentage of the sale, no hidden fees. Dealerships can move to a Pro plan with bundled unlocks and inventory matching as we roll it out.",
  },
  {
    q: "What is the wallet and escrow for?",
    a: "You can add funds to your wallet to show sellers you're a serious, ready-to-buy customer. Money stays under your control and is only released when you've inspected the car and approved the deal.",
  },
  {
    q: "What happens after a seller unlocks my request?",
    a: "A private Deal Room opens. You'll see the seller's name and business, chat in real time, and negotiate directly. If it's not a fit, close the conversation — your contact info was never exposed.",
  },
  {
    q: "Which cities does ReverseDrive cover?",
    a: "We're in early access and onboarding one metro at a time so every request gets real seller attention. Post a request now — you'll be first in line as coverage expands in your area.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      {/* ================= Hero ================= */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden grain">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-40 animate-gradient"
            style={{
              background:
                "radial-gradient(ellipse at 15% 25%, rgba(94, 106, 210, 0.16) 0%, transparent 50%), radial-gradient(ellipse at 85% 60%, rgba(113, 112, 255, 0.12) 0%, transparent 55%)",
            }}
          />
          <div className="absolute top-1/4 left-1/3 w-[520px] h-[520px] bg-[#5e6ad2]/8 rounded-full blur-[130px] animate-float-1" />
          <div className="absolute top-1/2 right-[12%] w-[340px] h-[340px] bg-[#7170ff]/7 rounded-full blur-[110px] animate-float-2" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[12px] text-[#8a8f98]" style={{ fontWeight: 510 }}>
                Now accepting early access users
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl leading-[1.02] tracking-tight animate-fade-in-up"
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

            <p
              className="mt-7 text-lg text-[#8a8f98] max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              Post your dream car with your budget. Let sellers compete for your money. No scrolling, no haggling, no
              stress.
            </p>

            <div
              className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 animate-fade-in-up"
              style={{ animationDelay: "150ms" }}
            >
              <Link
                href="/register?role=buyer"
                className="group inline-flex items-center gap-2 bg-[#5e6ad2] hover:bg-[#7170ff] text-white px-6 py-3 rounded-[10px] text-[14px] transition-all animate-pulse-glow"
                style={{ fontWeight: 510 }}
              >
                I Want to Buy
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/register?role=seller"
                className="group inline-flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] text-[#f7f8f8] border border-white/[0.08] hover:border-[#5e6ad2]/30 px-6 py-3 rounded-[10px] text-[14px] transition-all hover:shadow-[0_0_20px_rgba(94,106,210,0.15)]"
                style={{ fontWeight: 510 }}
              >
                I Want to Sell
              </Link>
            </div>

            <div
              className="mt-14 grid grid-cols-3 divide-x divide-white/[0.06] max-w-md mx-auto lg:mx-0 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center lg:text-left px-4 first:pl-0">
                  <div className="text-[22px] md:text-[26px] tracking-tight" style={{ fontWeight: 510 }}>
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-[#62666d] mt-1 leading-snug" style={{ fontWeight: 510 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: product visual */}
          <div className="relative hidden lg:block h-[480px] animate-fade-in" style={{ animationDelay: "250ms" }} aria-hidden="true">
            {/* Radar rings behind */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="radar-ring absolute left-1/2 top-1/2 -ml-[190px] -mt-[190px] h-[380px] w-[380px] rounded-full border border-[#5e6ad2]/25"
                  style={{ animationDelay: `${i * 0.85}s` }}
                />
              ))}
            </div>

            {/* Request card */}
            <div className="glass-card absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] rounded-[16px] p-5 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#5e6ad2]/25 to-[#7170ff]/10 border border-white/[0.08] flex items-center justify-center">
                    <Car size={16} className="text-[#7170ff]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[13px]" style={{ fontWeight: 510 }}>
                      <span className="blur-[3px] select-none">Marcus D.</span>
                      <BadgeCheck size={13} className="text-[#5e6ad2]" />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#62666d]">
                      <MapPin size={10} /> Dallas · 50mi radius
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10b981]/25 bg-[#10b981]/10 px-2.5 py-1 text-[11px] text-[#10b981]" style={{ fontWeight: 510 }}>
                  <span className="w-1 h-1 rounded-full bg-[#10b981] animate-pulse" /> Active
                </span>
              </div>

              <div className="text-[19px] tracking-tight mb-1" style={{ fontWeight: 510 }}>
                Toyota Tacoma TRD
              </div>
              <div className="text-[12px] text-[#8a8f98] mb-4">2021–2026 · Under 45,000 miles · Truck · 4x4</div>

              <div className="flex items-center justify-between rounded-[10px] border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#62666d]" style={{ fontWeight: 510 }}>
                    Max budget
                  </div>
                  <div className="text-[18px] text-[#f7f8f8]" style={{ fontWeight: 510 }}>
                    $32,000
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-[#62666d]" style={{ fontWeight: 510 }}>
                    Payment
                  </div>
                  <div className="inline-flex items-center gap-1 text-[13px] text-[#10b981]" style={{ fontWeight: 510 }}>
                    <Wallet size={13} /> Cash ready
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[12px] text-[#8a8f98]">
                <Radar size={13} className="text-[#7170ff]" />
                <span>
                  <span className="text-[#f7f8f8]" style={{ fontWeight: 510 }}>3 sellers</span> viewing right now
                </span>
              </div>
            </div>

            {/* Floating offer chips — solid surfaces, pinned to the card's
                edges so they read as layered cards instead of overlapping
                the card's content */}
            <div
              className="animate-float-y absolute left-0 top-10 z-20 w-[200px] -rotate-3 rounded-[12px] border border-white/[0.1] bg-[#101114] px-4 py-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.07)]"
            >
              <div className="text-[10px] uppercase tracking-wider text-[#62666d] mb-1" style={{ fontWeight: 510 }}>
                Offer received
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[15px]" style={{ fontWeight: 510 }}>$28,900</span>
                <span className="text-[11px] text-[#10b981]" style={{ fontWeight: 510 }}>-$3,100</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-[#8a8f98]">
                <Building2 size={11} /> North Dallas Toyota
              </div>
            </div>

            <div
              className="animate-float-y absolute right-0 bottom-12 z-20 w-[230px] rotate-2 rounded-[12px] border border-white/[0.1] bg-[#101114] px-4 py-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.07)]"
              style={{ animationDelay: "1.4s" }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#7170ff] flex items-center justify-center text-[9px] text-white" style={{ fontWeight: 510 }}>
                  J
                </div>
                <span className="text-[12px]" style={{ fontWeight: 510 }}>Jake · Deal Room</span>
                <MessageSquare size={11} className="text-[#62666d] ml-auto" />
              </div>
              <div className="rounded-[8px] rounded-tl-[3px] bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-[12px] text-[#d0d6e0]">
                2022, 28k miles, one owner. Can do $29,400 out the door.
              </div>
            </div>

            <div
              className="animate-float-y absolute bottom-2 left-1/2 z-20 -translate-x-1/2 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/[0.1] bg-[#101114] px-4 py-2 shadow-[0_14px_30px_-10px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.07)]"
              style={{ animationDelay: "0.7s" }}
            >
              <Sparkles size={13} className="text-[#f5a623]" />
              <span className="text-[12px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>7 competing offers in 6 hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Ticker ================= */}
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

      {/* ================= How It Works ================= */}
      <section id="how-it-works" className="py-24 px-6 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <Reveal direction="blur">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontWeight: 510, letterSpacing: "-0.03em" }}>
                How it works
              </h2>
              <p className="mt-4 text-[#8a8f98] text-base">Three steps between you and your next car.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Reveal key={i} direction="up" delay={i * 130}>
              <div
                className="glass-card group relative h-full rounded-[14px] p-6 hover:border-[#5e6ad2]/30 transition-all"
              >
                <div className="absolute inset-0 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-[#5e6ad2]/5 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-[10px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center mb-5 group-hover:bg-[#5e6ad2]/15 group-hover:shadow-[0_0_18px_rgba(94,106,210,0.25)] transition-all">
                    <feature.icon size={18} className="text-[#7170ff]" />
                  </div>
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] text-[#7170ff] mb-3"
                    style={{ fontWeight: 510 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg mb-2" style={{ fontWeight: 510 }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#8a8f98] leading-relaxed">{feature.description}</p>
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Comparison ================= */}
      <section className="py-24 px-6 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <Reveal direction="blur">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontWeight: 510, letterSpacing: "-0.03em" }}>
                Why ReverseDrive
              </h2>
              <p className="mt-4 text-[#8a8f98] text-base">The traditional model is broken. We fixed it.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Reveal direction="left" className="h-full">
            <div className="h-full rounded-[14px] border border-white/[0.05] bg-white/[0.01] p-6">
              <div className="flex items-center gap-2 mb-4 text-[#62666d]">
                <TrendingDown size={18} />
                <span className="text-sm" style={{ fontWeight: 510 }}>
                  Traditional Marketplaces
                </span>
              </div>
              <ul className="space-y-3">
                {[
                  "Scroll through thousands of listings",
                  "Many listings are outdated or sold",
                  "Contact info exposed to scrapers",
                  "Sellers wait passively for clicks",
                  "No quality control on leads",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#8a8f98]">
                    <span className="text-[#ef4444] mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            </Reveal>

            <Reveal direction="right" delay={120} className="h-full">
            <div className="glass-card h-full rounded-[14px] border-[#5e6ad2]/25 p-6" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 0 50px -18px rgba(94,106,210,0.45)" }}>
              <div className="flex items-center gap-2 mb-4 text-[#7170ff]">
                <Check size={18} />
                <span className="text-sm" style={{ fontWeight: 510 }}>
                  ReverseDrive
                </span>
              </div>
              <ul className="space-y-3">
                {[
                  "Post one request — sellers come to you",
                  "Active buyers with real budgets only",
                  "Contact info hidden until you choose",
                  "Sellers compete for your business",
                  "Every lead is verified and budget-confirmed",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#d0d6e0]">
                    <Check size={16} className="text-[#10b981] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= Pricing ================= */}
      <section id="pricing" className="py-24 px-6 border-t border-white/[0.05] scroll-mt-16 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#5e6ad2]/6 rounded-full blur-[130px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <Reveal direction="blur">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontWeight: 510, letterSpacing: "-0.03em" }}>
                Simple, honest pricing
              </h2>
              <p className="mt-4 text-[#8a8f98] text-base">No percentage of your car deal. Ever.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Buyers */}
            <Reveal direction="up" className="h-full">
            <div className="glass-card h-full rounded-[16px] p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-[8px] bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center">
                  <Car size={15} className="text-[#10b981]" />
                </div>
                <span className="text-[14px]" style={{ fontWeight: 510 }}>Buyers</span>
              </div>
              <div className="mb-1 flex items-baseline gap-1.5">
                <span className="text-[34px] tracking-tight" style={{ fontWeight: 510 }}>Free</span>
              </div>
              <p className="text-[13px] text-[#8a8f98] mb-6">Always. Sellers pay to reach you.</p>
              <ul className="space-y-2.5 text-[13px] text-[#d0d6e0] mb-8">
                {["Unlimited car requests", "Offers from verified sellers", "Private Deal Room chat", "Contact info never exposed", "Optional escrow wallet"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check size={14} className="text-[#10b981] mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?role=buyer"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] px-4 py-2.5 text-[13px] transition-all"
                style={{ fontWeight: 510 }}
              >
                Post your first request
              </Link>
            </div>
            </Reveal>

            {/* Sellers — highlighted */}
            <Reveal direction="up" delay={130} className="h-full">
            <div className="gradient-border glass-card h-full rounded-[16px] p-7 flex flex-col relative" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 60px -15px rgba(94,106,210,0.5)" }}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#5e6ad2] px-3 py-1 text-[10px] uppercase tracking-wider text-white" style={{ fontWeight: 510 }}>
                Most popular
              </span>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-[8px] bg-[#5e6ad2]/15 border border-[#5e6ad2]/25 flex items-center justify-center">
                  <Zap size={15} className="text-[#7170ff]" />
                </div>
                <span className="text-[14px]" style={{ fontWeight: 510 }}>Sellers</span>
              </div>
              <div className="mb-1 flex items-baseline gap-1.5">
                <span className="text-[34px] tracking-tight" style={{ fontWeight: 510 }}>$9.99</span>
                <span className="text-[13px] text-[#8a8f98]">per lead unlock</span>
              </div>
              <p className="text-[13px] text-[#8a8f98] mb-6">Pay only for the buyers you want.</p>
              <ul className="space-y-2.5 text-[13px] text-[#d0d6e0] mb-8">
                {["Browse every active request free", "Real budgets, confirmed intent", "Unlock opens a direct Deal Room", "One-time fee — no subscription", "No commission on the sale"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check size={14} className="text-[#7170ff] mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?role=seller"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#5e6ad2] hover:bg-[#7170ff] px-4 py-2.5 text-[13px] text-white transition-all"
                style={{ fontWeight: 510 }}
              >
                Start browsing leads <ArrowRight size={14} />
              </Link>
            </div>
            </Reveal>

            {/* Dealers */}
            <Reveal direction="up" delay={260} className="h-full">
            <div className="glass-card h-full rounded-[16px] p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-[8px] bg-[#f5a623]/10 border border-[#f5a623]/20 flex items-center justify-center">
                  <Building2 size={15} className="text-[#f5a623]" />
                </div>
                <span className="text-[14px]" style={{ fontWeight: 510 }}>Dealer Pro</span>
                <span className="ml-auto rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#8a8f98]" style={{ fontWeight: 510 }}>
                  Coming soon
                </span>
              </div>
              <div className="mb-1 flex items-baseline gap-1.5">
                <span className="text-[34px] tracking-tight" style={{ fontWeight: 510 }}>$299</span>
                <span className="text-[13px] text-[#8a8f98]">/month</span>
              </div>
              <p className="text-[13px] text-[#8a8f98] mb-6">For dealerships that live on leads.</p>
              <ul className="space-y-2.5 text-[13px] text-[#d0d6e0] mb-8">
                {["50 lead unlocks included", "Instant alerts on matching requests", "Inventory auto-matching", "Local demand analytics", "Priority placement"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check size={14} className="text-[#f5a623] mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] px-4 py-2.5 text-[13px] transition-all"
                style={{ fontWeight: 510 }}
              >
                Join the waitlist
              </Link>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="py-24 px-6 border-t border-white/[0.05] scroll-mt-16">
        <div className="max-w-2xl mx-auto">
          <Reveal direction="blur">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontWeight: 510, letterSpacing: "-0.03em" }}>
                Questions, answered
              </h2>
              <p className="mt-4 text-[#8a8f98] text-base">
                Everything people ask before posting their first request.
              </p>
            </div>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={i} direction="up" delay={Math.min(i * 70, 280)}>
              <details className="faq glass-card rounded-[12px] px-5 group">
                <summary className="flex items-center justify-between gap-4 py-4">
                  <span className="text-[14px] text-[#f7f8f8]" style={{ fontWeight: 510 }}>
                    {f.q}
                  </span>
                  <span className="faq-icon shrink-0 h-6 w-6 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-[#8a8f98]">
                    <Plus size={13} />
                  </span>
                </summary>
                <p className="pb-5 text-[13px] leading-relaxed text-[#8a8f98]">{f.a}</p>
              </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Final CTA ================= */}
      <section className="py-24 px-6 border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto">
          <Reveal direction="scale">
          <div className="glass-card grain relative overflow-hidden rounded-[20px] px-8 py-16 text-center" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 80px -20px rgba(94,106,210,0.5)" }}>
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[220px] bg-[#5e6ad2]/20 rounded-full blur-[90px] pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl tracking-tight mb-4" style={{ fontWeight: 510, letterSpacing: "-0.03em" }}>
                Ready to flip the script?
              </h2>
              <p className="text-[#8a8f98] mb-10 text-base">
                Join the reverse marketplace. Post your request in 60 seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register?role=buyer"
                  className="group inline-flex items-center gap-2 bg-[#5e6ad2] hover:bg-[#7170ff] text-white px-6 py-3 rounded-[10px] text-[14px] transition-all animate-pulse-glow"
                  style={{ fontWeight: 510 }}
                >
                  Get Started as a Buyer
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/register?role=seller"
                  className="group inline-flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] text-[#f7f8f8] border border-white/[0.08] hover:border-[#5e6ad2]/30 px-6 py-3 rounded-[10px] text-[14px] transition-all"
                  style={{ fontWeight: 510 }}
                >
                  Start Selling
                </Link>
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
