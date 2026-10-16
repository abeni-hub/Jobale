import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import BlueprintAnimation from './BlueprintAnimation';

interface ConstructionIntroProps {
  onComplete: () => void;
}

/**
 * ConstructionIntro — Clean, full-screen architectural blueprint opening experience.
 *
 * Fills 100% of the screen with the scaled-up BlueprintAnimation.
 * All corner badges and distractions are removed for a pure, cinematic CAD draw.
 * Once complete, smoothly fades into the hero section.
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

  // ESC key to skip immediately
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleFinish();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleFinish]);

  // Failsafe timeout — guarantees user is never stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFinish();
    }, 6500);
    return () => clearTimeout(timer);
  }, [handleFinish]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen z-[9999] bg-[#041D33] text-white select-none overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.02,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      }}
      aria-label="Jobale Engineering PLC architectural blueprint presentation"
      role="dialog"
      aria-modal="true"
    >
      {/* Background technical architectural grid */}
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

      {/* Atmospheric radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(8,107,183,0.22)_0%,_transparent_75%)]" />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* WHOLE FULL-SCREEN BLUEPRINT ANIMATION (Clean, scaled up)    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
        <BlueprintAnimation
          loop={false}
          onComplete={handleFinish}
          idPrefix="intro-bp"
          className="w-full h-full scale-[1.08] sm:scale-[1.14] drop-shadow-[0_20px_50px_rgba(8,107,183,0.35)]"
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      {/* Minimal Skip button */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-8 z-20">
        <button
          onClick={handleFinish}
          className="text-xs font-mono tracking-wider text-[#607A91] hover:text-white px-3 py-1.5 rounded border border-white/10 hover:border-[#086BB7]/60 bg-[#0F2137]/80 hover:bg-[#086BB7]/30 backdrop-blur-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#086BB7] shadow-lg"
          aria-label="Skip architectural intro animation"
        >
          SKIP [ESC] &rarr;
        </button>
      </div>
    </motion.div>
  );
}
