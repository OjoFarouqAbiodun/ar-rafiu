/**
 * Single source of truth for company identity and contact details.
 *
 * Every enquiry button, footer, and contact link reads from this module, so
 * replacing a placeholder is a one-line edit (PRD section 11). The values
 * currently in `placeholderContactDetails` are development placeholders and
 * must be replaced with confirmed details before deployment (PRD sections 24
 * and 25).
 */

export const company = {
  legalName: 'Ar-Rafiu Integrated Services Limited',
  tradingName: 'Ar-Rafiu Integrated Services',
  contact: {
    whatsapp: '2348000000000',
    phone: '+234 800 000 0000',
    email: 'info@example.com',
    address: 'Lagos, Nigeria',
  },
} as const;

export type ContactDetailKey = keyof typeof company.contact;

/**
 * One-sentence statement of what the company is, used wherever a page needs to
 * orient a visitor quickly. It is held here rather than restated per page so the
 * wording cannot drift between the homepage, the about page and the footer.
 */
export const companySummary =
  'Ar-Rafiu supplies IT equipment and technology, and provides installation, maintenance, repair and replacement.';

/**
 * Single wording for the placeholder disclosure. Three separate variants existed
 * before the copy audit; one constant keeps them consistent and easy to delete
 * once real contact details are confirmed.
 */
export const placeholderNotice =
  'Contact details shown are placeholders and will be updated once confirmed.';

/** Contact fields still holding temporary development values. */
export const placeholderContactDetails: readonly ContactDetailKey[] = [
  'whatsapp',
  'phone',
  'email',
  'address',
];