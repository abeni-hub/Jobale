import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { company } from '@/data/company';

interface ConstructionIntroProps {
  onComplete: () => void;
}

/**
 * ConstructionIntro — Brief opening brand overlay.
 *
 * This is a one-time brand moment (2–3 seconds) that shows
 * a compact blueprint sketch + company identity, then fades out.
 *
 * IMPORTANT: This component's lifecycle is fully independent
 * of the hero's BlueprintAnimation. When this unmounts, the hero
 * animation continues running because they are separate components.
 */
export default function ConstructionIntro({ onComplete }: ConstructionIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(false);

  const handleFinish = useCallback(() => {
    if (completed) return;
    setCompleted(true);
    try {
      sessionStorage.setItem('jobale_intro_seen', 'true');
    } catch {
      // Safe storage access fallback
    }
    onComplete();
  }, [completed, onComplete]);

  // Lock body scroll while intro is visible
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // ESC key to skip
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleFinish();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleFinish]);

  // Failsafe timeout — user is never stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFinish();
    }, 4000);
    return () => clearTimeout(timer);
  }, [handleFinish]);

  // GSAP animation sequence — brief brand reveal
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const quickTimer = setTimeout(() => handleFinish(), 400);
      return () => clearTimeout(quickTimer);
    }

    const ctx = gsap.context(() => {
      // Prepare stroke-dash for draw paths
      const strokeElements = gsap.utils.toArray<SVGGeometryElement>('.intro-draw');
      strokeElements.forEach((el) => {
        try {
          const length = el.getTotalLength?.() || 200;
          gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
        } catch {
          // Fallback
        }
      });

      gsap.set('.intro-fade', { opacity: 0 });
      gsap.set('.intro-brand', { opacity: 0, y: 12 });

      const tl = gsap.timeline({
        onComplete: () => handleFinish(),
      });

      // Quick foundation line
      tl.to('.intro-foundation', {
        strokeDashoffset: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      });

      // Building outlines
      tl.to('.intro-outline', {
        strokeDashoffset: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
      }, '-=0.2');

      // Technical details
      tl.to('.intro-fade', {
        opacity: 0.7,
        duration: 0.4,
        stagger: 0.03,
        ease: 'power1.out',
      }, '-=0.4');

      // Brand reveal
      tl.to('.intro-brand', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.15');

      // Hold for a moment
      tl.to({}, { duration: 0.6 });

    }, containerRef);

    return () => ctx.revert();
  }, [handleFinish]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07111E] text-white select-none overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        y: -12,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      }}
      aria-label="Jobale Engineering PLC blueprint presentation"
      role="dialog"
      aria-modal="true"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #193752 1px, transparent 1px),
            linear-gradient(to bottom, #193752 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(8,107,183,0.18)_0%,_transparent_75%)]" />

      {/* Skip Button */}
      <button
        onClick={handleFinish}
        className="absolute top-6 right-6 z-50 text-xs font-mono tracking-wider text-[#607A91]/70 hover:text-white px-3 py-1.5 rounded border border-white/10 hover:border-[#086BB7]/50 bg-[#0F2137]/80 backdrop-blur transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#086BB7]"
        aria-label="Skip architectural intro animation"
      >
        SKIP INTRO [ESC] &rarr;
      </button>

      {/* Technical corner badge */}
      <div className="absolute top-6 left-6 hidden sm:flex flex-col gap-0.5 text-[10px] font-mono text-[#607A91]/50">
        <span className="text-[#2A8AE0] font-semibold">JOBALE ENGINEERING PLC</span>
        <span>SPEC: ARCHITECTURAL BLUEPRINT 04</span>
      </div>

      {/* Compact Blueprint SVG */}
      <div className="relative w-full max-w-xl px-6 flex flex-col items-center">
        <div className="w-full aspect-[800/400] max-h-[45vh]">
          <svg
            viewBox="0 0 800 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="intro-glow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="1.5" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Foundation */}
            <line
              x1="100" y1="320" x2="700" y2="320"
              stroke="#2A8AE0" strokeWidth="2.5" strokeLinecap="round"
              className="intro-foundation intro-draw"
              filter="url(#intro-glow)"
            />

            {/* Left building */}
            <polygon
              points="160,320 160,160 300,160 300,320"
              fill="rgba(15, 33, 55, 0.4)"
              stroke="#2A8AE0" strokeWidth="1.8"
              className="intro-outline intro-draw"
            />

            {/* Center tower */}
            <polygon
              points="330,320 330,70 490,70 490,320"
              fill="rgba(15, 33, 55, 0.55)"
              stroke="#FFFFFF" strokeWidth="2"
              className="intro-outline intro-draw"
              filter="url(#intro-glow)"
            />
            <line x1="410" y1="25" x2="410" y2="70" stroke="#2A8AE0" strokeWidth="2" className="intro-outline intro-draw" />

            {/* Right building */}
            <polygon
              points="520,320 520,210 660,210 660,320"
              fill="rgba(15, 33, 55, 0.4)"
              stroke="#2A8AE0" strokeWidth="1.8"
              className="intro-outline intro-draw"
            />

            {/* Floor lines (subtle) */}
            {[120, 175, 230, 280].map((y, i) => (
              <line key={`if-${i}`} x1="330" y1={y} x2="490" y2={y}
                stroke="#607A91" strokeWidth="0.8"
                className="intro-fade" opacity="0"
              />
            ))}
            {[200, 240, 280].map((y, i) => (
              <line key={`ifl-${i}`} x1="160" y1={y} x2="300" y2={y}
                stroke="#607A91" strokeWidth="0.8"
                className="intro-fade" opacity="0"
              />
            ))}

            {/* Axis markers */}
            {[230, 410, 590].map((x, i) => (
              <g key={`iax-${i}`} className="intro-fade" opacity="0">
                <circle cx={x} cy="350" r="9" stroke="#607A91" strokeWidth="0.8" fill="#07111E" />
                <text x={x} y="354" fill="#2A8AE0" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  {String.fromCharCode(65 + i)}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Brand panel */}
        <div className="intro-brand flex flex-col items-center text-center mt-4 z-20">
          <div className="bg-white px-5 py-2.5 rounded-xl shadow-2xl border border-white/20 mb-3 flex items-center justify-center">
            <img
              src="/Jobale_Engineering_PLC_logo-04.png"
              alt={company.name}
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-widest text-white uppercase drop-shadow-md">
            {company.name}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-1.5 max-w-md">
            <span className="w-6 sm:w-10 h-[1.5px] bg-[#086BB7]" />
            <p className="text-xs sm:text-sm font-heading font-medium tracking-wide text-[#2A8AE0]">
              {company.slogan}
            </p>
            <span className="w-6 sm:w-10 h-[1.5px] bg-[#086BB7]" />
          </div>
        </div>
      </div>

      {/* Bottom badge */}
      <div className="absolute bottom-6 left-6 hidden sm:flex items-center gap-2 text-[10px] font-mono text-[#607A91]/50">
        <div className="w-2 h-2 rounded-full bg-[#086BB7] animate-pulse" />
        <span>STRUCTURAL CAD &bull; DRAFTING ACTIVE</span>
      </div>
    </motion.div>
  );
}
