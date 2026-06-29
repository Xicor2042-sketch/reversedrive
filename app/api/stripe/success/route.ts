import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Redirect handler after successful Stripe payment
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const requestId = searchParams.get('request_id')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !requestId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Find the conversation that was just created
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('request_id', requestId)
    .eq('seller_id', user.id)
    .single()

  if (conversation) {
    return NextResponse.redirect(new URL(`/deal-room/${conversation.id}`, request.url))
  }

  // Fallback to seller dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
}