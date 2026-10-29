/**
 * Structured Data (JSON-LD) Schemas and SEO Helpers for Jobale Engineering PLC
 *
 * Implements Schema.org standard markup for:
 * - GeneralContractor / ConstructionBusiness / Organization
 * - WebSite
 * - Service
 * - BreadcrumbList
 * - ConstructionProject / ItemPage
 */

export const BASE_PRODUCTION_URL = 'https://www.jobaleengineering.com';

export const COMPANY_IDENTITY = {
  name: 'Jobale Engineering PLC',
  alternateNames: [
    'Jobale Engineering',
    'Jobale Construction',
    'Jobale Engineering PLC Construction',
    'Jobale Engineering construction company',
  ],
  legalName: 'Jobale Engineering PLC',
  slogan: 'Building Excellence, Delivering Trust.',
  telephone: '+251 910 256 686',
  email: 'civiljob12@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Main Business District',
    addressLocality: 'Adama',
    addressRegion: 'Oromia',
    addressCountry: 'ET',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 8.54,
    longitude: 39.27,
  },
  url: BASE_PRODUCTION_URL,
  logo: `${BASE_PRODUCTION_URL}/Jobale_Engineering_PLC_logo-04.png`,
  image: 'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630',
  priceRange: '$$$',
  knowsAbout: [
    'Construction',
    'Construction services',
    'Civil engineering',
    'Civil engineering services',
    'Steel structure',
    'Steel structure construction',
    'Steel structure engineering',
    'General contractor',
    'General contractor services',
    'Water works',
    'Water works construction',
    'Water infrastructure projects',
    'Building construction',
    'Drainage and slope protection',
    'Healthcare facility rehabilitation',
  ],
  areaServed: [
    {
      '@type': 'Country',
      name: 'Ethiopia',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Oromia Region',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Amhara Region',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Tigray Region',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Afar Region',
    },
  ],
};

/**
 * Returns JSON-LD Organization & GeneralContractor schema
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['GeneralContractor', 'Organization'],
    '@id': `${BASE_PRODUCTION_URL}/#organization`,
    name: COMPANY_IDENTITY.name,
    alternateName: COMPANY_IDENTITY.alternateNames,
    legalName: COMPANY_IDENTITY.legalName,
    url: BASE_PRODUCTION_URL,
    logo: {
      '@type': 'ImageObject',
      url: COMPANY_IDENTITY.logo,
      caption: 'Jobale Engineering PLC Logo',
    },
    image: COMPANY_IDENTITY.image,
    telephone: COMPANY_IDENTITY.telephone,
    email: COMPANY_IDENTITY.email,
    slogan: COMPANY_IDENTITY.slogan,
    address: COMPANY_IDENTITY.address,
    geo: COMPANY_IDENTITY.geo,
    priceRange: COMPANY_IDENTITY.priceRange,
    areaServed: COMPANY_IDENTITY.areaServed,
    knowsAbout: COMPANY_IDENTITY.knowsAbout,
  };
}

/**
 * Returns JSON-LD WebSite schema
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_PRODUCTION_URL}/#website`,
    url: BASE_PRODUCTION_URL,
    name: 'Jobale Engineering PLC',
    alternateName: ['Jobale Engineering', 'Jobale Construction'],
    description:
      'Official website of Jobale Engineering PLC — construction, civil engineering, steel structure, general contractor, and water works services in Ethiopia.',
    publisher: {
      '@id': `${BASE_PRODUCTION_URL}/#organization`,
    },
    inLanguage: 'en-US',
  };
}

/**
 * Returns JSON-LD Service schema
 */
export function getServiceSchema(service: {
  title: string;
  slug: string;
  summary: string;
  image?: string;
  scope?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${BASE_PRODUCTION_URL}/services/${service.slug}/#service`,
    name: service.title,
    serviceType: service.title,
    description: service.summary,
    url: `${BASE_PRODUCTION_URL}/services/${service.slug}`,
    image: service.image || COMPANY_IDENTITY.image,
    provider: {
      '@id': `${BASE_PRODUCTION_URL}/#organization`,
      '@type': 'GeneralContractor',
      name: COMPANY_IDENTITY.name,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Ethiopia',
    },
    hasOfferCatalog: service.scope && service.scope.length > 0
      ? {
          '@type': 'OfferCatalog',
          name: `${service.title} Scope of Work`,
          itemListElement: service.scope.map((item, index) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: item,
            },
            position: index + 1,
          })),
        }
      : undefined,
  };
}

/**
 * Returns JSON-LD Project / ItemPage schema
 */
export function getProjectSchema(project: {
  name: string;
  slug: string;
  summary: string;
  category: string;
  location?: string | null;
  client?: string | null;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    '@id': `${BASE_PRODUCTION_URL}/projects/${project.slug}/#webpage`,
    url: `${BASE_PRODUCTION_URL}/projects/${project.slug}`,
    name: project.name,
    description: project.summary,
    mainEntity: {
      '@type': 'CreativeWork',
      name: project.name,
      creator: {
        '@id': `${BASE_PRODUCTION_URL}/#organization`,
        '@type': 'GeneralContractor',
        name: COMPANY_IDENTITY.name,
      },
      genre: project.category,
      locationCreated: project.location
        ? {
            '@type': 'Place',
            name: project.location,
          }
        : undefined,
      description: project.summary,
      image: project.image,
    },
  };
}

