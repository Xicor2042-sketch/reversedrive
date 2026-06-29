import Link from "next/link";

export function AuthLogo() {
  return (
    <Link href="/" className="group flex items-center gap-2">
      <span className="text-2xl font-bold tracking-tight text-white">
        Reverse
        <span className="text-[#3B82F6] text-glow-blue transition-all group-hover:text-[#60A5FA]">
          Drive
        </span>
      </span>
    </Link>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0D0F14] px-4 py-12">
      {/* Subtle grid background pattern */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

      {/* Ambient neon glows */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-[#3B82F6]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-[#06B6D4]/10 blur-[120px]" />

      {/* Logo at top */}
      <div className="relative z-10 mb-8">
        <AuthLogo />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}