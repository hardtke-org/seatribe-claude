import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const access_token = searchParams.get('access_token')
  const refresh_token = searchParams.get('refresh_token')
  const next = searchParams.get('next') ?? '/portal'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  function makeClient(response: NextResponse) {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return [] },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })
  }

  // Case 1: Invite / magic link (token_hash + type)
  if (token_hash && type) {
    const response = NextResponse.redirect(`${origin}${next}`)
    const supabase = makeClient(response)
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'invite' | 'magiclink' | 'recovery' | 'email',
    })
    if (!error) return response
    return NextResponse.redirect(`${origin}/login?error=invalid_link`)
  }

  // Case 2: PKCE flow (code)
  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`)
    const supabase = makeClient(response)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return response
    return NextResponse.redirect(`${origin}/login?error=auth_error`)
  }

  // Case 3: Implicit flow tokens in query params (from HTML bridge below)
  if (access_token && refresh_token) {
    const response = NextResponse.redirect(`${origin}${next}`)
    const supabase = makeClient(response)
    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (!error) return response
    return NextResponse.redirect(`${origin}/login?error=auth_error`)
  }

  // HTML bridge: tokens land in URL hash (not accessible server-side), extract and re-redirect
  const html = `<!DOCTYPE html><html><head><script>
(function() {
  var hash = window.location.hash.substring(1);
  var params = new URLSearchParams(hash);
  var at = params.get('access_token');
  var rt = params.get('refresh_token');
  var search = new URLSearchParams(window.location.search);
  var nextPath = search.get('next') || '/portal';
  if (at && rt) {
    var url = '${origin}/auth/callback'
      + '?next=' + encodeURIComponent(nextPath)
      + '&access_token=' + encodeURIComponent(at)
      + '&refresh_token=' + encodeURIComponent(rt);
    window.location.replace(url);
  } else {
    window.location.replace('/login?error=no_token');
  }
})();
</script></head><body>Einloggen…</body></html>`
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
