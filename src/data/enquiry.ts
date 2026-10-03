/**
 * Shortcuts into the enquiry flow.
 *
 * PRD section 3 identifies the core problem as friction between discovering
 * something and making contact, so the homepage offers a small set of starting
 * points that pre-fill the WhatsApp message with the visitor's area of interest.
 * Each topic stays within the equipment and service vocabulary already defined
 * in `equipment.ts` and `services.ts`.
 */

export interface EnquiryTopic {
  id: string;
  label: string;
  /** Carried into the WhatsApp message as the `Interest` field. */
  interest: string;
}

export const enquiryTopics: EnquiryTopic[] = [
  {
    id: 'compute',
    label: 'Servers & infrastructure',
    interest: 'Servers, server racks or computers',
  },
  {
    id: 'security',
    label: 'CCTV & access control',
    interest: 'CCTV systems or biometric machines',
  },
  {
    id: 'power',
    label: 'Power backup',
    interest: 'Inverters or batteries',
  },
  {
    id: 'print',
    label: 'Printers & photocopiers',
    interest: 'Printers or photocopy machines',
  },
  {
    id: 'support',
    label: 'Repairs & maintenance',
    interest: 'Maintenance, repairs or equipment replacement',
  },
];