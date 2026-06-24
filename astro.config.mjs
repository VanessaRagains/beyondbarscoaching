import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://vanessaragains.github.io',
  base: '/beyondbarscoaching'
  integrations: [sitemap()],
});
