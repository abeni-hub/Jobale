import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Building,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { getProjectBySlug, getRelatedProjects, projects as defaultProjects } from '@/data/projects';
import { services as defaultServices } from '@/data/services';
import { useCms } from '@/context/CmsContext';
import { mediaUrl } from '@/lib/api';
import NotFound from './NotFound';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, companyName } = useCms();

  const cmsProject = data?.projects?.find((p) => p.slug === slug);
  const staticProject = slug ? getProjectBySlug(slug) : undefined;

  if (!cmsProject && !staticProject) return <NotFound />;

  const rawImage = cmsProject?.image || staticProject?.image;
  const project = {
    id: String(cmsProject?.id || staticProject?.id || ''),
    name: cmsProject?.name || staticProject?.name || '',
    slug: cmsProject?.slug || staticProject?.slug || '',
    category: cmsProject?.category_name || cmsProject?.resolved_category || staticProject?.category || 'Building Construction',
    summary: cmsProject?.summary || staticProject?.summary || '',
    description: cmsProject?.description || cmsProject?.overview || staticProject?.description || '',
    scope: cmsProject?.scope || staticProject?.scope || [],
    specifications: cmsProject?.specifications || [],
    client: cmsProject?.client || staticProject?.client || '',
    location: cmsProject?.location || staticProject?.location || '',
    status: cmsProject?.project_status_display || cmsProject?.project_status || staticProject?.status || 'Completed',
    year: cmsProject?.completion_date ? cmsProject.completion_date.split('-')[0] : (staticProject?.year || ''),
    image: mediaUrl(rawImage) || 'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    gallery: (cmsProject?.gallery || []).map((g) => ({ ...g, image: mediaUrl(g.image) })),
  };

  const allProjects = (data?.projects && data.projects.length > 0)
    ? data.projects.map((p) => ({
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        category: p.category_name || p.resolved_category || 'Building Construction',
        summary: p.summary || p.overview || '',
        location: p.location || '',
        client: p.client || '',
        status: p.project_status_display || p.project_status || 'Completed',
        image: mediaUrl(p.image) || 'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
        year: p.completion_date ? p.completion_date.split('-')[0] : '',
      }))
    : defaultProjects.map((p) => ({
        ...p,
        image: mediaUrl(p.image),
      }));

  const relatedProjects = allProjects
    .filter((p) => p.category === project.category && p.slug !== project.slug)
    .slice(0, 3);

  const servicesList = data?.services && data.services.length > 0 ? data.services : defaultServices;
  const relatedService = servicesList.find((s) => {
    if (project.category === 'Building Construction') return s.slug === 'building-construction';
    if (project.category === 'Civil Works' || project.category === 'Water & Sanitation') return s.slug === 'civil-infrastructure';
    if (project.category === 'Rehabilitation') return s.slug === 'renovation-maintenance';
    return false;
  });

  return (
    <>
      <SEO
        title={`${project.name} | ${companyName}`}
        description={project.summary}
        ogImage={project.image}
      />

      <PageHeader
        label={project.category}
        title={project.name}
        description={project.summary}
        image={project.image}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Projects', to: '/projects' },
          { label: project.name },
        ]}
      />

      <section className="py-20 lg:py-24 bg-white">
        <div className="container-page">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Project image */}
              <div className="relative rounded-2xl overflow-hidden shadow-card mb-10">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-72 lg:h-96 object-cover"
                  loading="lazy"
                />
              </div>

              {/* Project description */}
              <div>
                <h2 className="text-2xl font-heading font-extrabold text-brand-navy mb-5">
                  Project Overview
                </h2>
                <p className="text-lg text-ink leading-relaxed">{project.description}</p>
              </div>

              {/* Scope of work */}
              <div className="mt-12">
                <h3 className="text-xl font-heading font-bold text-brand-navy mb-5">Scope of Work</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {project.scope.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-surface-offwhite">
                      <CheckCircle2 className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                      <span className="text-sm text-ink font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications if present */}
              {project.specifications && project.specifications.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-heading font-bold text-brand-navy mb-5">Technical Specifications</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {project.specifications.map((spec, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-surface-offwhite border border-surface-steel/40">
                        <CheckCircle2 className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                        <span className="text-sm text-ink font-medium">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Gallery if present */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-heading font-bold text-brand-navy mb-5">Project Gallery</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {project.gallery.map((img) => (
                      <div key={img.id} className="relative rounded-xl overflow-hidden group shadow-card">
                        <img
                          src={img.image}
                          alt={img.alt_text || img.caption || project.name}
                          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {img.caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/90 to-transparent p-3 text-xs text-white">
                            {img.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back link */}
              <div className="mt-12">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 text-brand-blue font-heading font-semibold hover:gap-3 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to All Projects
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {/* Project details */}
                <div className="p-6 rounded-xl bg-surface-offwhite border border-surface-steel/60">
                  <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-brand-navy mb-5">
                    Project Details
                  </h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="flex items-center gap-2 text-xs font-heading font-semibold text-ink-light uppercase tracking-wide mb-1">
                        <Tag className="w-3.5 h-3.5" /> Category
                      </dt>
                      <dd className="text-sm text-ink font-medium">{project.category}</dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-2 text-xs font-heading font-semibold text-ink-light uppercase tracking-wide mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Status
                      </dt>
                      <dd className="text-sm text-ink font-medium">{project.status}</dd>
                    </div>
                    {project.client && (
                      <div>
                        <dt className="flex items-center gap-2 text-xs font-heading font-semibold text-ink-light uppercase tracking-wide mb-1">
                          <User className="w-3.5 h-3.5" /> Client
                        </dt>
                        <dd className="text-sm text-ink font-medium">{project.client}</dd>
                      </div>
                    )}
                    {project.location && (
                      <div>
                        <dt className="flex items-center gap-2 text-xs font-heading font-semibold text-ink-light uppercase tracking-wide mb-1">
                          <MapPin className="w-3.5 h-3.5" /> Location
                        </dt>
                        <dd className="text-sm text-ink font-medium">{project.location}</dd>
                      </div>
                    )}
                    {project.year && (
                      <div>
                        <dt className="flex items-center gap-2 text-xs font-heading font-semibold text-ink-light uppercase tracking-wide mb-1">
                          <Calendar className="w-3.5 h-3.5" /> Completion Year
                        </dt>
                        <dd className="text-sm text-ink font-medium">{project.year}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Related service */}
                {relatedService && (() => {
                  const sName = ('short_name' in relatedService ? relatedService.short_name : (relatedService as { shortName?: string }).shortName) || relatedService.title;
                  return (
                    <div className="p-6 rounded-xl bg-brand-navy text-white">
                      <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-white mb-3">
                        Related Service
                      </h3>
                      <p className="text-sm text-surface-steel leading-relaxed mb-4">{sName}</p>
                      <Link
                        to={`/services/${relatedService.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-brand-blue-light hover:gap-3 transition-all"
                      >
                        View Service
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })()}

                {/* CTA */}
                <div className="p-6 rounded-xl bg-white border border-surface-steel/60">
                  <h3 className="font-heading font-bold text-brand-navy mb-3">Have a Similar Project?</h3>
                  <Link to="/contact" className="btn-primary w-full">
                    Discuss Your Project
                    <ArrowRight className="w-4 h-4" />
                  </Link>
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
                <p className="section-label mb-3">More Like This</p>
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
              {relatedProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.slug}`}
                  className="group card-base overflow-hidden hover:shadow-elevated hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-heading font-semibold bg-white/95 text-brand-navy">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-heading font-bold text-brand-navy group-hover:text-brand-blue transition-colors leading-snug line-clamp-2">
                      {p.name}
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
        title="Ready to Build Something Similar?"
        description="Our team has the experience to deliver projects like this one. Let's discuss your requirements."
        primaryCTA={{ label: 'Discuss Your Project', to: '/contact' }}
        secondaryCTA={{ label: 'View All Projects', to: '/projects' }}
      />
    </>
  );
}
