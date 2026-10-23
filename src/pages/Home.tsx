import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  HardHat,
  Users,
  ShieldCheck,
  ClipboardCheck,
  MessageSquare,
  Clock,
  DollarSign,
  CheckCircle2,
  Leaf,
  Factory,
  HeartPulse,
  GraduationCap,
  Home as HomeIcon,
  Briefcase,
  Globe2,
  Layers,
  Ruler,
  Wrench,
  Quote,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/CTASection';
import { company, stats as defaultStats } from '@/data/company';
import { services as defaultServices } from '@/data/services';
import { projects as defaultProjects, projectCategories as defaultCategories } from '@/data/projects';
import { useCms } from '@/context/CmsContext';
import { mediaUrl } from '@/lib/api';
import { renderLucideIcon } from '@/components/admin/IconPicker';

const defaultHeroImage =
  'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080';

const whyChooseFeatures: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Users,
    title: 'Experienced Engineering Team',
    description:
      'Our team brings practical construction and engineering experience across building, civil, water, and renovation projects in Ethiopia.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality-Focused Workmanship',
    description:
      'We inspect each construction stage against approved drawings and specifications, checking materials and workmanship before proceeding.',
  },
  {
    icon: ClipboardCheck,
    title: 'Disciplined Project Management',
    description:
      'Projects are planned with clear schedules, budgets, and resource allocations — then monitored against milestones for accountability.',
  },
  {
    icon: HardHat,
    title: 'Safety-Conscious Construction',
    description:
      'Site safety protocols, PPE use, and safety briefings are maintained across our projects to protect workers and the public.',
  },
  {
    icon: MessageSquare,
    title: 'Transparent Client Communication',
    description:
      'We keep clients informed at each project stage, with documented progress reviews and open channels for questions and feedback.',
  },
  {
    icon: Clock,
    title: 'On-Time Project Delivery',
    description:
      'Milestone-driven planning and regular progress tracking help keep projects on schedule and within agreed parameters.',
  },
];

const processSteps = [
  { number: '01', title: 'Consultation & Scoping', description: 'We review requirements, assess site conditions, and establish project objectives and constraints.' },
  { number: '02', title: 'Planning & Estimation', description: 'Detailed work breakdown, resource scheduling, material takeoffs, and preliminary timelines.' },
  { number: '03', title: 'Contract & Mobilization', description: 'Formal agreement, site handover, permits, procurement setup, and safety briefing.' },
  { number: '04', title: 'Execution & Quality Control', description: 'Disciplined construction with stage inspections, milestone reporting, and quality verification.' },
  { number: '05', title: 'Handover & Closeout', description: 'Final inspections, defect rectification, documentation handover, and warranty commencement.' },
];

const qualityCommitments = [
  { icon: ShieldCheck, title: 'Specification Adherence', description: 'Every stage is checked against approved engineering drawings, Ethiopian Building Codes, and material standards.' },
  { icon: HardHat, title: 'Site Safety Enforcement', description: 'Daily safety briefings, mandatory personal protective equipment (PPE), and hazard assessments on all active sites.' },
  { icon: Leaf, title: 'Environmental Responsibility', description: 'Construction waste segregation, erosion control, and resource-conscious building practices on every site.' },
  { icon: CheckCircle2, title: 'Stage-by-Stage Approvals', description: 'Concrete pour inspections, rebar verification, and milestone sign-offs before subsequent phases begin.' },
];

const sectors = [
  { icon: HomeIcon, label: 'Residential' },
  { icon: Building2, label: 'Commercial' },
  { icon: Factory, label: 'Industrial' },
  { icon: GraduationCap, label: 'Institutional' },
  { icon: Globe2, label: 'Infrastructure' },
  { icon: Briefcase, label: 'Renovation' },
];

function AnimatedCounter({ value, suffix }: { value: string; suffix: string }) {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const target = parseInt(value, 10);
          if (isNaN(target)) {
            setDisplayValue(value);
            return;
          }
          const duration = 1500;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(target * eased).toString());
            if (progress < 1) requestAnimationFrame(tick);
            else setDisplayValue(value);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

export default function Home() {
  const { data, slogan } = useCms();

  // Dynamic hero values with fallback
  const heroImage = data?.hero?.hero_image
    ? mediaUrl(data.hero.hero_image)
    : data?.hero?.background_image
    ? mediaUrl(data.hero.background_image)
    : defaultHeroImage;

  const overlayOpacity = data?.hero?.overlay_opacity ?? 0.75;
  const eyebrow = data?.hero?.eyebrow || 'JOBALE ENGINEERING PLC | CONSTRUCTION & CIVIL WORKS';
  const headline = data?.hero?.headline || 'Building with Precision.';
  const headlineAccent = data?.hero?.headline_accent || 'Delivering with Confidence.';
  const supportingText =
    data?.hero?.supporting_text ||
    'From building construction to civil infrastructure, Jobale Engineering delivers practical engineering solutions grounded in quality, safety, reliability, and lasting value.';
  const primaryCtaLabel = data?.hero?.primary_cta_label || 'Explore Our Projects';
  const primaryCtaUrl = data?.hero?.primary_cta_url || '/projects';
  const secondaryCtaLabel = data?.hero?.secondary_cta_label || 'Discuss Your Project';
  const secondaryCtaUrl = data?.hero?.secondary_cta_url || '/contact';

  // Dynamic statistics
  const activeStats =
    data?.about?.stats && data.about.stats.length > 0
      ? data.about.stats.map((s) => ({
          label: s.label,
          value: s.value,
          suffix: s.suffix || '',
        }))
      : defaultStats;

  // Dynamic services
  const activeServices =
    data?.services && data.services.length > 0
      ? data.services.map((s) => ({
          slug: s.slug,
          title: s.title,
          summary: s.summary,
          iconName: s.icon || 'Building2',
          image: s.image ? mediaUrl(s.image) : defaultHeroImage,
        }))
      : defaultServices.map((s) => ({
          slug: s.slug,
          title: s.title,
          summary: s.summary,
          iconName: 'Building2',
          image: s.image,
        }));

  // Dynamic projects
  const activeProjects =
    data?.featured_projects && data.featured_projects.length > 0
      ? data.featured_projects
      : data?.projects && data.projects.length > 0
      ? data.projects.slice(0, 6)
      : defaultProjects.filter((p) => p.verified).slice(0, 6);

  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Categories
  const categoryList: string[] = ['All'];
  if (data?.project_categories && data.project_categories.length > 0) {
    data.project_categories.forEach((cat) => {
      if (!categoryList.includes(cat.name)) categoryList.push(cat.name);
    });
  } else {
    defaultCategories.forEach((cat) => {
      if (!categoryList.includes(cat)) categoryList.push(cat);
    });
  }

  const filteredProjects =
    activeFilter === 'All'
      ? activeProjects
      : activeProjects.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p: any) =>
            p.category === activeFilter ||
            p.resolved_category === activeFilter ||
            p.category_name === activeFilter
        );

  // Dynamic testimonials
  const verifiedTestimonials = (data?.testimonials || []).filter(
    (t) => t.status === 'published' && t.is_verified
  );

  // Dynamic client references
  const verifiedClients = (data?.clients || []).filter((c) => c.status === 'published');

  return (
    <>
      <SEO
        title={data?.seo?.page_title || "Jobale Engineering PLC | Construction & Civil Engineering in Adama, Ethiopia"}
        description={data?.seo?.meta_description || "General construction and civil engineering company in Adama, Ethiopia. Building construction, civil infrastructure, water supply, renovation, and maintenance services."}
        ogImage={data?.seo?.og_image ? mediaUrl(data.seo.og_image) : heroImage}
      />

      {/* Section A: Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Construction site with tower cranes and buildings under development"
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-brand-navy-dark/90 via-brand-navy/75 to-brand-navy/60"
            style={{ opacity: overlayOpacity }}
          />
        </div>

        <div className="container-page relative py-20 lg:py-32">
          <div className="max-w-3xl relative z-10">
            <p className="section-label text-brand-blue-light mb-6 animate-fade-in-down flex items-center gap-2">
              <Factory className="w-4 h-4" />
              <span>{eyebrow}</span>
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-display-lg text-white font-heading font-extrabold tracking-tight leading-[1.05] text-balance animate-fade-in-up">
              {headline}
              {headlineAccent && (
                <>
                  <br />
                  <span className="text-brand-blue-light">{headlineAccent}</span>
                </>
              )}
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-surface-steel max-w-2xl leading-relaxed text-pretty animate-fade-in-up">
              {supportingText}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4 animate-fade-in-up">
              <Link to={primaryCtaUrl} className="btn-primary group">
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to={secondaryCtaUrl} className="btn-secondary">
                {secondaryCtaLabel}
              </Link>
            </div>
            <p className="mt-8 text-sm text-surface-steel/60 font-heading italic animate-fade-in">
              "{data?.hero?.slogan || slogan}"
            </p>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-offwhite to-transparent" />
      </section>

      {/* Section B: Company Introduction */}
      <section className="py-20 lg:py-28 bg-surface-offwhite">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <p className="section-label mb-4">Who We Are</p>
              <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">
                {data?.about?.heading || 'Engineering Solutions Built Around Your Vision'}
              </h2>
              <div className="mt-6 space-y-4 text-ink leading-relaxed">
                <p>
                  {data?.about?.introduction ||
                    'Jobale Engineering PLC is a professionally managed general construction company engaged in building construction, civil works, renovation, maintenance, and related engineering services. Based in Adama, Oromia, Ethiopia, we serve clients across multiple regions.'}
                </p>
                <p>
                  {data?.about?.overview ||
                    'We work with public institutions, private developers, commercial businesses, NGOs, and individual clients — bringing disciplined project management, quality workmanship, and a commitment to safety and durability to every engagement.'}
                </p>
                <p>
                  Our focus is on delivering construction that meets approved drawings and specifications, on time and on budget, with transparent communication and lasting value for our clients.
                </p>
              </div>
              <Link
                to="/about"
                className="mt-8 inline-flex items-center gap-2 text-brand-blue font-heading font-semibold hover:gap-3 transition-all"
              >
                Learn More About Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src={data?.about?.main_image ? mediaUrl(data.about.main_image) : "https://images.pexels.com/photos/8961028/pexels-photo-8961028.jpeg?auto=compress&cs=tinysrgb&w=600&h=400"}
                    alt="Engineers in safety gear discussing a construction project"
                    className="w-full h-56 object-cover rounded-xl shadow-card"
                    loading="lazy"
                  />
                  <img
                    src="https://images.pexels.com/photos/8482551/pexels-photo-8482551.jpeg?auto=compress&cs=tinysrgb&w=600&h=400"
                    alt="Engineer in hard hat reviewing architectural floor plans"
                    className="w-full h-40 object-cover rounded-xl shadow-card"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img
                    src="https://images.pexels.com/photos/36606405/pexels-photo-36606405.jpeg?auto=compress&cs=tinysrgb&w=600&h=400"
                    alt="Excavator at construction site with foundations and rebar"
                    className="w-full h-40 object-cover rounded-xl shadow-card"
                    loading="lazy"
                  />
                  <img
                    src={data?.about?.secondary_image ? mediaUrl(data.about.secondary_image) : "https://images.pexels.com/photos/1311159/pexels-photo-1311159.jpeg?auto=compress&cs=tinysrgb&w=600&h=400"}
                    alt="Aerial view of industrial storage yard with steel structures"
                    className="w-full h-56 object-cover rounded-xl shadow-card"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section C: Statistics */}
      <section className="bg-brand-navy py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="container-page relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {activeStats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-sm font-heading font-semibold uppercase tracking-wider text-brand-blue-light">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section D: Services */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-page">
          <div className="max-w-2xl mb-14">
            <p className="section-label mb-4">What We Do</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">
              Construction & Engineering Services
            </h2>
            <p className="mt-4 text-lg text-ink leading-relaxed">
              From building construction to civil infrastructure, finishing, MEP, and renovation — we deliver integrated construction services with experienced supervision and systematic quality control.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeServices.map((service) => (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className="group card-base overflow-hidden hover:shadow-elevated hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />
                  <div className="absolute top-4 left-4 w-11 h-11 rounded-lg bg-white/95 flex items-center justify-center shadow-md text-brand-blue">
                    {renderLucideIcon(service.iconName, 'w-5 h-5')}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-heading font-bold text-brand-navy group-hover:text-brand-blue transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm text-ink leading-relaxed line-clamp-3">
                    {service.summary}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-brand-blue">
                    Explore Service
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}

            {/* Sixth card: CTA */}
            <div className="card-base bg-gradient-to-br from-brand-navy to-brand-navy-dark p-8 flex flex-col justify-center items-center text-center">
              <ClipboardCheck className="w-12 h-12 text-brand-blue-light mb-4" />
              <h3 className="text-lg font-heading font-bold text-white">
                Need a Custom Service Package?
              </h3>
              <p className="mt-3 text-sm text-surface-steel leading-relaxed">
                Tell us about your project requirements and we'll propose the right scope of services.
              </p>
              <Link to="/contact" className="mt-6 btn-primary !bg-white !text-brand-navy hover:!bg-surface-offwhite">
                Discuss Your Project
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section E: Featured Projects */}
      <section className="py-20 lg:py-28 bg-surface-offwhite">
        <div className="container-page">
          <div className="max-w-2xl mb-10">
            <p className="section-label mb-4">Our Work</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">
              Featured Projects
            </h2>
            <p className="mt-4 text-lg text-ink leading-relaxed">
              A selection of verified construction and civil engineering projects from our portfolio.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categoryList.map((cat) => (
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

          {/* Project grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any) => {
              const projectImage = project.image ? mediaUrl(project.image) : defaultHeroImage;
              const categoryBadge = project.resolved_category || project.category_name || project.category;
              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.slug}`}
                  className="group card-base overflow-hidden hover:shadow-elevated hover:-translate-y-1"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={projectImage}
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1.5 rounded-md text-xs font-heading font-semibold bg-white/95 text-brand-navy">
                      {categoryBadge}
                    </span>
                    <span className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-xs font-heading font-medium bg-brand-blue/90 text-white">
                      {project.project_status || project.status}
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
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link to="/projects" className="btn-outline">
              View All Projects
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section F: Why Choose Jobale */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-page">
          <div className="max-w-2xl mb-14">
            <p className="section-label mb-4">Why Jobale</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">
              Why Choose Jobale Engineering?
            </h2>
            <p className="mt-4 text-lg text-ink leading-relaxed">
              We combine engineering experience with disciplined project delivery — focused on quality, safety, and client satisfaction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-7 rounded-xl border border-surface-steel/60 bg-surface-offwhite/50 hover:bg-white hover:shadow-card-hover hover:border-brand-blue/20 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-brand-blue/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-brand-blue" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-brand-navy">{feature.title}</h3>
                  <p className="mt-3 text-sm text-ink leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section G: Project Delivery Process */}
      <section className="py-20 lg:py-28 bg-surface-offwhite relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container-page relative">
          <div className="max-w-2xl mb-14">
            <p className="section-label mb-4">How We Work</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">
              Project Delivery Process
            </h2>
            <p className="mt-4 text-lg text-ink leading-relaxed">
              Our five-stage methodology ensures every project is initiated, planned, executed, and closed out with structure and accountability.
            </p>
          </div>

          <div className="hidden lg:flex items-start justify-between gap-4">
            {processSteps.map((step, i) => (
              <div key={i} className="flex-1 relative">
                {i < processSteps.length - 1 && (
                  <div className="absolute top-7 left-[60%] right-[-40%] h-0.5 bg-gradient-to-r from-brand-blue/40 to-brand-blue/10" />
                )}
                <div className="relative w-14 h-14 rounded-full bg-white border-2 border-brand-blue flex items-center justify-center shadow-md z-10">
                  <span className="text-sm font-heading font-extrabold text-brand-blue">{step.number}</span>
                </div>
                <h3 className="mt-5 text-base font-heading font-bold text-brand-navy">{step.title}</h3>
                <p className="mt-2 text-sm text-ink leading-relaxed pr-4">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="lg:hidden space-y-6">
            {processSteps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-brand-blue flex items-center justify-center shadow-sm shrink-0">
                    <span className="text-xs font-heading font-extrabold text-brand-blue">{step.number}</span>
                  </div>
                  {i < processSteps.length - 1 && <div className="w-0.5 flex-1 bg-brand-blue/20 mt-2" />}
                </div>
                <div className="pb-4">
                  <h3 className="text-base font-heading font-bold text-brand-navy">{step.title}</h3>
                  <p className="mt-1 text-sm text-ink leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section H: Quality, Safety & Sustainability */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="section-label mb-4">Our Commitments</p>
              <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">
                Quality, Safety & Sustainability
              </h2>
              <p className="mt-5 text-lg text-ink leading-relaxed">
                We treat quality, safety, and environmental responsibility as core project commitments — not optional extras. Every project follows our approach to stage inspections, site safety, and responsible construction practices.
              </p>
              <Link to="/quality-safety" className="mt-8 inline-flex items-center gap-2 text-brand-blue font-heading font-semibold hover:gap-3 transition-all">
                Read Our Quality & Safety Policies
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {qualityCommitments.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="p-6 rounded-xl bg-surface-offwhite border border-surface-steel/50 hover:shadow-card transition-all">
                    <div className="w-10 h-10 rounded-lg bg-brand-navy/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-brand-navy" />
                    </div>
                    <h3 className="text-sm font-heading font-bold text-brand-navy">{item.title}</h3>
                    <p className="mt-2 text-sm text-ink leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section I: Client & Sector Coverage */}
      <section className="py-20 lg:py-24 bg-surface-offwhite">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="section-label mb-4 justify-center">Sector Coverage</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">
              Sectors We Serve
            </h2>
            <p className="mt-4 text-lg text-ink leading-relaxed">
              We deliver construction and engineering services across a range of institutional, commercial, and private sectors.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sectors.map((sector, i) => {
              const Icon = sector.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-white border border-surface-steel/50 hover:border-brand-blue/30 hover:shadow-card transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-brand-blue" />
                  </div>
                  <span className="text-sm font-heading font-semibold text-brand-navy leading-snug">
                    {sector.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Verified Clients if available */}
          {verifiedClients.length > 0 && (
            <div className="mt-14 pt-10 border-t border-surface-steel/40">
              <p className="text-center text-xs font-heading font-semibold text-brand-navy uppercase tracking-wider mb-6">
                Verified Client Relationships & Project Partners
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8">
                {verifiedClients.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-white shadow-sm border border-surface-steel/40">
                    {c.logo && (
                      <img src={mediaUrl(c.logo)} alt={c.name} className="h-8 max-w-[100px] object-contain" />
                    )}
                    <span className="text-xs font-semibold text-brand-navy">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Client Testimonials Section */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="section-label justify-center mb-4">Client Feedback</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">
              Trusted Project Delivery
            </h2>
            <p className="mt-4 text-lg text-ink leading-relaxed">
              {verifiedTestimonials.length > 0
                ? 'Verified statements from client representatives on completed engineering works.'
                : 'Approved client testimonials will be added here as soon as verified by the company.'}
            </p>
          </div>

          {verifiedTestimonials.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {verifiedTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-7 rounded-2xl bg-surface-offwhite border border-surface-steel/60 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all"
                >
                  <div>
                    <Quote className="w-8 h-8 text-brand-blue mb-4" />
                    <p className="text-sm text-ink leading-relaxed italic">"{t.quote}"</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-surface-steel/40 flex items-center gap-3">
                    {t.image ? (
                      <img src={mediaUrl(t.image)} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs">
                        {t.name[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-heading font-bold text-brand-navy">{t.name}</h4>
                      <p className="text-[11px] text-ink-light">
                        {t.job_title ? `${t.job_title}, ` : ''}{t.organization}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {['Quality Workmanship', 'Clear Project Communication', 'Disciplined Site Coordination'].map(
                (title) => (
                  <div
                    key={title}
                    className="p-7 rounded-xl bg-surface-offwhite border border-surface-steel/60 text-center"
                  >
                    <Quote className="w-8 h-8 text-brand-blue mx-auto mb-4" />
                    <h3 className="text-base font-heading font-bold text-brand-navy">{title}</h3>
                    <p className="mt-3 text-sm text-ink-light">Client testimonial pending approval.</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* Section J: Final CTA */}
      <CTASection
        title="Let's Build Something That Lasts."
        description="Have a construction or civil engineering project in mind? Speak with our team about your requirements."
        primaryCTA={{ label: 'Discuss Your Project', to: '/contact' }}
        secondaryCTA={{ label: 'Contact Our Team', to: '/contact' }}
      />
    </>
  );
}
