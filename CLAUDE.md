# Beyond BARS Coaching — Claude Instructions

This is a static Astro site for [beyondbarscoaching.org](https://beyondbarscoaching.org), a 501(c)(3) nonprofit. Vanessa Ragains (founder) collaborates with Claude to make content changes. New blog posts and edits go through PRs before deploying.

## Architecture

- **Framework:** Astro v5, fully static output
- **Hosting:** GitHub Pages, auto-deployed from `main` via `.github/workflows/deploy.yml`
- **Blog:** Astro content collections — one `.md` file per post in `src/content/blog/`
- **Styles:** Single `src/styles/global.css` with CSS custom properties; brand color `#ae97c9`

## Key conventions

**Blog URL slugs are sacred.** All 41 posts live at `/blog/f/<slug>` and must stay there — these URLs are shared externally. The `.md` filename becomes the slug, so it must match the original exactly (including emoji and special characters if applicable).

**Local images only.** No `img1.wsimg.com` or `wsimg.com` URLs in committed files — these are the GoDaddy CDN and will break once the subscription is cancelled. Images belong in `public/img/`, PDFs in `public/downloads/`.

**GA4 placeholder.** `src/layouts/BaseLayout.astro` has `G-XXXXXXXXXX` as the GA4 ID — replace it when Vanessa provides the real Measurement ID.

## Adding a blog post

1. Create `src/content/blog/<slug>.md` with frontmatter:
   ```yaml
   ---
   title: "Post Title"
   description: "One sentence for listings/SEO."
   pubDate: 2024-06-01
   heroImage: /img/blog/<slug>/hero.jpg   # optional
   ---
   ```
2. If there are images, add them to `public/img/blog/<slug>/`
3. Open a PR; merge deploys automatically

## Editing pages

Pages are in `src/pages/`. Shared chrome is in `src/layouts/BaseLayout.astro` (head, nav, footer) and `src/components/` (Nav.astro, Footer.astro). Design tokens are in `src/styles/global.css`.

## Open items (as of initial scaffold)

These are TODOs that require input from Vanessa before the site is fully launch-ready:

| Item | File to update |
|---|---|
| Podbean embed snippet | `src/pages/podcast.astro` |
| Apple Music playlist URL | `src/pages/playlist.astro` |
| Givebutter URL — CREW Partnership | `src/pages/💛-choose-your-impact.astro` |
| Givebutter URL — Tech/Ops | `src/pages/💛-choose-your-impact.astro` |
| Givebutter URL — Workbook stock | `src/pages/💛-choose-your-impact.astro` |
| GA4 Measurement ID | `src/layouts/BaseLayout.astro` |

## Pre-launch tasks (run once, before GoDaddy is cancelled)

1. **Blog migration:** `npx playwright install chromium && node scripts/migrate-blog.mjs`
   Scrapes all 41 posts from the live site, writes `.md` files to `src/content/blog/`, and downloads images to `public/img/blog/`.

2. **Assets from GoDaddy CDN:** Download the 9 PDFs and all site images (logo, OG image, board photos, Choose Your Impact card images) from `img1.wsimg.com` and commit them to `public/downloads/` and `public/img/`.

3. **Delete the placeholder post** at `src/content/blog/placeholder.md` once real posts are migrated.

## Org reference

- 501(c)(3) EIN: #33-1514564
- Contact: Text (650) 307-6592 | Vanessa.Ragains@gmail.com
- Social: Instagram @beyondbarscoaching | LinkedIn /in/vanessaragains/ | YouTube @vanessaragains
- Board: Vanessa Ragains (President), Jessie Keck (Treasurer), Hailey Brock
