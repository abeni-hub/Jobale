interface LogoProps {
  className?: string;
  variant?: 'full' | 'mark';
  theme?: 'light' | 'dark';
}

export default function Logo({ className = '', variant = 'full' }: LogoProps) {
  return (
    <img
      src="/Jobale_Engineering_PLC_logo-04.png"
      alt="Jobale Engineering PLC"
      className={`${variant === 'mark' ? 'object-contain object-left' : 'object-contain'} ${className}`}
      loading="eager"
    />
  );
}
