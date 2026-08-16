#!/usr/bin/env bash
# Mirror all site images (originals) from Jetpack CDN to archive/images/
set -u
DEST="/home/tacavar/workspaces/theeroticmorgan-rebuild/archive/images"
MANIFEST="/home/tacavar/workspaces/theeroticmorgan-rebuild/archive/image_manifest.json"
mkdir -p "$DEST"
ok=0; fail=0; skip=0
for rel in $(python3 -c "import json;print('\n'.join(json.load(open('$MANIFEST'))))"); do
  out="$DEST/$rel"
  if [ -s "$out" ]; then skip=$((skip+1)); continue; fi
  mkdir -p "$(dirname "$out")"
  url="https://i0.wp.com/theeroticmorgan.com/wp-content/uploads/$rel"
  if curl -sf --max-time 90 --retry 2 -A "Mozilla/5.0" -o "$out" "$url"; then
    ok=$((ok+1))
  else
    # fallback: direct origin (some URLs rendered without i0 host)
    url2="https://theeroticmorgan.com/wp-content/uploads/$rel"
    if curl -sf --max-time 90 --retry 2 -A "Mozilla/5.0" -o "$out" "$url2"; then ok=$((ok+1)); else fail=$((fail+1)); echo "FAIL $rel"; rm -f "$out"; fi
  fi
done
echo "done ok=$ok skip=$skip fail=$fail total=$(python3 -c "import json;print(len(json.load(open('$MANIFEST'))))")"
