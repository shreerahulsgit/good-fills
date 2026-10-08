import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const CONSOLE_SESSION_COOKIE = 'GFSESSION';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/console')) {
    const hasConsoleSession = Boolean(request.cookies.get(CONSOLE_SESSION_COOKIE)?.value);
    if (!hasConsoleSession && pathname !== '/console') {
      return NextResponse.redirect(new URL('/console', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/auth/')) {
    if (!request.cookies.get(CONSOLE_SESSION_COOKIE)?.value) {
      return NextResponse.json({ error: 'Console authentication required.' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/account/') && !pathname.startsWith('/api/account/auth/')) {
    const response = NextResponse.next({ request });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Account authentication required.' }, { status: 401 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/console/:path*', '/api/admin/:path*', '/api/account/:path*'],
};