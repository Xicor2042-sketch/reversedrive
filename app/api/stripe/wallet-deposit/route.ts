import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { handleWalletDeposit } from "@/lib/stripe/payment-handlers"
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.STRIPE_SECRET_KEY?.startsWith('sk_')

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount } = await request.json()
    const cents = Math.round(Number(amount) * 100)

    if (!cents || cents < 500) {
      return NextResponse.json({ error: "Minimum deposit is $5" }, { status: 400 })
    }

    if (DEMO_MODE) {
      await handleWalletDeposit({ buyerId: user.id, amountCents: cents })
      return NextResponse.json({ demo: true, success: true })
    }

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "ReverseDrive Wallet Deposit",
              description: `Deposit $${(cents / 100).toFixed(2)} into your ReverseDrive wallet for secure car purchases`,
            },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?canceled=true`,
      metadata: {
        buyer_id: user.id,
        type: "wallet_deposit",
        amount_cents: cents.toString(),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Wallet deposit checkout error:", error)
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 })
  }
}
