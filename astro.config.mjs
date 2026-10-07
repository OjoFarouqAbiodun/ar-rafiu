// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Astro 7 defaults to 'jsx' whitespace compression, which strips the spaces
  // between inline elements. These templates are hand-authored and rely on
  // whitespace-aware collapsing, so the previous behaviour is kept.
  compressHTML: true,
  // Site URL is intentionally not set because no custom domain is confirmed yet.
  // When the real domain is purchased, set `site` here (e.g. https://example.com)
  // and the sitemap + canonical URLs will use it automatically.
  site: undefined,
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404.html') && !page.endsWith('/404/'),
    }),
  ],
});