import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { handleWalletDeposit } from "@/lib/stripe/payment-handlers"
import Stripe from "stripe"

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Redirect handler after a successful wallet-deposit checkout. Credits the
// wallet under the buyer's own session (verified against Stripe), so it
// works without the service-role key; the webhook is a redundant backup and
// handleWalletDeposit is idempotent per payment intent.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    if (sessionId) {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      const paid = session.payment_status === "paid"
      const mine =
        session.metadata?.type === "wallet_deposit" &&
        session.metadata?.buyer_id === user.id

      if (paid && mine) {
        const cents = Number(session.metadata?.amount_cents || session.amount_total || 0)
        if (cents > 0) {
          await handleWalletDeposit({
            buyerId: user.id,
            amountCents: cents,
            stripePaymentIntentId: (session.payment_intent as string) || undefined,
          })
          return NextResponse.redirect(new URL("/wallet?success=true", request.url))
        }
      }
    }
  } catch (err) {
    console.error("Wallet deposit finalization error:", err)
  }

  return NextResponse.redirect(new URL("/wallet", request.url))
}
