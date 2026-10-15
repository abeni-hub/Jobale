import {
  Building2,
  HardHat,
  Ruler,
  Wrench,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ServiceItem {
  scope: string[];
}

export interface ServiceCategory {
  slug: string;
  title: string;
  shortName: string;
  icon: LucideIcon;
  summary: string;
  image: string;
  overview: string;
  scope: string[];
  applications: string[];
  approach: string;
  qualitySafety: string;
}

export const services: ServiceCategory[] = [
  {
    slug: 'building-construction',
    title: 'Building Construction',
    shortName: 'Building Construction',
    icon: Building2,
    summary:
      'General contracting for residential, commercial, institutional, industrial, and multi-storey structures — delivered with disciplined supervision and quality workmanship.',
    image: 'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'Jobale Engineering PLC undertakes general building construction projects across residential, commercial, institutional, and industrial categories. Our approach integrates experienced site supervision, skilled labour, and systematic quality control to deliver structures that meet approved drawings and specifications.',
    scope: [
      'Residential buildings',
      'Commercial buildings',
      'Institutional buildings',
      'Industrial buildings',
      'Multi-storey structures',
    ],
    applications: [
      'Private residences and apartment complexes',
      'Office and retail buildings',
      'Schools, hospitals, and government facilities',
      'Warehouses and light industrial structures',
    ],
    approach:
      'We assign qualified site engineers and foremen to every project, maintain construction schedules aligned with project milestones, and coordinate closely with clients, consultants, and subcontractors to ensure drawings and specifications are faithfully executed.',
    qualitySafety:
      'Each construction stage is inspected against approved plans. Materials are checked on delivery, and workmanship is verified before proceeding to subsequent stages. Site safety protocols, including PPE use and safety briefings, are enforced throughout.',
  },
  {
    slug: 'civil-infrastructure',
    title: 'Civil & Infrastructure Works',
    shortName: 'Civil & Infrastructure',
    icon: Ruler,
    summary:
      'Roads, drainage, water supply, earthworks, and related civil infrastructure — engineered for durability and community benefit.',
    image: 'https://images.pexels.com/photos/4390530/pexels-photo-4390530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'Our civil and infrastructure division handles road construction, drainage systems, water supply and sanitation, excavation, earthworks, and boundary walls. We deliver infrastructure that serves communities and supports industrial operations with reliable, long-lasting results.',
    scope: [
      'Roads and access roads',
      'Drainage and culverts',
      'Water supply and sanitation',
      'Excavation and earthworks',
      'Boundary walls and related works',
    ],
    applications: [
      'Access roads for industrial and community facilities',
      'Drainage systems for flood and runoff management',
      'Rural and community water supply schemes',
      'Site preparation and earthworks for new developments',
    ],
    approach:
      'Civil works are planned around site conditions, survey data, and engineering specifications. We deploy appropriate plant and equipment, maintain progress against baseline schedules, and document each stage for client review and approval.',
    qualitySafety:
      'Materials are tested for compliance with specified standards. Earthworks and concrete works are inspected at each stage. Traffic and public safety measures are implemented where works affect surrounding areas.',
  },
  {
    slug: 'finishing-fit-out',
    title: 'Finishing & Fit-Out',
    shortName: 'Finishing & Fit-Out',
    icon: Layers,
    summary:
      'Interior and exterior finishing — flooring, painting, ceilings, glazing, and joinery — executed to a high standard of detail and durability.',
    image: 'https://images.pexels.com/photos/36035072/pexels-photo-36035072.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'We provide comprehensive finishing and fit-out services that complete a building to a functional, durable, and aesthetically refined standard. From flooring to ceilings, painting to glazing, our finishing teams work to approved finishes schedules and quality benchmarks.',
    scope: [
      'Flooring and tiling',
      'Painting and plastering',
      'Ceilings and interior finishes',
      'Aluminium and glazing',
      'Joinery and partitions',
    ],
    applications: [
      'Office and commercial interior fit-outs',
      'Residential finishing packages',
      'Institutional facility interiors',
      'Renovation and refurbishment finishing',
    ],
    approach:
      'Finishing works are sequenced after structural completion and coordinated across trades to avoid conflicts. Samples and mock-ups are reviewed with the client where appropriate, and final finishes are inspected against the approved schedule.',
    qualitySafety:
      'Surface preparation is verified before application. Paint, tile, and finish materials are checked for consistency and conformity. Dust and fume control measures protect workers and occupants during finishing operations.',
  },
  {
    slug: 'building-services-mep',
    title: 'Building Services (MEP)',
    shortName: 'Building Services (MEP)',
    icon: Wrench,
    summary:
      'Mechanical, electrical, and plumbing installations — including water, drainage, electrical, and sanitary systems — integrated into the building package.',
    image: 'https://images.pexels.com/photos/34938439/pexels-photo-34938439.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'Our building services division covers electrical installations, plumbing, water and drainage systems, and sanitary fixtures. We coordinate MEP installations with structural and finishing works to ensure properly integrated, functional building systems.',
    scope: [
      'Electrical installations',
      'Plumbing',
      'Water and drainage installations',
      'Sanitary fixtures and fittings',
    ],
    applications: [
      'Electrical wiring and distribution for new buildings',
      'Plumbing and sanitary installation packages',
      'Water supply and drainage system installation',
      'MEP works for renovation and upgrade projects',
    ],
    approach:
      'MEP works are planned in coordination with structural and finishing schedules. Installations follow approved drawings and applicable standards, with testing and commissioning carried out before handover.',
    qualitySafety:
      'Electrical installations are tested for safety and functionality. Plumbing and drainage systems are pressure-tested and inspected. All MEP works are documented and handed over with as-built information.',
  },
  {
    slug: 'renovation-maintenance',
    title: 'Renovation & Maintenance',
    shortName: 'Renovation & Maintenance',
    icon: HardHat,
    summary:
      'Rehabilitation, repairs, periodic maintenance, and project supervision — extending the service life and performance of existing buildings.',
    image: 'https://images.pexels.com/photos/27134625/pexels-photo-27134625.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'We provide renovation, rehabilitation, and maintenance services for existing buildings and facilities. Our team also offers project supervision and management, and design support and consultancy for clients who need engineering guidance alongside construction services.',
    scope: [
      'Rehabilitation',
      'Building repairs',
      'Periodic maintenance',
      'Project supervision and management',
      'Design support, consultancy, and related services',
    ],
    applications: [
      'Building rehabilitation and upgrade projects',
      'Healthcare facility renovation and refurbishment',
      'Periodic maintenance for institutional and commercial buildings',
      'Project supervision on behalf of owners and developers',
    ],
    approach:
      'Renovation projects begin with a condition assessment and scope definition. Works are planned to minimise disruption where facilities remain operational. Maintenance programmes are scheduled and documented for accountability.',
    qualitySafety:
      'Existing structural and service conditions are assessed before commencing works. Renovation works are inspected against the approved scope. Safety measures address the specific risks of working in and around occupied or partially occupied buildings.',
  },
];

export function getServiceBySlug(slug: string): ServiceCategory | undefined {
  return services.find((s) => s.slug === slug);
}
