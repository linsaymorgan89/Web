#!/usr/bin/env python3
"""
Publish pipeline for theeroticmorgan site.
Fetches content from admin API, processes images, updates data files, builds, and deploys.
"""

import sys
import os
import json
import subprocess
import base64
import hashlib
import re
from pathlib import Path
from datetime import datetime
from urllib.request import urlopen, Request
from urllib.error import URLError

# Configuration
REPO_ROOT = Path("/home/tacavar/workspaces/theeroticmorgan-rebuild")
SITE_DIR = REPO_ROOT / "site"
DATA_DIR = SITE_DIR / "src" / "data"
PUBLIC_IMAGES = SITE_DIR / "public" / "images"
LOG_FILE = REPO_ROOT / "publish.log"
MARKER_FILE = REPO_ROOT / ".last_published"

API_URL = "https://tem.tacavar.com/api/admin?action=export"


def log(message):
    """Log a message with timestamp."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {message}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def fetch_api():
    """Fetch data from the admin API."""
    try:
        req = Request(API_URL, headers={"User-Agent": "Mozilla/5.0 (compatible; theeroticmorgan-publish-bot/1.0)"})
        with urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode())
    except URLError as e:
        log(f"ERROR: Failed to fetch from API: {e}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        log(f"ERROR: Failed to parse API response: {e}")
        sys.exit(1)


def get_last_published():
    """Get the timestamp of the last publish."""
    if MARKER_FILE.exists():
        try:
            return int(MARKER_FILE.read_text().strip())
        except ValueError:
            return 0
    return 0


def sanitize_filename(name):
    """Sanitize a filename to lowercase-hyphenated ASCII."""
    # Convert to lowercase
    name = name.lower()
    # Replace non-alphanumeric with hyphens
    name = re.sub(r'[^\w\-]', '-', name)
    # Collapse multiple hyphens
    name = re.sub(r'-+', '-', name)
    # Strip leading/trailing hyphens
    name = name.strip('-')
    return name


def process_image(img_value, target_dir, filename_hint):
    """
    Process an image field. If it's a base64 data URI, decode and save it.
    Otherwise, return the existing path.
    Returns the relative path for use in JSON.
    """
    if not img_value.startswith("data:image/"):
        # Already a static path
        return img_value

    log(f"Found base64 image in {filename_hint}")

    # Parse data URI
    match = re.match(r'data:(image/[^;]+);base64,(.+)', img_value)
    if not match:
        log(f"WARNING: Could not parse data URI for {filename_hint}, keeping original")
        return img_value

    mime_type = match.group(1)
    base64_data = match.group(2)

    # Determine file extension
    ext_map = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
    }
    ext = ext_map.get(mime_type, "jpg")

    # Sanitize filename
    safe_filename = sanitize_filename(filename_hint)

    # Create target directory
    target_dir = Path(target_dir)
    target_dir.mkdir(parents=True, exist_ok=True)

    # Decode and write
    output_path = target_dir / f"{safe_filename}.{ext}"
    try:
        decoded = base64.b64decode(base64_data)
        output_path.write_bytes(decoded)
        log(f"Wrote image to {output_path}")
    except Exception as e:
        log(f"ERROR: Failed to decode/write image {filename_hint}: {e}")
        raise

    # Return relative path
    return f"/images/{target_dir.name}/{safe_filename}.{ext}"


def sanity_check(site, rates, tours, posts_obj, gallery):
    """
    Refuse to publish if the fetched content looks corrupt/empty compared to
    what's already committed on disk. A previous incident: a stray empty
    site-tab form submission set KV's admin:site to {}, which flowed straight
    through to overwriting the real site.json with no validation at all.
    """
    problems = []

    if not site.get("phone") or not site.get("email"):
        problems.append("site.phone/site.email is empty")
    if not site.get("home", {}).get("lede"):
        problems.append("site.home.lede is empty")

    if not rates.get("local") or not rates.get("touring"):
        problems.append("rates.local/rates.touring is empty")

    # tours/posts are allowed to legitimately become empty (all tours could
    # be deleted), but only if the site already has zero of them on disk too.
    try:
        existing_tours = json.loads((DATA_DIR / "tours.json").read_text())
    except Exception:
        existing_tours = []
    if existing_tours and not tours:
        problems.append(f"tours went from {len(existing_tours)} to 0")

    try:
        existing_posts = json.loads((DATA_DIR / "posts.json").read_text()).get("posts", [])
    except Exception:
        existing_posts = []
    new_posts = posts_obj.get("posts", [])
    if existing_posts and not new_posts:
        problems.append(f"posts went from {len(existing_posts)} to 0")

    try:
        existing_gallery = json.loads((DATA_DIR / "gallery.json").read_text())
    except Exception:
        existing_gallery = []
    if existing_gallery and not gallery:
        problems.append(f"gallery went from {len(existing_gallery)} to 0")

    return problems


def process_tours(tours):
    """Process tours array and handle image fields."""
    processed = []
    for tour in tours:
        if "img" in tour and tour["img"]:
            city = tour.get("city", "unknown")
            tour["img"] = process_image(
                tour["img"], PUBLIC_IMAGES / "tours", city
            )
        processed.append(tour)
    return processed


def process_gallery(gallery):
    """
    Process gallery photo list. New uploads (data URIs) get a content-hash
    filename since gallery photos have no natural unique name like a post
    slug or tour city -- hashing avoids collisions and re-writing the same
    photo under a new name on every publish run.
    """
    processed = []
    for i, photo in enumerate(gallery):
        img = photo.get("img", "")
        if img.startswith("data:image/"):
            match = re.match(r'data:image/[^;]+;base64,(.+)', img)
            digest = hashlib.sha1(match.group(1).encode()).hexdigest()[:10] if match else str(i)
            photo["img"] = process_image(img, PUBLIC_IMAGES / "gallery", "photo-" + digest)
        processed.append(photo)
    return processed


def process_posts(posts_obj):
    """Process posts object and handle image fields."""
    posts = posts_obj.get("posts", [])
    processed = []
    for post in posts:
        if "img" in post and post["img"]:
            slug = post.get("slug", "unknown")
            post["img"] = process_image(
                post["img"], PUBLIC_IMAGES / "blog", slug
            )
        processed.append(post)

    result = posts_obj.copy()
    result["posts"] = processed
    return result


def build_site():
    """Build the site with bun."""
    log("Building site with bun...")
    os.chdir(SITE_DIR)
    result = subprocess.run(
        ["/usr/bin/bun", "run", "build"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        log("ERROR: Build failed")
        log(result.stdout)
        log(result.stderr)
        # Rollback data files
        subprocess.run(
            ["git", "checkout", "src/data/"],
            cwd=REPO_ROOT,
            capture_output=True,
        )
        sys.exit(1)
    log("Build completed successfully")


def commit_changes():
    """Commit changes if there are any."""
    os.chdir(REPO_ROOT)
    result = subprocess.run(
        ["git", "diff", "--quiet"],
        capture_output=True,
    )
    if result.returncode == 0:
        result_cached = subprocess.run(
            ["git", "diff", "--cached", "--quiet"],
            capture_output=True,
        )
        if result_cached.returncode == 0:
            log("No changes to commit")
            return

    log("Committing changes...")
    # Scoped on purpose: never `git add -A` here. This runs unattended from
    # cron; a blanket add previously committed .wrangler/ dev-server junk
    # (sqlite state, temp bundles) into the repo.
    subprocess.run(
        [
            "git", "add",
            "site/src/data/site.json",
            "site/src/data/rates.json",
            "site/src/data/tours.json",
            "site/src/data/posts.json",
            "site/src/data/gallery.json",
            "site/src/data/services.json",
            "site/public/images",
            ".last_published",
        ],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
    )

    result = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        capture_output=True,
    )
    if result.returncode != 0:
        subprocess.run(
            [
                "git",
                "commit",
                "-m",
                "Publish: content update via admin panel",
            ],
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
        )


def deploy_to_cloudflare():
    """Deploy to Cloudflare Pages production."""
    log("Deploying to Cloudflare Pages...")

    # Get API token
    with open("/home/tacavar/bailian/.env") as f:
        for line in f:
            if line.startswith("CLOUDFLARE_WRANGLER_API_TOKEN="):
                api_token = line.split("=", 1)[1].strip()
                break
        else:
            log("ERROR: CLOUDFLARE_WRANGLER_API_TOKEN not found in .env")
            sys.exit(1)

    os.chdir(SITE_DIR)
    env = os.environ.copy()
    env["CLOUDFLARE_API_TOKEN"] = api_token

    result = subprocess.run(
        [
            "/usr/bin/npx",
            "wrangler",
            "pages",
            "deploy",
            "dist",
            "--project-name=theeroticmorgan",
            "--branch=main",
            "--commit-dirty=true",
        ],
        env=env,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        log("ERROR: Deployment failed")
        log(result.stdout)
        log(result.stderr)
        sys.exit(1)

    log("Deployment completed successfully")
    log(result.stdout)


def main():
    """Main publish pipeline."""
    log("Starting publish pipeline...")

    # Ensure marker file exists
    MARKER_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not MARKER_FILE.exists():
        MARKER_FILE.write_text("0")

    # Fetch data
    log(f"Fetching data from {API_URL}")
    data = fetch_api()

    site = data.get("site", {})
    rates = data.get("rates", {})
    tours = data.get("tours", [])
    posts_obj = data.get("posts", {"categories": {}, "posts": []})
    gallery = data.get("gallery", [])
    services = data.get("services", [])
    publish_pending = data.get("publishPending", 0)

    # Check if anything new to publish
    last_published = get_last_published()
    if publish_pending <= last_published:
        log(f"No new publishes pending (last: {last_published}, current: {publish_pending}). Skipping.")
        return

    log(f"New publish pending detected (timestamp: {publish_pending})")

    # Refuse to overwrite good data with an empty/corrupt payload
    problems = sanity_check(site, rates, tours, posts_obj, gallery)
    if problems:
        log("ERROR: Sanity check failed, refusing to publish: " + "; ".join(problems))
        log("(Not updating marker file, so this will be retried once the underlying data is fixed.)")
        sys.exit(1)

    # Process images
    log("Processing images...")
    tours = process_tours(tours)
    posts_obj = process_posts(posts_obj)
    gallery = process_gallery(gallery)

    # Write data files
    log("Writing updated data files...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    (DATA_DIR / "site.json").write_text(
        json.dumps(site, indent=2) + "\n"
    )
    (DATA_DIR / "rates.json").write_text(
        json.dumps(rates, indent=2) + "\n"
    )
    (DATA_DIR / "tours.json").write_text(
        json.dumps(tours, indent=2) + "\n"
    )
    (DATA_DIR / "posts.json").write_text(
        json.dumps(posts_obj, indent=2) + "\n"
    )
    (DATA_DIR / "gallery.json").write_text(
        json.dumps(gallery, indent=2) + "\n"
    )
    (DATA_DIR / "services.json").write_text(
        json.dumps(services, indent=2) + "\n"
    )
    log("Data files updated")

    # Build
    build_site()

    # Commit
    commit_changes()

    # Deploy
    deploy_to_cloudflare()

    # Update marker
    MARKER_FILE.write_text(str(publish_pending))
    log(f"Published successfully! Marker updated to timestamp {publish_pending}")


if __name__ == "__main__":
    main()
