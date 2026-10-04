/**
 * Service list, taken from the set named in PRD section 9.3.
 *
 * Summaries describe what a service is rather than what the company achieves
 * with it, so no capability or performance claim is implied (PRD section 24).
 *
 * `features` and `useCases` are declared but intentionally left unpopulated, for
 * the same reason as `equipment.ts`: the detail pages can render them as soon as
 * real data exists, and nothing is invented to fill them meanwhile.
 */

export interface Service {
  /** Stable URL segment for `/services/[service]`. Not shown to visitors. */
  id: string;
  name: string;
  description: string;
  /** Optional. Only factual, company-supplied inclusions or capabilities. */
  features?: readonly string[];
  /** Optional. Only factual, company-supplied use cases. */
  useCases?: readonly string[];
}

export const services: Service[] = [
  {
    id: 'installation',
    name: 'IT equipment installation',
    description: 'Setting up and connecting IT equipment so it is ready to use.',
  },
  {
    id: 'maintenance',
    name: 'Equipment maintenance',
    description: 'Maintenance carried out on equipment to keep it working reliably.',
  },
  {
    id: 'repairs',
    name: 'Equipment repairs',
    description: 'Finding the cause of a fault and repairing equipment that has stopped working properly.',
  },
  {
    id: 'replacement',
    name: 'Equipment replacement',
    description: 'Replacing equipment that has reached the end of its useful life.',
  },
  {
    id: 'cctv-installation',
    name: 'CCTV installation',
    description: 'Fitting and connecting camera systems, and setting them up for the area being monitored.',
  },
  {
    id: 'biometric-installation',
    name: 'Biometric system installation',
    description: 'Fitting biometric devices such as fingerprint readers and setting them up for access control.',
  },
  {
    id: 'server-solutions',
    name: 'Server solutions',
    description: 'Server hardware, racking and the physical setup around them.',
  },
  {
    id: 'it-support',
    name: 'IT support',
    description: 'Troubleshooting problems with IT equipment and the technology around it.',
  },
  {
    id: 'software-solutions',
    name: 'Software & application solutions',
    description: 'Software and applications. State the requirement when you enquire and it can be matched.',
  },
  {
    id: 'power-backup',
    name: 'Power backup solutions',
    description: 'Inverter and battery systems for when the mains supply is interrupted.',
  },
  {
    id: 'other-technology',
    name: 'Other technology services',
    description: 'Other technology equipment and services, raised through the same enquiry route.',
  },
];

export function findService(id: string): Service | undefined {
  return services.find((service) => service.id === id);
}