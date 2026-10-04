import { company } from '../data/company';

/**
 * Builds the enquiry body defined in PRD section 10. Callers pass the labelled
 * details relevant to the enquiry, for example `{ Product: 'Rack Server' }` on a
 * product page or `{ Service: 'CCTV Installation' }` on a service page.
 *
 * General enquiries pass nothing, so the message asks what the visitor needs
 * instead of asserting an interest they have not expressed.
 */
export function buildEnquiryMessage(details: Record<string, string> = {}): string {
  const subject = Object.entries(details)
    .map(([label, value]) => `${label}: ${value}`)
    .join(', ');

  return [
    `Hello ${company.legalName},`,
    subject
      ? `I would like to ask about ${subject}.`
      : 'I would like to ask about your equipment or services.',
    'Please let me know what details you need from me.',
    'Thank you.',
  ].join('\n\n');
}

/**
 * WhatsApp deep link with a pre-filled message. The message is encoded because
 * product and service names routinely contain characters that would otherwise
 * break the query string (PRD section 30).
 */
export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${company.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}