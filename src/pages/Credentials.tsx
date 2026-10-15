import {
  FileText,
  ShieldCheck,
  Award,
  FileBadge,
  Receipt,
  ScrollText,
  Download,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { credentials, verificationList } from '@/data/company';

const categoryIcons: LucideIcon[] = [
  FileText,
  Award,
  FileBadge,
  Receipt,
  ScrollText,
  ShieldCheck,
];

export default function Credentials() {
  return (
    <>
      <SEO
        title="Company Credentials | Jobale Engineering PLC"
        description="Company credentials and registrations for Jobale Engineering PLC — business registration, contractor certificates, trade licenses, TIN/VAT, and company policies."
        ogImage="https://images.pexels.com/photos/8469982/pexels-photo-8469982.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
      />

      <PageHeader
        label="Credentials"
        title="Company Credentials & Documentation"
        description="A formal summary of our business registration, contractor certifications, trade licenses, tax registrations, and company policies. Documents will be made available for download once verified and approved for publication."
        image="https://images.pexels.com/photos/8469982/pexels-photo-8469982.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Credentials' }]}
      />

      {/* Credential categories */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="section-label mb-4">Documented Credentials</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-balance">
              Registrations, Certifications & Policies
            </h2>
            <p className="mt-4 text-lg text-ink leading-relaxed">
              The following credential categories reflect the standard documentation expected of a registered construction company in Ethiopia. Each item will be published with supporting documentation once verified and approved.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {credentials.map((category, i) => {
              const Icon = categoryIcons[i] ?? FileText;
              return (
                <div
                  key={i}
                  className="p-7 rounded-xl bg-surface-offwhite border border-surface-steel/60 hover:shadow-card transition-all"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-lg bg-brand-navy flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-brand-navy">{category.category}</h3>
                  </div>
                  <ul className="space-y-3">
                    {category.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3">
                        {item.available ? (
                          <a
                            href="#"
                            className="flex items-center gap-2 text-sm text-brand-blue font-heading font-semibold hover:underline"
                          >
                            <Download className="w-4 h-4 shrink-0" />
                            {item.name}
                          </a>
                        ) : (
                          <div className="flex items-start gap-3 w-full">
                            <div className="w-5 h-5 rounded-full bg-ink-muted/20 flex items-center justify-center shrink-0 mt-0.5">
                              <AlertCircle className="w-3 h-3 text-ink-muted" />
                            </div>
                            <div>
                              <p className="text-sm text-ink font-medium">{item.name}</p>
                              <p className="text-xs text-ink-muted mt-0.5">{item.note}</p>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Important notice */}
          <div className="mt-12 p-6 rounded-xl bg-brand-navy/5 border border-brand-navy/15 max-w-3xl">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading font-bold text-brand-navy mb-2">Important Note</h3>
                <p className="text-sm text-ink leading-relaxed">
                  The company profile contains placeholders and inconsistent contractor-grade information. License numbers, registration numbers, and certificate details will be published only after verification with the relevant authorities and client approval. No credentials have been fabricated or invented for this page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification list */}
      <section className="py-16 bg-surface-offwhite border-t border-surface-steel/40">
        <div className="container-page">
          <div className="max-w-3xl">
            <h2 className="text-xl font-heading font-bold text-brand-navy mb-4">
              Information Requiring Verification
            </h2>
            <p className="text-sm text-ink mb-4">
              The following items from the company profile require verification before publication as confirmed fact:
            </p>
            <ul className="space-y-2">
              {verificationList.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5 shrink-0" />
                  <span><strong className="text-ink">{item.item}</strong> — {item.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CTASection
        title="Need Our Credentials for a Tender or Proposal?"
        description="Contact our team to request verified documentation for procurement, pre-qualification, or proposal submissions."
        primaryCTA={{ label: 'Contact Our Team', to: '/contact' }}
        secondaryCTA={{ label: 'Learn About Us', to: '/about' }}
      />
    </>
  );
}
