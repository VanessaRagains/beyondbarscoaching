/**
 * Blog migration script: scrapes all 41 Beyond BARS blog posts
 * from the live GoDaddy site and writes them as Markdown files.
 *
 * Run once, locally, BEFORE GoDaddy is cancelled:
 *   node scripts/migrate-blog.mjs
 *
 * Prerequisites:
 *   npm install  (installs playwright and turndown)
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL as NodeURL } from 'url';

const BLOG_URLS = [
  'https://beyondbarscoaching.org/blog/f/the-power-of-schedules-punctuality-showing-up-in-recovery',
  'https://beyondbarscoaching.org/blog/f/%F0%9F%92%9A-what-shrek-teaches-%F0%9F%A7%A0-us-about-being-a-rebel-%F0%9F%92%9A',
  'https://beyondbarscoaching.org/blog/f/%F0%9F%8E%99%EF%B8%8F-chaos-to-calm-%E2%80%93-episode-9-emotional-resilience-without-alcoh',
  'https://beyondbarscoaching.org/blog/f/%F0%9F%8E%99%EF%B8%8F-chaos-to-calm-%E2%80%93-episode-8-stress-inoculation-%E2%80%93-training-your',
  'https://beyondbarscoaching.org/blog/f/%F0%9F%8E%99%EF%B8%8F-chaos-to-calm-%E2%80%93-episode-7-from-shutdown-to-reconnection',
  'https://beyondbarscoaching.org/blog/f/%F0%9F%8E%99%EF%B8%8F-chaos-to-calm-%E2%80%93-episode-6-from-hyperarousal-to-calm',
  'https://beyondbarscoaching.org/blog/f/%F0%9F%8E%99%EF%B8%8F-chaos-to-calm-%E2%80%93-episode-5-cravings-as-nervous-system-message',
  'https://beyondbarscoaching.org/blog/f/%F0%9F%8E%99%EF%B8%8F-chaos-to-calm-%E2%80%93-episode-4-gray-matter-self-regulation',
  'https://beyondbarscoaching.org/blog/f/%F0%9F%8E%99%EF%B8%8F-chaos-to-calm-%E2%80%93-episode-3-dopamine-joy-reset',
  'https://beyondbarscoaching.org/blog/f/%F0%9F%8E%99%EF%B8%8F-chaos-to-calm-%E2%80%93-episode-2-cortisol-chaos',
  'https://beyondbarscoaching.org/blog/f/%F0%9F%8E%99%EF%B8%8F-chaos-to-calm-%E2%80%93-episode-1-nervous-system-101',
  'https://beyondbarscoaching.org/blog/f/%F0%9F%92%9C-self-love-isn%E2%80%99t-soft-%E2%80%94-it%E2%80%99s-structured',
  'https://beyondbarscoaching.org/blog/f/why-does-a-linkedin-profile-matter-for-system-impacted-folks',
  'https://beyondbarscoaching.org/blog/f/20-ways-to-rebel-in-a-positive-way',
  'https://beyondbarscoaching.org/blog/f/a-year-of-impact-growth-rebel-strength-beyond-bars-coaching',
  'https://beyondbarscoaching.org/blog/f/how-the-power-of-coaching-transforms-lives-beyond-bars',
  'https://beyondbarscoaching.org/blog/f/4-holidays-4-birthdays-without-family-my-group-home-journey',
  'https://beyondbarscoaching.org/blog/f/restoring-our-connection-to-mother-earth-1',
  'https://beyondbarscoaching.org/blog/f/intro-to-yoga-%F0%9F%A7%98%E2%80%8D%E2%99%82%EF%B8%8F-props---a-handy-guide',
  'https://beyondbarscoaching.org/blog/f/my-tips-challenges-faced-by-those-re-entering-society',
  'https://beyondbarscoaching.org/blog/f/navigating-life-after-adversity-lessons-learned-practical-tips',
  'https://beyondbarscoaching.org/blog/f/introducing-beyond-bars-coaching',
  'https://beyondbarscoaching.org/blog/f/how-being-sober-helped-me-build-my-personal-development-muscle',
  'https://beyondbarscoaching.org/blog/f/5-ways-to-practice-satya-in-your-life-today',
  'https://beyondbarscoaching.org/blog/f/4-ways-to-practice-ahimsa-as-self-love-today',
  'https://beyondbarscoaching.org/blog/f/how-to-hire-a-life-coach---3-ds-to-consider',
  'https://beyondbarscoaching.org/blog/f/8-ways-yoga-changed-my-life',
  'https://beyondbarscoaching.org/blog/f/seasonal-pillar-series-pt-3-9-tips-for-personal-development',
  'https://beyondbarscoaching.org/blog/f/seasonal-pillar-series-10-ways-to-practice-self-care-now',
  'https://beyondbarscoaching.org/blog/f/seasonal-pillar-series-12-ways-to-nourish-your-body-now',
  'https://beyondbarscoaching.org/blog/f/dec-2022-%7C-herb-of-the-month-%7C-hawthorn-berry',
  'https://beyondbarscoaching.org/blog/f/6-ways-i%E2%80%99m-embracing-my-authentic-soul',
  'https://beyondbarscoaching.org/blog/f/milestone-730-days-sober',
  'https://beyondbarscoaching.org/blog/f/worldsoilday-1152022',
  'https://beyondbarscoaching.org/blog/f/beyond-the-massage-table',
  'https://beyondbarscoaching.org/blog/f/restoring-our-connection-to-mother-earth',
  'https://beyondbarscoaching.org/blog/f/you-may-be-a-new-herbalist-if-you%E2%80%A6',
  'https://beyondbarscoaching.org/blog/f/%E2%9C%A8%F0%9F%8C%BF%F0%9F%AB%B6-i-can-officially-call-myself-an-herbalist-%F0%9F%AB%B6%F0%9F%8C%BF%E2%9C%A8',
  'https://beyondbarscoaching.org/blog/f/reflecting-on-my-%E2%80%9Croots%E2%80%9D-journey',
  'https://beyondbarscoaching.org/blog/f/my-herbalism-journey-march-2022',
];

const CONTENT_DIR  = path.join(process.cwd(), 'src/content/blog');
const IMG_DIR      = path.join(process.cwd(), 'public/img/blog');

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });

/** Normalize protocol-relative URLs to https */
function toAbsolute(url) {
  return url.startsWith('//') ? 'https:' + url : url;
}

/** Strip GoDaddy image transform suffix (/:/rs=w:...) to get the original */
function stripTransform(url) {
  return url.replace(/\/:[^/]*$/, '');
}

/** Derive a normalized file extension from a URL, defaulting to .jpg */
function extFromUrl(url) {
  const p = new NodeURL(toAbsolute(url)).pathname;
  const e = path.extname(p).toLowerCase();
  return e || '.jpg';
}

/** Download a file to localPath, following redirects */
async function downloadFile(url, localPath) {
  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(localPath)) return;

  const fullUrl = toAbsolute(url);
  return new Promise((resolve, reject) => {
    const get = fullUrl.startsWith('https') ? https.get : http.get;
    const file = fs.createWriteStream(localPath);
    get(fullUrl, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(localPath);
        downloadFile(res.headers.location, localPath).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      reject(err);
    });
  });
}

async function migratePost(browser, postUrl) {
  const urlObj = new NodeURL(postUrl);
  // Slug is the last path segment (URL-encoded)
  const slug = urlObj.pathname.replace('/blog/f/', '');

  console.log(`\n→ ${slug}`);

  const page = await browser.newPage();
  try {
    await page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for main article content
    await page.waitForSelector('article, [data-testid="richTextElement"], .blog-post-content', {
      timeout: 15000,
    }).catch(() => { /* best-effort */ });

    const data = await page.evaluate(() => {
      // Title: prefer a post-level heading inside the article over the page-level h1
      // (GoDaddy sites use a generic page h1 like "The Sober Rebel Blog")
      const postContainer =
        document.querySelector('article') ||
        document.querySelector('[data-hook="post-content"]') ||
        document.querySelector('.blog-post-content') ||
        document.querySelector('main');

      const title =
        postContainer?.querySelector('h3[role="heading"]')?.innerText?.trim() ||
        postContainer?.querySelector('h2[role="heading"]')?.innerText?.trim() ||
        postContainer?.querySelector('h1[role="heading"]')?.innerText?.trim() ||
        document.querySelector('[data-hook="post-title"]')?.innerText?.trim() ||
        document.querySelector('h1')?.innerText?.trim() ||
        document.title;

      // Publish date
      const dateEl =
        document.querySelector('time') ||
        document.querySelector('[data-hook="post-metadata-date"]') ||
        document.querySelector('.post-metadata__date');
      const pubDate = dateEl?.getAttribute('datetime') || dateEl?.innerText?.trim() || null;

      // Hero image — use getAttribute to get the raw src (may be protocol-relative)
      const heroEl =
        document.querySelector('[data-hook="hero-image"] img') ||
        document.querySelector('.media-root img') ||
        postContainer?.querySelector('img');
      const heroSrc = heroEl?.getAttribute('src') || heroEl?.src || null;

      // Body HTML
      const bodyHtml = postContainer?.innerHTML || document.body.innerHTML;

      // All images — use getAttribute to preserve raw src values
      const images = [
        ...document.querySelectorAll('article img, [data-hook="post-content"] img, main img'),
      ]
        .map(img => img.getAttribute('src') || img.src)
        .filter(Boolean);

      // Tags/categories
      const categoriesEl = document.querySelector('[data-aid="RSS_POST_CATEGORIES"]');
      const categoriesText = categoriesEl?.innerText?.trim() || '';
      const tags = categoriesText
        ? categoriesText.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      return { title, pubDate, heroSrc, bodyHtml, images, tags };
    });

    // Convert body HTML to Markdown
    let markdown = td.turndown(data.bodyHtml);

    // Remove "All Posts" back-link (GoDaddy blog index link)
    markdown = markdown.replace(/\[All Posts\]\([^)]*\)\n*/gi, '');

    // Download images and rewrite paths in markdown
    const imgSlugDir = path.join(IMG_DIR, slug);
    const seenUrls   = new Set();

    const allImgUrls = [...new Set([
      ...(data.heroSrc ? [data.heroSrc] : []),
      ...data.images,
    ])].filter(u => u && (u.startsWith('http') || u.startsWith('//')));

    let heroLocalPath = null;
    let bodyImageIndex = 0;

    for (const imgUrl of allImgUrls) {
      const cleanUrl = stripTransform(imgUrl);
      if (seenUrls.has(cleanUrl)) continue;
      seenUrls.add(cleanUrl);

      const ext = extFromUrl(cleanUrl);
      const isHero = imgUrl === data.heroSrc;
      const filename = isHero
        ? `hero${ext}`
        : `image-${String(++bodyImageIndex).padStart(2, '0')}${ext}`;
      const localAbs = path.join(imgSlugDir, filename);
      const localRel = `/img/blog/${slug}/${filename}`;

      try {
        await downloadFile(cleanUrl, localAbs);

        if (isHero) heroLocalPath = localRel;

        // Replace all variants of this URL in the markdown:
        // absolute (https://...), protocol-relative (//...), with/without transform suffix
        const variants = new Set([
          imgUrl,
          cleanUrl,
          toAbsolute(imgUrl),
          toAbsolute(cleanUrl),
          imgUrl.replace(/^https?:/, ''),
          cleanUrl.replace(/^https?:/, ''),
        ]);
        for (const v of variants) {
          if (v) markdown = markdown.replaceAll(v, localRel);
        }
      } catch (e) {
        console.warn(`  ⚠ Failed to download ${cleanUrl}: ${e.message}`);
      }
    }

    // Build frontmatter
    const fm = [
      '---',
      `title: ${JSON.stringify(data.title)}`,
      ...(data.pubDate ? [`pubDate: ${data.pubDate}`] : []),
      ...(heroLocalPath ? [`heroImage: ${JSON.stringify(heroLocalPath)}`] : []),
      ...(data.tags.length ? [`tags: [${data.tags.map(t => JSON.stringify(t)).join(', ')}]`] : []),
      '---',
      '',
    ].join('\n');

    // Write markdown file — filename is the URL-decoded slug
    const decodedSlug  = decodeURIComponent(slug);
    const safeFilename = decodedSlug.replace(/[<>:"\\|?*]/g, '-') + '.md';
    const outPath      = path.join(CONTENT_DIR, safeFilename);

    // Remove placeholder if present
    const placeholder = path.join(CONTENT_DIR, 'placeholder.md');
    if (fs.existsSync(placeholder)) fs.unlinkSync(placeholder);

    fs.writeFileSync(outPath, fm + markdown, 'utf8');
    console.log(`  ✓ ${safeFilename}`);
    if (data.tags.length) console.log(`    tags: ${data.tags.join(', ')}`);
  } finally {
    await page.close();
  }
}

async function main() {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
  if (!fs.existsSync(IMG_DIR))     fs.mkdirSync(IMG_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  for (const url of BLOG_URLS) {
    try {
      await migratePost(browser, url);
    } catch (e) {
      console.error(`  ✗ Failed ${url}: ${e.message}`);
    }
    // Small delay to be polite to the server
    await new Promise(r => setTimeout(r, 1500));
  }

  await browser.close();
  console.log('\n✅ Migration complete. Review src/content/blog/ and public/img/blog/ then spot-check the output.');
}

main().catch(console.error);
