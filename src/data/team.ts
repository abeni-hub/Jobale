export interface TeamMember {
  name: string;
  role: string;
  qualifications: string | null;
  image: string | null;
  published: boolean;
  note?: string;
}

export const teamMembers: TeamMember[] = [
  {
    name: 'Eyob Hibret',
    role: 'General Manager',
    qualifications: null,
    image: null,
    published: true,
    note: 'Management message subject to approval before publication.',
  },
  {
    name: 'Kumelachew Dessalegn',
    role: 'Project Management',
    qualifications: null,
    image: null,
    published: true,
    note: 'Role and title subject to confirmation.',
  },
  {
    name: 'Zelalem Tsegaye',
    role: 'Project Management',
    qualifications: null,
    image: null,
    published: true,
    note: 'Role and title subject to confirmation.',
  },
  {
    name: 'Dawi Tamirat',
    role: 'Site Engineer',
    qualifications: null,
    image: null,
    published: true,
  },
  {
    name: 'Melat Kifle',
    role: 'Finance Head',
    qualifications: null,
    image: null,
    published: true,
  },
  {
    name: 'Begashawu Kifle',
    role: 'Foreman',
    qualifications: null,
    image: null,
    published: true,
  },
  {
    name: 'Eyerusalem Wendimteka',
    role: 'Accountant',
    qualifications: null,
    image: null,
    published: true,
  },
];

export const publishedTeamMembers = teamMembers.filter((m) => m.published);
