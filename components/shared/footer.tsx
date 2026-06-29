import Link from "next/link";

const footerLinks = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#08090a]">
      <div className="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between gap-6 px-6 py-12">
        <span className="text-[15px] tracking-tight text-[#f7f8f8]" style={{ fontWeight: 510 }}>
          Reverse<span className="text-[#7170ff]">Drive</span>
        </span>
        <div className="flex items-center gap-6 text-[13px] text-[#62666d]" style={{ fontWeight: 510 }}>
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-[#f7f8f8] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <span className="text-[12px] text-[#62666d]">© {new Date().getFullYear()} ReverseDrive</span>
      </div>
    </footer>
  );
}