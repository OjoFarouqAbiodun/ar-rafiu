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
 * `buildEnquiryMessage` folds its details into a single sentence, which reads
 * correctly for one product or service but not for a form: the visitor's own
 * free-text message ends up buried mid-sentence and picks up a second full stop.
 * This builds the same greeting and sign-off with the details on their own
 * lines, so the message reads as what it is.
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