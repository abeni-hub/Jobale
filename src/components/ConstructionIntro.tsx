import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlueprintAnimation from './BlueprintAnimation';

interface ConstructionIntroProps {
  onComplete: () => void;
}

/**
 * ConstructionIntro — Full-screen architectural blueprint opening experience.
 *
 * 1. Fills the screen with the scaled-up architectural BlueprintAnimation.
 * 2. As the drawing completes, displays a prominent, cinematic "JOBALE ENGINEERING"
 *    brand title with slogan.
 * 3. Smoothly fades out and transitions into the public website.
 */
export default function ConstructionIntro({ onComplete }: ConstructionIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(false);
  const [showBrandTitle, setShowBrandTitle] = useState(false);

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

  // When the blueprint CAD drawing completes, reveal "JOBALE ENGINEERING"
  // and hold before cleanly transitioning to the main site
  const handleBlueprintComplete = useCallback(() => {
    setShowBrandTitle(true);
    const holdTimer = setTimeout(() => {
      handleFinish();
    }, 2200);
    return () => clearTimeout(holdTimer);
  }, [handleFinish]);

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
    }, 8000);
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
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
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
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(8,107,183,0.25)_0%,_transparent_75%)]" />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* WHOLE FULL-SCREEN BLUEPRINT ANIMATION (Clean, scaled up)    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
        <BlueprintAnimation
          loop={false}
          onComplete={handleBlueprintComplete}
          idPrefix="intro-bp"
          className="w-full h-full scale-[1.08] sm:scale-[1.14] drop-shadow-[0_20px_50px_rgba(8,107,183,0.35)]"
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FINAL BRAND TITLE REVEAL: "JOBALE ENGINEERING"              */}
      {/* Appears at the conclusion of the drawing before entering    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showBrandTitle && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center px-8 py-7 rounded-2xl bg-[#041D33]/85 backdrop-blur-xl border border-[#086BB7]/60 shadow-[0_0_80px_rgba(8,107,183,0.5)] max-w-xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex items-center justify-center gap-2 mb-2 text-[#4FA8E8] text-xs font-mono uppercase tracking-[0.3em]"
              >
                <span className="w-8 h-px bg-[#4FA8E8]/50" />
                <span>PLC</span>
                <span className="w-8 h-px bg-[#4FA8E8]/50" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, letterSpacing: '0.08em' }}
                animate={{ opacity: 1, letterSpacing: '0.04em' }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-wide leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
              >
                JOBALE ENGINEERING
              </motion.h1>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                className="h-0.5 w-28 bg-gradient-to-r from-transparent via-[#4FA8E8] to-transparent mx-auto my-3"
              />

              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-xs sm:text-sm font-heading font-medium tracking-[0.22em] uppercase text-[#A1B8CE]"
              >
                Building Excellence, Delivering Trust
              </motion.p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Minimal Skip button */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-8 z-40">
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

