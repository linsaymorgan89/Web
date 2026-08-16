import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://theeroticmorgan.com',
  trailingSlash: 'always',
  integrations: [sitemap({
    changefreq: 'weekly',
    priority: 0.7,
    serialize(item) {
      if (item.url.includes('?')) return undefined;
      if (item.url === 'https://theeroticmorgan.com/') item.priority = 1.0;
      return item;
    },
  })],
  build: { inlineStylesheets: 'auto' },
  image: { domains: [], remotePatterns: [] },
});
