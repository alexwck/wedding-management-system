import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // For server action POST requests, just pass through without touching
  // the Supabase session. The Supabase SSR setAll callback re-creates
  // NextResponse.next() which hangs the body stream on POST requests.
  // Auth is enforced on the GET that rendered the page, and server
  // actions that need auth should validate the session themselves.
  const isServerAction =
    request.method === "POST" &&
    request.headers.get("Next-Action") !== null;

  if (isServerAction) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // Root redirect based on auth state
  if (request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    if (!user) {
      url.pathname = "/auth/login";
    } else if (user.app_metadata?.role === "admin") {
      url.pathname = "/admin";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  // Protected routes require authentication
  if (!user && (isDashboardRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Admin routes require admin role (check app_metadata)
  if (user && isAdminRoute) {
    const role = user.app_metadata?.role;
    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
