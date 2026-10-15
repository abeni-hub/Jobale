import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Globe, RotateCcw } from 'lucide-react';
import Logo from './Logo';
import { company } from '@/data/company';
import { services } from '@/data/services';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy-dark text-surface-steel">
      <div className="container-page pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo className="h-14 w-[180px] rounded bg-white mb-4" theme="dark" />
            <p className="text-sm leading-relaxed text-surface-steel/80 max-w-xs">
              {company.slogan}
            </p>
            <p className="mt-4 text-sm text-surface-steel/70 max-w-xs">
              General construction and civil engineering company based in {company.city}, {company.region}, {company.country}.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-white mb-5">
              Navigation
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/about' },
                { label: 'Services', to: '/services' },
                { label: 'Projects', to: '/projects' },
                { label: 'Quality & Safety', to: '/quality-safety' },
                { label: 'Our Team', to: '/team' },
                { label: 'Contact', to: '/contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-surface-steel/80 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-white mb-5">
              Services
            </h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/services/${service.slug}`}
                    className="text-sm text-surface-steel/80 hover:text-white transition-colors"
                  >
                    {service.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-white mb-5">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${company.phone.replace(/\s/g, '')}`}
                  className="flex items-start gap-3 text-sm text-surface-steel/80 hover:text-white transition-colors group"
                >
                  <Phone className="w-4 h-4 mt-0.5 text-brand-blue-light shrink-0" />
                  <span>{company.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-start gap-3 text-sm text-surface-steel/80 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 mt-0.5 text-brand-blue-light shrink-0" />
                  <span>{company.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-surface-steel/80">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-blue-light shrink-0" />
                <span>{company.city}, {company.region}, {company.country}</span>
              </li>
              {company.website && (
                <li className="flex items-start gap-3 text-sm text-surface-steel/80">
                  <Globe className="w-4 h-4 mt-0.5 text-brand-blue-light shrink-0" />
                  <span>{company.website}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-steel/60 text-center sm:text-left">
            &copy; {year} {company.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('replay-jobale-intro'));
              }}
              className="text-xs text-surface-steel/60 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-brand-blue rounded px-1 cursor-pointer"
              title="Replay Architectural Blueprint Intro"
            >
              <RotateCcw className="w-3 h-3 text-brand-blue-light" />
              <span>Replay Intro</span>
            </button>
            <span className="text-xs text-surface-steel/60">Privacy Policy</span>
            <span className="text-xs text-surface-steel/60">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
