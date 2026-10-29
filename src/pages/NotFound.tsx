import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found | Jobale Engineering PLC"
        description="The requested page could not be found on Jobale Engineering PLC. Please return to the homepage or contact our team."
        noindex={true}
      />
      <section className="min-h-[70vh] flex items-center justify-center bg-surface-offwhite">
        <div className="container-page text-center py-20">
          <p className="text-8xl font-heading font-extrabold text-brand-blue/20">404</p>
          <h1 className="mt-4 text-3xl font-heading font-extrabold text-brand-navy">
            Page Not Found
          </h1>
          <p className="mt-4 text-lg text-ink max-w-md mx-auto">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/" className="btn-primary">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link to="/contact" className="btn-outline">
              <ArrowLeft className="w-4 h-4" />
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
