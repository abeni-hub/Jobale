export interface CompanyInfo {
  name: string;
  legalName: string;
  slogan: string;
  phone: string;
  email: string;
  city: string;
  region: string;
  country: string;
  website: string | null;
  established: string | null;
}

export const company: CompanyInfo = {
  name: 'Jobale Engineering PLC',
  legalName: 'Jobale Engineering PLC',
  slogan: 'Building Excellence, Delivering Trust.',
  phone: '+251 910 256 686',
  email: 'civiljob12@gmail.com',
  city: 'Adama',
  region: 'Oromia',
  country: 'Ethiopia',
  website: 'www.jobaleengineering.com',
  established: null,
};

export interface StatItem {
  label: string;
  value: string;
  suffix: string;
  verified: boolean;
  note: string;
}

// NOTE: Figures sourced from the company profile "At a Glance" section.
// These must be verified with the client before publication.
export const stats: StatItem[] = [
  {
    label: 'Years in Business',
    value: '12',
    suffix: '+',
    verified: false,
    note: 'Verify against current company records before publication.',
  },
  {
    label: 'Projects Completed',
    value: '10',
    suffix: '+',
    verified: false,
    note: 'Verify against current project records before publication.',
  },
  {
    label: 'Team Members',
    value: '10',
    suffix: '',
    verified: false,
    note: 'Verify against current personnel records before publication.',
  },
  {
    label: 'Repeat Clients',
    value: '6',
    suffix: '+',
    verified: false,
    note: 'Verify against current client records before publication.',
  },
];

export interface CredentialItem {
  name: string;
  available: boolean;
  note?: string;
}

export interface CredentialCategory {
  category: string;
  items: CredentialItem[];
}

export interface VerificationItem {
  item: string;
  reason: string;
}

export const credentials: CredentialCategory[] = [
  {
    category: 'Commercial Registration & Trade License',
    items: [
      { name: 'Commercial Registration Certificate', available: false, note: 'Pending verification of registration number.' },
      { name: 'Valid Trade License for Construction Services', available: false, note: 'Renewed annually under Ethiopian Ministry of Trade & Regional Integration.' },
    ],
  },
  {
    category: 'Competency Certification',
    items: [
      { name: 'General Contractor Competency Certificate', available: false, note: 'Issued by Ministry of Urban Development and Infrastructure.' },
      { name: 'Civil Engineering Practice License', available: false, note: 'Professional engineer practice certifications.' },
    ],
  },
  {
    category: 'Tax & Compliance',
    items: [
      { name: 'Tax Identification Number (TIN)', available: false, note: 'Registered with Ministry of Revenues, Adama Branch.' },
      { name: 'VAT Registration Certificate', available: false, note: 'Standard value-added tax compliance in Ethiopia.' },
      { name: 'Tax Clearance Certificate', available: false, note: 'Current tax clearance for tender participation.' },
    ],
  },
  {
    category: 'Safety, Quality & Environmental Policies',
    items: [
      { name: 'Occupational Health and Safety (OHS) Policy Manual', available: false, note: 'Internal site safety protocols and compliance documentation.' },
      { name: 'Quality Management & Control Guidelines', available: false, note: 'Standardized material testing and inspection documentation.' },
    ],
  },
];

export const verificationList: VerificationItem[] = [
  {
    item: 'Contractor Grade Classification',
    reason: 'Profile specifies general construction; exact grade to be confirmed against Ministry certificate.',
  },
  {
    item: 'Year of Establishment',
    reason: 'Founded date pending documentation review with registrar.',
  },
  {
    item: 'Equipment Inventory & Yard Assets',
    reason: 'Machinery schedules to be verified prior to proposal inclusions.',
  },
];


