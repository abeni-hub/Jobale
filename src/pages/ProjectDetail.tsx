import { useState, useMemo, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Images,
  Camera,
} from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { getProjectBySlug, getRelatedProjects, projects as defaultProjects } from '@/data/projects';
import { services as defaultServices } from '@/data/services';
import { useCms } from '@/context/CmsContext';
import { mediaUrl } from '@/lib/api';
import { getProjectSchema } from '@/lib/seoData';
import NotFound from './NotFound';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, companyName } = useCms();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  // Combine cover image and all gallery images into a unified photos list
  const allPhotos = useMemo(() => {
    const list: { url: string; caption?: string; alt?: string }[] = [];
    if (project.image) {
      list.push({
        url: project.image,
        caption: project.name,
        alt: project.name,
      });
    }
    if (Array.isArray(project.gallery)) {
      project.gallery.forEach((g) => {
        if (g.image && g.image !== project.image) {
          list.push({
            url: g.image,
            caption: g.caption || project.name,
            alt: g.alt_text || g.caption || project.name,
          });
        }
      });
    }
    return list;
  }, [project.image, project.gallery, project.name]);

  const currentPhoto = allPhotos[activePhotoIndex] || allPhotos[0];

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivePhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivePhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  const openLightboxAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % allPhotos.length);
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, allPhotos.length]);

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
    if (project.category === 'Water & Sanitation') return s.slug === 'water-works';
    if (project.category === 'Civil Works') return s.slug === 'civil-engineering' || s.slug === 'civil-infrastructure';
    if (project.category === 'Building Construction') return s.slug === 'building-construction';
    if (project.category === 'Rehabilitation') return s.slug === 'renovation-maintenance';
    return false;
  });

  const canonicalUrl = `/projects/${project.slug}`;
  const seoDescription = `${project.summary} Executed by ${companyName}${project.location ? ` in ${project.location}` : ''}.`;
  const seoKeywords = `${project.name}, Jobale Engineering, Jobale Construction, ${project.category}, ${project.location || 'Ethiopia'}, construction contractor Ethiopia`;

  return (
    <>
      <SEO
        title={`${project.name} | ${companyName}`}
        description={seoDescription}
        canonical={canonicalUrl}
        keywords={seoKeywords}
        ogImage={project.image}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Projects', item: '/projects' },
          { name: project.name, item: canonicalUrl },
        ]}
        structuredData={getProjectSchema(project)}
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
              {/* Interactive Multi-Photo Viewer Showcase */}
              <div className="mb-10 space-y-3">
                <div
                  onClick={() => openLightboxAt(activePhotoIndex)}
                  className="relative rounded-2xl overflow-hidden shadow-card group cursor-pointer bg-brand-navy"
                >
                  <img
                    src={currentPhoto?.url || project.image}
                    alt={currentPhoto?.alt || project.name}
                    className="w-full h-80 sm:h-96 lg:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750';
                    }}
                  />

                  {/* Top info badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-md text-xs font-heading font-semibold bg-brand-navy/90 text-white backdrop-blur-md shadow-md flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-brand-blue-light" />
                      <span>Photo {activePhotoIndex + 1} of {allPhotos.length}</span>
                    </span>
                    {activePhotoIndex === 0 && (
                      <span className="px-2 py-1 rounded-md text-[10px] font-heading font-bold bg-brand-blue text-white shadow-md">
                        COVER
                      </span>
                    )}
                  </div>

                  {/* Expand button top right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightboxAt(activePhotoIndex);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-brand-navy/80 hover:bg-brand-navy text-white backdrop-blur-md shadow-md transition-all group-hover:scale-110"
                    title="View Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4 text-brand-blue-light" />
                  </button>

                  {/* Next / Previous arrows overlay */}
                  {allPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-brand-navy/80 hover:bg-brand-navy text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-all hover:scale-110"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-brand-navy/80 hover:bg-brand-navy text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-all hover:scale-110"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Bottom caption bar */}
                  {currentPhoto?.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/95 via-brand-navy/70 to-transparent p-5 text-white">
                      <p className="text-sm font-medium tracking-wide drop-shadow">
                        {currentPhoto.caption}
                      </p>
                    </div>
                  )}
                </div>

                {/* Thumbnail strip if multiple photos exist */}
                {allPhotos.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                    {allPhotos.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 transition-all border-2 ${
                          activePhotoIndex === idx
                            ? 'border-brand-blue ring-2 ring-brand-blue/30 scale-105 shadow-md'
                            : 'border-surface-steel/50 opacity-70 hover:opacity-100 hover:border-surface-steel'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.alt || `Photo thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/75 text-[9px] font-mono text-white">
                          #{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
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

              {/* Project Photo Gallery Grid (when multiple photos exist) */}
              {allPhotos.length > 1 && (
                <div className="mt-14 pt-12 border-t border-surface-steel/50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-heading font-extrabold text-brand-navy flex items-center gap-2">
                        <Images className="w-6 h-6 text-brand-blue" />
                        <span>Project Photo Gallery</span>
                      </h3>
                      <p className="text-sm text-ink-light mt-1">
                        Browse all {allPhotos.length} high-resolution photos of this project. Click any photo to enlarge.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-heading font-bold">
                      {allPhotos.length} Photos
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {allPhotos.map((photo, i) => (
                      <div
                        key={i}
                        onClick={() => openLightboxAt(i)}
                        className="group relative rounded-xl overflow-hidden shadow-card hover:shadow-elevated cursor-pointer bg-surface-offwhite aspect-video transition-all hover:-translate-y-1"
                      >
                        <img
                          src={photo.url}
                          alt={photo.alt || `Project photo ${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <span className="text-xs text-white font-medium line-clamp-1">{photo.caption}</span>
                          <span className="text-[10px] text-brand-blue-light flex items-center gap-1 mt-1">
                            <Maximize2 className="w-3 h-3" /> Click to view high-res
                          </span>
                        </div>
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono text-white">
                          #{i + 1}
                        </span>
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
                        Explore {sName} Services
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
                      alt={`Jobale Engineering PLC - ${p.name}`}
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

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Header */}
          <div
            className="w-full flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-heading font-semibold text-sm sm:text-base text-brand-blue-light">
                {project.name}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-surface-steel font-mono">
                {lightboxIndex + 1} / {allPhotos.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Photo Display */}
          <div
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allPhotos[lightboxIndex]?.url}
              alt={allPhotos[lightboxIndex]?.alt || project.name}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-all"
            />

            {allPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length)}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((prev) => (prev + 1) % allPhotos.length)}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          {/* Caption & thumbnails */}
          <div
            className="w-full max-w-3xl text-center z-10 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {allPhotos[lightboxIndex]?.caption && (
              <p className="text-white text-sm sm:text-base font-medium drop-shadow-md">
                {allPhotos[lightboxIndex]?.caption}
              </p>
            )}
            {allPhotos.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                {allPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      lightboxIndex === idx
                        ? 'border-brand-blue ring-2 ring-brand-blue/50 scale-105'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
