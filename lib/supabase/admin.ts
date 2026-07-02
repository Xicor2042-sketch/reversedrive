import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Server-only Supabase client for contexts with no user session (Stripe
// webhooks). Uses the service role key, which bypasses RLS — never import
// this from client components. Falls back to the anon key so demo mode
// keeps working before SUPABASE_SERVICE_ROLE_KEY is configured.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
