import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ConstructionIntro from './components/ConstructionIntro';
import Layout from './components/Layout';
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

function App() {
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      if (import.meta.env.DEV) {
        return true;
      }
      return sessionStorage.getItem('jobale_intro_seen') !== 'true';
    } catch {
      return true;
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
    <>
      <AnimatePresence>
        {showIntro && (
          <ConstructionIntro onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <BrowserRouter>
        <Layout>
          <Routes>
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
          </Routes>
        </Layout>
      </BrowserRouter>
    </>
  );
}

export default App;

