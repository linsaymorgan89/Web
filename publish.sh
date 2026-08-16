#!/usr/bin/env bash
set -euo pipefail

# Publish pipeline for theeroticmorgan site
# Fetches content from admin API, processes images, updates data files, builds, and deploys

REPO_ROOT="/home/tacavar/workspaces/theeroticmorgan-rebuild"
SITE_DIR="$REPO_ROOT/site"
DATA_DIR="$SITE_DIR/src/data"
PUBLIC_IMAGES="$SITE_DIR/public/images"
LOG_FILE="$REPO_ROOT/publish.log"
MARKER_FILE="$REPO_ROOT/.last_published"

# Ensure marker file exists
touch "$MARKER_FILE"

# API endpoint (local wrangler dev instance)
API_URL="https://tem.tacavar.com/api/admin?action=export"

log() {
  local timestamp
  timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  echo "[$timestamp] $*" | tee -a "$LOG_FILE"
}

log "Starting publish pipeline..."

# Step 1: Fetch current data from API
log "Fetching data from $API_URL"
response=$(curl -s "$API_URL")
if [ -z "$response" ]; then
  log "ERROR: Failed to fetch from API"
  exit 1
fi

# Extract individual components
site=$(echo "$response" | jq '.site')
rates=$(echo "$response" | jq '.rates')
tours=$(echo "$response" | jq '.tours')
posts_obj=$(echo "$response" | jq '.posts')
publish_pending=$(echo "$response" | jq '.publishPending')

# Step 2: Check if there's anything new to publish
last_published=$(cat "$MARKER_FILE" 2>/dev/null || echo "0")
if [ "$publish_pending" -le "$last_published" ]; then
  log "No new publishes pending (last: $last_published, current: $publish_pending). Skipping."
  exit 0
fi

log "New publish pending detected (timestamp: $publish_pending)"

# Step 3: Process tours and posts to extract base64 images
# This is a helper function to process a single image field
process_image_field() {
  local img_value="$1"
  local target_dir="$2"
  local filename_hint="$3"

  # Check if it's a data URI
  if [[ "$img_value" =~ ^data:image/ ]]; then
    log "Found base64 image in $filename_hint"

    # Extract MIME type and base64 data
    local mime_type
    local base64_data
    mime_type=$(echo "$img_value" | sed 's/data:\(image\/[^;]*\);.*/\1/')
    base64_data=$(echo "$img_value" | sed 's/.*base64,//')

    # Determine file extension
    local ext
    case "$mime_type" in
      image/jpeg) ext="jpg" ;;
      image/png) ext="png" ;;
      image/webp) ext="webp" ;;
      image/gif) ext="gif" ;;
      *) ext="jpg" ;; # default fallback
    esac

    # Sanitize filename
    local safe_filename
    safe_filename=$(echo "$filename_hint" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]_-' '-' | sed 's/-\+/-/g' | sed 's/^-\|-$//')

    # Create target directory if needed
    mkdir -p "$target_dir"

    # Write decoded image to disk
    local output_path="$target_dir/${safe_filename}.${ext}"
    echo "$base64_data" | base64 -d > "$output_path"
    log "Wrote image to $output_path"

    # Return the relative path for use in JSON
    echo "/images/$(basename "$target_dir")/${safe_filename}.${ext}"
  else
    # Already a static path, return as-is
    echo "$img_value"
  fi
}

# Process tours for images
tours_processed=$(echo "$tours" | jq -c '.[]' | while read -r tour; do
  local img_field
  img_field=$(echo "$tour" | jq -r '.img // empty')

  if [ -n "$img_field" ]; then
    local city
    city=$(echo "$tour" | jq -r '.city')
    local new_img_path
    new_img_path=$(process_image_field "$img_field" "$PUBLIC_IMAGES/tours" "$city")

    # Replace the img field with the new path
    echo "$tour" | jq --arg newimg "$new_img_path" '.img = $newimg'
  else
    echo "$tour"
  fi
done | jq -s '.')

# Process posts for images
posts_processed=$(echo "$posts_obj" | jq '.posts | .[]' | while read -r post; do
  local img_field
  img_field=$(echo "$post" | jq -r '.img // empty')

  if [ -n "$img_field" ]; then
    local slug
    slug=$(echo "$post" | jq -r '.slug')
    local new_img_path
    new_img_path=$(process_image_field "$img_field" "$PUBLIC_IMAGES/blog" "$slug")

    # Replace the img field with the new path
    echo "$post" | jq --arg newimg "$new_img_path" '.img = $newimg'
  else
    echo "$post"
  fi
done | jq -s '.')

# Reconstruct posts object with processed posts
posts_final=$(echo "$posts_obj" | jq --argjson new_posts "$posts_processed" '.posts = $new_posts')

# Step 4: Write cleaned data files
log "Writing updated data files..."
echo "$site" | jq '.' > "$DATA_DIR/site.json.tmp" && mv "$DATA_DIR/site.json.tmp" "$DATA_DIR/site.json"
echo "$rates" | jq '.' > "$DATA_DIR/rates.json.tmp" && mv "$DATA_DIR/rates.json.tmp" "$DATA_DIR/rates.json"
echo "$tours_processed" | jq '.' > "$DATA_DIR/tours.json.tmp" && mv "$DATA_DIR/tours.json.tmp" "$DATA_DIR/tours.json"
echo "$posts_final" | jq '.' > "$DATA_DIR/posts.json.tmp" && mv "$DATA_DIR/posts.json.tmp" "$DATA_DIR/posts.json"
log "Data files updated"

# Step 5: Build the site
log "Building site with bun..."
cd "$SITE_DIR"
if ! /usr/bin/bun run build 2>&1 | tee -a "$LOG_FILE"; then
  log "ERROR: Build failed, rolling back changes"
  git checkout src/data/
  exit 1
fi
log "Build completed successfully"

# Step 6: Commit changes if there are any
cd "$REPO_ROOT"
if git diff --cached --quiet && git diff --quiet; then
  log "No changes to commit"
else
  git add -A
  if ! git diff --cached --quiet; then
    log "Committing changes..."
    git commit -m "Publish: content update via admin panel"
  fi
fi

# Step 7: Deploy to Cloudflare Pages (PRODUCTION)
log "Deploying to Cloudflare Pages..."
export CLOUDFLARE_API_TOKEN
CLOUDFLARE_API_TOKEN=$(grep '^CLOUDFLARE_WRANGLER_API_TOKEN=' /home/tacavar/bailian/.env | cut -d= -f2-)

cd "$SITE_DIR"
if /usr/bin/npx wrangler pages deploy dist --project-name=theeroticmorgan --branch=main --commit-dirty=true 2>&1 | tee -a "$LOG_FILE"; then
  log "Deployment completed successfully"
else
  log "ERROR: Deployment failed"
  exit 1
fi

# Step 8: Update the marker file with current timestamp
echo "$publish_pending" > "$MARKER_FILE"
log "Published successfully! Marker updated to timestamp $publish_pending"
