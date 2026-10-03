// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Astro 7 defaults to 'jsx' whitespace compression, which strips the spaces
  // between inline elements. These templates are hand-authored and rely on
  // whitespace-aware collapsing, so the previous behaviour is kept.
  compressHTML: true,
});