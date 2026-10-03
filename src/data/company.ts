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

/** Contact fields still holding temporary development values. */
export const placeholderContactDetails: readonly ContactDetailKey[] = [
  'whatsapp',
  'phone',
  'email',
  'address',
];