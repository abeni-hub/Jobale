import { useEffect } from 'react';

export interface BreadcrumbEntry {
  name: string;
  item: string;
}

export interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'business.business';
  noindex?: boolean;
  breadcrumbs?: BreadcrumbEntry[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_DOMAIN = 'https://www.jobaleengineering.com';
const DEFAULT_OG_IMAGE =
  'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630';

export default function SEO({
  title,
  description,
  canonical,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
  breadcrumbs,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    // 1. Update document title
    document.title = title;

    // Helper: upsert <meta> tag
    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper: upsert <link> tag
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // 2. Canonical URL resolution
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const resolvedCanonical = canonical
      ? (canonical.startsWith('http') ? canonical : `${DEFAULT_DOMAIN}${canonical}`)
      : `${DEFAULT_DOMAIN}${currentPath === '/' ? '' : currentPath}`;

    setLink('canonical', resolvedCanonical);

    // 3. Meta description
    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, 'property');
      setMeta('twitter:description', description);
    }

    // 4. Meta keywords
    if (keywords) {
      setMeta('keywords', keywords);
    }

    // 5. Robots directive
    const robotsDirective = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    setMeta('robots', robotsDirective);

    // 6. Open Graph & Twitter Titles
    setMeta('og:title', title, 'property');
    setMeta('twitter:title', title);
    setMeta('og:type', ogType, 'property');
    setMeta('og:url', resolvedCanonical, 'property');
    setMeta('og:site_name', 'Jobale Engineering PLC', 'property');
    setMeta('og:locale', 'en_US', 'property');

    // 7. Imagery
    if (ogImage) {
      setMeta('og:image', ogImage, 'property');
      setMeta('twitter:image', ogImage);
    }
    setMeta('twitter:card', 'summary_large_image');

    // 8. Structured Data (JSON-LD)
    const scriptId = 'jobale-structured-data';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;

    const schemasToInject: any[] = [];

    // Optional breadcrumb list schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemasToInject.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: crumb.item.startsWith('http') ? crumb.item : `${DEFAULT_DOMAIN}${crumb.item}`,
        })),
      });
    }

    // Page-specific structured data
    if (structuredData) {
      if (Array.isArray(structuredData)) {
        schemasToInject.push(...structuredData);
      } else {
        schemasToInject.push(structuredData);
      }
    }

    if (schemasToInject.length > 0) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(
        schemasToInject.length === 1 ? schemasToInject[0] : schemasToInject
      );
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, canonical, keywords, ogImage, ogType, noindex, breadcrumbs, structuredData]);

  return null;
}
