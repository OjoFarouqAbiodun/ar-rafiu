/**
 * Primary navigation, shared by the header and the footer so the two cannot
 * drift apart. Destinations follow PRD section 15.
 */

export interface NavigationItem {
  href: string;
  label: string;
}

export const primaryNavigation: NavigationItem[] = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/**
 * Whether a navigation destination is the page currently being viewed.
 *
 * Shared by the header and the footer so the two cannot disagree about which
 * item is current. Detail pages live one or two segments below a section, so a
 * plain string comparison would leave `/products/servers/` with no current item
 * in the footer while the header correctly marked Products.
 *
 * Matching is on whole path segments rather than a bare prefix, so `/products`
 * does not also match a hypothetical `/products-archive`. The root is handled
 * separately because every other path starts with it.
 */
export function isCurrentPath(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}