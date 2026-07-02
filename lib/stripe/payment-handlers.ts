import { createClient } from "@/lib/supabase/server"

export interface LeadUnlockMeta {
  sellerId: string
  requestId: string
  unlockFeeCents: number
  stripePaymentIntentId?: string
}

export interface WalletDepositMeta {
  buyerId: string
  amountCents: number
  stripePaymentIntentId?: string
}

export async function handleLeadUnlock(payload: LeadUnlockMeta) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("unlocked_leads")
    .select("id, seller_id")
    .eq("request_id", payload.requestId)
    .eq("seller_id", payload.sellerId)
    .maybeSingle()

  if (existing) {
    const { data: conv } = await supabase
      .from("conversations")
      .select("id")
      .eq("request_id", payload.requestId)
      .eq("seller_id", payload.sellerId)
      .maybeSingle()
    return { alreadyUnlocked: true, conversationId: conv?.id || null }
  }

  // 1) Record the unlock (one per seller+request — enforced by unique constraint)
  const { data: unlock, error: unlockError } = await supabase
    .from("unlocked_leads")
    .insert({
      seller_id: payload.sellerId,
      request_id: payload.requestId,
      unlock_fee: payload.unlockFeeCents / 100,
      stripe_payment_intent_id: payload.stripePaymentIntentId || `demo_${Date.now()}`,
      unlocked_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (unlockError) throw new Error(unlockError.message)

  // 2) Look up the buyer who owns this request (needed to open the Deal Room —
  //    conversations.buyer_id is NOT NULL, so the insert fails without it)
  const { data: carRequest, error: reqError } = await supabase
    .from("car_requests")
    .select("buyer_id")
    .eq("id", payload.requestId)
    .single()

  if (reqError || !carRequest) throw new Error(reqError?.message || "Request not found")

  // 3) Open the Deal Room conversation (buyer_id + unlock_id are both NOT NULL)
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({
      request_id: payload.requestId,
      buyer_id: carRequest.buyer_id,
      seller_id: payload.sellerId,
      unlock_id: unlock.id,
      status: "active",
    })
    .select("id")
    .single()

  if (convError) throw new Error(convError.message)

  // 4) Record the $9.99 unlock transaction (column names + status must match the schema)
  const { error: txError } = await supabase.from("transactions").insert({
    seller_id: payload.sellerId,
    related_request_id: payload.requestId,
    amount: payload.unlockFeeCents / 100,
    type: "lead_unlock",
    status: "completed",
    stripe_payment_id: payload.stripePaymentIntentId || `demo_${Date.now()}`,
  })

  if (txError) throw new Error(txError.message)

  return { alreadyUnlocked: false, conversationId: conversation.id }
}

export async function handleWalletDeposit(payload: WalletDepositMeta) {
  const supabase = await createClient()

  const { data: wallet } = await supabase
    .from("buyer_wallets")
    .select("id, balance")
    .eq("id", payload.buyerId)
    .maybeSingle()

  const amount = payload.amountCents / 100

  if (wallet) {
    const { error } = await supabase
      .from("buyer_wallets")
      .update({ balance: wallet.balance + amount, updated_at: new Date().toISOString() })
      .eq("id", payload.buyerId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from("buyer_wallets").insert({
      id: payload.buyerId,
      balance: amount,
    })
    if (error) throw new Error(error.message)
  }

  const { error: escrowError } = await supabase.from("escrow_transactions").insert({
    buyer_id: payload.buyerId,
    amount,
    status: "funded",
    stripe_payment_intent_id: payload.stripePaymentIntentId || `demo_${Date.now()}`,
  })

  if (escrowError) throw new Error(escrowError.message)

  return { success: true }
}
