/**
 * Service list, taken from the set named in PRD section 9.3.
 *
 * Summaries describe what a service is rather than what the company achieves
 * with it, so no capability or performance claim is implied (PRD section 24).
 */

export interface Service {
  id: string;
  name: string;
  description: string;
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
    description: 'Scheduled upkeep intended to keep equipment working reliably.',
  },
  {
    id: 'repairs',
    name: 'Equipment repairs',
    description: 'Diagnosis and repair of faulty equipment.',
  },
  {
    id: 'replacement',
    name: 'Equipment replacement',
    description: 'Replacing equipment that can no longer be repaired economically.',
  },
  {
    id: 'cctv-installation',
    name: 'CCTV installation',
    description: 'Installing camera systems for monitoring and security.',
  },
  {
    id: 'biometric-installation',
    name: 'Biometric system installation',
    description: 'Installing biometric identification and access control systems.',
  },
  {
    id: 'server-solutions',
    name: 'Server solutions',
    description: 'Server hardware, racking and related infrastructure support.',
  },
  {
    id: 'it-support',
    name: 'IT support',
    description: 'Technical support for IT equipment and related technology issues.',
  },
  {
    id: 'software-solutions',
    name: 'Software & application solutions',
    description: 'Software and application solutions matched to business requirements.',
  },
  {
    id: 'power-backup',
    name: 'Power backup solutions',
    description: 'Inverter and battery backup power solutions.',
  },
  {
    id: 'other-technology',
    name: 'Other technology services',
    description: 'Related technology equipment and services not listed above.',
  },
];