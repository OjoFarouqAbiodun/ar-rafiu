import { company } from '../data/company';

/**
 * Page metadata builder.
 *
 * Canonical URLs and `og:image` are deliberately absent. Both require an
 * absolute origin, and the deployment domain is not yet known (PRD section 32,
 * phase 8). They are added when `site` is configured rather than guessed now.
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
  // Return undefined if site URL is not configured (no domain decided yet).
  // When site is set in astro.config.mjs, Astro's sitemap and layouts can use this.
  const site = (import.meta as any).env?.SITE;
  if (!site) return undefined;
  const base = String(site).replace(/\/$/, '');
  const slug = path.startsWith('/') ? path : `/${path}`;
  return `${base}${slug.replace(/\/$/, '') || '/'}`;
}