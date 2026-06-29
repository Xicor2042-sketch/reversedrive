import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleLeadUnlock } from '@/lib/stripe/payment-handlers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.STRIPE_SECRET_KEY?.startsWith('sk_')

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId } = await request.json()

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID required' }, { status: 400 })
    }

    const { data: carRequest } = await supabase
      .from('car_requests')
      .select('id, make, model, status')
      .eq('id', requestId)
      .single()

    if (!carRequest || carRequest.status !== 'active') {
      return NextResponse.json({ error: 'Lead not available' }, { status: 404 })
    }

    if (DEMO_MODE) {
      const result = await handleLeadUnlock({
        sellerId: user.id,
        requestId,
        unlockFeeCents: 999,
      })
      return NextResponse.json({ demo: true, ...result })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Lead Unlock: ${carRequest.make} ${carRequest.model}`,
              description: 'Unlock buyer contact info and start chatting in the Deal Room',
            },
            unit_amount: 999,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}&request_id=${requestId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/leads/${requestId}`,
      metadata: {
        seller_id: user.id,
        request_id: requestId,
        type: 'lead_unlock',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 })
  }
}
