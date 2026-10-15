import { Link } from 'react-router-dom';
import {
  Target,
  Eye,
  Handshake,
  ShieldCheck,
  Award,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { company } from '@/data/company';

const coreValues: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: ShieldCheck, title: 'Quality', description: 'We deliver construction that meets approved drawings, specifications, and applicable standards — inspected at every stage.' },
  { icon: Award, title: 'Integrity', description: 'We communicate transparently, honour our commitments, and build trust through honest project relationships.' },
  { icon: Clock, title: 'Reliability', description: 'We manage schedules and budgets with discipline, flagging issues early and delivering on our undertakings.' },
  { icon: Handshake, title: 'Client Focus', description: 'We work around the client\'s vision, requirements, and constraints — keeping them informed at every stage.' },
  { icon: TrendingUp, title: 'Continuous Improvement', description: 'We review each project for lessons learned and apply them to improve our processes and outcomes.' },
  { icon: Target, title: 'Safety', description: 'We protect our workers, the public, and the environment through systematic safety practices on every site.' },
];

export default function About() {
  return (
    <>
      <SEO
        title="About Us | Jobale Engineering PLC"
        description="Learn about Jobale Engineering PLC — a general construction and civil engineering company based in Adama, Ethiopia. Our history, vision, mission, and core values."
        ogImage="https://images.pexels.com/photos/8961028/pexels-photo-8961028.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
      />

      <PageHeader
        label="About Our Company"
        title="A Construction Company Built on Engineering Discipline and Trust"
        description="Jobale Engineering PLC is a general construction and civil engineering company serving institutions, businesses, and communities across Ethiopia."
        image="https://images.pexels.com/photos/8961028/pexels-photo-8961028.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About Us' }]}
      />

      {/* Company introduction */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="section-label mb-4">Company Introduction</p>
              <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">
                Professionally Managed Construction & Engineering
              </h2>
              <div className="mt-6 space-y-4 text-ink leading-relaxed">
                <p>
                  Jobale Engineering PLC is a professionally managed general construction company engaged in building construction, civil works, renovation, maintenance, and related engineering services. We are based in {company.city}, {company.region}, {company.country}.
                </p>
                <p>
                  Our company serves government institutions, public procurement departments, NGOs, international organizations, real estate developers, private businesses, consultants, and individual clients. We bring disciplined project management, experienced site supervision, and a systematic approach to quality and safety to every engagement.
                </p>
                <p>
                  We are committed to delivering construction that meets approved drawings and specifications, on schedule and on budget, with workmanship and materials that stand the test of time.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/19895874/pexels-photo-19895874.jpeg?auto=compress&cs=tinysrgb&w=600&h=500"
                alt="Construction workers in safety gear collaborating on a project"
                className="w-full h-64 object-cover rounded-xl shadow-card"
                loading="lazy"
              />
              <img
                src="https://images.pexels.com/photos/8961146/pexels-photo-8961146.jpeg?auto=compress&cs=tinysrgb&w=600&h=500"
                alt="Engineers discussing blueprints at a construction site"
                className="w-full h-64 object-cover rounded-xl shadow-card mt-8"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* History & Background */}
      <section className="py-20 bg-surface-offwhite">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="section-label mb-4">History & Background</p>
            <h2 className="text-3xl font-heading font-extrabold mb-6 text-balance">
              Building Experience Across Ethiopia
            </h2>
            <div className="space-y-4 text-ink leading-relaxed">
              <p>
                Jobale Engineering PLC has undertaken construction and civil engineering projects across multiple regions of Ethiopia, working on building construction, civil infrastructure, water supply and sanitation, and rehabilitation projects for industrial clients, communities, and public facilities.
              </p>
              <p>
                Our project experience includes works at industrial facilities such as Lemi National Cement and Dangote Cement Factory, community water supply projects in Sekota, Woldia, Negele, Shire, and Asayita, and healthcare facility rehabilitation works — demonstrating our range across sectors and project types.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 lg:p-10 rounded-2xl bg-brand-navy text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-10" />
              <div className="relative">
                <Eye className="w-10 h-10 text-brand-blue-light mb-5" />
                <h3 className="text-xl font-heading font-bold text-white uppercase tracking-wide">Vision</h3>
                <p className="mt-4 text-lg text-surface-steel leading-relaxed">
                  To be a trusted and respected construction and engineering company in Ethiopia — recognised for quality workmanship, safe practices, and projects that deliver lasting value to our clients and communities.
                </p>
              </div>
            </div>
            <div className="p-8 lg:p-10 rounded-2xl bg-surface-offwhite border border-surface-steel/60 relative overflow-hidden">
              <Target className="w-10 h-10 text-brand-blue mb-5" />
              <h3 className="text-xl font-heading font-bold text-brand-navy uppercase tracking-wide">Mission</h3>
              <p className="mt-4 text-lg text-ink leading-relaxed">
                To deliver practical engineering and construction solutions that meet client requirements, comply with approved standards, and are executed with discipline, safety, and transparency — building long-term client relationships through reliable performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 lg:py-24 bg-surface-offwhite">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="section-label justify-center mb-4">Our Principles</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">Core Values</h2>
            <p className="mt-4 text-lg text-ink">The principles that guide our work on every project.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className="p-7 rounded-xl bg-white border border-surface-steel/50 hover:shadow-card transition-all">
                  <div className="w-12 h-12 rounded-lg bg-brand-blue/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-brand-blue" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-brand-navy">{value.title}</h3>
                  <p className="mt-3 text-sm text-ink leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Management Message */}
      <section className="py-20 bg-white">
        <div className="container-page">
          <div className="max-w-3xl mx-auto">
            <p className="section-label mb-4">Management Message</p>
            <h2 className="text-3xl font-heading font-extrabold mb-6 text-balance">
              From the General Manager
            </h2>
            <div className="p-8 lg:p-10 rounded-2xl bg-surface-offwhite border border-surface-steel/60">
              <blockquote className="text-lg text-ink leading-relaxed italic">
                "At Jobale Engineering, we believe that every construction project is a commitment — to our clients, to the people who use what we build, and to the communities around our sites. We take that commitment seriously, managing each project with discipline, inspecting our work at every stage, and maintaining the safety and environmental standards that our profession demands. Our goal is simple: to deliver construction that is built right, delivered on time, and trusted to last."
              </blockquote>
              <div className="mt-6 pt-6 border-t border-surface-steel/50">
                <p className="font-heading font-bold text-brand-navy">Eyob Hibret</p>
                <p className="text-sm text-ink-light">General Manager, Jobale Engineering PLC</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              This management message is drafted for review and must be approved before publication under the named manager.
            </p>
          </div>
        </div>
      </section>

      {/* Organizational Structure */}
      <section className="py-20 bg-white">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="section-label mb-4">Organizational Structure</p>
            <h2 className="text-3xl font-heading font-extrabold mb-6 text-balance">
              How We Are Organized
            </h2>
            <div className="space-y-4 text-ink leading-relaxed">
              <p>
                Jobale Engineering PLC is managed by a General Manager with oversight of project management, site engineering, finance, and site operations. Our organizational structure is designed to ensure clear lines of responsibility on every project.
              </p>
            </div>
            <div className="mt-8 p-6 rounded-xl bg-surface-offwhite border border-surface-steel/60">
              <ul className="space-y-3">
                {[
                  'General Manager — overall leadership and client engagement',
                  'Project Management — planning, scheduling, and project coordination',
                  'Site Engineering — technical supervision and quality control',
                  'Finance — financial management and accounting',
                  'Site Operations — foremen and skilled construction teams',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-ink">
                    <CheckCircle2 className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/team" className="mt-8 inline-flex items-center gap-2 text-brand-blue font-heading font-semibold hover:gap-3 transition-all">
              Meet Our Team
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Discuss Your Project?"
        description="Whether it's a building, civil infrastructure, water supply, or renovation project — our team is ready to help."
        primaryCTA={{ label: 'Discuss Your Project', to: '/contact' }}
        secondaryCTA={{ label: 'View Our Services', to: '/services' }}
      />
    </>
  );
}
