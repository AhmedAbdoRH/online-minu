import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const url = new URL(request.url)
    // console.log(`Middleware: Checking ${url.pathname}. User found: ${!!user}`);

    if (url.pathname === '/') {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    if (user && (url.pathname === '/login' || url.pathname === '/signup')) {
      // console.log("Middleware: User logged in, redirecting to dashboard");
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (!user && url.pathname.startsWith('/dashboard')) {
      // console.log("Middleware: No user, redirecting to login");
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (session) {
      await supabase.auth.refreshSession()
    }

    return response
  } catch (e) {
    // If middleware fails, log it but don't break the app. 
    // Just allow the request to proceed.
    console.error('Middleware Error:', e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (files with extensions like .png, .jpg, etc.)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/.*|favicon.ico|api/.*|.*\\..*).*)',
  ],
}

