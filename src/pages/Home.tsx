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
import { company, stats } from '@/data/company';
import { services } from '@/data/services';
import { projects, projectCategories } from '@/data/projects';
import { getRelatedProjects } from '@/data/projects';

const heroImage = 'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080';

const whyChooseFeatures: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Users,
    title: 'Experienced Engineering Team',
    description: 'Our team brings practical construction and engineering experience across building, civil, water, and renovation projects in Ethiopia.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality-Focused Workmanship',
    description: 'We inspect each construction stage against approved drawings and specifications, checking materials and workmanship before proceeding.',
  },
  {
    icon: ClipboardCheck,
    title: 'Disciplined Project Management',
    description: 'Projects are planned with clear schedules, budgets, and resource allocations — then monitored against milestones for accountability.',
  },
  {
    icon: HardHat,
    title: 'Safety-Conscious Construction',
    description: 'Site safety protocols, PPE use, and safety briefings are maintained across our projects to protect workers and the public.',
  },
  {
    icon: MessageSquare,
    title: 'Transparent Client Communication',
    description: 'We keep clients informed at each project stage, with documented progress reviews and open channels for questions and feedback.',
  },
  {
    icon: DollarSign,
    title: 'Cost & Schedule Control',
    description: 'Budgets and timelines are tracked against baseline plans. Variations are flagged and addressed promptly to avoid surprises.',
  },
];

const processSteps: { number: string; title: string; description: string }[] = [
  { number: '01', title: 'Initiation', description: 'Understand the scope, drawings, specifications, and client requirements.' },
  { number: '02', title: 'Planning', description: 'Develop schedules, budgets, procurement plans, and resource allocations.' },
  { number: '03', title: 'Execution', description: 'Undertake construction with skilled teams and qualified supervision.' },
  { number: '04', title: 'Monitoring & Control', description: 'Monitor progress, cost, quality, and safety against the project plan.' },
  { number: '05', title: 'Handover & Closeout', description: 'Complete inspections, testing, snagging, client sign-off, and defect-liability support.' },
];

const sectors: { icon: LucideIcon; label: string }[] = [
  { icon: Building2, label: 'Government & Public Institutions' },
  { icon: HomeIcon, label: 'Real Estate Developers' },
  { icon: Briefcase, label: 'Commercial Businesses' },
  { icon: Globe2, label: 'NGOs & International Organizations' },
  { icon: GraduationCap, label: 'Educational & Healthcare Institutions' },
  { icon: HeartPulse, label: 'Private Property Owners' },
];

const qualityCommitments: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: ShieldCheck, title: 'Quality Assurance', description: 'Stage-by-stage inspections, material checks, testing, and corrective actions.' },
  { icon: HardHat, title: 'Worker & Public Safety', description: 'Risk assessments, PPE, safety briefings, and emergency procedures on every site.' },
  { icon: Leaf, title: 'Environmental Protection', description: 'Responsible waste management, dust and noise control, and pollution prevention.' },
  { icon: Users, title: 'Community Responsibility', description: 'Local employment, skills development, and respect for surrounding communities.' },
];

function AnimatedCounter({ value, suffix }: { value: string; suffix: string }) {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const target = parseInt(value, 10);
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
  const featuredProjects = projects.filter((p) => p.verified).slice(0, 6);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const filteredProjects =
    activeFilter === 'All'
      ? featuredProjects
      : featuredProjects.filter((p) => p.category === activeFilter);
  const availableFilters = projectCategories.filter((cat) =>
    cat === 'All' || featuredProjects.some((p) => p.category === cat)
  );

  return (
    <>
      <SEO
        title="Jobale Engineering PLC | Construction & Civil Engineering in Adama, Ethiopia"
        description="General construction and civil engineering company in Adama, Ethiopia. Building construction, civil infrastructure, water supply, renovation, and maintenance services."
        ogImage={heroImage}
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
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-dark/90 via-brand-navy/75 to-brand-navy/60" />
        </div>

        <div className="container-page relative py-20 lg:py-32">
          <div className="max-w-3xl">
            <p className="section-label text-brand-blue-light mb-6 animate-fade-in-down">
              <Factory className="w-4 h-4" />
              JOBALE ENGINEERING PLC | CONSTRUCTION & CIVIL WORKS
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-display-lg text-white font-heading font-extrabold tracking-tight leading-[1.05] text-balance animate-fade-in-up">
              Building with Precision.
              <br />
              Delivering with Confidence.
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-surface-steel max-w-2xl leading-relaxed text-pretty animate-fade-in-up">
              From building construction to civil infrastructure, Jobale Engineering delivers practical engineering solutions grounded in quality, safety, reliability, and lasting value.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4 animate-fade-in-up">
              <Link to="/projects" className="btn-primary group">
                Explore Our Projects
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/contact" className="btn-secondary">
                Discuss Your Project
              </Link>
            </div>
            <p className="mt-8 text-sm text-surface-steel/60 font-heading italic animate-fade-in">
              "{company.slogan}"
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
                Engineering Solutions Built Around Your Vision
              </h2>
              <div className="mt-6 space-y-4 text-ink leading-relaxed">
                <p>
                  Jobale Engineering PLC is a professionally managed general construction company engaged in building construction, civil works, renovation, maintenance, and related engineering services. Based in Adama, Oromia, Ethiopia, we serve clients across multiple regions.
                </p>
                <p>
                  We work with public institutions, private developers, commercial businesses, NGOs, and individual clients — bringing disciplined project management, quality workmanship, and a commitment to safety and durability to every engagement.
                </p>
                <p>
                  Our focus is on delivering construction that meets approved drawings and specifications, on time and on budget, with transparent communication and lasting value for our clients.
                </p>
              </div>
              <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-brand-blue font-heading font-semibold hover:gap-3 transition-all">
                Learn More About Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.pexels.com/photos/8961028/pexels-photo-8961028.jpeg?auto=compress&cs=tinysrgb&w=600&h=400"
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
                    src="https://images.pexels.com/photos/1311159/pexels-photo-1311159.jpeg?auto=compress&cs=tinysrgb&w=600&h=400"
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
            {stats.map((stat, i) => (
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
          <p className="mt-10 text-center text-xs text-surface-steel/50 max-w-2xl mx-auto">
          </p>
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
            {services.map((service) => {
              const Icon = service.icon;
              return (
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
                    <div className="absolute top-4 left-4 w-11 h-11 rounded-lg bg-white/95 flex items-center justify-center shadow-md">
                      <Icon className="w-5 h-5 text-brand-blue" />
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
              );
            })}

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
            {availableFilters.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all ${activeFilter === cat
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
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.slug}`}
                className="group card-base overflow-hidden hover:shadow-elevated hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
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

          {/* Desktop horizontal */}
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

          {/* Mobile vertical timeline */}
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

          <p className="mt-10 text-center text-xs text-ink-muted max-w-2xl mx-auto">
            Sector listings reflect the company's target client base. No organization's logo or endorsement is implied.
          </p>
        </div>
      </section>

      {/* Client testimonials */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="section-label justify-center mb-4">Client Feedback</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">Trusted Project Delivery</h2>
            <p className="mt-4 text-lg text-ink leading-relaxed">
              Approved client testimonials will be added here as soon as they are provided by the company.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {['Quality workmanship', 'Clear project communication', 'Reliable site coordination'].map((title) => (
              <div key={title} className="p-7 rounded-xl bg-surface-offwhite border border-surface-steel/60 text-center">
                <Quote className="w-8 h-8 text-brand-blue mx-auto mb-4" />
                <h3 className="text-base font-heading font-bold text-brand-navy">{title}</h3>
                <p className="mt-3 text-sm text-ink-light">Client testimonial pending approval.</p>
              </div>
            ))}
          </div>
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
