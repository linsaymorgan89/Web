# Cutover checklist — full ownership transfer to Morgan

Current state (2026-08-17): site is fully built and content-managed via the
admin panel, deployed to Cloudflare Pages production at
`theeroticmorgan.pages.dev` under the **Tacavar** Cloudflare account.
`tem.tacavar.com` reverse-proxies straight to that same production
deployment (same Functions, same KV) — it is not a separate environment,
so anything tested there is exactly what's live. The whole site (not just
/admin) is currently behind a password gate (`Nympho`) so it's safe to
leave in this state indefinitely pre-launch.

Goal: at launch, Morgan owns everything end to end — her own GitHub repo,
her own Cloudflare account/Pages project, her own domain. Nothing of hers
should remain on Tacavar's GitHub or Cloudflare after cutover. Only a
backup copy of the code stays on the droplet (bailian).

When Morgan's GitHub + Cloudflare + domain are ready, do this in order:

## 1. Morgan creates her own accounts
- GitHub account (personal or org).
- Cloudflare account (free tier is fine for Pages).
- Owns/controls `theeroticmorgan.com` at a registrar (buy new, or transfer
  an existing registration into her name).

## 2. Push code to her GitHub (not Tacavar's)
- Add a git remote here pointing at a new repo under Morgan's GitHub
  account (`git init` first if this directory has no `.git` yet).
- Commit and push. Code should never land on Tacavar00 or Josh's personal
  GitHub — push straight to her account.

## 3. Set up Cloudflare Pages under her account
- Create a `theeroticmorgan` Pages project in **her** Cloudflare account,
  connected via Git integration to her new GitHub repo (auto-deploy on
  push), so she's not dependent on someone manually running `deploy.sh`.
- Add `theeroticmorgan.com` as a site in her Cloudflare account, point the
  domain's nameservers at Cloudflare (done at the registrar). Wait for the
  zone to show "Active".
- Cloudflare dashboard → Workers & Pages → `theeroticmorgan` → Custom
  domains → add `theeroticmorgan.com` (and `www.` if wanted). Cloudflare
  issues the SSL cert automatically once DNS is live.

## 4. Migrate the KV data
- Create a `TEM_USERS`-equivalent KV namespace in her Cloudflare account.
- Export data from the Tacavar-side `TEM_USERS` namespace
  (`wrangler kv:bulk get` or equivalent) and import it into her new
  namespace (`wrangler kv:bulk put`).
- Rewire the Pages project's KV binding to her new namespace.

## 5. Turn off the site-wide password gate
Right now `site/functions/_middleware.js` gates EVERY route, including the
public pages — that's intentional pre-launch. At launch the public site
needs to be open.

Two options, pick one:
- **Simplest**: delete `site/functions/_middleware.js` entirely (removes
  the gate from everything, including `/admin`).
- **Recommended**: edit the middleware so it only gates `/admin` (keep
  public pages open, keep the admin panel behind a password so Morgan is
  the only one who can edit content). The middleware already has the
  routing structure to do this — just flip which paths are exempted.

Rebuild + deploy (via her Git-integration push, or `./deploy.sh` adapted
to her Cloudflare API token) after this change.

## 6. Verify on her infra
- `curl -I https://theeroticmorgan.com/` → 200, no password prompt.
- `curl -I https://theeroticmorgan.com/admin/` → still gated (if kept) or
  otherwise however protected.
- Click through the site for real (nav, rates, tours, blog, gallery).
- Confirm `/api/admin?action=export` still returns real data. Update
  `publish.py`'s `API_URL` (currently
  `https://tem.tacavar.com/api/admin?action=export`) to point at
  `https://theeroticmorgan.com/api/admin?action=export` directly, since
  `tem.tacavar.com` is going away in step 7.

## 7. Tear down the Tacavar side
- Delete the `theeroticmorgan` Pages project from the Tacavar Cloudflare
  account.
- Delete the `TEM_USERS` KV namespace from the Tacavar Cloudflare account
  (only after step 4 migration is confirmed working).
- Remove the `tem.tacavar.com` Caddy block on bailian
  (`/etc/caddy/Caddyfile` — back it up first per house rule, then
  `caddy validate` before reload).
- Confirm no repo exists under Tacavar00 or Josh's personal GitHub for
  this project (there shouldn't be one, since code was pushed straight to
  Morgan's account in step 2).

## 8. Keep the droplet backup
- Leave this directory
  (`/home/tacavar/workspaces/theeroticmorgan-rebuild`) in place on bailian
  as the retained copy. This is the ONLY place a copy should remain under
  Tacavar's control after cutover.

## Things that do NOT need to change at cutover
- The admin panel and publish pipeline logic are not domain-specific —
  only the KV binding (step 4) and `API_URL` (step 6) need updating.
- `deploy.sh` and `publish.py`'s deploy step target
  `--project-name=theeroticmorgan --branch=main` explicitly, but this only
  matters for the OLD (Tacavar-owned) Pages project pre-cutover — once
  Morgan's repo has Git integration set up, her deploys happen
  automatically on push and this script becomes obsolete for her.
