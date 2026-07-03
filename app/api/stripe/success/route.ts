import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleLeadUnlock } from '@/lib/stripe/payment-handlers'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Redirect handler after successful Stripe payment.
//
// This route does the unlock itself (verified against Stripe) instead of
// waiting for the webhook: it runs under the seller's own session, so all
// inserts pass RLS — proven by the demo-mode flow which uses the same
// handleLeadUnlock. handleLeadUnlock is idempotent, so the webhook firing
// as well cannot double-unlock.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const requestId = searchParams.get('request_id')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !requestId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    if (sessionId) {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      const paid = session.payment_status === 'paid'
      const mine =
        session.metadata?.type === 'lead_unlock' &&
        session.metadata?.seller_id === user.id &&
        session.metadata?.request_id === requestId

      if (paid && mine) {
        const result = await handleLeadUnlock({
          sellerId: user.id,
          requestId,
          unlockFeeCents: session.amount_total ?? 999,
          stripePaymentIntentId: (session.payment_intent as string) || undefined,
        })
        if (result.conversationId) {
          return NextResponse.redirect(new URL(`/deal-room/${result.conversationId}`, request.url))
        }
      }
    }
  } catch (err) {
    console.error('Unlock finalization error:', err)
  }

  // Fallback: the webhook may have already created the conversation.
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('request_id', requestId)
    .eq('seller_id', user.id)
    .maybeSingle()

  if (conversation) {
    return NextResponse.redirect(new URL(`/deal-room/${conversation.id}`, request.url))
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
