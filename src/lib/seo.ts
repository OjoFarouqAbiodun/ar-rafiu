import { company } from '../data/company';

/**
 * Page metadata builder.
 *
 * Builds the title, description, Open Graph and Twitter tags. Canonical URLs
 * are generated separately in `src/layouts/BaseLayout.astro` from Astro's
 * confirmed `site` origin. The Open Graph image is still to be added when an
 * asset exists rather than guessed.
 */

export interface PageMeta {
  /** Page title without the company suffix. Pass the legal name to omit it. */
  title: string;
  description: string;
}

export interface ResolvedPageMeta {
  title: string;
  description: string;
  openGraph: {
    title: string;
    description: string;
    siteName: string;
    type: 'website';
  };
  twitter: {
    card: 'summary';
    title: string;
    description: string;
  };
}

export function buildPageMeta({ title, description }: PageMeta): ResolvedPageMeta {
  const fullTitle = title === company.legalName ? title : `${title} | ${company.tradingName}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      siteName: company.tradingName,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: fullTitle,
      description,
    },
  };
}

export function getCanonicalUrl(path: string): string | undefined {
  // Returns undefined if Astro's `site` is not configured. `site` is set in
  // astro.config.mjs, so this resolves against the confirmed production origin.
  const site = (import.meta as any).env?.SITE;
  if (!site) return undefined;
  const base = String(site).replace(/\/$/, '');
  const slug = path.startsWith('/') ? path : `/${path}`;
  return `${base}${slug.replace(/\/$/, '') || '/'}`;
}