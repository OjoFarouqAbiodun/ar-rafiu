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