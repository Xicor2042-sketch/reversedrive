import Link from "next/link";

export function AuthLogo() {
  return (
    <Link href="/" className="group flex items-center gap-2">
      <span className="text-2xl tracking-tight text-[#f7f8f8]" style={{ fontWeight: 510 }}>
        Reverse
        <span className="text-[#7170ff] transition-all group-hover:text-[#828fff]">
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#08090a] px-4 py-12" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-[#5e6ad2]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-[#7170ff]/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(94,106,210,0.08),transparent_50%)]" />

      {/* Logo at top */}
      <div className="relative z-10 mb-8">
        <AuthLogo />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
