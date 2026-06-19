# Beyond BARS Coaching — Website

Static site for [beyondbarscoaching.org](https://beyondbarscoaching.org), built with [Astro](https://astro.build) and hosted on GitHub Pages.

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

## Publishing changes

1. Edit files locally (or work with Claude in this repo)
2. Open a pull request on GitHub — or push directly to `main` for small fixes
3. GitHub Actions builds and deploys automatically on every push to `main`

## Adding a blog post

Create a Markdown file in `src/content/blog/` named after the URL slug:

```
src/content/blog/my-post-title.md
```

With this frontmatter:

```yaml
---
title: "Your Post Title"
description: "One-sentence summary shown in blog listings and search results."
pubDate: 2024-06-01
heroImage: /img/blog/my-post-title/hero.jpg   # optional
---

Your post content in Markdown.
```

The post goes live at `/blog/f/my-post-title` once merged. Upload any images to `public/img/blog/my-post-title/` and reference them with that path.

## Editing a page

All pages are in `src/pages/`. Edit the `.astro` file for the page you want — the content sections are plain HTML and easy to update. Changes go live on the next push to `main`.

## Assets

| Location | Contents |
|---|---|
| `public/img/` | Site images (logo, board photos, OG image) |
| `public/img/blog/` | Blog post images (organized by slug) |
| `public/downloads/` | The 9 downloadable PDFs |

## Design tokens

All colors and fonts are CSS custom properties in `src/styles/global.css`. The brand color is `#ae97c9` (lavender). Edit that file to adjust the look site-wide.

## Open items before launch

- [ ] Run blog migration: `npx playwright install chromium && node scripts/migrate-blog.mjs` (do this before GoDaddy is cancelled)
- [ ] Download site images and PDFs from GoDaddy CDN → `public/img/` and `public/downloads/` (include favicon images)
- [x] Add Podbean embed → `src/pages/podcast.astro`
- [ ] Add Apple Music playlist URL → `src/pages/playlist.astro`
- [ ] Add Givebutter URLs for CREW, Tech/Ops, and Workbook buckets → `src/pages/💛-choose-your-impact.astro`
- [ ] Replace `G-XXXXXXXXXX` with real GA4 Measurement ID → `src/layouts/BaseLayout.astro`
- [ ] DNS cutover: point domain to GitHub Pages via Cloudflare
- [ ] Transfer registrar from GoDaddy to Cloudflare (after site is live)

## Infrastructure

- **Host:** GitHub Pages, deployed via `.github/workflows/deploy.yml` on push to `main`
- **DNS:** Cloudflare free plan (pointed at GitHub Pages IPs)
- **Registrar:** Transferring from GoDaddy to Cloudflare Registrar
- **Custom domain:** `public/CNAME` + GitHub → Settings → Pages → Custom domain
