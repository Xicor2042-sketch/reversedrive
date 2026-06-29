"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  Megaphone,
  Users,
  MessageSquareLock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Static placeholder social proof data
const tickerItems = [
  "John in Dallas found a 2021 Tacoma in 4 hours",
  "Sarah in Miami got 7 offers on her Mustang request overnight",
  "Mike in Denver saved $4,200 on his BMW X5 deal",
  "Emily in Austin closed on an RAV4 in 2 days",
  "Carlos in Phoenix received 12 competing offers in 6 hours",
  "Aisha in Atlanta found her dream Tesla Model 3 in 3 hours",
  "Tyler in Seattle bought a 4Runner below market in 1 day",
  "Nina in Chicago had sellers bidding within 30 minutes",
];

const features = [
  {
    icon: Megaphone,
    title: "Post Your Request",
    description:
      "Tell us exactly what you want — make, model, budget, specs. One post replaces hours of scrolling listings.",
    accent: "#3B82F6",
  },
  {
    icon: Users,
    title: "Sellers Come to You",
    description:
      "Verified sellers see your request and compete. No haggling, no chasing — let them bring their best offer.",
    accent: "#06B6D4",
  },
  {
    icon: MessageSquareLock,
    title: "Secure In-App Chat",
    description:
      "Negotiate and finalize in a private deal room. Your contact info stays protected until you're ready.",
    accent: "#3B82F6",
  },
];

// Framer Motion variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-[#0D0F14]">
      {/* ===== Hero ===== */}
      <section className="relative flex min-h-[88vh] flex-col items-center justify-center px-4 text-center">
        {/* Animated gradient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[#3B82F6]/20 blur-[140px] animate-blob" />
          <div
            className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-[#06B6D4]/15 blur-[120px] animate-blob"
            style={{ animationDelay: "4s" }}
          />
          <div
            className="absolute bottom-0 left-0 h-[400px] w-[500px] rounded-full bg-[#1E40AF]/15 blur-[120px] animate-blob"
            style={{ animationDelay: "8s" }}
          />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        {/* Hero content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 flex max-w-4xl flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-4 py-1.5 text-sm text-[#60A5FA]"
          >
            <Sparkles size={14} />
            The reverse car marketplace
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="text-balance text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl"
          >
            Don&apos;t search.
            <br />
            <span className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
              Let the car come to you.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-balance text-lg text-gray-400 sm:text-xl"
          >
            Post your dream car. Let sellers compete for your money.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={item}
            className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
          >
            <Link
              href="/register?role=buyer"
              className={cn(
                "group inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-8 text-base font-semibold text-white",
                "glow-blue transition-all hover:bg-[#2563EB] hover:shadow-[0_0_36px_rgba(59,130,246,0.6)] sm:w-auto"
              )}
            >
              I Want to Buy
              <ArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/register?role=seller"
              className={cn(
                "group inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-[#06B6D4]/30 bg-white/5 px-8 text-base font-semibold text-[#06B6D4] backdrop-blur-md",
                "transition-all hover:border-[#06B6D4]/60 hover:bg-[#06B6D4]/10 sm:w-auto"
              )}
            >
              I Want to Sell
              <ArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== Social Proof Ticker ===== */}
      <section className="relative border-y border-white/5 bg-[#111827]/60 py-4 overflow-hidden">
        <div className="flex w-max animate-ticker gap-8 whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((text, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-gray-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* ===== Feature Highlights ===== */}
      <section
        id="how-it-works"
        className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center"
        >
          <motion.h2
            variants={item}
            className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            How it works
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-3 max-w-xl text-center text-gray-400"
          >
            Three simple steps between you and your next car.
          </motion.p>

          <div className="mt-14 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <motion.div key={feature.title} variants={item}>
                <div className="glass group h-full rounded-2xl p-8 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]">
                  <div
                    className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${feature.accent}15`,
                      boxShadow: `0 0 24px ${feature.accent}25`,
                    }}
                  >
                    <feature.icon size={26} style={{ color: feature.accent }} />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== Bottom CTA ===== */}
      <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-[#3B82F6]/20 blur-[100px]" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to flip the script?
            </h2>
            <p className="mt-4 text-gray-400">
              Join thousands of buyers and sellers on ReverseDrive.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register?role=buyer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-6 font-semibold text-white glow-blue transition-all hover:bg-[#2563EB]"
              >
                Get Started as a Buyer
              </Link>
              <Link
                href="/register?role=seller"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#06B6D4]/30 bg-white/5 px-6 font-semibold text-[#06B6D4] backdrop-blur-md transition-all hover:border-[#06B6D4]/60 hover:bg-[#06B6D4]/10"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}