/**
 * Site behaviour that needs scripting.
 *
 * Deliberately tiny and framework-free: PRD section 21 asks for minimal
 * JavaScript, and the only interactive requirement in this phase is the mobile
 * navigation. Animation is handled separately in `src/lib/motion`.
 */

/**
 * Where the full navigation takes over from the collapsed panel.
 *
 * Matches the `--bp-lg` media queries in `SiteHeader.astro`. The two have to
 * agree: if the stylesheet treated a width as mobile while this query treated
 * it as desktop, the toggle would be on screen with no panel to collapse into.
 */
const DESKTOP_NAV = '(min-width: 64rem)';

function initSiteNav(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;

  const toggle = header.querySelector<HTMLButtonElement>('.site-header__toggle');
  if (!toggle) return;

  const nav = header.querySelector<HTMLElement>('.site-nav');
  if (!nav) return;

  // Flipping this flag is what enables the collapsed mobile panel. Until it is
  // set the navigation list renders expanded, so a scripting failure leaves a
  // usable site rather than a hidden menu.
  header.dataset.navReady = 'true';

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const setOpen = (open: boolean): void => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.dataset.open = String(open);
  };

  const close = (returnFocus = false): void => {
    if (!isOpen()) return;
    setOpen(false);
    if (returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  // Following a link inside the panel should not leave it open behind the new
  // page.
  nav.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close(true);
  });

  document.addEventListener('click', (event) => {
    if (!isOpen()) return;
    if (!header.contains(event.target as Node)) close();
  });

  // Keeps the panel from staying open when focus lands somewhere unrelated,
  // such as after a keyboard user tabs past the end of the header.
  header.addEventListener('focusout', (event) => {
    if (!isOpen()) return;
    const next = event.relatedTarget as Node | null;
    if (!next || !header.contains(next)) close();
  });

  const desktop = window.matchMedia(DESKTOP_NAV);
  desktop.addEventListener('change', (event) => {
    if (event.matches) close();
  });
}

function init(): void {
  initSiteNav();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}