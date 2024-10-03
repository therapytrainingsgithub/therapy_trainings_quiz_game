import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Key is not defined');
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Ensure cookies are set with SameSite=none and Secure if not localhost
          const cookieOptions = `; SameSite=${options.sameSite}; Secure=${options.secure}`;
          request.cookies.set(name, `${value}${cookieOptions}`);
        });
      }
    }
  });

  let supabaseResponse = NextResponse.next();

  // Fetch user session from Supabase
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users trying to access a protected route
  if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect from "/" to "/quiz" if logged in, otherwise to "/login"
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    if (user) {
      url.pathname = '/quiz';
    } else {
      url.pathname = '/login';
    }
    return NextResponse.redirect(url);
  }

  if ((pathname === '/login' || pathname === '/signup') && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/quiz';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
