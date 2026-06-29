"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function updateRequestStatus(requestId: string, status: "active" | "paused" | "closed") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: request } = await supabase
    .from("car_requests")
    .select("buyer_id")
    .eq("id", requestId)
    .single()

  if (!request || request.buyer_id !== user.id) throw new Error("Forbidden")

  const update: { status: string; expires_at?: string } = { status }
  if (status === "active") {
    // Reactivate/extend for 30 days
    const d = new Date()
    d.setDate(d.getDate() + 30)
    update.expires_at = d.toISOString()
  }

  const { error } = await supabase.from("car_requests").update(update).eq("id", requestId)
  if (error) throw new Error(error.message)

  revalidatePath(`/requests/${requestId}`)
  revalidatePath("/requests")
  revalidatePath("/dashboard")
}

export async function closeRequest(requestId: string) {
  await updateRequestStatus(requestId, "closed")
}

export async function deleteRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: request } = await supabase
    .from("car_requests")
    .select("buyer_id")
    .eq("id", requestId)
    .single()

  if (!request || request.buyer_id !== user.id) throw new Error("Forbidden")

  const { error } = await supabase.from("car_requests").delete().eq("id", requestId)
  if (error) throw new Error(error.message)

  revalidatePath("/requests")
  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function updateRequest(
  requestId: string,
  payload: {
    make: string
    model: string
    year_min?: number
    year_max?: number
    body_type?: string
    fuel_type?: string
    transmission?: string
    mileage_max?: number
    max_budget: number
    payment_method: string
    location_zip: string
    location_radius_miles: number
    notes?: string
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: request } = await supabase
    .from("car_requests")
    .select("buyer_id")
    .eq("id", requestId)
    .single()

  if (!request || request.buyer_id !== user.id) throw new Error("Forbidden")

  const { error } = await supabase
    .from("car_requests")
    .update({
      ...payload,
      body_type: payload.body_type || null,
      fuel_type: payload.fuel_type || null,
      transmission: payload.transmission || null,
      notes: payload.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)

  if (error) throw new Error(error.message)

  revalidatePath(`/requests/${requestId}`)
  revalidatePath("/requests")
  revalidatePath("/dashboard")
}
