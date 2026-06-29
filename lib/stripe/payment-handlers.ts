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

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({
      request_id: payload.requestId,
      seller_id: payload.sellerId,
      status: "active",
    })
    .select("id")
    .single()

  if (convError) throw new Error(convError.message)

  const { error: txError } = await supabase.from("transactions").insert({
    seller_id: payload.sellerId,
    request_id: payload.requestId,
    amount: payload.unlockFeeCents / 100,
    type: "lead_unlock",
    status: "paid",
    stripe_payment_intent_id: payload.stripePaymentIntentId || `demo_${Date.now()}`,
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
