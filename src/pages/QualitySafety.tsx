import {
  ShieldCheck,
  HardHat,
  Leaf,
  Users,
  CheckCircle2,
  ClipboardCheck,
  AlertTriangle,
  Wrench,
  Eye,
  Trash2,
  Droplets,
  Volume2,
  Recycle,
  Sprout,
  Handshake,
  Scale,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';

interface Commitment {
  icon: LucideIcon;
  title: string;
  points: string[];
}

const qualityAssurance: Commitment = {
  icon: ClipboardCheck,
  title: 'Quality Assurance',
  points: [
    'Compliance with project drawings, specifications, and applicable standards',
    'Material checks on delivery and before use',
    'Stage-by-stage inspections throughout construction',
    'Testing of materials, installations, and completed works',
    'Corrective actions when inspections identify non-conformances',
    'Final handover inspections before project sign-off',
  ],
};

const healthSafety: Commitment = {
  icon: HardHat,
  title: 'Health & Safety',
  points: [
    'Risk assessments before commencing site activities',
    'Personal protective equipment (PPE) provided and enforced',
    'Worker training and site safety briefings',
    'Safe site operations and signage',
    'Emergency procedures and first-aid readiness',
    'Ongoing safety monitoring throughout the project',
  ],
};

const environmental: Commitment = {
  icon: Leaf,
  title: 'Environmental Responsibility',
  points: [
    'Responsible waste disposal and segregation',
    'Dust and noise control measures',
    'Pollution prevention on and around sites',
    'Efficient use of water and energy',
    'Responsible sourcing of materials',
    'Site restoration upon project completion',
  ],
};

const community: Commitment = {
  icon: Users,
  title: 'Community Responsibility',
  points: [
    'Local employment opportunities on projects',
    'Skills development and on-site training',
    'Support for local suppliers and service providers',
    'Respect for local communities and customs',
    'Fair labour practices',
    'Minimising disruption to surrounding areas',
  ],
};

const commitments = [qualityAssurance, healthSafety, environmental, community];

export default function QualitySafety() {
  return (
    <>
      <SEO
        title="Quality, Safety & Sustainability | Jobale Engineering PLC"
        description="Our commitments to quality assurance, health and safety, environmental responsibility, and community engagement on every construction project."
        ogImage="https://images.pexels.com/photos/38043248/pexels-photo-38043248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
      />

      <PageHeader
        label="Our Commitments"
        title="Quality, Safety & Sustainability"
        description="We treat quality, safety, environmental responsibility, and community engagement as core project commitments — embedded in how we plan, execute, and close out every project."
        image="https://images.pexels.com/photos/38043248/pexels-photo-38043248.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Quality & Safety' }]}
      />

      {/* Introduction */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="section-label mb-4">Our Approach</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold mb-6 text-balance">
              Building Right, Building Safe, Building Responsibly
            </h2>
            <div className="space-y-4 text-ink leading-relaxed">
              <p>
                Quality, safety, and sustainability are not add-ons to our construction process — they are part of how we work on every project. From the first site assessment to final handover, we follow systematic commitments designed to protect our clients, our workers, the public, and the environment.
              </p>
              <p>
                The policies below describe how our team approaches quality, safety, environmental responsibility, and community engagement on every project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Four commitment sections */}
      <section className="py-12 lg:py-16 bg-surface-offwhite space-y-12 lg:space-y-16">
        {commitments.map((commitment, i) => {
          const Icon = commitment.icon;
          const isDark = i % 2 === 1;
          return (
            <div key={i} className={isDark ? 'bg-white py-16 lg:py-20' : ''}>
              <div className="container-page">
                <div className="grid lg:grid-cols-3 gap-10">
                  {/* Header column */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-28">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${isDark ? 'bg-brand-blue/10' : 'bg-brand-navy'}`}>
                        <Icon className={`w-7 h-7 ${isDark ? 'text-brand-blue' : 'text-white'}`} />
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-brand-navy">
                        {commitment.title}
                      </h2>
                      <div className={`mt-4 h-1 w-16 rounded-full ${isDark ? 'bg-brand-blue' : 'bg-brand-blue-light'}`} />
                    </div>
                  </div>

                  {/* Points */}
                  <div className="lg:col-span-2">
                    <ul className="grid sm:grid-cols-2 gap-4">
                      {commitment.points.map((point, j) => (
                        <li
                          key={j}
                          className={`flex items-start gap-3 p-5 rounded-xl ${isDark ? 'bg-surface-offwhite' : 'bg-white'} border border-surface-steel/40`}
                        >
                          <CheckCircle2 className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                          <span className="text-sm text-ink font-medium leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Key icons strip */}
      <section className="py-16 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="container-page relative">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {[
              { icon: Eye, label: 'Inspections' },
              { icon: AlertTriangle, label: 'Risk Assessments' },
              { icon: Wrench, label: 'Material Checks' },
              { icon: HardHat, label: 'PPE Enforced' },
              { icon: Droplets, label: 'Water Efficiency' },
              { icon: Volume2, label: 'Noise Control' },
              { icon: Recycle, label: 'Waste Management' },
              { icon: Sprout, label: 'Site Restoration' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-brand-blue-light" />
                  </div>
                  <span className="text-xs font-heading font-semibold text-surface-steel">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Policy statement */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container-page">
          <div className="max-w-3xl mx-auto text-center">
            <Scale className="w-12 h-12 text-brand-blue mx-auto mb-6" />
            <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-brand-navy mb-6 text-balance">
              Our Policy Commitment
            </h2>
            <p className="text-lg text-ink leading-relaxed">
              Jobale Engineering PLC is committed to delivering construction that meets approved standards, protecting the health and safety of our workers and the public, minimising our environmental impact, and contributing positively to the communities where we work. These commitments apply on every project, regardless of size or sector.
            </p>
            <div className="mt-10 flex justify-center">
              <a href="/contact" className="btn-primary">
                Discuss Your Project
              </a>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Quality and Safety Start with a Conversation"
        description="Discuss your project requirements, quality standards, and safety expectations with our team."
        primaryCTA={{ label: 'Contact Our Team', to: '/contact' }}
        secondaryCTA={{ label: 'View Our Projects', to: '/projects' }}
      />
    </>
  );
}
