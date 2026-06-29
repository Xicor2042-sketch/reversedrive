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
      // Build redirect response and forward the session cookies
      const response = NextResponse.redirect(`${origin}${next}`);
      // Copy cookies from the request (now populated by exchangeCodeForSession)
      request.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
      });
      return response;
    }

    // Error exchanging code — redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
  }

  // No code present — redirect to login
  return NextResponse.redirect(`${origin}/login`);
}