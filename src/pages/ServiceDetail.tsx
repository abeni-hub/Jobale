import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  HardHat,
  Building,
  Wrench,
} from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { getServiceBySlug, services } from '@/data/services';
import { projects as defaultProjects } from '@/data/projects';
import { useCms } from '@/context/CmsContext';
import { resolveLucideIcon } from '@/lib/icons';
import { mediaUrl } from '@/lib/api';
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
      if (service.slug === 'building-construction') return p.category === 'Building Construction';
      if (service.slug === 'civil-infrastructure') return p.category === 'Civil Works' || p.category === 'Water & Sanitation';
      if (service.slug === 'renovation-maintenance') return p.category === 'Rehabilitation';
      return false;
    })
    .slice(0, 3);

  const otherServices = (data?.services && data.services.length > 0)
    ? data.services
        .filter((s) => s.slug !== service.slug)
        .slice(0, 4)
        .map((s) => ({
          slug: s.slug,
          shortName: s.short_name || s.title,
          icon: resolveLucideIcon(s.icon, Building),
        }))
    : services
        .filter((s) => s.slug !== service.slug)
        .slice(0, 4);

  return (
    <>
      <SEO
        title={`${service.title} | ${companyName}`}
        description={service.summary}
        ogImage={service.image}
      />

      <PageHeader
        label="Service"
        title={service.title}
        description={service.summary}
        image={service.image}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: service.shortName },
        ]}
      />

      {/* Overview */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container-page">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <p className="section-label mb-4">Overview</p>
              <h2 className="text-2xl lg:text-3xl font-heading font-extrabold mb-6 text-balance">
                {service.title}
              </h2>
              <p className="text-lg text-ink leading-relaxed">{service.overview}</p>

              {/* Scope */}
              <div className="mt-12">
                <h3 className="text-xl font-heading font-bold text-brand-navy mb-5">Scope of Services</h3>
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
                <h3 className="text-xl font-heading font-bold text-brand-navy mb-5">Typical Applications</h3>
                <ul className="space-y-3">
                  {service.applications.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-ink">
                      <span className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delivery Approach */}
              <div className="mt-12">
                <h3 className="text-xl font-heading font-bold text-brand-navy mb-5">Delivery Approach</h3>
                <div className="p-6 rounded-xl bg-surface-offwhite border border-surface-steel/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                      <Building className="w-5 h-5 text-brand-blue" />
                    </div>
                    <span className="font-heading font-bold text-brand-navy">Our Approach</span>
                  </div>
                  <p className="text-ink leading-relaxed">{service.approach}</p>
                </div>
              </div>

              {/* Quality & Safety */}
              <div className="mt-12">
                <h3 className="text-xl font-heading font-bold text-brand-navy mb-5">Quality & Safety Considerations</h3>
                <div className="p-6 rounded-xl bg-brand-navy text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-brand-blue-light" />
                    </div>
                    <span className="font-heading font-bold text-white">Our Commitments</span>
                  </div>
                  <p className="text-surface-steel leading-relaxed">{service.qualitySafety}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="sticky top-28 space-y-6">
                {/* Quick facts */}
                <div className="p-6 rounded-xl bg-surface-offwhite border border-surface-steel/60">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-lg bg-brand-blue flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-heading font-bold text-brand-navy">{service.shortName}</h3>
                  </div>
                  <Link to="/contact" className="btn-primary w-full">
                    Discuss This Service
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Other services */}
                <div className="p-6 rounded-xl bg-white border border-surface-steel/60">
                  <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-brand-navy mb-4">
                    Other Services
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
                <p className="section-label mb-3">Related Work</p>
                <h2 className="text-2xl lg:text-3xl font-heading font-extrabold">Related Projects</h2>
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
                      alt={project.name}
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
                      View Project
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
        title={`Ready to Start Your ${service.shortName} Project?`}
        description="Speak with our team about your requirements, site conditions, and project timeline."
        primaryCTA={{ label: 'Discuss Your Project', to: '/contact' }}
        secondaryCTA={{ label: 'Back to Services', to: '/services' }}
      />
    </>
  );
}
