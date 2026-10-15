import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { company } from '@/data/company';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Quality & Safety', to: '/quality-safety' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white dark:bg-brand-navy-dark shadow-md'
          : 'bg-white/95 dark:bg-brand-navy-dark/95 backdrop-blur-sm'
      }`}
    >
      {/* Top bar */}
      <div className={`bg-brand-navy text-surface-steel transition-all duration-300 ${scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'}`}>
        <div className="container-page flex items-center justify-between py-2 text-xs">
          <span className="font-heading font-medium tracking-wide">
            {company.slogan}
          </span>
          <a
            href={`tel:${company.phone.replace(/\s/g, '')}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            {company.phone}
          </a>
        </div>
      </div>

      {/* Main nav */}
      <div className="container-page">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center shrink-0" aria-label="Jobale Engineering PLC — Home">
            <Logo className="h-12 w-[150px] sm:w-[175px] rounded bg-white" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-brand-blue bg-brand-blue/5'
                      : 'text-ink hover:text-brand-blue hover:bg-surface-offwhite'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to="/contact" className="hidden sm:inline-flex btn-primary !py-2.5 !px-5">
              Discuss a Project
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-brand-navy dark:text-white hover:bg-surface-offwhite dark:hover:bg-brand-navy-light transition-colors"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-brand-navy/55 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <nav
            id="mobile-menu"
            className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white dark:bg-brand-navy-dark shadow-2xl z-[70] lg:hidden animate-fade-in overflow-y-auto"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between p-5 border-b border-surface-steel">
              <Logo className="h-10 w-[140px] rounded bg-white" />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-brand-navy dark:text-white hover:bg-surface-offwhite dark:hover:bg-brand-navy-light"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col p-4 gap-1">
              <div className="flex items-center justify-between px-4 py-2 mb-2 rounded-lg bg-surface-offwhite dark:bg-brand-navy-light">
                <span className="text-sm font-heading font-semibold text-brand-navy dark:text-white">Appearance</span>
                <ThemeToggle />
              </div>
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-3.5 rounded-lg text-base font-heading font-semibold transition-colors ${
                      isActive
                        ? 'text-brand-blue bg-brand-blue/5'
                        : 'text-ink hover:text-brand-blue hover:bg-surface-offwhite'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link to="/contact" className="btn-primary mt-4 w-full">
                Discuss a Project
              </Link>
              <div className="mt-6 pt-6 border-t border-surface-steel space-y-3">
                <a
                  href={`tel:${company.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-sm text-ink"
                >
                  <Phone className="w-4 h-4 text-brand-blue" />
                  {company.phone}
                </a>
                <a
                  href={`mailto:${company.email}`}
                  className="block text-sm text-ink"
                >
                  {company.email}
                </a>
                <p className="text-sm text-ink-light">
                  {company.city}, {company.region}, {company.country}
                </p>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
