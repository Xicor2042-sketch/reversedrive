import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Terms of Service · ReverseDrive" }

const sections = [
  {
    h: "1. What ReverseDrive is",
    p: "ReverseDrive is a reverse car marketplace. Buyers post requests describing the vehicle they want; sellers pay a fee to unlock a request and communicate with the buyer through our in-app Deal Room. ReverseDrive is a venue that connects buyers and sellers — we are not a party to any vehicle sale, we do not own or inspect vehicles, and we do not guarantee that any deal will complete.",
  },
  {
    h: "2. Accounts",
    p: "You must provide accurate information when creating an account and keep your login credentials secure. You are responsible for all activity under your account. You must be at least 18 years old and able to enter a binding contract to use ReverseDrive. We may suspend or terminate accounts that violate these terms, post fraudulent requests, or abuse other users.",
  },
  {
    h: "3. Fees",
    p: "Posting requests is free for buyers. Sellers pay a per-lead unlock fee (shown at the time of purchase) to open a conversation with a buyer. Unlock fees are charged when you confirm the purchase and are non-refundable once the buyer's information has been revealed, except where required by law or where we determine a request was fraudulent. We do not charge a commission on vehicle sales.",
  },
  {
    h: "4. Wallet and escrow-style deposits",
    p: "Buyers may add funds to an in-app wallet to signal purchase readiness. Wallet funds remain under your control and are only released to a seller when you explicitly approve a deal. Wallet features may be limited or unavailable while ReverseDrive is in early access. ReverseDrive is not a bank, and wallet balances are not deposit accounts and do not earn interest.",
  },
  {
    h: "5. Conduct",
    p: "You agree not to: post false or misleading requests; attempt to move conversations off-platform to avoid fees; harvest or scrape user data; harass other users; or use ReverseDrive for any unlawful purpose, including the sale of stolen vehicles or odometer fraud. Buyer contact information revealed by an unlock may only be used to discuss the specific vehicle request it belongs to.",
  },
  {
    h: "6. Vehicle transactions",
    p: "All negotiations, inspections, test drives, payments for vehicles, and title transfers happen between the buyer and seller directly. Always verify the vehicle's condition, history, and title in person before paying. ReverseDrive provides no warranty of any kind regarding vehicles, sellers, or buyers.",
  },
  {
    h: "7. Limitation of liability",
    p: "To the maximum extent permitted by law, ReverseDrive's total liability for any claim arising out of your use of the service is limited to the fees you paid us in the twelve months before the claim. We are not liable for indirect, incidental, or consequential damages, or for losses arising from transactions between users.",
  },
  {
    h: "8. Changes",
    p: "We may update these terms as the product evolves. If we make material changes we will notify you by email or in-app notice. Continuing to use ReverseDrive after changes take effect means you accept the updated terms.",
  },
  {
    h: "9. Contact",
    p: "Questions about these terms? Reach us through the contact page and we'll get back to you quickly.",
  },
]

export default function TermsPage() {
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
          Terms of Service
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
          ReverseDrive is in early access. These terms are a plain-language summary of how the
          service works today and will be reviewed by counsel before general availability.
        </p>
      </div>
    </div>
  )
}
