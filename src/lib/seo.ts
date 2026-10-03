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