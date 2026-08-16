# Cutover checklist — going live on theeroticmorgan.com

Current state (2026-08-16): site is fully built and content-managed via the
admin panel, deployed to Cloudflare Pages production at
`theeroticmorgan.pages.dev`. `tem.tacavar.com` reverse-proxies straight to
that same production deployment (same Functions, same KV) — it is not a
separate environment, so anything tested there is exactly what's live.
The whole site (not just /admin) is currently behind a password gate
(`Nympho`) so it's safe to leave in this state indefinitely pre-launch.

When Morgan's domain + Cloudflare access is ready, do this in order:

## 1. Get the domain onto Cloudflare
- Add `theeroticmorgan.com` as a site in the Tacavar Cloudflare account (or
  whichever account/zone Morgan wants billing under).
- Point the domain's nameservers at Cloudflare (done at the registrar).
- Wait for DNS to propagate (Cloudflare will show "Active" on the zone).

## 2. Bind the custom domain to the Pages project
Cloudflare dashboard → Workers & Pages → `theeroticmorgan` → Custom domains
→ Add `theeroticmorgan.com` (and `www.theeroticmorgan.com` if wanted).
Cloudflare handles the SSL cert automatically once DNS is live.

## 3. Turn off the site-wide password gate
Right now `site/functions/_middleware.js` gates EVERY route, including the
public pages — that's intentional pre-launch (nobody should stumble on an
unfinished rebuild), but the public site needs to be open at launch.

Two options, pick one:
- **Simplest**: delete `site/functions/_middleware.js` entirely (removes
  the gate from everything, including `/admin`).
- **Recommended**: edit the middleware so it only gates `/admin` (keep
  public pages open, keep the admin panel behind a password so Morgan is
  the only one who can edit content). The middleware already has the
  routing structure to do this — just flip which paths are exempted.

Rebuild + `./deploy.sh` after this change.

## 4. Verify
- `curl -I https://theeroticmorgan.com/` → 200, no password prompt.
- `curl -I https://theeroticmorgan.com/admin/` → still gated (if you kept
  the admin-only gate) or otherwise however you decided to protect it.
- Click through the site for real (nav, rates, tours, blog, gallery).
- Confirm `/api/admin?action=export` still returns real data (this is what
  `publish.py` reads from) — see `publish.py`'s `API_URL` below.

## 5. Point publish.py at the real domain (optional but recommended)
`publish.py`'s `API_URL` is currently `https://tem.tacavar.com/api/admin?action=export`.
Since `tem.tacavar.com` already proxies to the real production deployment,
this keeps working as-is after cutover with zero changes needed. If you'd
rather it hit `theeroticmorgan.com` directly (e.g. if `tem.tacavar.com` gets
retired later), just update the `API_URL` constant at the top of
`publish.py` — nothing else changes.

## 6. Retire tem.tacavar.com (optional)
Once the real domain is live and confirmed working, `tem.tacavar.com` has
no remaining purpose (it was only useful pre-launch, as a friendly URL
before the real domain existed). Safe to remove the Caddy block on bailian
whenever convenient — not urgent, doesn't cost anything to leave running.

## Things that do NOT need to change at cutover
- The admin panel, KV namespace (`TEM_USERS`), and publish pipeline are all
  already wired to the real Cloudflare Pages project — nothing here is
  tied to the domain name.
- `deploy.sh` and `publish.py`'s deploy step already target
  `--project-name=theeroticmorgan --branch=main` (production) explicitly —
  no domain-specific config there either.
