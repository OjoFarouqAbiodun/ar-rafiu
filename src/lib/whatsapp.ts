import { company } from '../data/company';

/**
 * Builds the enquiry body defined in PRD section 10. Callers pass the labelled
 * details relevant to the enquiry, for example `{ Product: 'Rack Server' }` on a
 * product page or `{ Service: 'CCTV Installation' }` on a service page.
 */
export function buildEnquiryMessage(details: Record<string, string>): string {
  const body = Object.entries(details)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n\n');

  return [
    `Hello ${company.legalName},`,
    'I would like to make an enquiry about:',
    body,
    'Please provide more information about availability, specifications and pricing.',
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