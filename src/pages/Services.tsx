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

  // Use dynamic published services from CMS if available, otherwise default
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
        title={`Services | ${companyName}`}
        description="Building construction, civil infrastructure, finishing and fit-out, building services (MEP), and renovation and maintenance services from Jobale Engineering PLC."
        ogImage="https://images.pexels.com/photos/4390530/pexels-photo-4390530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
      />

      <PageHeader
        label="Our Services"
        title="Construction & Engineering Services"
        description="From building construction to civil infrastructure, finishing, MEP, and renovation — we deliver integrated construction services with experienced supervision and systematic quality control."
        image="https://images.pexels.com/photos/4390530/pexels-photo-4390530.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
      />

      <section className="py-20 lg:py-28 bg-white">
        <div className="container-page">
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
                      alt={service.title}
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
                      Service {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2 className="mt-2 text-2xl lg:text-3xl font-heading font-extrabold text-brand-navy">
                      {service.title}
                    </h2>
                    <p className="mt-4 text-ink leading-relaxed">{service.summary}</p>
                    <ul className="mt-5 grid sm:grid-cols-2 gap-2">
                      {service.scope.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-ink">
                          <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/services/${service.slug}`}
                      className="mt-7 inline-flex items-center gap-2 text-brand-blue font-heading font-semibold hover:gap-3 transition-all"
                    >
                      Explore {service.shortName}
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
        title="Need a Service Not Listed Here?"
        description="Tell us about your project requirements. We'll assess whether we can deliver directly or recommend an appropriate approach."
        primaryCTA={{ label: 'Discuss Your Project', to: '/contact' }}
        secondaryCTA={{ label: 'View Our Projects', to: '/projects' }}
      />
    </>
  );
}
