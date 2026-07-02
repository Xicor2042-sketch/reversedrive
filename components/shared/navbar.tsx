"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  // Transparent while at the very top of the page, condenses into a glass
  // bar with a hairline border once the user starts scrolling.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.06] bg-[#08090a]/75 backdrop-blur-xl shadow-[0_12px_40px_-16px_rgba(0,0,0,0.7)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? "h-13 md:h-14" : "h-16"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-[15px] font-medium tracking-tight text-[#f7f8f8]" style={{ fontWeight: 510 }}>
            Reverse<span className="text-[#7170ff] transition-colors group-hover:text-[#828fff]">Drive</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] text-[#8a8f98] transition-colors hover:text-[#f7f8f8]"
              style={{ fontWeight: 510 }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
            style={{ fontWeight: 510 }}
          >
            Log In
          </Link>
          <Link
            href="/register?role=buyer"
            className="text-[13px] text-white bg-[#5e6ad2] hover:bg-[#7170ff] hover:shadow-[0_0_20px_-4px_rgba(113,112,255,0.6)] px-3 py-1.5 rounded-[6px] transition-all"
            style={{ fontWeight: 510 }}
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
