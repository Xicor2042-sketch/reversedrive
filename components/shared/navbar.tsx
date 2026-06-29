import Link from "next/link";

const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#08090a]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-[15px] font-medium tracking-tight text-[#f7f8f8]" style={{ fontWeight: 510 }}>
            Reverse<span className="text-[#7170ff]">Drive</span>
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
            className="text-[13px] text-white bg-[#5e6ad2] hover:bg-[#7170ff] px-3 py-1.5 rounded-[6px] transition-colors"
            style={{ fontWeight: 510 }}
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}