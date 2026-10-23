import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CmsProvider } from './context/CmsContext';

import ConstructionIntro from './components/ConstructionIntro';
import Layout from './components/Layout';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import QualitySafety from './pages/QualitySafety';
import Team from './pages/Team';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Admin pages and layout
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import SectionsManager from './pages/admin/SectionsManager';
import SiteSettingsEditor from './pages/admin/SiteSettingsEditor';
import HeroEditor from './pages/admin/HeroEditor';
import AboutEditor from './pages/admin/AboutEditor';
import ServicesManager from './pages/admin/ServicesManager';
import ProjectsManager from './pages/admin/ProjectsManager';
import ClientsManager from './pages/admin/ClientsManager';
import QualitySafetyEditor from './pages/admin/QualitySafetyEditor';
import TestimonialsManager from './pages/admin/TestimonialsManager';
import ContactEditor from './pages/admin/ContactEditor';
import NavigationFooterEditor from './pages/admin/NavigationFooterEditor';
import MediaLibraryPage from './pages/admin/MediaLibraryPage';
import SEOEditor from './pages/admin/SEOEditor';
import AccountSettings from './pages/admin/AccountSettings';

function App() {
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    // Never show the intro when accessing the administrative portal
    if (window.location.pathname.startsWith('/admin')) {
      return false;
    }
    try {
      return sessionStorage.getItem('jobale_intro_seen') !== 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleReplay = () => {
      try {
        sessionStorage.removeItem('jobale_intro_seen');
      } catch {
        // safe fallback
      }
      setShowIntro(true);
    };

    window.addEventListener('replay-jobale-intro', handleReplay);
    return () => window.removeEventListener('replay-jobale-intro', handleReplay);
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <CmsProvider>
          <AnimatePresence>
            {showIntro && (
              <ConstructionIntro onComplete={() => setShowIntro(false)} />
            )}
          </AnimatePresence>

          <BrowserRouter>
            <Routes>
              {/* Branded Admin Authentication */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Custom Admin CMS Control Center */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="sections" element={<SectionsManager />} />
                <Route path="settings" element={<SiteSettingsEditor />} />
                <Route path="hero" element={<HeroEditor />} />
                <Route path="about" element={<AboutEditor />} />
                <Route path="services" element={<ServicesManager />} />
                <Route path="projects" element={<ProjectsManager />} />
                <Route path="clients" element={<ClientsManager />} />
                <Route path="quality-safety" element={<QualitySafetyEditor />} />
                <Route path="testimonials" element={<TestimonialsManager />} />
                <Route path="contact" element={<ContactEditor />} />
                <Route path="navigation" element={<NavigationFooterEditor />} />
                <Route path="media" element={<MediaLibraryPage />} />
                <Route path="seo" element={<SEOEditor />} />
                <Route path="account" element={<AccountSettings />} />
              </Route>

              {/* Public Corporate Website */}
              <Route element={<Layout><Outlet /></Layout>}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:slug" element={<ServiceDetail />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:slug" element={<ProjectDetail />} />
                <Route path="/quality-safety" element={<QualitySafety />} />
                <Route path="/team" element={<Team />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CmsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
