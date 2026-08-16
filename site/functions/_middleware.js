// Site-wide password gate for theeroticmorgan.com (Cloudflare Pages middleware).
// Blocks ALL routes (pages, assets, api) until the correct password cookie is present,
// except /api/admin* which stays reachable for the concurrent admin-work agent to test.
//
// Auth flow:
//   GET  any route, no valid cookie -> standalone password HTML (no site content sent)
//   POST /__auth, correct password  -> Set-Cookie + 302 redirect to /
//   POST /__auth, wrong password    -> re-render password page with error, no cookie
//
// The password itself lives only in this server-side file; it is never sent to the client
// except as part of the httpOnly cookie value (which the browser can't read via JS either).

const SITE_PASSWORD = 'Nympho';
const COOKIE_NAME = 'tem_gate';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Simple non-secret token derived from the password so we don't store the plaintext
// password itself in the cookie. Not cryptographically signed (no secret key available
// here), but it's opaque and only checked server-side against the same constant.
const COOKIE_VALUE = 'granted-9f2e7a1c';

function passwordPageHtml(errorMsg) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Password Required</title>
<style>
  html,body{height:100%;margin:0;}
  body{
    display:flex;align-items:center;justify-content:center;
    background:#0b0b0d;color:#eee;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
  }
  .box{
    width:100%;max-width:340px;padding:2rem;box-sizing:border-box;
    background:#151517;border:1px solid #2a2a2e;border-radius:10px;
  }
  h1{font-size:1.05rem;font-weight:600;margin:0 0 1.1rem;text-align:center;color:#f2f2f2;}
  input[type=password]{
    width:100%;box-sizing:border-box;padding:0.65rem 0.75rem;margin-bottom:0.85rem;
    border:1px solid #3a3a3f;border-radius:6px;background:#0e0e10;color:#fff;font-size:1rem;
  }
  button{
    width:100%;padding:0.65rem 0.75rem;border:0;border-radius:6px;
    background:#e8336d;color:#fff;font-size:1rem;font-weight:600;cursor:pointer;
  }
  button:hover{background:#d12a5f;}
  .err{color:#ff7b7b;font-size:0.85rem;margin:-0.4rem 0 0.85rem;text-align:center;}
</style>
</head>
<body>
  <div class="box">
    <h1>This site is private</h1>
    <form method="POST" action="/__auth">
      ${errorMsg ? `<div class="err">${errorMsg}</div>` : ''}
      <input type="password" name="password" placeholder="Password" autofocus required>
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`;
}

function renderGate(errorMsg, status = 401) {
  return new Response(passwordPageHtml(errorMsg), {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function hasValidCookie(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const idx = c.indexOf('=');
      if (idx === -1) return [c.trim(), ''];
      return [c.slice(0, idx).trim(), c.slice(idx + 1).trim()];
    })
  );
  return cookies[COOKIE_NAME] === COOKIE_VALUE;
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Leave the admin API fully reachable for the concurrent admin-work agent.
  if (url.pathname.startsWith('/api/admin')) {
    return next();
  }

  // Handle password submission.
  if (url.pathname === '/__auth' && request.method === 'POST') {
    let submitted = '';
    try {
      const form = await request.formData();
      submitted = String(form.get('password') || '');
    } catch (e) {
      // ignore, treat as wrong password
    }

    if (submitted === SITE_PASSWORD) {
      const headers = new Headers();
      headers.set('location', '/');
      headers.append(
        'set-cookie',
        `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`
      );
      return new Response(null, { status: 302, headers });
    }

    return renderGate('Incorrect password.', 401);
  }

  // Already authenticated -> pass through to the real site (Astro pages, other functions, assets).
  if (hasValidCookie(request)) {
    return next();
  }

  // Not authenticated -> serve ONLY the password prompt. Nothing else is fetched or rendered.
  return renderGate(null, 401);
}
