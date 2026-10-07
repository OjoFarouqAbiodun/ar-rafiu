import { company } from '../data/company';

/**
 * Builds the enquiry body defined in PRD section 10. Callers pass the labelled
 * details relevant to the enquiry, for example `{ Product: 'Rack Server' }` on a
 * product page or `{ Service: 'CCTV Installation' }` on a service page; each
 * detail becomes a labelled line of its own, as in the PRD's example message.
 *
 * General enquiries pass nothing, so the message asks what the visitor needs
 * instead of asserting an interest they have not expressed.
 */
export function buildEnquiryMessage(details: Record<string, string> = {}): string {
  const lines = Object.entries(details).map(([label, value]) => `${label}: ${value}`);

  return [
    `Hello ${company.legalName},`,
    lines.length
      ? 'I would like to ask about:'
      : 'I would like to ask about your equipment or services.',
    ...(lines.length ? [lines.join('\n')] : []),
    'Please let me know what details you need from me.',
    'Thank you.',
  ].join('\n\n');
}

/**
 * The details a visitor can supply through the general enquiry form.
 *
 * Phone is optional. WhatsApp is the channel the message travels over (PRD
 * section 11), so a phone number is offered for a callback rather than demanded.
 */
export interface GeneralEnquiry {
  name: string;
  email: string;
  phone?: string;
  /** The chosen product or service, including "Another requirement". */
  subject: string;
  message: string;
}

/**
 * Message for an enquiry composed from the contact form.
 *
 * The greeting and sign-off match `buildEnquiryMessage`, but the body keeps the
 * visitor's own details on their own lines: a form supplies more fields than a
 * product or service link, and folding them into prose would bury the
 * free-text message mid-sentence.
 *
 * The line opening the body states that the enquiry came from the website,
 * because the recipient receives it in WhatsApp with no other context. Phone is
 * omitted when it was left blank.
 */
export function buildGeneralEnquiryMessage(enquiry: GeneralEnquiry): string {
  const lines = [
    `Hello ${company.legalName},`,
    'I am sending a general enquiry from the Ar-Rafiu website.',
    [
      `Name: ${enquiry.name}`,
      `Email: ${enquiry.email}`,
      ...(enquiry.phone?.trim() ? [`Phone: ${enquiry.phone.trim()}`] : []),
      `Product or service: ${enquiry.subject}`,
    ].join('\n'),
    enquiry.message,
    'Thank you.',
  ];

  return lines.join('\n\n');
}

/**
 * WhatsApp deep link with a pre-filled message. The message is encoded because
 * product and service names routinely contain characters that would otherwise
 * break the query string (PRD section 30).
 */
export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${company.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * WhatsApp deep link with no message attached, for places that show the number
 * itself rather than offering a pre-composed enquiry.
 */
export function buildWhatsAppChatLink(): string {
  return `https://wa.me/${company.contact.whatsapp}`;
}