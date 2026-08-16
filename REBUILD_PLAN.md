# theeroticmorgan.com Rebuild Plan
Date: 2026-08-16
Prepared by: Tacavar

## 1. Current State Audit (evidence)

Platform and stack:
- WordPress on Bluehost shared hosting. Evidence: "Powered by Bluehost" footer link (wonderblocks UTM params), /wp-content/ paths, /wp-json/ route, Bluehost block-theme 404 template.
- Cloudflare proxy in front. Jetpack Photon image CDN (all images served from i0.wp.com).
- Plugins inferred from rendered markup: Jetpack (Photon, lazy comments), Paid Member Submissions (register page uses ?subscription_plan=964&single_plan=yes), a gallery plugin with lightbox (photo metadata/comment toggles, download image links), WP Accessibility toolbar (Text / Bigger text / Line height / Readable font sidebar), Bluehost WonderBlocks.

Critical defects found:
1. Cloudflare serves an interactive JS challenge to every visitor including search bots. Verified 2026-08-16: curl with Googlebot UA on / returns 403 with cf-mitigated: challenge. /sitemap.xml and /sitemap_index.xml return the challenge page. robots.txt declares the sitemap but most crawlers can never fetch it. This is the single biggest SEO problem; it caps everything else.
2. Duplicate content: /touring/ and /touring-colorado-sept-7-12/ serve the identical Colorado post (both fetched, same text, no canonical distinction visible).
3. All posts filed under Uncategorized. Author byline is admin, /author/admin/ crawlable.
4. Titles unoptimized: home title "Home - The Erotic Morgan"; about page title "Dallas Escort Erotic Morgan-About Me" (missing spaces).
5. Broken heading hierarchy on /donations/: rate names are H4 elements directly under H2 sections.
6. Images: original iPhone JPEGs (IMG_5838.jpeg etc.) up to 1242x2208 on the homepage, JPEG only, no AVIF/WebP, Jetpack resize params as the only optimization. EXIF likely intact (the site itself ships a "toggle photo metadata" tool, implying capture metadata exists in files; that is a privacy leak).
7. No meta descriptions on rendered pages. No RSS strategy beyond WP default. No age gate or RTA label detected on any page.
8. No analytics (note: GA4 and AdSense prohibit adult content; never add them).

Content inventory (WP REST API, full: 15 pages + 13 posts = 28 URLs):
Pages: / , /about-me/ , /photo-gallery/ , /donations/ , /services/ , /appointment-request/ , /blog-updates/ , /register/ , /login/ , /account/ , /password-reset/ , /the-good-stuff/ , /pricing/ , /pricing-2/ , /google-site-verification-google234c5df4e9468961-html/ (junk page, GSC verification done via page slug hack)
Posts (13): get-the-goods , touring-colorado-sept-7-12 , how-to-contact-your-escort , behind-closed-doors , role-play-scenarios , tips-to-ensure-a-great-session-2 , tips-to-ensure-a-great-session , sex-worker-rights , optimize-your-overnight , provider-responsibilities , why-i-am-an-escort , why-all-the-diy-pics , dc-tour
New defect found: THREE overlapping rate pages (/donations/ modified 2026-08-08, /pricing/ and /pricing-2/ modified 2026-07-29/30, all live). Two "Good Stuff" pages: /the-good-stuff/ (page) and /get-the-goods/ (post) sell the same product. Slug/title cross-wire: post slug "tips-to-ensure-a-great-session" has title "How to Choose the Right Girl" and slug "-2" has title "Tips to Ensure A Great Session". Categories exist but unused correctly: "Morgan's Thoughts" (5 posts), "Stuff I Have Going On" (2), "Tours" (1) + empty duplicate "tours" category, Uncategorized (6). GSC ownership verified via a visible junk page instead of DNS/meta: google234c5df4e9468961.

External entity citations: ECCIE (provider id 20698), Preferred411 (ref 5753), Slixa (morgan-alexander-4), Tryst (morganaf), OnlyFans (theeroticmorgan), mywishlist.online wishlist. Phone 945-397-2900, email morgan@theeroticmorgan.com. Members product "The Good Stuff": 50 USD one-time lifetime, manual P2P payment (Zelle, CashApp, Venmo, PayPal, Apple Pay), manual approval.

Site strengths to preserve: authentic first-person voice (site explicitly markets "written by me, not AI"), blog cadence, verification banner block, simple direct funnel (photos, rates, phone).

## 2. Stack Decision

Commit: Astro 5 static site on Cloudflare Pages. Workers + KV for the members gate. Domain DNS is already on Cloudflare, cutover is a pointer change. Bluehost cancelled after archive.

Why: zero JS by default, build-time image pipeline (sharp: AVIF/WebP/srcset), fastest achievable Core Web Vitals, smallest attack surface, free hosting, and it matches the existing Tacavar Cloudflare Pages fleet (avoidtravelscam, tacavar.com moved 2026-07-02).

Rejected:
- WordPress on better hosting. Keeps her familiar admin but ships 300KB+ of theme/plugin CSS, permanent plugin patch surface, lower CWV ceiling, and the same members-area workaround. Not "best possible coding".
- Next.js. SSR buys nothing for a ~15 page content site; adds runtime and audit cost.

Editing for Morgan: Decap CMS (git-based, free, works on CF Pages) so she keeps editing posts herself, or Tacavar's weekly publishing pipeline treats this as a 5th site. Decision point for her, does not affect the build.

## 3. Information Architecture and 301 Map

| New URL | Source | Notes |
|---|---|---|
| / | / | hero, intro, latest 3 posts, verification banners, click-to-call |
| /about-me/ | /about-me/ | keep slug |
| /tour-schedule/ | /touring/ | current + upcoming tours, kills the duplicate |
| /photo-gallery/ | /photo-gallery/ | keep slug, rebuilt gallery |
| /rates/ | /donations/ | canonical; /pricing/ and /pricing-2/ also 301 here (3-way dedup) |
| /services/ | /services/ | keep slug |
| /appointment-request/ | /appointment-request/ | keep slug |
| /blog/ | /blog-updates/ | 301; categories: touring, client-guides, behind-the-scenes |
| /blog/<slug>/ | same slugs | all 13 existing post slugs kept verbatim |
| /good-stuff/ | /the-good-stuff/ AND /get-the-goods/ | both 301 here, single product page |
| /register/ , /login/ | same | Worker-backed |
| /contact/ | new | phone, email, OnlyFans, etiquette summary |
| /privacy/ , /terms/ , /2257/ | new | required legal, 18 U.S.C. 2257 statement |

301 extras: /account/ and /password-reset/ fold into /login/ (auth handled client-side by the Worker with inline reset flow). /google-site-verification-google234c5df4e9468961-html/ 410s after moving GSC verification to DNS TXT. /author/admin/ to /about-me/ . /category/uncategorized/ to /blog/ . Category redirects: /category/morgans-thoughts/ + /category/stuff-i-have-going-on/ + /category/tours/ + /category/tours-2/ map to the new 3-category scheme. Empty duplicate "tours" category dies. Old /sitemap.html gets 410.

Post recategorization (from WP API data):
- Client guides (new "client-guides"): how-to-contact-your-escort, tips-to-ensure-a-great-session-2 (title: Tips to Ensure A Great Session), tips-to-ensure-a-great-session (title: How to Choose the Right Girl), optimize-your-overnight, role-play-scenarios
- Touring: touring-colorado-sept-7-12, dc-tour
- Morgan's voice: why-i-am-an-escort, provider-responsibilities, sex-worker-rights, behind-closed-doors, why-all-the-diy-pics, get-the-goods (redirects, not a post)

## 4. SEO Spec

- Titles: "Page intent | Morgan Alexander, Dallas Companion". Home: "Morgan Alexander | Independent Escort in Dallas, TX". Unique 140-155 char meta description per page, written in her voice.
- RTA compliance: meta name="rating" content="RTA-5042-1996-140-157-587-RTA" plus matching HTTP header on every response. Age gate: JS overlay with cookie persistence; server-rendered content stays in the DOM so crawlers index normally.
- robots.txt: allow all, sitemap declared. Cloudflare config: Bot Fight Mode OFF, verified bots allowed, no interactive challenge on any path. Acceptance test: curl with Googlebot UA returns 200 on / and /sitemap-index.xml.
- Sitemap: sitemap-index.xml (pages + posts, real lastmod). RSS at /rss.xml (WP had feeds; keep them alive, aids discovery).
- Canonicals self-referencing, trailing slash consistent, one H1 per page, heading hierarchy fixed (rate names become H3 under H2 groups), byline Morgan Alexander linked to /about-me/ (E-E-A-T), visible dates on posts.
- Schema JSON-LD: WebSite + Person on home/about; BlogPosting + BreadcrumbList on posts; FAQPage on /contact/ and /good-stuff/; ImageGallery on the gallery. No LocalBusiness or AggregateRating (restricted for adult; reviews live on ECCIE and stay as plain links).
- Internal linking: every post links contextually to /rates/, /tour-schedule/, /contact/; breadcrumbs on blog; related posts by category; home links newest tour post.
- Image SEO: descriptive filenames (morgan-dallas-01.avif), alt text in her voice, explicit width/height, AVIF + WebP fallback, lazy below fold, fetchpriority=high on the hero LCP image, EXIF stripped at build.
- Keep ECCIE, P411, Slixa, Tryst banner links as normal follow links; they are the site's authority citations.

## 5. GEO Spec (generative engine optimization)

- /llms.txt at root: markdown index, who Morgan is, service area, page map with one-line summaries.
- Answer-shaped reformat: each H2 question in her posts gets a 40-60 word direct answer paragraph immediately below, then her prose continues. Her "How To Contact Your Escort" post is exactly the query class LLMs pull.
- Visible FAQ blocks (not hidden) on /contact/, /good-stuff/, /rates/ with matching FAQPage schema.
- Entity consistency: exact phrase "Morgan Alexander, independent escort and private companion based in Dallas, Texas" in home intro, about, llms.txt; one phone format everywhere; same handles as ECCIE/P411/Slixa/Tryst/OnlyFans profiles.
- Outbound citation: link the ECCIE profile as the canonical review source so engines triangulate the entity.
- Honest caveat: major LLM answer engines suppress adult-intent queries. GEO upside concentrates in Perplexity/Bing surfaces and long-tail etiquette questions (screening, first contact, touring etiquette), which her posts already target. Evergreen titles, no dates in titles or slugs.

## 6. Performance Spec (acceptance thresholds)

- Budget: under 50KB HTML+CSS+JS per page excluding images; total JS under 15KB (age gate + lightbox + session check).
- Fonts: max 2 families, self-hosted WOFF2, preloaded, font-display: swap, size-adjust fallback metrics. Plain rel="stylesheet" links only; the media="print" onload pattern is banned (known CLS regression, see seo-performance-auditing skill).
- CWV targets, mobile, PSI median of 3: performance >= 0.95, LCP < 1.8s, CLS < 0.05, INP < 200ms.
- Images via astro:assets: AVIF ~q55 + WebP fallback, srcset widths 480/768/1080, explicit dimensions, LQIP blur placeholders. Lightbox is vanilla JS, honors prefers-reduced-motion.
- Analytics: Cloudflare Web Analytics (cookieless, adult-safe). Plausible acceptable. GA4/AdSense prohibited by policy.
- Caching: immutable hashed assets, short HTML TTL.

## 7. Members Area ("The Good Stuff") Spec

- Payments stay manual P2P exactly as today (the Stripe restriction is real). Payment number moves behind the register flow instead of sitting on a public marketing page (reduces scrape surface; optional, her call).
- Register (Worker + KV): email, preferred payment method, reference note, custom-video request field. Morgan approves via a tiny admin page; approval issues an HMAC-signed cookie (30 day, rotating secret).
- Protected media served only through /good-stuff/media/* Worker route validating the cookie; files stored under unguessable hashed keys. Current /wp-content/uploads/2026/07/IMG_5838.jpeg pattern is trivially enumerable; that closes.
- Login: email + per-member PIN or magic link, same cookie.
- Her copy stays verbatim, including the lifetime-access promise.

## 8. Migration Plan

1. Archive: full crawl of the 15 URLs (web_extract path already proven), download all image originals through Jetpack CDN before touching Bluehost, then full wp-content/uploads archive and WP XML export if wp-admin access is available.
2. Content: migrate her text verbatim. Only mechanical change is the answer-shape reformat in section 5. No AI rewrite (site explicitly promises human-written).
3. Images: strip EXIF, re-encode AVIF/WebP, rename descriptively.
4. Build Astro site, deploy to CF Pages preview, run PSI median-of-3 against thresholds.
5. Cutover: point DNS/origin at Pages. Cancel Bluehost after 2 weeks of clean logs.
6. 301 map live per section 3 on day one (Pages _redirects file).
7. Submit sitemap in GSC and Bing Webmaster (Bing feeds Perplexity). Monitor coverage weekly for 4 weeks.
8. Visual design: captured from 4 screenshots Josh supplied 2026-08-16. Design DNA (gemma-4-12b local vision, descriptions saved at /root/tem_analysis/gemma_descriptions.txt and desc_123925.txt): consistent white/ivory background, black text, elegant serif wordmark with wide-tracked all-caps sans nav in top right, editorial split layouts (text left, portrait imagery right, images approx 3:4 with no borders or shadows), high whitespace, thin light-grey dividers, dark charcoal (#202020) multi-column footer with small social icons, soft pink (#E197B3 to #F8C8DC) accent range appearing in photography and heart accents. Maximalist collage treatment (overlapping colored rectangles behind portrait) on one page; minimalist price-list treatment (names left, prices right) on another. No rounded corners, no shadows, no gradient buttons. Theme target: editorial feminine minimalism, serif display + sans body, flat imagery.
   Caveat: local model could not transcribe the exact wordmark/nav strings (transcription pass filtered empty; nav text read as unreliable). During Phase 1 theming, confirm nav labels against the live site before finalizing.

## 9. Build Phases

- Phase 0 (0.5d): content + image archive, repo init, design capture.
- Phase 1 (1d): Astro scaffold, design system cloned from current look, all static pages.
- Phase 2 (1d): blog migration, SEO + GEO spec implementation, schema, llms.txt.
- Phase 3 (0.5d): members Worker, register/login, hashed media.
- Phase 4 (0.5d): PSI + GEO acceptance tests, 301s, DNS cutover, GSC/Bing submission.

Total: ~3.5 working days.

## 10. Risks and Open Items

- Visual capture pending (challenge + browser quota). Blocking for theming only, not for scaffold.
- Bluehost cancellation: archive uploads first or originals are lost.
- P2P payment flow unchanged: fraud exposure stays as-is (her business model, out of scope).
- Domain is young (content starts May 2026); equity is mostly profile backlinks, the 301 map preserves it.
- Cloudflare Pages adult content: permitted for legal adult content, no conflict expected.
- Decision for Morgan: Decap CMS self-editing vs Tacavar-managed publishing.
