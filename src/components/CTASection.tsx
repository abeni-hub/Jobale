import { Link } from 'react-router-dom';

interface CTASectionProps {
  title: string;
  description: string;
  primaryCTA: { label: string; to: string };
  secondaryCTA: { label: string; to: string };
}

export default function CTASection({
  title,
  description,
  primaryCTA,
  secondaryCTA,
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-brand-navy py-20 lg:py-24">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-navy" />

      <div className="container-page relative text-center">
        <h2 className="text-3xl lg:text-4xl text-white font-heading font-extrabold tracking-tight max-w-2xl mx-auto text-balance">
          {title}
        </h2>
        <p className="mt-5 text-lg text-surface-steel max-w-2xl mx-auto leading-relaxed text-pretty">
          {description}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={primaryCTA.to} className="btn-primary">
            {primaryCTA.label}
          </Link>
          <Link to={secondaryCTA.to} className="btn-secondary">
            {secondaryCTA.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
