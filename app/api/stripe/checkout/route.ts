import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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

    // Verify the request exists and is active
    const { data: carRequest } = await supabase
      .from('car_requests')
      .select('id, make, model, status')
      .eq('id', requestId)
      .single()

    if (!carRequest || carRequest.status !== 'active') {
      return NextResponse.json({ error: 'Lead not available' }, { status: 404 })
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from('unlocked_leads')
      .select('id')
      .eq('request_id', requestId)
      .eq('seller_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already unlocked', alreadyUnlocked: true }, { status: 400 })
    }

    // Create Stripe checkout session
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
            unit_amount: 999, // $9.99 in cents
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
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}