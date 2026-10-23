import { mediaUrl } from '@/lib/api';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'mark';
  theme?: 'light' | 'dark';
  src?: string | null;
}

export default function Logo({ className = '', variant = 'full', src }: LogoProps) {
  const imageSrc = src ? mediaUrl(src) : '/Jobale_Engineering_PLC_logo-04.png';

  return (
    <img
      src={imageSrc}
      alt="Jobale Engineering PLC"
      className={`${variant === 'mark' ? 'object-contain object-left' : 'object-contain'} ${className}`}
      loading="eager"
    />
  );
}
