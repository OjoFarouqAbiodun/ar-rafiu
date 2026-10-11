/**
 * Equipment catalogue, grouped by what the equipment is for rather than by
 * alphabetical order.
 *
 * The grouping is the reason the data is shaped this way: PRD section 2 lists a
 * flat set of product lines, which rendered as a grid produces an undifferentiated
 * wall of items. Grouping lets the homepage present them as a handful of
 * readable domains.
 *
 * Only category-level information from PRD section 2 is recorded here. No
 * specifications, model names or stock levels are stated because the company has
 * not supplied them (PRD section 24).
 *
 * `features` and `useCases` are declared but intentionally left unpopulated. They
 * exist so that the product detail pages required by PRD section 9.4 can render
 * those sections the moment real data arrives, without the page having to be
 * rebuilt. They are never filled with plausible-sounding filler.
 */

export interface EquipmentCategory {
  /** Stable URL segment for `/products/[category]`. Not shown to visitors. */
  id: string;
  name: string;
  description: string;
  /** Optional until official product photography exists (PRD section 27.10). */
  image?: string;
  /**
   * Optional alt text describing what the photograph shows. Unset means the
   * detail page falls back to the item name, which is the pre-existing
   * behaviour. Set for entries whose photograph is representative stock, so the
   * alt describes the visible subject rather than naming the page.
   */
  imageAlt?: string;
  /** Optional. Only factual, company-supplied feature statements. */
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

export interface EquipmentGroup {
  id: string;
  title: string;
  description: string;
  categories: EquipmentCategory[];
}

export const equipmentGroups: EquipmentGroup[] = [
  {
    id: 'compute',
    title: 'Computers & infrastructure',
    description: 'Computers, servers and the racks that hold them.',
    categories: [
      {
        id: 'servers',
        name: 'Servers',
        description: 'Server hardware for shared services and business workloads.',
        image: '/assets/products/servers/server-rack-data-center.jpg',
      },
      {
        id: 'server-racks',
        name: 'Server racks',
        description: 'Racks for housing, organising and protecting server equipment.',
        image: '/assets/products/server-racks/server-equipment-rack.jpg',
      },
      {
        id: 'computers',
        name: 'Computers',
        description: 'Desktop and workstation computers for staff use.',
        image: '/assets/products/computers/desktop-computer-workstation.jpg',
      },
      {
        id: 'laptops',
        name: 'Laptops',
        description: 'Portable computers for staff who work away from a desk.',
        image: '/assets/products/laptops/laptop-computer.jpg',
        imageAlt: 'A laptop computer',
      },
    ],
  },
  {
    id: 'print',
    title: 'Print & document',
    description: 'Print, copy and document-handling equipment.',
    categories: [
      {
        id: 'printers',
        name: 'Printers',
        description: 'Printers for everyday documents, from occasional pages to shared office print runs.',
        image: '/assets/products/printers/printer-business-office.jpg',
      },
      {
        id: 'photocopiers',
        name: 'Photocopiers',
        description: 'Photocopy machines for higher-volume document work.',
        image: '/assets/products/photocopiers/office-photocopier.jpg',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & access control',
    description: 'Monitoring and controlled-entry equipment.',
    categories: [
      {
        id: 'cctv-systems',
        name: 'CCTV systems',
        description: 'Closed-circuit camera systems for monitoring and security.',
        image: '/assets/products/cctv-systems/cctv-security-camera.jpg',
      },
      {
        id: 'biometric-machines',
        name: 'Biometric machines',
        description: 'Biometric devices for identification and access control.',
        image: '/assets/products/biometric-machines/biometric-fingerprint-scanner.jpg',
      },
    ],
  },
  {
    id: 'power',
    title: 'Power & solar',
    description: 'Solar, inverter, battery, UPS and voltage-protection equipment.',
    categories: [
      {
        id: 'inverters',
        name: 'Inverters',
        description: 'Inverters that turn stored battery power into mains electricity for equipment that needs a normal supply.',
        image: '/assets/products/inverters/power-inverter-unit.jpg',
        metaDescription:
          'Inverters supplied by Ar-Rafiu Integrated Services Limited, turning stored battery power into mains electricity for equipment that needs a normal supply.',
      },
      {
        id: 'batteries',
        name: 'Batteries',
        description: 'Batteries that store power for use when the mains supply is unavailable.',
        image: '/assets/products/batteries/battery-power-storage.jpg',
      },
      {
        id: 'solar-panels',
        name: 'Solar panels',
        description: 'Panels that generate electricity from sunlight for on-site power.',
        image: '/assets/products/solar-panels/solar-panel-array.jpg',
        imageAlt: 'Solar panels',
      },
      {
        id: 'ups-systems',
        name: 'UPS systems',
        description:
          'Uninterruptible power supplies that keep equipment running through a mains interruption, including industrial, online and line-interactive units.',
        image: '/assets/products/ups-systems/ups-power-cabinet.jpg',
        imageAlt: 'Power backup equipment',
      },
      {
        id: 'avr-stabilizers',
        name: 'AVR stabilizers',
        description:
          'Automatic voltage regulators that steady the supply reaching connected equipment.',
        image: '/assets/products/avr-stabilizers/avr-power-protector.jpg',
        imageAlt: 'Power-protection equipment',
      },
    ],
  },
  {
    id: 'software',
    title: 'Software & applications',
    description: 'Software used in day-to-day business work.',
    categories: [
      {
        id: 'applications',
        name: 'Applications',
        description: 'Business software and applications used for everyday organisational work.',
        image: '/assets/products/applications/business-software-computer-screen.jpg',
      },
    ],
  },
];

/**
 * A single category together with the group it belongs to.
 *
 * PRD section 9.4 asks a product detail page to state the category, and the group
 * is the only category information the company has supplied. Flattening the groups
 * here means `/products/[category]` does not have to search across groups itself,
 * and keeps that traversal in the data layer rather than in a page.
 */
export interface EquipmentEntry extends EquipmentCategory {
  groupId: string;
  groupTitle: string;
  groupDescription: string;
}

export const equipmentEntries: EquipmentEntry[] = equipmentGroups.flatMap((group) =>
  group.categories.map((category) => ({
    ...category,
    groupId: group.id,
    groupTitle: group.title,
    groupDescription: group.description,
  })),
);

export function findEquipmentEntry(id: string): EquipmentEntry | undefined {
  return equipmentEntries.find((entry) => entry.id === id);
}