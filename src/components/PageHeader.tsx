import { Link } from 'react-router-dom';
import { mediaUrl } from '@/lib/api';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  label?: string;
  title: string;
  description?: string;
  image?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export default function PageHeader({
  label,
  title,
  description,
  image,
  breadcrumbs,
}: PageHeaderProps) {
  const resolvedImage = mediaUrl(image);

  return (
    <section className="relative overflow-hidden bg-brand-navy">
      {resolvedImage && (
        <>
          <div className="absolute inset-0">
            <img
              src={resolvedImage}
              alt=""
              className="h-full w-full object-cover opacity-30"
              loading="eager"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/90 via-brand-navy/75 to-brand-navy/95" />
        </>
      )}
      {!resolvedImage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy-dark" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </>
      )}

      <div className="container-page relative py-20 lg:py-28">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-surface-steel">
              {breadcrumbs.map((crumb, i) => (
                <li key={i} className="flex items-center gap-2">
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-white transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white/80">{crumb.label}</span>
                  )}
                  {i < breadcrumbs.length - 1 && <span className="text-surface-steel/50">/</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {label && (
          <p className="section-label text-brand-blue-light mb-4 animate-fade-in-down">
            {label}
          </p>
        )}
        <h1 className="text-4xl lg:text-5xl text-white font-heading font-extrabold tracking-tight max-w-3xl text-balance animate-fade-in-up">
          {title}
        </h1>
        {description && (
          <p className="mt-6 text-lg text-surface-steel max-w-2xl leading-relaxed text-pretty animate-fade-in-up">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
