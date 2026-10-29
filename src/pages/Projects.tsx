import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, X, FolderOpen } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { projects as defaultProjects, projectCategories as defaultCategories } from '@/data/projects';
import { useCms } from '@/context/CmsContext';
import { mediaUrl } from '@/lib/api';

interface CardProject {
  id: string;
  name: string;
  slug: string;
  category: string;
  summary: string;
  location: string;
  client: string;
  status: string;
  image: string;
}

export default function Projects() {
  const { data, companyName } = useCms();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const projectsList: CardProject[] = useMemo(() => {
    if (data?.projects && data.projects.length > 0) {
      return data.projects.map((p) => ({
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        category: p.category_name || p.resolved_category || 'Building Construction',
        summary: p.summary || p.overview || '',
        location: p.location || '',
        client: p.client || '',
        status: p.project_status_display || p.project_status || 'Completed',
        image: mediaUrl(p.image) || 'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
      }));
    }
    return defaultProjects.map((p) => ({
      id: String(p.id),
      name: p.name,
      slug: p.slug,
      category: p.category,
      summary: p.summary,
      location: p.location || '',
      client: p.client || '',
      status: p.status,
      image: mediaUrl(p.image) || 'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
    }));
  }, [data?.projects]);

  const filteredProjects: CardProject[] = useMemo(() => {
    let result = projectsList;
    if (activeFilter !== 'All') {
      result = result.filter((p) => p.category === activeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.summary.toLowerCase().includes(query) ||
          (p.location?.toLowerCase().includes(query) ?? false) ||
          (p.client?.toLowerCase().includes(query) ?? false)
      );
    }
    return result;
  }, [projectsList, activeFilter, searchQuery]);

  const availableFilters = useMemo(() => {
    const cats = new Set<string>();
    cats.add('All');
    projectsList.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [projectsList]);

  return (
    <>
      <SEO
        title={`Projects & Construction Portfolio | ${companyName}`}
        description="View completed and verified engineering projects by Jobale Engineering PLC across Ethiopia: industrial cement factory civil works, hospital water supply systems, community water infrastructure, and building construction."
        canonical="/projects"
        keywords="Jobale Engineering projects, construction portfolio Ethiopia, Lemi cement ditch project, Dangote cement canteen, community water supply Ethiopia, civil works portfolio"
        ogImage="https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Projects', item: '/projects' },
        ]}
      />

      <PageHeader
        label="Our Portfolio"
        title="Construction & Engineering Projects"
        description="A portfolio of verified projects spanning building construction, civil works, water supply and sanitation, and rehabilitation across multiple regions of Ethiopia."
        image="https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Projects' }]}
      />

      <section className="py-20 lg:py-24 bg-surface-offwhite">
        <div className="container-page">
          {/* Search + filters */}
          <div className="mb-10 space-y-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by project name, location, or client..."
                className="w-full pl-12 pr-12 py-3.5 rounded-lg border border-surface-steel bg-white text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                aria-label="Search projects"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {availableFilters.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all ${
                    activeFilter === cat
                      ? 'bg-brand-blue text-white shadow-md'
                      : 'bg-white text-ink hover:bg-surface-steel/40 border border-surface-steel/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-ink-light mb-6">
            Showing {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
            {activeFilter !== 'All' && ` in ${activeFilter}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>

          {/* Project grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.slug}`}
                  className="group card-base overflow-hidden hover:shadow-elevated hover:-translate-y-1"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={project.image}
                      alt={`Jobale Engineering PLC Project: ${project.name}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=600&h=400';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1.5 rounded-md text-xs font-heading font-semibold bg-white/95 text-brand-navy">
                      {project.category}
                    </span>
                    <span className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-xs font-heading font-medium bg-brand-blue/90 text-white">
                      {project.status}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-heading font-bold text-brand-navy group-hover:text-brand-blue transition-colors leading-snug line-clamp-2">
                      {project.name}
                    </h3>
                    <p className="mt-2 text-sm text-ink-light leading-relaxed line-clamp-2">
                      {project.summary}
                    </p>
                    {project.location && (
                      <p className="mt-3 text-xs text-ink-muted font-medium">{project.location}</p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-brand-blue">
                      View Project
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FolderOpen className="w-12 h-12 text-ink-muted mx-auto mb-4" />
              <h3 className="text-lg font-heading font-bold text-brand-navy">No Projects Found</h3>
              <p className="mt-2 text-ink-light">Try adjusting your search or filter selection.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('All');
                }}
                className="mt-6 btn-outline"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>
      </section>

      <CTASection
        title="Have a Project in Mind?"
        description="Whether you're planning a new build, civil infrastructure, or a renovation — speak with our team about your requirements."
        primaryCTA={{ label: 'Discuss Your Project', to: '/contact' }}
        secondaryCTA={{ label: 'View Our Services', to: '/services' }}
      />
    </>
  );
}
