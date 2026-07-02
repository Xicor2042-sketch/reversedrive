import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Privacy Policy · ReverseDrive" }

const sections = [
  {
    h: "1. What we collect",
    p: "Account details (name, email, optional phone and business name), the car requests you post (vehicle specs, budget, ZIP code and search radius), messages you send in Deal Rooms, wallet and payment records, and basic technical data such as device type and pages visited. Card numbers never touch our servers — payments are processed by Stripe.",
  },
  {
    h: "2. The Privacy Shield",
    p: "Protecting buyer contact information is the core of the product. Your name, email, and phone are enforced as private at the database level with row-level security. Sellers browsing requests see only the vehicle specs, budget, and general area. A seller who unlocks your request sees your first name and can chat with you in-app — your email and phone number are never shown unless you choose to share them yourself.",
  },
  {
    h: "3. How we use data",
    p: "We use your data to run the marketplace: matching requests with sellers, powering Deal Room chat, processing unlock fees and wallet deposits, preventing fraud, and sending transactional emails such as password resets and unlock notifications. We do not sell your personal information, and we do not share it with advertisers.",
  },
  {
    h: "4. Who we share with",
    p: "Service providers that make ReverseDrive work: Supabase (database and authentication), Vercel (hosting), and Stripe (payments). Each receives only what it needs to perform its function. We may disclose information if required by law or to protect users from fraud or safety threats.",
  },
  {
    h: "5. Data retention and deletion",
    p: "We keep your data while your account is active. You can update your profile anytime in Settings. To delete your account and associated data, contact us and we will remove it within 30 days, except records we must keep for tax, fraud-prevention, or legal reasons (such as payment records).",
  },
  {
    h: "6. Security",
    p: "All traffic is encrypted in transit (HTTPS). Database access is gated by row-level security policies so users can only read the rows that belong to them. Payment credentials are handled entirely by Stripe, a PCI-DSS Level 1 provider.",
  },
  {
    h: "7. Changes and contact",
    p: "If this policy changes materially we will notify you by email or in-app notice. Questions or requests about your data? Reach us through the contact page.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] px-6 py-24" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
          style={{ fontWeight: 510 }}
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="text-3xl tracking-tight mb-3" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>
          Privacy Policy
        </h1>
        <p className="text-[13px] text-[#62666d] mb-10">Last updated July 2, 2026 · Early access</p>

        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-[16px] mb-2" style={{ fontWeight: 510 }}>{s.h}</h2>
              <p className="text-[14px] leading-relaxed text-[#8a8f98]">{s.p}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-[10px] border border-[#f5a623]/20 bg-[#f5a623]/[0.04] p-4 text-[12px] leading-relaxed text-[#8a8f98]">
          ReverseDrive is in early access. This policy is a plain-language description of our
          current practices and will be reviewed by counsel before general availability.
        </p>
      </div>
    </div>
  )
}
