import Link from "next/link";
import { ShieldCheck, Lock, BadgeCheck } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Post a request", href: "/register?role=buyer" },
      { label: "Browse leads", href: "/register?role=seller" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#08090a]">
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          {/* Brand */}
          <div>
            <span className="text-[16px] tracking-tight text-[#f7f8f8]" style={{ fontWeight: 510 }}>
              Reverse<span className="text-[#7170ff]">Drive</span>
            </span>
            <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-[#62666d]">
              The reverse car marketplace. You post the car you want — verified
              sellers compete for your business.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] text-[#8a8f98]" style={{ fontWeight: 510 }}>
                <ShieldCheck size={11} className="text-[#10b981]" /> Privacy shield
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] text-[#8a8f98]" style={{ fontWeight: 510 }}>
                <Lock size={11} className="text-[#7170ff]" /> Escrow protected
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] text-[#8a8f98]" style={{ fontWeight: 510 }}>
                <BadgeCheck size={11} className="text-[#5e6ad2]" /> Verified sellers
              </span>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <div className="mb-3 text-[11px] uppercase tracking-wider text-[#62666d]" style={{ fontWeight: 510 }}>
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
                      style={{ fontWeight: 510 }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.05] pt-6">
          <span className="text-[12px] text-[#62666d]">
            © {new Date().getFullYear()} ReverseDrive. All rights reserved.
          </span>
          <span className="text-[12px] text-[#62666d]">
            Built for buyers. Feared by dealerships.
          </span>
        </div>
      </div>
    </footer>
  );
}
