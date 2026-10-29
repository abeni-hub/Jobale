import {
  Building2,
  HardHat,
  Ruler,
  Wrench,
  Layers,
  ShieldCheck,
  Droplets,
  Hammer,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
  targetKeywords: string[];
  seoTitle?: string;
  seoDescription?: string;
  verifiedProjectsNote?: string;
  verificationNote?: string;
}

export const services: ServiceCategory[] = [
  {
    slug: 'building-construction',
    title: 'Construction Services & Building Works',
    shortName: 'Construction Services',
    icon: Building2,
    summary:
      'General contracting for commercial, industrial, institutional, and residential structures — delivered with engineering discipline, code compliance, and quality workmanship.',
    image: 'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'Jobale Engineering PLC delivers complete building construction services throughout Ethiopia. From industrial facilities and multi-storey commercial developments to institutional structures and residential complexes, our engineering team manages foundation excavation, reinforced concrete works, structural masonry, building envelopes, and full structural delivery. We combine experienced site supervision, qualified foremen, and disciplined adherence to the Ethiopian Building Code Standard (EBCS) to construct durable, high-performance buildings.',
    scope: [
      'Commercial and multi-storey office buildings',
      'Industrial buildings, factory units, and facilities',
      'Institutional buildings (educational and healthcare facilities)',
      'Substructure works, deep foundations, and reinforced concrete framing',
      'Residential apartment complexes and private developments',
      'Structural masonry, envelope construction, and structural roofing',
    ],
    applications: [
      'Commercial and retail business complexes',
      'Industrial manufacturing plants and warehouse developments',
      'Public institutions, schools, hospitals, and administrative centers',
      'Multi-storey residential buildings and estates',
    ],
    approach:
      'We assign qualified site engineers and foremen to every building project. Construction schedules are synchronized with client milestones, material take-offs, and procurement pipelines. Quality verification runs continuously across structural pours, bar reinforcement placement, and envelope testing.',
    qualitySafety:
      'Each construction stage undergoes rigorous inspections before sign-off. Concrete compressive strength testing, rebar verification, and formwork stability checks are standard practice. Site safety follows structured Occupational Health and Safety (OHS) procedures including mandatory PPE and safety briefings.',
    targetKeywords: [
      'construction',
      'construction company',
      'construction services',
      'building construction Ethiopia',
      'Jobale Engineering construction company',
      'Jobale Engineering construction services',
    ],
    seoTitle: 'Construction Services & Building Contractor | Jobale Engineering PLC',
    seoDescription:
      'Professional building construction services from Jobale Engineering PLC. General contracting for commercial, industrial, institutional, and multi-storey structures in Ethiopia.',
    verifiedProjectsNote:
      'Verified project execution includes the Canteen Building and industrial utility works at Dangote Cement Factory (Mugher, Oromia).',
  },
  {
    slug: 'civil-engineering',
    title: 'Civil Engineering Services & Civil Works',
    shortName: 'Civil Engineering',
    icon: Ruler,
    summary:
      'Engineered civil infrastructure including site development, earthworks, drainage systems, access roads, and industrial slope protection — designed for durability and performance.',
    image: 'https://images.pexels.com/photos/4390530/pexels-photo-4390530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'Our civil engineering division provides comprehensive infrastructure development and heavy civil works across Ethiopia. Jobale Engineering PLC specializes in bulk earthmoving, site leveling, engineered access roads, reinforced concrete drainage ditches, culverts, retaining walls, and industrial slope stabilization. We deliver resilient infrastructure engineered to handle demanding environmental conditions and heavy industrial operational requirements.',
    scope: [
      'Industrial production-line ditches and drainage channels',
      'Slope protection, retaining structures, and erosion control',
      'Access roads, paving, and heavy-duty traffic routes',
      'Bulk site excavation, grading, and earthworks',
      'Box culverts, storm drains, and runoff management',
      'Perimeter security boundary walls and civil foundations',
    ],
    applications: [
      'Industrial plant infrastructure and cement factory sites',
      'Municipal and regional drainage management projects',
      'Access roadways connecting industrial and community assets',
      'Topographical site preparation for industrial and commercial development',
    ],
    approach:
      'Civil works begin with precise topographical surveys and soil mechanics evaluation. Works are executed using heavy construction plant, monitored against geometric design standards, and sequenced to ensure optimal drainage flow, compaction densities, and structural stability.',
    qualitySafety:
      'Compaction testing, soil stability analysis, concrete cube compressive testing, and line-and-grade laser checks are enforced at every construction phase. Traffic management and public safety buffers are maintained on active works.',
    targetKeywords: [
      'civil engineering',
      'civil engineering services',
      'civil works contractor',
      'drainage ditch construction',
      'slope protection works',
      'Jobale Engineering civil works',
    ],
    seoTitle: 'Civil Engineering Services & Infrastructure | Jobale Engineering PLC',
    seoDescription:
      'Specialized civil engineering services from Jobale Engineering PLC: access roads, industrial ditches, drainage, earthworks, and slope protection in Ethiopia.',
    verifiedProjectsNote:
      'Verified execution includes the Production-Line Ditch & Slope Protection works and Drainage Ditch projects at Lemi National Cement (Amhara Region).',
  },
  {
    slug: 'steel-structures',
    title: 'Steel Structure Engineering & Construction',
    shortName: 'Steel Structures',
    icon: Hammer,
    summary:
      'Structural steel design, fabrication coordination, and on-site erection for industrial warehouses, factory sheds, commercial canopies, and heavy structural frameworks.',
    image: 'https://images.pexels.com/photos/1311159/pexels-photo-1311159.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'Jobale Engineering PLC provides structural steel engineering and construction solutions tailored for industrial, logistics, and commercial applications. From wide-span industrial warehouses and factory production sheds to structural steel mezzanines and heavy roofing frameworks, we coordinate precision fabrication and safe, crane-assisted site erection. Structural steel delivers unmatched spanning capability, seismic resilience, and rapid construction timelines.',
    scope: [
      'Industrial warehouse frameworks and logistics sheds',
      'Structural steel trusses, purlins, and roofing systems',
      'Factory production sheds and equipment support platforms',
      'Steel mezzanine floors and multi-storey framing',
      'Canopies, crane runway beams, and heavy anchor systems',
      'Protective anti-corrosion coating and fireproofing coordination',
    ],
    applications: [
      'Manufacturing facilities and assembly plant buildings',
      'Agricultural and commercial storage warehouses',
      'Industrial workshops and heavy equipment service bays',
      'Commercial canopies, shopping halls, and transit structures',
    ],
    approach:
      'Steel structure works are planned through coordinated structural shop drawings, anchor bolt layout verification, and sequenced crane lifting logistics. On-site assembly is carried out by experienced riggers and certified welders following approved connection details.',
    qualitySafety:
      'Alignment, vertical plumb, and bolt torque are verified with calibrated instruments before final tightening and bracing. Weld visual inspection and non-destructive testing are coordinated where specified. Rigorous crane lift safety plans and fall protection systems are strictly enforced.',
    targetKeywords: [
      'steel structure',
      'steel structure construction',
      'steel structure engineering',
      'structural steel fabrication',
      'warehouse construction Ethiopia',
      'industrial steel buildings',
    ],
    seoTitle: 'Steel Structure Engineering & Construction | Jobale Engineering PLC',
    seoDescription:
      'Structural steel engineering, industrial steel frameworks, warehouses, and structural erection by Jobale Engineering PLC across Ethiopia.',
    verificationNote:
      'Fabrication tonnage capacity and specific plant weld certifications to be confirmed against client tender requirements.',
  },
  {
    slug: 'general-contracting',
    title: 'General Contracting Services',
    shortName: 'General Contractor',
    icon: HardHat,
    summary:
      'Turnkey general contracting, procurement, project management, and site supervision — ensuring seamless construction delivery from groundbreaking to client handover.',
    image: 'https://images.pexels.com/photos/8961028/pexels-photo-8961028.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'As a licensed General Contractor, Jobale Engineering PLC manages the complete construction life cycle for private developers, corporate enterprises, public institutions, and international organizations. We take full single-point responsibility for site mobilization, regulatory compliance, subcontractor coordination, material procurement, quality assurance, schedule adherence, and budget control. Our client-focused general contracting model minimizes risk and guarantees accountability.',
    scope: [
      'Single-point turnkey project management and site execution',
      'Subcontractor procurement, scheduling, and multi-trade coordination',
      'Construction cost estimation, value engineering, and budget control',
      'Site mobilization, plant setup, and utility connections',
      'Permit compliance, statutory inspections, and documentation',
      'Final testing, commissioning, defects rectification, and handover',
    ],
    applications: [
      'Turnkey commercial, institutional, and industrial building projects',
      'Comprehensive industrial plant expansion and ancillary works',
      'Multi-disciplinary infrastructure developments requiring multi-trade coordination',
      'Design-and-build and traditional general contracting contracts',
    ],
    approach:
      'Our general contracting approach uses milestone-based Critical Path Method (CPM) scheduling, transparent weekly progress reporting, and rigorous site supervision. A dedicated project manager serves as the direct client point of contact, ensuring complete alignment on deliverables, timelines, and costs.',
    qualitySafety:
      'Integrated Project Quality Plans (PQP) and Site Safety Management Plans are established at project kickoff. Regular safety briefings, daily hazard assessments, and independent quality audits safeguard worksite integrity.',
    targetKeywords: [
      'general contractor',
      'general contractor services',
      'general construction contractor Ethiopia',
      'turnkey building contractor',
      'Jobale Construction',
      'Jobale Engineering PLC',
    ],
    seoTitle: 'General Contractor Services | Jobale Engineering PLC',
    seoDescription:
      'Licensed general contractor services from Jobale Engineering PLC. Full-cycle project management, site mobilization, and turnkey construction delivery in Ethiopia.',
    verificationNote:
      'Contractor competency grade classification to be confirmed against Ministry of Urban Development and Infrastructure certificate.',
  },
  {
    slug: 'water-works',
    title: 'Water Works & Infrastructure Construction',
    shortName: 'Water Works',
    icon: Droplets,
    summary:
      'Community water supply schemes, transmission pipelines, distribution networks, hospital water supply systems, reservoirs, and sanitation infrastructure across Ethiopia.',
    image: 'https://images.pexels.com/photos/28101466/pexels-photo-28101466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'Jobale Engineering PLC possesses extensive verified experience delivering critical water supply and sanitation infrastructure across diverse Ethiopian regions. Our water works portfolio spans rural and urban community water supply schemes, hospital-grade distribution and storage systems, water intake structures, pump houses, pressure mains, and sanitation facilities. We work with public water bureaus, NGOs, and healthcare facilities to deliver safe, reliable, and sustainable water access.',
    scope: [
      'Community and town water supply distribution networks',
      'Hospital water supply, storage reservoirs, and sanitation systems',
      'Water transmission pipelines and pressure main installation',
      'Intake structures, valve chambers, and pump house construction',
      'Water storage tanks, masonry reservoirs, and elevated towers',
      'Sanitary drainage, wastewater systems, and community wash facilities',
    ],
    applications: [
      'Town and rural community water supply development',
      'Healthcare facility and hospital water reliability infrastructure',
      'Industrial facility water-line connections and utility piping',
      'Regional water bureau and NGO-funded sanitation programs',
    ],
    approach:
      'Water infrastructure projects are planned around hydraulic specifications, topographic elevation profiles, and community demand. Pipe laying, trench bedding, jointing, thrust blocks, and pressure testing follow rigorous engineering protocols to ensure zero-leakage durability.',
    qualitySafety:
      'Hydrostatic pressure testing is conducted on all pipeline sections before trench backfilling. Water quality testing, disinfection procedures, and concrete water-retaining structure leak tests are systematically performed before commissioning.',
    targetKeywords: [
      'water works',
      'water works construction',
      'water infrastructure projects',
      'community water supply Ethiopia',
      'hospital water supply system',
      'water distribution network',
      'Jobale Engineering water works',
    ],
    seoTitle: 'Water Works & Infrastructure Construction | Jobale Engineering PLC',
    seoDescription:
      'Water works and infrastructure development by Jobale Engineering PLC. Community water supply, hospital distribution networks, and sanitation facilities in Ethiopia.',
    verifiedProjectsNote:
      'Verified project execution includes: Sekota & Woldia Community Water Supply & Sanitation (Amhara Region), Negele General Hospital Water Supply Project (Oromia Region), Shire Borera Water Supply Project (Tigray Region), Asayita Town Water Supply Project (Afar Region), and Dangote Cement Factory Water-Line Works (Mugher, Oromia).',
  },
  {
    slug: 'finishing-fit-out',
    title: 'Finishing & Fit-Out Services',
    shortName: 'Finishing & Fit-Out',
    icon: Layers,
    summary:
      'Interior and exterior finishing — flooring, painting, ceilings, glazing, and joinery — executed to a high standard of architectural detail and durability.',
    image: 'https://images.pexels.com/photos/36035072/pexels-photo-36035072.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'We provide comprehensive finishing and fit-out services that complete a building to a functional, durable, and aesthetically refined standard. From flooring and plastering to suspended ceilings, painting, aluminium partitions, and architectural glazing, our finishing teams work to approved finishes schedules and high craftsmanship benchmarks.',
    scope: [
      'Flooring and porcelain/ceramic tiling',
      'Internal and external plastering and painting',
      'Acoustic and decorative suspended ceilings',
      'Aluminium framing, curtain walls, and architectural glazing',
      'Custom joinery, cabinetry, and interior partitions',
    ],
    applications: [
      'Office and commercial interior fit-outs',
      'Residential finishing packages for villas and apartments',
      'Institutional and healthcare facility interiors',
      'Commercial renovation and retail refurbishment finishing',
    ],
    approach:
      'Finishing works are sequenced after structural completion and coordinated across trades to avoid conflicts. Samples and mock-ups are reviewed with the client where appropriate, and final finishes are inspected against approved schedules.',
    qualitySafety:
      'Surface preparation is verified before application. Paint, tile, and finish materials are checked for batch consistency and conformity. Dust and fume control measures protect workers and occupants during operations.',
    targetKeywords: [
      'finishing and fit-out',
      'interior fit-out contractor',
      'commercial finishing Ethiopia',
      'architectural glazing Adama',
    ],
    seoTitle: 'Finishing & Fit-Out Services | Jobale Engineering PLC',
    seoDescription:
      'High-quality interior and exterior architectural finishing, tiling, painting, ceilings, glazing, and joinery by Jobale Engineering PLC.',
  },
  {
    slug: 'building-services-mep',
    title: 'Building Services (MEP)',
    shortName: 'Building Services (MEP)',
    icon: Wrench,
    summary:
      'Mechanical, electrical, and plumbing installations — including water supply, power distribution, drainage, and sanitary systems — integrated into the building package.',
    image: 'https://images.pexels.com/photos/34938439/pexels-photo-34938439.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'Our building services division covers electrical installations, plumbing, water and drainage systems, and sanitary fixtures. We coordinate MEP installations with structural and finishing works to ensure properly integrated, functional building systems that operate safely and efficiently.',
    scope: [
      'Electrical distribution, lighting, and power installations',
      'Plumbing networks and cold/hot water distribution',
      'Sanitary drainage, soil waste, and vent systems',
      'Sanitary fixtures, fittings, and booster pumps',
      'Fire suppression piping and safety infrastructure',
    ],
    applications: [
      'Electrical wiring and distribution for commercial and residential buildings',
      'Plumbing and sanitary installation packages for hospitals and institutions',
      'Water supply and drainage system installation for industrial facilities',
      'MEP works for facility modernization and upgrade projects',
    ],
    approach:
      'MEP works are planned in coordination with structural and finishing schedules. Installations follow approved drawings and applicable electrical and plumbing standards, with pressure testing and commissioning carried out before handover.',
    qualitySafety:
      'Electrical installations undergo continuity, resistance, and load testing. Plumbing and drainage systems are hydrostatic pressure-tested and inspected. All MEP works are documented and handed over with as-built diagrams.',
    targetKeywords: [
      'MEP contractor',
      'building services MEP Ethiopia',
      'electrical installation contractor',
      'plumbing contractor Adama',
    ],
    seoTitle: 'Building Services (MEP) | Jobale Engineering PLC',
    seoDescription:
      'Mechanical, electrical, plumbing, drainage, and sanitary system installations integrated by Jobale Engineering PLC in Ethiopia.',
  },
  {
    slug: 'renovation-maintenance',
    title: 'Renovation & Maintenance Services',
    shortName: 'Renovation & Maintenance',
    icon: ShieldCheck,
    summary:
      'Rehabilitation, repairs, periodic maintenance, and project supervision — extending the service life, safety, and performance of existing buildings.',
    image: 'https://images.pexels.com/photos/27134625/pexels-photo-27134625.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    overview:
      'Jobale Engineering PLC provides comprehensive renovation, rehabilitation, and preventive maintenance services for public facilities, commercial properties, and residential buildings. We specialize in structural rehabilitation, healthcare facility upgrades, defect rectification, waterproofing, and ongoing facility management.',
    scope: [
      'Structural rehabilitation and strengthening',
      'Healthcare and public facility refurbishment',
      'Building envelope repairs, re-roofing, and waterproofing',
      'Periodic maintenance contracts for commercial facilities',
      'Project supervision, condition audits, and engineering consultancy',
    ],
    applications: [
      'Healthcare facility rehabilitation and modernization',
      'Institutional and educational building upgrades',
      'Commercial property refurbishment and re-purposing',
      'Long-term preventive maintenance for industrial assets',
    ],
    approach:
      'Renovation projects begin with a comprehensive condition survey and structural assessment. Works are scheduled to minimize disruption when facilities remain active, implementing dust barriers and temporary access pathways.',
    qualitySafety:
      'Existing structural stability is verified before undertaking demolition or modifications. Strict infection-control and cleanliness protocols are maintained during healthcare facility renovations.',
    targetKeywords: [
      'building renovation Ethiopia',
      'facility rehabilitation contractor',
      'hospital renovation works',
      'building maintenance Adama',
    ],
    seoTitle: 'Renovation & Maintenance Services | Jobale Engineering PLC',
    seoDescription:
      'Building rehabilitation, healthcare facility renovation, structural repairs, and periodic maintenance by Jobale Engineering PLC.',
    verifiedProjectsNote:
      'Verified project execution includes Rehabilitation Works at Kurba Health Centre and Wadla Primary Health Centre (Amhara Region).',
  },
];

const slugAliases: Record<string, string> = {
  'civil-infrastructure': 'civil-engineering',
  'construction-services': 'building-construction',
  'steel-structure-engineering': 'steel-structures',
  'steel-structure-construction': 'steel-structures',
  'water-infrastructure': 'water-works',
  'water-sanitation': 'water-works',
};

export function getServiceBySlug(slug: string): ServiceCategory | undefined {
  if (!slug) return undefined;
  const directMatch = services.find((s) => s.slug === slug);
  if (directMatch) return directMatch;
  const aliasedSlug = slugAliases[slug];
  if (aliasedSlug) {
    return services.find((s) => s.slug === aliasedSlug);
  }
  return undefined;
}
