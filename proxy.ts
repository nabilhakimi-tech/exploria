import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Protected routes that require authentication (empty so portals can be entered directly without login)
const PROTECTED_ROUTES: string[] = [];
const AUTH_ROUTES = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const userRole = (user?.user_metadata?.role as string) || 'parent';

  // 1. If user is NOT authenticated and trying to access protected routes → redirect to login
  if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 2. If user IS authenticated and trying to access auth routes (/login, /register) → redirect to their respective portal
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    if (userRole === 'admin' || userRole === 'staff') {
      url.pathname = '/staff';
    } else if (userRole === 'student') {
      url.pathname = '/student';
    } else {
      url.pathname = '/parent';
    }
    return NextResponse.redirect(url);
  }

  // 3. Role-Based Access Control (RBAC) across portals
  if (user) {
    // Only staff and admin can access /staff
    if (pathname.startsWith('/staff') && userRole !== 'staff' && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = userRole === 'student' ? '/student' : '/parent';
      return NextResponse.redirect(url);
    }

    // Students cannot access parent portal
    if (pathname.startsWith('/parent') && userRole === 'student') {
      const url = request.nextUrl.clone();
      url.pathname = '/student';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
