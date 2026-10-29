import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Building,
  Info,
  CheckCircle,
} from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { getServiceBySlug, services } from '@/data/services';
import { projects as defaultProjects } from '@/data/projects';
import { useCms } from '@/context/CmsContext';
import { resolveLucideIcon } from '@/lib/icons';
import { mediaUrl } from '@/lib/api';
import { getServiceSchema } from '@/lib/seoData';
import NotFound from './NotFound';

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, companyName } = useCms();

  // Find from dynamic CMS services or static services
  const cmsService = data?.services?.find((s) => s.slug === slug);
  const staticService = slug ? getServiceBySlug(slug) : undefined;

  if (!cmsService && !staticService) return <NotFound />;

  const rawImage = cmsService?.image || staticService?.image;
  const service = {
    slug: cmsService?.slug || staticService?.slug || '',
    title: cmsService?.title || staticService?.title || '',
    shortName: cmsService?.short_name || staticService?.shortName || staticService?.title || '',
    summary: cmsService?.summary || staticService?.summary || '',
    overview: cmsService?.overview || staticService?.overview || '',
    scope: cmsService?.scope || staticService?.scope || [],
    applications: cmsService?.applications || staticService?.applications || [],
    approach: cmsService?.approach || staticService?.approach || '',
    qualitySafety: cmsService?.quality_safety || staticService?.qualitySafety || '',
    targetKeywords: staticService?.targetKeywords || [
      'construction services',
      'civil engineering',
      'general contractor',
      'Ethiopia contractor',
    ],
    seoTitle: staticService?.seoTitle,
    seoDescription: staticService?.seoDescription,
    verifiedProjectsNote: staticService?.verifiedProjectsNote,
    verificationNote: staticService?.verificationNote,
    image: mediaUrl(rawImage) || 'https://images.pexels.com/photos/4390530/pexels-photo-4390530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    icon: resolveLucideIcon(cmsService?.icon, staticService?.icon || Building),
  };

  const Icon = service.icon;

  const allProjects = (data?.projects && data.projects.length > 0)
    ? data.projects.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category_name || p.resolved_category || 'Building Construction',
        image: mediaUrl(p.image) || 'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
      }))
    : defaultProjects.map((p) => ({
        ...p,
        image: mediaUrl(p.image),
      }));

  const relatedProjects = allProjects
    .filter((p) => {
      if (service.slug === 'water-works') return p.category === 'Water & Sanitation';
      if (service.slug === 'civil-engineering' || service.slug === 'civil-infrastructure') {
        return p.category === 'Civil Works';
      }
      if (service.slug === 'building-construction') {
        return p.category === 'Building Construction';
      }
      if (service.slug === 'general-contracting') {
        return p.category === 'Building Construction' || p.category === 'Civil Works';
      }
      if (service.slug === 'steel-structures') {
        return p.slug.includes('cement') || p.category === 'Building Construction';
      }
      if (service.slug === 'renovation-maintenance') {
        return p.category === 'Rehabilitation';
      }
      return p.category === 'Building Construction';
    })
    .slice(0, 3);

  const otherServices = (data?.services && data.services.length > 0)
    ? data.services
        .filter((s) => s.slug !== service.slug)
        .slice(0, 5)
        .map((s) => ({
          slug: s.slug,
          shortName: s.short_name || s.title,
          icon: resolveLucideIcon(s.icon, Building),
        }))
    : services
        .filter((s) => s.slug !== service.slug)
        .slice(0, 5);

  const serviceSchema = getServiceSchema({
    title: service.title,
    slug: service.slug,
    summary: service.summary,
    image: service.image,
    scope: service.scope,
  });

  const pageTitle = service.seoTitle || `${service.title} | ${companyName}`;
  const pageDescription = service.seoDescription || service.summary;
  const canonicalUrl = `/services/${service.slug}`;

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={canonicalUrl}
        keywords={service.targetKeywords.join(', ')}
        ogImage={service.image}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Services', item: '/services' },
          { name: service.shortName, item: canonicalUrl },
        ]}
        structuredData={serviceSchema}
      />

      <PageHeader
        label="Engineering & Construction Service"
        title={service.title}
        description={service.summary}
        image={service.image}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: service.shortName },
        ]}
      />

      {/* Main Service Content */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container-page">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <p className="section-label mb-4">Service Capabilities</p>
              <h2 className="text-2xl lg:text-3xl font-heading font-extrabold mb-6 text-balance text-brand-navy">
                Professional {service.shortName} by Jobale Engineering PLC
              </h2>
              <p className="text-lg text-ink leading-relaxed">{service.overview}</p>

              {/* Verified Project Highlight */}
              {service.verifiedProjectsNote && (
                <div className="mt-8 p-5 rounded-xl bg-brand-blue/5 border border-brand-blue/20 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                  <div className="text-sm text-ink leading-relaxed">
                    <strong className="text-brand-navy font-heading font-semibold block mb-0.5">
                      Verified Field Experience:
                    </strong>
                    {service.verifiedProjectsNote}
                  </div>
                </div>
              )}

              {/* Client Confirmation Note (Honesty & Compliance) */}
              {service.verificationNote && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-semibold">Note on Project Specifications: </span>
                    {service.verificationNote}
                  </div>
                </div>
              )}

              {/* Scope */}
              <div className="mt-12">
                <h3 className="text-xl font-heading font-bold text-brand-navy mb-5">
                  Scope of Services & Key Deliverables
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {service.scope.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-surface-offwhite">
                      <CheckCircle2 className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                      <span className="text-sm text-ink font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applications */}
              <div className="mt-12">
                <h3 className="text-xl font-heading font-bold text-brand-navy mb-5">
                  Typical Project Applications in Ethiopia
                </h3>
                <ul className="space-y-3">
                  {service.applications.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-ink">
                      <span className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                      </span>
                      <span className="text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delivery Approach */}
              <div className="mt-12">
                <h3 className="text-xl font-heading font-bold text-brand-navy mb-5">
                  Engineering Delivery & Execution Process
                </h3>
                <div className="p-6 rounded-xl bg-surface-offwhite border border-surface-steel/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                      <Building className="w-5 h-5 text-brand-blue" />
                    </div>
                    <span className="font-heading font-bold text-brand-navy">Our Technical Approach</span>
                  </div>
                  <p className="text-ink leading-relaxed text-sm sm:text-base">{service.approach}</p>
                </div>
              </div>

              {/* Quality & Safety */}
              <div className="mt-12">
                <h3 className="text-xl font-heading font-bold text-brand-navy mb-5">
                  Quality Assurance & Site Safety Standards
                </h3>
                <div className="p-6 rounded-xl bg-brand-navy text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-brand-blue-light" />
                    </div>
                    <span className="font-heading font-bold text-white">Our Commitments</span>
                  </div>
                  <p className="text-surface-steel leading-relaxed text-sm sm:text-base">{service.qualitySafety}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="sticky top-28 space-y-6">
                {/* Inquiry card */}
                <div className="p-6 rounded-xl bg-surface-offwhite border border-surface-steel/60">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-lg bg-brand-blue flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-brand-navy text-sm uppercase tracking-wider">
                        {service.shortName}
                      </h3>
                      <p className="text-xs text-ink-muted">Inquire for tenders & quotations</p>
                    </div>
                  </div>
                  <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                    Partner with Jobale Engineering PLC for your {service.shortName.toLowerCase()} requirements in Ethiopia.
                  </p>
                  <Link
                    to="/contact"
                    className="btn-primary w-full text-center flex items-center justify-center gap-2"
                  >
                    Request a Quotation
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Other services */}
                <div className="p-6 rounded-xl bg-white border border-surface-steel/60">
                  <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-brand-navy mb-4">
                    All Engineering Services
                  </h3>
                  <ul className="space-y-3">
                    {otherServices.map((s) => {
                      const OtherIcon = s.icon;
                      return (
                        <li key={s.slug}>
                          <Link
                            to={`/services/${s.slug}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-offwhite transition-colors group"
                          >
                            <OtherIcon className="w-5 h-5 text-brand-blue shrink-0" />
                            <span className="text-sm font-medium text-ink group-hover:text-brand-blue transition-colors">
                              {s.shortName}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-surface-steel/40">
                    <Link
                      to="/services"
                      className="text-xs font-heading font-semibold text-brand-blue hover:underline inline-flex items-center gap-1"
                    >
                      View all services <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-20 bg-surface-offwhite">
          <div className="container-page">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="section-label mb-3">Portfolio Evidence</p>
                <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-brand-navy">
                  Related Projects for {service.shortName}
                </h2>
              </div>
              <Link
                to="/projects"
                className="hidden sm:inline-flex items-center gap-2 text-brand-blue font-heading font-semibold hover:gap-3 transition-all"
              >
                All Projects
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.slug}`}
                  className="group card-base overflow-hidden hover:shadow-elevated hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={project.image}
                      alt={`Jobale Engineering ${service.shortName} project: ${project.name}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-heading font-semibold bg-white/95 text-brand-navy">
                      {project.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-heading font-bold text-brand-navy group-hover:text-brand-blue transition-colors leading-snug line-clamp-2">
                      {project.name}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-brand-blue">
                      View Project Details
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection
        title={`Plan Your ${service.shortName} Project with Jobale Engineering`}
        description="Speak with our technical engineering team in Adama, Ethiopia about requirements, site evaluations, and commercial proposals."
        primaryCTA={{ label: 'Discuss Your Project', to: '/contact' }}
        secondaryCTA={{ label: 'Explore All Services', to: '/services' }}
      />
    </>
  );
}
