import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { seller_id, request_id, buyer_id, type } = session.metadata || {}

      if (type === 'lead_unlock' && seller_id && request_id) {
        // Create unlock record
        const { data: unlockRecord, error: unlockError } = await supabase
          .from('unlocked_leads')
          .insert({
            seller_id,
            request_id,
            unlock_fee: 9.99,
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .select()
          .single()

        if (unlockError) {
          console.error('Failed to create unlock record:', unlockError)
          break
        }

        // Get the buyer_id from the request
        const { data: carRequest } = await supabase
          .from('car_requests')
          .select('buyer_id')
          .eq('id', request_id)
          .single()

        if (carRequest) {
          // Create conversation
          await supabase.from('conversations').insert({
            request_id,
            buyer_id: carRequest.buyer_id,
            seller_id,
            unlock_id: unlockRecord.id,
          })
        }

        // Create transaction record
        await supabase.from('transactions').insert({
          seller_id,
          type: 'lead_unlock',
          amount: 9.99,
          stripe_payment_id: session.payment_intent as string,
          status: 'completed',
          related_request_id: request_id,
        })
      } else if (type === 'wallet_deposit' && buyer_id) {
        const amount = Number(session.metadata?.amount_cents || 0) / 100
        if (amount > 0) {
          // Upsert wallet row with balance increment
          const { data: wallet } = await supabase
            .from('buyer_wallets')
            .select('balance')
            .eq('id', buyer_id)
            .single()

          const newBalance = (wallet?.balance || 0) + amount
          const { error: walletError } = await supabase
            .from('buyer_wallets')
            .upsert({ id: buyer_id, balance: newBalance }, { onConflict: 'id' })

          if (walletError) {
            console.error('Failed to update wallet:', walletError)
            break
          }

          await supabase.from('escrow_transactions').insert({
            buyer_id,
            amount,
            stripe_payment_intent_id: session.payment_intent as string,
            status: 'funded',
            description: 'Wallet deposit',
          })
        }
      }
      break
    }

    default:
      // Unhandled event type
      break
  }

  return NextResponse.json({ received: true })
}