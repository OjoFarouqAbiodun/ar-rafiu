import { buildGeneralEnquiryMessage, buildWhatsAppLink } from '../lib/whatsapp';

/**
 * Site behaviour that needs scripting.
 *
 * Deliberately tiny and framework-free: PRD section 21 asks for minimal
 * JavaScript. Each feature is a small `init*` function that returns immediately
 * when its markup is absent, so this stays a set of independent initialisers
 * rather than an application.
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

/**
 * What counts as an acceptable email address.
 *
 * Deliberately permissive. The message is only pre-filled into WhatsApp, where
 * the visitor reads it before sending, so a strict pattern would reject addresses
 * that are valid in practice. This catches the cases a person would call a
 * mistake: no `@`, nothing either side of it, or no dot in the domain.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * One control in the enquiry form, with the message shown when it is empty or
 * malformed. Each message says how to correct the problem, per
 * FRONTEND-CORE-RULES section 15.
 */
interface EnquiryField {
  input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  error: HTMLElement;
  /** Returns the message to show, or null when the value is acceptable. */
  validate(value: string): string | null;
}

function initEnquiryForm(): void {
  const root = document.querySelector<HTMLElement>('[data-enquiry-root]');
  if (!root) return;

  const form = root.querySelector<HTMLFormElement>('[data-enquiry-form]');
  if (!form) return;

  const fieldError = (name: string): HTMLElement | null =>
    form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);

  // Typed before filtering, because a trailing `filter` would strip the
  // contextual type the arrow parameters rely on.
  const declaredFields: EnquiryField[] = [
    {
      input: form.elements.namedItem('name') as HTMLInputElement,
      error: fieldError('name') as HTMLElement,
      validate: (value) =>
        value.trim() ? null : 'Enter your name so the enquiry reaches you.',
    },
    {
      input: form.elements.namedItem('email') as HTMLInputElement,
      error: fieldError('email') as HTMLElement,
      validate: (value) => {
        const trimmed = value.trim();
        if (!trimmed) return 'Enter your email address so the enquiry reaches you.';
        if (!EMAIL_PATTERN.test(trimmed)) {
          return 'Enter an email address in the format name@example.com.';
        }
        return null;
      },
    },
    {
      // Optional, so an empty value is valid. A supplied value is still checked,
      // because a half-typed number reaches WhatsApp as-is.
      input: form.elements.namedItem('phone') as HTMLInputElement,
      error: fieldError('phone') as HTMLElement,
      validate: (value) => {
        const trimmed = value.trim();
        if (!trimmed) return null;
        if (!/\d/.test(trimmed)) return 'Enter a phone number, or leave this empty.';
        return null;
      },
    },
    {
      input: form.elements.namedItem('subject') as HTMLSelectElement,
      error: fieldError('subject') as HTMLElement,
      validate: (value) => (value ? null : 'Choose a product or service.'),
    },
    {
      input: form.elements.namedItem('message') as HTMLTextAreaElement,
      error: fieldError('message') as HTMLElement,
      validate: (value) => (value.trim() ? null : 'Describe what you need.'),
    },
  ];

  // Dropped rather than silently crashing if a future edit leaves a control or
  // its error paragraph out of the markup.
  const fields = declaredFields.filter((field) => field.input && field.error);

  /** Shows or clears one field's error without touching what was typed. */
  const setFieldState = (field: EnquiryField, message: string | null): void => {
    if (message) {
      field.error.textContent = message;
      field.error.hidden = false;
      field.input.setAttribute('aria-invalid', 'true');
    } else {
      field.error.textContent = '';
      field.error.hidden = true;
      field.input.removeAttribute('aria-invalid');
    }
  };

  // The section starts hidden and is revealed here, so the form only appears
  // when something can handle it. A form with no action would otherwise post the
  // visitor's details back to this page's URL when JavaScript is unavailable.
  root.hidden = false;

  form.addEventListener('submit', (event) => {
    // Nothing is sent anywhere: the message is composed here and handed to
    // WhatsApp. Preventing the default is what stops the browser submitting the
    // form to this page.
    event.preventDefault();

    let firstInvalid: EnquiryField | null = null;

    for (const field of fields) {
      const message = field.validate(field.input.value);
      setFieldState(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    }

    if (firstInvalid) {
      firstInvalid.input.focus();
      return;
    }

    const value = (name: string): string => {
      const element = form.elements.namedItem(name);
      return element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
        ? element.value.trim()
        : '';
    };

    const message = buildGeneralEnquiryMessage({
      name: value('name'),
      email: value('email'),
      phone: value('phone'),
      subject: value('subject'),
      message: value('message'),
    });

    // The entered values are deliberately not logged, stored or sent to the
    // site: they leave the browser only inside the WhatsApp link.
    window.location.assign(buildWhatsAppLink(message));
  });

  // `change` rather than `input`, so an error clears once the visitor has
  // finished with the field instead of being re-announced on every keystroke.
  for (const field of fields) {
    field.input.addEventListener('change', () => setFieldState(field, field.validate(field.input.value)));
  }
}

function init(): void {
  initSiteNav();
  initEnquiryForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}