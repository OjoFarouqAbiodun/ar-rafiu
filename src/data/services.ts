/**
 * Service list. It combines the services named in PRD section 9.3, which says
 * this list is to be updated when the company provides its official set, with
 * the areas the company confirmed in 2026.
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
  /** Optional until official photography exists (PRD section 27.10). */
  image?: string;
  /**
   * Optional alt text describing what the photograph shows. Unset means the
   * detail page falls back to the item name, which is the pre-existing
   * behaviour. Set for entries whose photograph is representative stock, so the
   * alt describes the visible subject rather than naming the page.
   */
  imageAlt?: string;
  /** Optional. Only factual, company-supplied inclusions or capabilities. */
  features?: readonly string[];
  /** Optional. Only factual, company-supplied use cases. */
  useCases?: readonly string[];
  /**
   * Optional override for the page's meta description, for the rare entry whose
   * `description` makes the composed description run long. Unset means the route
   * composes it as before. The visible description is never rewritten to suit
   * search engines.
   */
  metaDescription?: string;
}

export const services: Service[] = [
  {
    id: 'general-installation',
    name: 'General installation & maintenance',
    description:
      'Installation and maintenance work for the equipment Ar-Rafiu supplies, and for equipment already in use.',
    image: '/assets/services/it-maintenance-technician.jpg',
  },
  {
    id: 'repairs',
    name: 'Equipment repairs',
    description: 'Finding the cause of a fault and repairing equipment that has stopped working properly.',
    image: '/assets/services/laptop-repair-workbench.jpg',
  },
  {
    id: 'replacement',
    name: 'Equipment replacement',
    description: 'Replacing equipment that has reached the end of its useful life.',
    image: '/assets/services/replacing-computer-components.jpg',
  },
  {
    id: 'cctv-installation',
    name: 'CCTV installation & maintenance',
    description:
      'Fitting and connecting camera systems, setting them up for the area being monitored, and keeping them maintained.',
    image: '/assets/services/cctv-camera-installation.jpg',
  },
  {
    id: 'solar-installation',
    name: 'Solar & hybrid solar installation & management',
    description:
      'Installing solar and hybrid solar systems, and managing them as part of the power setup.',
    image: '/assets/services/solar-panel-installation.jpg',
    imageAlt: 'Technicians installing solar panels on a roof',
  },
  {
    id: 'biometric-installation',
    name: 'Biometric system installation',
    description: 'Fitting biometric devices such as fingerprint readers and setting them up for access control.',
    image: '/assets/services/biometric-access-terminal.jpg',
    metaDescription:
      'Biometric system installation from Ar-Rafiu: fitting fingerprint readers and other biometric devices and setting them up for access control.',
  },
  {
    id: 'networking-solutions',
    name: 'Networking solutions',
    description:
      'Setting up and connecting computer networks and the equipment that runs on them.',
    image: '/assets/services/technician-installing-network-equipment.jpg',
  },
  {
    id: 'server-solutions',
    name: 'Server solutions',
    description: 'Server hardware, racking and the physical setup around them.',
    image: '/assets/services/server-room-networking.jpg',
  },
  {
    id: 'it-support',
    name: 'IT support',
    description: 'Troubleshooting problems with IT equipment and the technology around it.',
    image: '/assets/services/it-support-helpdesk.jpg',
  },
  {
    id: 'hardware-software-engineering',
    name: 'Hardware & software engineering',
    description:
      'Hardware and software engineering work, from working out what a requirement needs to setting it up.',
    image: '/assets/services/circuit-board-electronics.jpg',
    imageAlt: 'Electronic components on a circuit board',
  },
  {
    id: 'software-solutions',
    name: 'Software & application solutions',
    description: 'Software and applications. State the requirement when you enquire and it can be matched.',
    image: '/assets/services/business-software-on-screen.jpg',
    metaDescription:
      'Software and application solutions from Ar-Rafiu Integrated Services Limited. Describe the requirement when you enquire and it can be matched to it.',
  },
  {
    id: 'web-design',
    name: 'Web design',
    description:
      'Designing and building websites, from the first layout through to the finished pages.',
    image: '/assets/services/web-design-screen.jpg',
    imageAlt: 'A computer screen showing web design work',
  },
  {
    id: 'laptop-desktop',
    name: 'Laptop & desktop supply, services & maintenance',
    description:
      'Supplying laptops and desktop computers, and servicing or maintaining the ones already in use.',
    image: '/assets/services/technician-repairing-laptop.jpg',
    imageAlt: 'A technician servicing a laptop',
  },
  {
    id: 'solar-panel-inverter-supply',
    name: 'Solar panel & inverter supply',
    description: 'Supplying solar panels and inverters for on-site power.',
    image: '/assets/services/residential-solar-inverter.jpg',
    imageAlt: 'An installed solar inverter setup',
  },
  {
    id: 'ups-solutions',
    name: 'UPS solutions',
    description:
      'Uninterruptible power supplies, including industrial, online and line-interactive units, supplied and set up.',
    image: '/assets/services/ups-battery-unit.jpg',
    imageAlt: 'Battery backup or uninterruptible power supply equipment',
  },
  {
    id: 'avr-stabilizers',
    name: 'AVR stabilizers',
    description:
      'Automatic voltage regulators that steady the supply reaching connected equipment.',
    image: '/assets/services/voltage-regulation-equipment.jpg',
    imageAlt: 'Voltage regulation or power supply equipment',
  },
  {
    id: 'power-backup',
    name: 'Power backup solutions',
    description: 'Inverter and battery systems for when the mains supply is interrupted.',
    image: '/assets/services/uninterruptible-power-supply.jpg',
  },
  {
    id: 'other-technology',
    name: 'Other technology services',
    description: 'Other technology equipment and services, raised through the same enquiry route.',
    image: '/assets/services/technology-equipment-workspace.jpg',
  },
];

export function findService(id: string): Service | undefined {
  return services.find((service) => service.id === id);
}
