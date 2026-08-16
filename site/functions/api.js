// theeroticmorgan.com members + appointment Worker
// Deploys alongside the static site on Cloudflare Pages (functions/ directory).
// KV namespaces: TEM_USERS (registrations), TEM_SESSIONS (session tokens)
// Env vars: NOTIFY_EMAIL, TURNSTILE_SECRET (optional)

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const form = await request.formData();
  const json = Object.fromEntries(form.entries());

  if (url.pathname === '/api/register') {
    return handleRegister(json, env);
  }
  if (url.pathname === '/api/login') {
    return handleLogin(json, env);
  }
  if (url.pathname === '/api/appointment') {
    return handleAppointment(json, env);
  }
  return new Response('Not found', { status: 404 });
}

function fail(msg, status = 400) {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

async function sha256(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function pbkdf(pw, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 100000 }, key, 256);
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function handleRegister(j, env) {
  const u = String(j.username || '').trim();
  const e = String(j.email || '').trim().toLowerCase();
  const p = String(j.password || '');
  const p2 = String(j.password2 || '');
  if (u.length < 3) return fail('Username must be at least 3 characters.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return fail('Enter a valid email.');
  if (p.length < 8) return fail('Password must be at least 8 characters.');
  if (p !== p2) return fail('Passwords do not match.');

  const id = 'user:' + e;
  const existing = await env.TEM_USERS.get(id);
  if (existing) return fail('An account with this email already exists. Try logging in.');

  const salt = crypto.randomUUID();
  const hash = await pbkdf(p, salt);
  await env.TEM_USERS.put(id, JSON.stringify({
    username: u, email: e, salt, hash,
    created: new Date().toISOString(), active: false, // activated manually after $50 payment
  }));
  return new Response(JSON.stringify({
    ok: true,
    message: 'Registered. Send the one-time $50 payment to 469-274-7852 (Zelle/Venmo/CashApp/PayPal/Apple Pay) and your access will be activated, usually the same day.',
  }), { headers: { 'content-type': 'application/json' } });
}

async function handleLogin(j, env) {
  const id = String(j.user || '').trim().toLowerCase();
  const p = String(j.password || '');
  let rec = await env.TEM_USERS.get('user:' + id);
  if (!rec) {
    // try username lookup index
    const email = await env.TEM_USERS.get('nameidx:' + id);
    if (email) rec = await env.TEM_USERS.get('user:' + email);
  }
  if (!rec) return fail('Invalid credentials.', 401);
  const user = JSON.parse(rec);
  const hash = await pbkdf(p, user.salt);
  if (hash !== user.hash) return fail('Invalid credentials.', 401);
  if (!user.active) return fail('Membership not activated yet. If you have already sent payment, give me a few hours to activate it.');

  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  await env.TEM_SESSIONS.put('sess:' + token, JSON.stringify({ email: user.email, u: user.username }), { expirationTtl: 60 * 60 * 24 * 30 });
  const res = new Response(JSON.stringify({ ok: true, redirect: '/good-stuff/' }), { headers: { 'content-type': 'application/json' } });
  res.headers.append('Set-Cookie', `tem_sess=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`);
  return res;
}

async function handleAppointment(j, env) {
  if (String(j.captcha || '').trim() !== '15') return fail('Math check failed.');
  const req = {
    ...j,
    received: new Date().toISOString(),
  };
  // appointment requests stored for manual review (Morgan lists keys in KV dashboard)
  const key = 'appt:' + Date.now();
  await env.TEM_USERS.put(key, JSON.stringify(req), { expirationTtl: 60 * 60 * 24 * 90 });
  return new Response(JSON.stringify({
    ok: true,
    message: 'Request received. For fastest response, also text me at 945-397-2900. I will confirm within 24 hours.',
  }), { headers: { 'content-type': 'application/json' } });
}
