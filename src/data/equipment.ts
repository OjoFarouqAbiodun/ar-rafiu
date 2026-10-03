/**
 * Equipment catalogue, grouped by what the equipment is for rather than by
 * alphabetical order.
 *
 * The grouping is the reason the data is shaped this way: PRD section 2 lists a
 * flat set of product lines, which rendered as a grid produces an undifferentiated
 * wall of ten items. Grouping lets the homepage present them as a handful of
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
  /** Optional. Only factual, company-supplied feature statements. */
  features?: readonly string[];
  /** Optional. Only factual, company-supplied use cases. */
  useCases?: readonly string[];
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
    title: 'Compute & infrastructure',
    description: 'The hardware that business operations actually run on.',
    categories: [
      {
        id: 'servers',
        name: 'Servers',
        description: 'Server hardware for shared services and business workloads.',
      },
      {
        id: 'server-racks',
        name: 'Server racks',
        description: 'Racks for housing, organising and protecting server equipment.',
      },
      {
        id: 'computers',
        name: 'Computers',
        description: 'Desktop and workstation computers for staff use.',
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
        description: 'Printers for everyday office and shared printing requirements.',
      },
      {
        id: 'photocopiers',
        name: 'Photocopiers',
        description: 'Photocopy machines for higher-volume document work.',
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
      },
      {
        id: 'biometric-machines',
        name: 'Biometric machines',
        description: 'Biometric devices for identification and access control.',
      },
    ],
  },
  {
    id: 'power',
    title: 'Power continuity',
    description: 'Backup power equipment for when the mains supply is unavailable.',
    categories: [
      {
        id: 'inverters',
        name: 'Inverters',
        description: 'Inverters for backup power supply.',
      },
      {
        id: 'batteries',
        name: 'Batteries',
        description: 'Batteries for backup power systems.',
      },
    ],
  },
  {
    id: 'software',
    title: 'Software & applications',
    description: 'Application and software solutions.',
    categories: [
      {
        id: 'applications',
        name: 'Applications',
        description: 'Software and application solutions for business requirements.',
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