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

import { useCms } from '@/context/CmsContext';
import { resolveLucideIcon } from '@/lib/icons';
import { mediaUrl } from '@/lib/api';

const defaultQualityAssurance: Commitment = {
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

const defaultHealthSafety: Commitment = {
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

const defaultEnvironmental: Commitment = {
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

const defaultCommunity: Commitment = {
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

const defaultCommitments = [defaultQualityAssurance, defaultHealthSafety, defaultEnvironmental, defaultCommunity];

export default function QualitySafety() {
  const { data, companyName } = useCms();
  const qs = data?.quality_safety;
  const verifiedStandards = data?.quality_standards || [];

  const commitments: Commitment[] = (qs?.commitments && qs.commitments.length > 0)
    ? qs.commitments.map((c: any) => {
        let points: string[] = [];
        if (Array.isArray(c.points) && c.points.length > 0) {
          points = c.points;
        } else if (c.description) {
          if (c.description.includes('\n')) {
            points = c.description.split('\n').map((s: string) => s.trim()).filter(Boolean);
          } else if (c.description.includes(';')) {
            points = c.description.split(';').map((s: string) => s.trim()).filter(Boolean);
          }
        }

        const titleLower = (c.title || '').toLowerCase();
        if (points.length <= 1) {
          if (titleLower.includes('quality') && qs?.quality_assurance) {
            points = qs.quality_assurance.split(/(?<=\.)\s+/).map((s) => s.trim()).filter(Boolean);
          } else if (titleLower.includes('safety') && qs?.safety_practices) {
            points = qs.safety_practices.split(/(?<=\.)\s+/).map((s) => s.trim()).filter(Boolean);
          } else if (titleLower.includes('environment') && qs?.environmental_practices) {
            points = qs.environmental_practices.split(/(?<=\.)\s+/).map((s) => s.trim()).filter(Boolean);
          }
        }

        if (points.length <= 1) {
          const defaultMatch = defaultCommitments.find(
            (d) => d.title.toLowerCase().includes(titleLower) || titleLower.includes(d.title.toLowerCase())
          );
          if (defaultMatch && defaultMatch.points.length > 0) {
            points = defaultMatch.points;
          }
        }

        return {
          icon: resolveLucideIcon(c.icon, ShieldCheck),
          title: c.title,
          points: points.length > 0 ? points : (c.description ? [c.description] : []),
        };
      })
    : defaultCommitments;

  const heroImg = mediaUrl(qs?.hero_image) || "https://images.pexels.com/photos/38043248/pexels-photo-38043248.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600";

  return (
    <>
      <SEO
        title={`Quality, Safety & Sustainability | ${companyName}`}
        description={qs?.introduction || "Our commitments to quality assurance, health and safety, environmental responsibility, and community engagement on every construction project."}
        ogImage={heroImg}
      />

      <PageHeader
        label="Our Commitments"
        title={qs?.heading || "Quality, Safety & Sustainability"}
        description={qs?.introduction || "We treat quality, safety, environmental responsibility, and community engagement as core project commitments — embedded in how we plan, execute, and close out every project."}
        image={heroImg}
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
              {qs?.quality_assurance ? (
                <p className="whitespace-pre-line">{qs.quality_assurance}</p>
              ) : (
                <>
                  <p>
                    Quality, safety, and sustainability are not add-ons to our construction process — they are part of how we work on every project. From the first site assessment to final handover, we follow systematic commitments designed to protect our clients, our workers, the public, and the environment.
                  </p>
                  <p>
                    The policies below describe how our team approaches quality, safety, environmental responsibility, and community engagement on every project.
                  </p>
                </>
              )}
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

      {/* Verified Certifications & Credentials if verified by owner */}
      {verifiedStandards.length > 0 && (
        <section className="py-20 bg-surface-offwhite">
          <div className="container-page">
            <div className="max-w-2xl mb-12">
              <p className="section-label mb-4">Credentials & Standards</p>
              <h2 className="text-3xl font-heading font-extrabold text-brand-navy">
                Verified Standards & Certifications
              </h2>
              <p className="mt-3 text-ink">
                Official certifications, quality accreditations, and regulatory compliance standards verified by Jobale Engineering PLC.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verifiedStandards.map((std) => (
                <div key={std.id} className="p-6 rounded-xl bg-white border border-surface-steel/50 shadow-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div>
                      <h3 className="text-base font-heading font-bold text-brand-navy">{std.name}</h3>
                      <p className="text-xs text-ink-muted">{std.issuing_body}</p>
                    </div>
                  </div>
                  {std.certificate_number && (
                    <p className="text-xs text-ink-light mb-2">
                      <span className="font-semibold text-brand-navy">Cert No:</span> {std.certificate_number}
                    </p>
                  )}
                  {std.description && (
                    <p className="text-sm text-ink leading-relaxed line-clamp-3">{std.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
