#!/usr/bin/env python3
"""tier-cheap grunt pipeline for theeroticmorgan rebuild.
Generates SEO metadata, alt text, and llms.txt skeleton from archived content.
Model: tier-cheap via local LiteLLM gateway (deepseek v4 flash primary).
Fail-open: on any LLM error, writes placeholder with needs_review=true.
"""
import json, os, sys, urllib.request

GATEWAY = os.environ.get("LITELLM_URL", "http://127.0.0.1:8643")
KEY = os.environ.get("LITELLM_KEY", "")
MODEL = os.environ.get("GRUNT_MODEL", "tier-cheap")
OUT = "/home/tacavar/workspaces/theeroticmorgan-rebuild/generated"

def llm(prompt, max_tokens=20000):
    body = json.dumps({"model": MODEL, "messages": [{"role": "user", "content": prompt}],
                       "max_tokens": max_tokens, "temperature": 0.3}).encode()
    headers = {"Content-Type": "application/json"}
    if KEY:
        headers["Authorization"] = f"Bearer {KEY}"
    req = urllib.request.Request(GATEWAY + "/v1/chat/completions", data=body,
                                 headers=headers)
    with urllib.request.urlopen(req, timeout=120) as r:
        d = json.loads(r.read())
    return d["choices"][0]["message"]["content"].strip()

PAGES = {
  "/":            "Home - Morgan Alexander, Dallas independent escort. Intro text: welcome, everything you want in a private companion, class and style, dinner dates, private time, fantasies, call 945-397-2900.",
  "/about-me/":   "About Morgan Alexander - Dallas premier private entertainer, California native, 100% independent, DDF, college educated, outdoorsy, hiking camping fishing.",
  "/rates/":      "Rates and suggested donations: local Dallas 400/hr, 700/2hr recommended, 1000/3hr dinner date, 1500 overnight, 2500 weekend. Touring higher. Add-ons: role play, PSE, massage, BDSM, dancing.",
  "/services/":   "Services list: massage, dinner date, travel companion, GFE, PSE, virtual appointment, incall outcall, date planning, role play, custom content, facetime verification, long term arrangements, parties, light BDSM.",
  "/photo-gallery/": "Free photo gallery of Morgan's favorite self-shot photos, plus teaser for members-only Good Stuff.",
  "/good-stuff/": "The Good Stuff members area: 50 dollars one-time lifetime access to Morgan's sexiest nudes and videos, paid via Zelle CashApp Venmo PayPal Apple Pay, monthly photo updates, one free custom video.",
  "/tour-schedule/": "Tour schedule: current and upcoming tours with dates, cities, touring rates, pre-book discount.",
  "/contact/":    "Contact: phone 945-397-2900, email morgan@theeroticmorgan.com, OnlyFans link, screening info.",
  "/appointment-request/": "Pre-booking appointment request form, 2-3 days advance, references from ECCIE P411 TER OH2.",
  "/blog/":       "Weekly blog by Morgan Alexander: touring announcements, client etiquette guides, behind-the-scenes.",
}

ALT_JOBS = [
  "hero portrait", "about portrait", "gallery portrait 1", "gallery portrait 2",
  "gallery portrait 3", "gallery portrait 4", "gallery portrait 5",
  "rates page portrait", "services portrait", "blog post feature colorado garden of the gods",
  "blog post feature contact etiquette stock", "eccie banner", "p411 banner", "slixa badge", "tryst badge",
]

def main():
    os.makedirs(OUT, exist_ok=True)
    # 1. meta descriptions
    metas, need = {}, 0
    for slug, desc in PAGES.items():
        prompt = (f"Write a meta description (140-155 chars, count carefully) for this page of an escort's personal site. "
                  f"Warm, first-person-adjacent, tasteful, no explicit words. Page: {slug}\nFacts: {desc}\n"
                  f"Output ONLY the description text.")
        try:
            metas[slug] = {"description": llm(prompt), "needs_review": False}
        except Exception as e:
            metas[slug] = {"description": "", "needs_review": True, "error": str(e)[:200]}
            need += 1
    with open(f"{OUT}/meta.json", "w") as f:
        json.dump(metas, f, indent=2)

    # 2. alt text
    alts = {}
    for label in ALT_JOBS:
        prompt = (f"Write HTML image alt text (max 90 chars) for an escort site image: {label}. "
                  f"Tasteful, descriptive, no explicit words. Output ONLY the alt text.")
        try:
            alts[label] = {"alt": llm(prompt, 20000), "needs_review": False}
        except Exception as e:
            alts[label] = {"alt": "", "needs_review": True, "error": str(e)[:200]}
            need += 1
    with open(f"{OUT}/alts.json", "w") as f:
        json.dump(alts, f, indent=2)

    print(json.dumps({"model": MODEL, "meta_count": len(metas), "alt_count": len(alts),
                      "needs_review": need}, indent=2))

if __name__ == "__main__":
    main()
