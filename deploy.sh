#!/usr/bin/env bash
# Build and deploy theeroticmorgan.com to Cloudflare Pages PRODUCTION.
# Usage: ./deploy.sh
#
# Auth: uses CLOUDFLARE_WRANGLER_API_TOKEN from /home/tacavar/bailian/.env
# (no `wrangler login` needed/expected on bailian).
set -euo pipefail
cd "$(dirname "$0")/site"

/root/.bun/bin/bun run build

export CLOUDFLARE_API_TOKEN
CLOUDFLARE_API_TOKEN="$(grep '^CLOUDFLARE_WRANGLER_API_TOKEN=' /home/tacavar/bailian/.env | cut -d= -f2-)"

# --branch=main is REQUIRED: without it wrangler auto-detects the local git
# branch (currently `master`) and silently deploys to Preview instead of
# Production. Do not remove this flag.
npx wrangler pages deploy dist \
  --project-name=theeroticmorgan \
  --branch=main \
  --commit-dirty=true

echo
echo "Deployed to Cloudflare Pages production (theeroticmorgan.pages.dev)."
echo "See CUTOVER.md for the one-time steps to point theeroticmorgan.com at this."
