export interface Project {
  id: string;
  slug: string;
  name: string;
  category: 'Building Construction' | 'Civil Works' | 'Water & Sanitation' | 'Rehabilitation';
  client: string | null;
  location: string | null;
  year: number | null;
  status: 'Completed' | 'Ongoing' | 'Verified' | 'Unverified';
  image: string;
  summary: string;
  scope: string[];
  description: string;
  verified: boolean;
}

export const projects: Project[] = [
  {
    id: 'p01',
    slug: 'lemi-national-cement-ditch-slope-protection',
    name: 'Lemi National Cement — Production-Line Ditch & Slope Protection',
    category: 'Civil Works',
    client: 'Lemi National Cement',
    location: 'Lemi, Amhara Region, Ethiopia',
    year: null,
    status: 'Verified',
    image: 'https://images.pexels.com/photos/5505706/pexels-photo-5505706.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    summary:
      'Ditch construction and slope protection works on the production line at Lemi National Cement.',
    scope: [
      'Production-line ditch construction',
      'Slope protection works',
      'Drainage and erosion control',
    ],
    description:
      'This project involved the construction of a ditch and associated slope protection works along the production line at Lemi National Cement. The works were designed to manage surface water, protect adjacent slopes from erosion, and ensure safe and stable ground conditions around the production facility.',
    verified: true,
  },
  {
    id: 'p02',
    slug: 'lemi-national-cement-drainage-ditch',
    name: 'Lemi National Cement — Production-Line Drainage Ditch',
    category: 'Civil Works',
    client: 'Lemi National Cement',
    location: 'Lemi, Amhara Region, Ethiopia',
    year: null,
    status: 'Verified',
    image: 'https://images.pexels.com/photos/18468425/pexels-photo-18468425.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    summary:
      'Drainage ditch construction for the production line at Lemi National Cement.',
    scope: [
      'Drainage ditch construction',
      'Surface water management',
      'Civil works for industrial facility',
    ],
    description:
      'A dedicated drainage ditch project for the production line at Lemi National Cement, providing engineered surface water management to protect the facility and surrounding ground from water-related damage during operations.',
    verified: true,
  },
  {
    id: 'p03',
    slug: 'sekota-woldia-water-supply-sanitation',
    name: 'Sekota & Woldia — Community Water Supply & Sanitation',
    category: 'Water & Sanitation',
    client: null,
    location: 'Sekota and Woldia, Amhara Region, Ethiopia',
    year: null,
    status: 'Verified',
    image: 'https://images.pexels.com/photos/28101466/pexels-photo-28101466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    summary:
      'Community water supply and sanitation project serving the Sekota and Woldia areas.',
    scope: [
      'Community water supply system',
      'Sanitation infrastructure',
      'Water distribution network',
    ],
    description:
      'A community-focused water supply and sanitation project serving the Sekota and Woldia areas. The project aimed to improve access to clean water and sanitation facilities for local communities, contributing to public health and quality of life.',
    verified: true,
  },
  {
    id: 'p04',
    slug: 'negele-general-hospital-water-supply',
    name: 'Negele General Hospital — Water Supply Project',
    category: 'Water & Sanitation',
    client: null,
    location: 'Negele, Oromia Region, Ethiopia',
    year: null,
    status: 'Verified',
    image: 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    summary:
      'Water supply system installation for Negele General Hospital.',
    scope: [
      'Hospital water supply system',
      'Water distribution and storage',
      'Sanitary infrastructure',
    ],
    description:
      'A water supply project for Negele General Hospital, providing a reliable water distribution system to support healthcare operations and facility hygiene. The works included water supply infrastructure designed to meet the demands of a functioning hospital environment.',
    verified: true,
  },
  {
    id: 'p05',
    slug: 'shire-borera-water-supply',
    name: 'Shire Borera — Water Supply Project',
    category: 'Water & Sanitation',
    client: null,
    location: 'Shire, Tigray Region, Ethiopia',
    year: null,
    status: 'Verified',
    image: 'https://images.pexels.com/photos/16566547/pexels-photo-16566547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    summary:
      'Water supply project for the Shire Borera community.',
    scope: [
      'Community water supply',
      'Water infrastructure development',
      'Rural water access',
    ],
    description:
      'A water supply project for the Shire Borera community, designed to extend reliable access to clean water for residential and community use. The project contributed to improved public health and daily living conditions in the area.',
    verified: true,
  },
  {
    id: 'p06',
    slug: 'dangote-cement-canteen-water-line',
    name: 'Dangote Cement Factory — Canteen Building & Water-Line Works',
    category: 'Building Construction',
    client: 'Dangote Cement Factory',
    location: 'Mugher, Oromia Region, Ethiopia',
    year: null,
    status: 'Verified',
    image: 'https://images.pexels.com/photos/29590119/pexels-photo-29590119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    summary:
      'Canteen building construction and water-line works at Dangote Cement Factory.',
    scope: [
      'Canteen building construction',
      'Water-line installation',
      'Building and civil works for industrial facility',
    ],
    description:
      'This project combined building construction and water-line installation works at Dangote Cement Factory. The canteen building was constructed to serve the factory workforce, with associated water-line works providing necessary water supply infrastructure.',
    verified: true,
  },
  {
    id: 'p07',
    slug: 'asayita-town-water-supply',
    name: 'Asayita Town — Water Supply Project',
    category: 'Water & Sanitation',
    client: null,
    location: 'Asayita, Afar Region, Ethiopia',
    year: null,
    status: 'Verified',
    image: 'https://images.pexels.com/photos/18682366/pexels-photo-18682366.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    summary:
      'Water supply project for Asayita Town.',
    scope: [
      'Town water supply system',
      'Water distribution infrastructure',
      'Community water access',
    ],
    description:
      'A water supply project for Asayita Town, aimed at improving the reliability and reach of clean water access for the local population. The project involved the development of water supply infrastructure tailored to the needs of the community.',
    verified: true,
  },
  {
    id: 'p08',
    slug: 'kurba-hc-wadla-phc-rehabilitation',
    name: 'Kurba HC & Wadla PHC — Rehabilitation Works',
    category: 'Rehabilitation',
    client: null,
    location: 'Amhara Region, Ethiopia',
    year: null,
    status: 'Verified',
    image: 'https://images.pexels.com/photos/27134625/pexels-photo-27134625.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    summary:
      'Rehabilitation works at Kurba Health Centre and Wadla Primary Health Centre.',
    scope: [
      'Healthcare facility rehabilitation',
      'Building repairs and renovation',
      'Facility upgrade works',
    ],
    description:
      'Rehabilitation works at Kurba Health Centre and Wadla Primary Health Centre, involving building repairs, renovation, and facility improvements to restore and enhance the functionality of these healthcare facilities for continued community service.',
    verified: true,
  },
];

export const projectCategories = [
  'All',
  'Building Construction',
  'Civil Works',
  'Water & Sanitation',
  'Rehabilitation',
] as const;

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getRelatedProjects(project: Project, count = 3): Project[] {
  return projects
    .filter((p) => p.slug !== project.slug && p.category === project.category)
    .slice(0, count);
}
