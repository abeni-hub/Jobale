import { Link } from 'react-router-dom';
import { UserCircle2, ArrowRight, Mail, Phone } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { publishedTeamMembers } from '@/data/team';
import { company } from '@/data/company';

export default function Team() {
  return (
    <>
      <SEO
        title="Our Team | Jobale Engineering PLC"
        description="Meet the management and personnel behind Jobale Engineering PLC — our general management, project management, engineering, finance, and site operations teams."
        ogImage="https://images.pexels.com/photos/30719069/pexels-photo-30719069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
      />

      <PageHeader
        label="Our People"
        title="The Team Behind Our Projects"
        description="Our team brings experience across project management, site engineering, finance, and site operations — working together to deliver construction that meets client requirements."
        image="https://images.pexels.com/photos/30719069/pexels-photo-30719069.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Our Team' }]}
      />

      <section className="py-20 lg:py-24 bg-white">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="section-label mb-4">Management & Personnel</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">
              Experienced Leadership and Dedicated Teams
            </h2>
            <p className="mt-4 text-lg text-ink leading-relaxed">
              Our organizational structure ensures clear lines of responsibility on every project — from general management through site operations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {publishedTeamMembers.map((member, i) => (
              <div
                key={i}
                className="card-base p-6 text-center hover:shadow-card-hover transition-all"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-blue to-brand-navy flex items-center justify-center">
                  <UserCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-heading font-bold text-brand-navy">{member.name}</h3>
                <p className="mt-1 text-sm font-heading font-semibold text-brand-blue">{member.role}</p>
                {member.qualifications && (
                  <p className="mt-2 text-xs text-ink-light">{member.qualifications}</p>
                )}
                {member.note && (
                  <p className="mt-3 text-xs text-ink-muted italic">{member.note}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-xl bg-surface-offwhite border border-surface-steel/50 max-w-3xl">
            <h3 className="text-sm font-heading font-bold text-brand-navy mb-3">
              About Our Team Page
            </h3>
            <ul className="space-y-2 text-sm text-ink-light">
              <li>Staff photographs will replace the current placeholders once approved photographs are supplied.</li>
              <li>Job titles and qualification-to-person mappings require confirmation before publication.</li>
              <li>Additional team member profiles can be added as they are approved for publication.</li>
              <li>Profiles can be hidden from publication without removal from the system.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact prompt */}
      <section className="py-16 bg-surface-offwhite">
        <div className="container-page">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-heading font-extrabold text-brand-navy mb-4">
              Want to Speak with Our Team?
            </h2>
            <p className="text-ink mb-8">
              Reach out directly to discuss your project requirements.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="btn-primary">
                <Phone className="w-4 h-4" />
                {company.phone}
              </a>
              <a href={`mailto:${company.email}`} className="btn-outline">
                <Mail className="w-4 h-4" />
                {company.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Build with a Team You Can Trust"
        description="Our experienced team is ready to deliver your next construction or civil engineering project."
        primaryCTA={{ label: 'Discuss Your Project', to: '/contact' }}
        secondaryCTA={{ label: 'View Our Services', to: '/services' }}
      />
    </>
  );
}
