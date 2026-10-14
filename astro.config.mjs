// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Astro 7 defaults to 'jsx' whitespace compression, which strips the spaces
  // between inline elements. These templates are hand-authored and rely on
  // whitespace-aware collapsing, so the previous behaviour is kept.
  compressHTML: true,
  // Confirmed production origin. The sitemap and canonical URLs use it
  // automatically.
  site: 'https://ar-rafiu.vercel.app',
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404.html') && !page.endsWith('/404/'),
    }),
  ],
});