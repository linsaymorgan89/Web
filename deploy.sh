#!/usr/bin/env bash
# Deploy theeroticmorgan.com static build to Cloudflare Pages.
# Usage: ./deploy.sh  (requires wrangler auth: npx wrangler login)
set -euo pipefail
cd "$(dirname "$0")/site"
/root/.bun/bin/bun run build
echo "dist/ built. Deploy with:"
echo "  npx wrangler pages deploy dist --project-name=theeroticmorgan"
echo "Then bind custom domain theeroticmorgan.com in the Pages project."
