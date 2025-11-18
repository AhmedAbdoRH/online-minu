import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = new URL(request.url)

  if (user && (url.pathname === '/login' || url.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!user && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if(session){
    await supabase.auth.refreshSession()
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /c/ (public catalog pages)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/.*|favicon.ico|c/.*).*)',
  ],
}
