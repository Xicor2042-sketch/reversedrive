import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0D0F14]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">
            Reverse
            <span className="text-[#3B82F6] text-glow-blue transition-all group-hover:text-[#60A5FA]">
              Drive
            </span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Log In button */}
        <Link
          href="/login"
          className={cn(
            "rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white",
            "transition-all hover:border-[#3B82F6]/40 hover:bg-[#3B82F6]/10 hover:text-white"
          )}
        >
          Log In
        </Link>
      </nav>
    </header>
  );
}