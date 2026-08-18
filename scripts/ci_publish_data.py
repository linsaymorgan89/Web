#!/usr/bin/env python3
"""
CI data-prep for theeroticmorgan auto-publish (runs in GitHub Actions).
Fetches the admin export from the live site, decodes any base64 images into
static files, and writes the site's src/data/*.json. The workflow then builds
and deploys. cwd is the repo root.
"""
import os, sys, json, base64, hashlib, re
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError

EXPORT_URL = os.environ.get("EXPORT_URL", "").strip()
if not EXPORT_URL:
    print("ERROR: EXPORT_URL env var is required"); sys.exit(1)

REPO_ROOT = Path.cwd()
DATA_DIR = REPO_ROOT / "site" / "src" / "data"
PUBLIC_IMAGES = REPO_ROOT / "site" / "public" / "images"


def fetch_api():
    # cache-bust so we never read a stale edge-cached export
    sep = "&" if "?" in EXPORT_URL else "?"
    url = f"{EXPORT_URL}{sep}_cb={os.urandom(4).hex()}"
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (tem-ci-publish/1.0)"})
    with urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())


def sanitize_filename(name):
    name = name.lower()
    name = re.sub(r'[^\w\-]', '-', name)
    name = re.sub(r'-+', '-', name)
    return name.strip('-') or "img"


def process_image(img_value, target_dir, filename_hint):
    if not isinstance(img_value, str) or not img_value.startswith("data:image/"):
        return img_value
    m = re.match(r'data:(image/[^;]+);base64,(.+)', img_value)
    if not m:
        return img_value
    ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"}.get(m.group(1), "jpg")
    target_dir = Path(target_dir); target_dir.mkdir(parents=True, exist_ok=True)
    out = target_dir / f"{sanitize_filename(filename_hint)}.{ext}"
    out.write_bytes(base64.b64decode(m.group(2)))
    print(f"wrote {out}")
    return f"/images/{target_dir.name}/{out.name}"


def main():
    d = fetch_api()
    if "error" in d:
        print("ERROR from export:", d["error"]); sys.exit(1)
    site = d.get("site", {})
    rates = d.get("rates", {})
    tours = d.get("tours", [])
    posts_obj = d.get("posts", {"categories": {}, "posts": []})
    gallery = d.get("gallery", [])
    services = d.get("services", [])

    # normalize posts shape (export may give {posts,categories})
    if isinstance(posts_obj, list):
        posts_obj = {"categories": {}, "posts": posts_obj}

    # process images
    for t in tours:
        if t.get("img"):
            t["img"] = process_image(t["img"], PUBLIC_IMAGES / "tours", t.get("city", "tour"))
    for i, p in enumerate(gallery):
        img = p.get("img", "")
        if isinstance(img, str) and img.startswith("data:image/"):
            mm = re.match(r'data:image/[^;]+;base64,(.+)', img)
            digest = hashlib.sha1(mm.group(1).encode()).hexdigest()[:10] if mm else str(i)
            p["img"] = process_image(img, PUBLIC_IMAGES / "gallery", "photo-" + digest)
    for p in posts_obj.get("posts", []):
        if p.get("img"):
            p["img"] = process_image(p["img"], PUBLIC_IMAGES / "blog", p.get("slug", "post"))

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "site.json").write_text(json.dumps(site, indent=2) + "\n")
    (DATA_DIR / "rates.json").write_text(json.dumps(rates, indent=2) + "\n")
    (DATA_DIR / "tours.json").write_text(json.dumps(tours, indent=2) + "\n")
    (DATA_DIR / "posts.json").write_text(json.dumps(posts_obj, indent=2) + "\n")
    (DATA_DIR / "gallery.json").write_text(json.dumps(gallery, indent=2) + "\n")
    (DATA_DIR / "services.json").write_text(json.dumps(services, indent=2) + "\n")
    print("data files written")


if __name__ == "__main__":
    main()
