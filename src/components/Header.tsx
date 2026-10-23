import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import Logo from './Logo';
import { company } from '@/data/company';
import { useCms } from '@/context/CmsContext';

const defaultNavLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Quality & Safety', to: '/quality-safety' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const { data, slogan, companyName, phone, email, city, region, country } = useCms();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Dynamic CMS navigation items or fallback
  const navLinks =
    data?.navigation && data.navigation.length > 0
      ? data.navigation
          .filter((item) => item.is_visible)
          .map((item) => ({ label: item.label, to: item.url }))
      : defaultNavLinks;

  const logoSrc = data?.site_settings?.logo || null;

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
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white dark:bg-brand-navy-dark shadow-md'
            : 'bg-white/95 dark:bg-brand-navy-dark/95 backdrop-blur-sm'
        }`}
      >
        {/* Top bar */}
        <div
          className={`bg-brand-navy text-surface-steel transition-all duration-300 ${
            scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'
          }`}
        >
          <div className="container-page flex items-center justify-between py-2 text-xs">
            <span className="font-heading font-medium tracking-wide hidden sm:inline">
              {slogan}
            </span>
            <span className="font-heading font-medium tracking-wide sm:hidden truncate max-w-[190px]">
              {companyName}
            </span>
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-brand-blue-light" />
              <span>{phone}</span>
            </a>
          </div>
        </div>

        {/* Main nav */}
        <div className="container-page">
          <div className="flex items-center justify-between h-20">
            <Link
              to="/"
              className="flex items-center shrink-0"
              aria-label={`${companyName} — Home`}
            >
              <Logo src={logoSrc} className="h-12 w-[150px] sm:w-[175px] rounded bg-white" />
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
      </header>

      {/* Mobile menu Portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[9998] lg:hidden"
                  onClick={() => setIsOpen(false)}
                  aria-hidden="true"
                />

                {/* Drawer */}
                <motion.nav
                  id="mobile-menu"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  className="fixed inset-y-0 right-0 w-80 max-w-[85vw] h-full h-dvh bg-white dark:bg-brand-navy-dark shadow-2xl z-[9999] lg:hidden overflow-y-auto flex flex-col justify-between"
                  aria-label="Mobile navigation"
                >
                  <div>
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between p-5 border-b border-surface-steel dark:border-brand-navy-light">
                      <Logo src={logoSrc} className="h-10 w-[140px] rounded bg-white" />
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg text-brand-navy dark:text-white hover:bg-surface-offwhite dark:hover:bg-brand-navy-light transition-colors"
                        aria-label="Close menu"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Nav Items */}
                    <div className="flex flex-col p-4 gap-1">
                      {navLinks.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          end={link.to === '/'}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }) =>
                            `px-4 py-3.5 rounded-lg text-base font-heading font-semibold transition-colors ${
                              isActive
                                ? 'text-brand-blue bg-brand-blue/5 dark:bg-brand-blue/15'
                                : 'text-ink dark:text-surface-steel hover:text-brand-blue hover:bg-surface-offwhite dark:hover:bg-brand-navy-light'
                            }`
                          }
                        >
                          {link.label}
                        </NavLink>
                      ))}

                      <Link
                        to="/contact"
                        onClick={() => setIsOpen(false)}
                        className="btn-primary mt-4 w-full text-center"
                      >
                        Discuss a Project
                      </Link>
                    </div>
                  </div>

                  {/* Drawer Footer */}
                  <div className="p-5 border-t border-surface-steel dark:border-brand-navy-light space-y-3 bg-surface-offwhite/50 dark:bg-brand-navy-light/30">
                    <a
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-sm text-ink dark:text-surface-steel hover:text-brand-blue transition-colors"
                    >
                      <Phone className="w-4 h-4 text-brand-blue" />
                      {phone}
                    </a>
                    <a
                      href={`mailto:${email}`}
                      className="block text-sm text-ink dark:text-surface-steel hover:text-brand-blue transition-colors"
                    >
                      {email}
                    </a>
                    <p className="text-xs text-ink-light dark:text-surface-steel-dark">
                      {city}, {region}, {country}
                    </p>
                  </div>
                </motion.nav>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
