import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { services as defaultServices } from '@/data/services';
import { useCms } from '@/context/CmsContext';
import { resolveLucideIcon } from '@/lib/icons';
import { mediaUrl } from '@/lib/api';

export default function Services() {
  const { data, companyName } = useCms();
  const apiServices = data?.services;

  // Use dynamic published services from CMS if available, otherwise fallback to comprehensive defaultServices
  const servicesList = (apiServices && apiServices.length > 0)
    ? apiServices.map((s) => ({
        slug: s.slug,
        title: s.title,
        shortName: s.short_name || s.title,
        summary: s.summary,
        scope: s.scope || [],
        image: mediaUrl(s.image) || 'https://images.pexels.com/photos/4390530/pexels-photo-4390530.jpeg?auto=compress&cs=tinysrgb&w=600&h=500',
        icon: resolveLucideIcon(s.icon, Building2),
      }))
    : defaultServices.map((s) => ({
        ...s,
        image: mediaUrl(s.image) || 'https://images.pexels.com/photos/4390530/pexels-photo-4390530.jpeg?auto=compress&cs=tinysrgb&w=600&h=500',
      }));

  return (
    <>
      <SEO
        title={`Construction & Engineering Services | ${companyName}`}
        description="Explore comprehensive engineering services from Jobale Engineering PLC: general contracting, civil engineering, building construction, steel structure, and water works across Ethiopia."
        canonical="/services"
        keywords="construction services, civil engineering services, general contractor services, steel structure engineering, water works construction Ethiopia, Jobale Engineering services"
        ogImage="https://images.pexels.com/photos/4390530/pexels-photo-4390530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Services', item: '/services' },
        ]}
      />

      <PageHeader
        label="Engineering Solutions"
        title="Construction & Engineering Services"
        description="From building construction and heavy civil works to steel structures, turnkey general contracting, and water infrastructure — Jobale Engineering PLC provides disciplined supervision and quality engineering throughout Ethiopia."
        image="https://images.pexels.com/photos/4390530/pexels-photo-4390530.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
      />

      <section className="py-20 lg:py-28 bg-white">
        <div className="container-page">
          <div className="max-w-3xl mb-16">
            <p className="section-label mb-3">Our Core Capabilities</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-brand-navy">
              Delivering Engineering Excellence Across Core Disciplines
            </h2>
            <p className="mt-4 text-ink leading-relaxed">
              We provide integrated, specification-compliant engineering services for institutional, commercial, industrial, and community clients. Explore each specialized service division below:
            </p>
          </div>

          <div className="space-y-16">
            {servicesList.map((service, i) => {
              const Icon = service.icon;
              const isReversed = i % 2 === 1;
              return (
                <div
                  key={service.slug}
                  className={`grid lg:grid-cols-2 gap-10 lg:gap-14 items-center ${isReversed ? 'lg:[&>*:first-child]:order-2' : ''}`}
                >
                  <div className="relative">
                    <img
                      src={service.image}
                      alt={`Jobale Engineering PLC - ${service.title}`}
                      className="w-full h-72 lg:h-80 object-cover rounded-2xl shadow-card"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.pexels.com/photos/4390530/pexels-photo-4390530.jpeg?auto=compress&cs=tinysrgb&w=600&h=500';
                      }}
                    />
                    <div className="absolute -bottom-5 -left-2 lg:-left-5 w-16 h-16 rounded-xl bg-brand-blue flex items-center justify-center shadow-elevated">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-heading font-bold uppercase tracking-widest text-brand-blue">
                      Capability {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2 className="mt-2 text-2xl lg:text-3xl font-heading font-extrabold text-brand-navy">
                      {service.title}
                    </h2>
                    <p className="mt-4 text-ink leading-relaxed">{service.summary}</p>
                    <ul className="mt-5 grid sm:grid-cols-2 gap-2">
                      {service.scope.slice(0, 4).map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-ink">
                          <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/services/${service.slug}`}
                      className="mt-7 inline-flex items-center gap-2 text-brand-blue font-heading font-semibold hover:gap-3 transition-all"
                    >
                      Explore {service.shortName} Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection
        title="Need Engineering Support for an Upcoming Project?"
        description="Connect with Jobale Engineering PLC in Adama, Ethiopia to discuss your technical drawings, bill of quantities (BOQ), and project schedule."
        primaryCTA={{ label: 'Discuss Your Project', to: '/contact' }}
        secondaryCTA={{ label: 'View Our Projects', to: '/projects' }}
      />
    </>
  );
}
