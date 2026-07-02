import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Auth callback handler — exchanges the OAuth code for a session.
// Supabase redirects here with ?code=... after email confirmation or OAuth login.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Optional "next" param to redirect somewhere other than /dashboard
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            // We'll carry cookies over via the redirect response below
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Apply any sign-up intent (role/dealer flag) stashed by the register page.
      const intentCookie = request.cookies.get("rd_oauth_intent")?.value;
      let nextPath = next;
      if (intentCookie) {
        let intent: { role?: string; is_dealer?: boolean; display_name?: string; dealer_business_name?: string } | null = null;
        try {
          intent = JSON.parse(intentCookie);
        } catch {
          try { intent = JSON.parse(decodeURIComponent(intentCookie)); } catch {}
        }
        if (intent) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const updates: Record<string, unknown> = {
              role: intent.role === "seller" ? "seller" : "buyer",
              is_dealer: !!intent.is_dealer,
              updated_at: new Date().toISOString(),
            };
            if (intent.display_name) updates.display_name = intent.display_name;
            if (intent.dealer_business_name) updates.dealer_business_name = intent.dealer_business_name;
            await supabase.from("profiles").update(updates).eq("id", user.id);
            await supabase.auth.updateUser({
              data: { role: updates.role, is_dealer: updates.is_dealer },
            }).catch(() => {});
            nextPath = intent.role === "seller" ? "/leads" : "/dashboard";
          }
        }
      }

      // Build redirect response and forward the session cookies
      const response = NextResponse.redirect(`${origin}${nextPath}`);
      // Copy cookies from the request (now populated by exchangeCodeForSession)
      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name === "rd_oauth_intent") return;
        response.cookies.set(cookie.name, cookie.value, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
      });
      // Clear the consumed intent cookie.
      response.cookies.set("rd_oauth_intent", "", { path: "/", maxAge: 0 });
      return response;
    }

    // Error exchanging code — redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
  }

  // No code present — redirect to login
  return NextResponse.redirect(`${origin}/login`);
}