import { company } from '../data/company';

/**
 * Page metadata builder.
 *
 * Builds the title, description, Open Graph and Twitter values. The canonical
 * URL and the share-image URL are resolved in `src/layouts/BaseLayout.astro`
 * from Astro's confirmed `site` origin and passed in, so this module stays
 * free of environment-specific URLs.
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
    url?: string;
    image?: {
      url: string;
      secureUrl?: string;
      type?: string;
      width?: number;
      height?: number;
      alt?: string;
    };
  };
  twitter: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    image?: string;
  };
}

export interface BuildPageMetaOptions extends PageMeta {
  /** Absolute URL to the Open Graph/Twitter share image. */
  imageUrl?: string;
  /** Absolute URL of the page (canonical/og:url). */
  url?: string;
}

export function buildPageMeta({
  title,
  description,
  imageUrl,
  url,
}: BuildPageMetaOptions): ResolvedPageMeta {
  const fullTitle = title === company.legalName ? title : `${title} | ${company.tradingName}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      siteName: company.tradingName,
      type: 'website',
      ...(url ? { url } : {}),
      ...(imageUrl
        ? {
            image: {
              url: imageUrl,
              secureUrl: imageUrl,
              type: 'image/png',
              width: 1200,
              height: 630,
              alt: `${company.tradingName} — IT equipment, technology and technical support`,
            },
          }
        : {}),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description,
      ...(imageUrl ? { image: imageUrl } : {}),
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