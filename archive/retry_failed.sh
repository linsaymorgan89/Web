#!/usr/bin/env bash
# Fix the 5 failed image mirror downloads (transformed variants fetchable via ?fit= on originals)
set -u
DEST="/home/tacavar/workspaces/theeroticmorgan-rebuild/archive/images"
declare -A RETRY=(
  ["2026/07/IMG_5916.jpeg"]="2026/07/IMG_5916.jpeg"
)
fails=$(grep '^FAIL' /home/tacavar/workspaces/theeroticmorgan-rebuild/archive/mirror_log.txt | awk '{print $2}')
for rel in $fails; do
  out="$DEST/$rel"; mkdir -p "$(dirname "$out")"
  url="https://i0.wp.com/theeroticmorgan.com/wp-content/uploads/$rel"
  if curl -sf --max-time 90 --retry 3 -A "Mozilla/5.0" -o "$out" "$url"; then echo "OK(i0) $rel";
  else echo "STILL FAIL $rel"; fi
done
find "$DEST" -type f | wc -l
