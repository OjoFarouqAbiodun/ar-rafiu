/**
 * Equipment catalogue, grouped by what the equipment is for rather than by
 * alphabetical order.
 *
 * The grouping is the reason the data is shaped this way: PRD section 2 lists a
 * flat set of product lines, which rendered as a grid produces an undifferentiated
 * wall of eleven items. Grouping lets the homepage present them as a handful of
 * readable domains.
 *
 * Only category-level information from PRD section 2 is recorded here. No
 * specifications, model names or stock levels are stated because the company has
 * not supplied them (PRD section 24).
 */

export interface EquipmentCategory {
  name: string;
  description: string;
  /** Optional until official product photography exists (PRD section 27.10). */
  image?: string;
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
        name: 'Servers',
        description: 'Server hardware for shared services and business workloads.',
      },
      {
        name: 'Server racks',
        description: 'Racks for housing, organising and protecting server equipment.',
      },
      {
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
        name: 'Printers',
        description: 'Printers for everyday office and shared printing requirements.',
      },
      {
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
        name: 'CCTV systems',
        description: 'Closed-circuit camera systems for monitoring and security.',
      },
      {
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
        name: 'Inverters',
        description: 'Inverters for backup power supply.',
      },
      {
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
        name: 'Applications',
        description: 'Software and application solutions for business requirements.',
      },
    ],
  },
];