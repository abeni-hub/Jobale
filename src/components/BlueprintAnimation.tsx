import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * BlueprintAnimation — Continuous architectural SVG animation.
 *
 * Lifecycle is fully independent of the intro overlay.
 * Uses gsap.context() for cleanup, repeat: -1 for infinite looping,
 * and yoyo: true for seamless visual transitions between iterations.
 *
 * Respects prefers-reduced-motion by showing a static blueprint.
 */
export default function BlueprintAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Show a fully-drawn static blueprint
      const allPaths = containerRef.current.querySelectorAll('.bp-draw');
      allPaths.forEach((el) => {
        (el as SVGElement).style.strokeDashoffset = '0';
        (el as SVGElement).style.opacity = '1';
      });
      const allBeams = containerRef.current.querySelectorAll('.bp-beam');
      allBeams.forEach((el) => {
        (el as SVGElement).style.transform = 'scaleY(1)';
        (el as SVGElement).style.opacity = '1';
      });
      const allFade = containerRef.current.querySelectorAll('.bp-fade');
      allFade.forEach((el) => {
        (el as SVGElement).style.opacity = '1';
      });
      return;
    }

    ctxRef.current = gsap.context(() => {
      // Measure and prepare stroke-dasharray/offset for all draw paths
      const drawPaths = gsap.utils.toArray<SVGGeometryElement>('.bp-draw');
      drawPaths.forEach((el) => {
        try {
          const len = el.getTotalLength?.() ?? 300;
          gsap.set(el, {
            strokeDasharray: len,
            strokeDashoffset: len,
            opacity: 1,
          });
        } catch {
          // Fallback for elements without getTotalLength
        }
      });

      // Initial hidden states
      gsap.set('.bp-beam', { scaleY: 0, transformOrigin: 'bottom center', opacity: 1 });
      gsap.set('.bp-fade', { opacity: 0 });
      gsap.set('.bp-pulse', { opacity: 0.3 });

      // ───────────────────────────────────────────────────────
      // MASTER TIMELINE — Infinite loop with yoyo for seamless reset
      // ───────────────────────────────────────────────────────
      const master = gsap.timeline({
        repeat: -1,
        yoyo: true,
        repeatDelay: 0.8,
        defaults: { ease: 'power2.out' },
      });

      // PHASE A — Foundation line draws left to right
      master
        .to('.bp-foundation', {
          strokeDashoffset: 0,
          duration: 1.0,
          ease: 'power2.inOut',
        })
        .to('.bp-hatch', {
          opacity: 0.5,
          duration: 0.5,
          stagger: 0.02,
          ease: 'power1.out',
        }, '-=0.5')
        .to('.bp-axis-marker', {
          opacity: 1,
          duration: 0.35,
          stagger: 0.05,
        }, '-=0.3');

      // PHASE B — Building outlines trace progressively
      master
        .to('.bp-outline-center', {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: 'power2.out',
        }, '-=0.2')
        .to('.bp-outline-left', {
          strokeDashoffset: 0,
          duration: 1.0,
          stagger: 0.08,
          ease: 'power2.out',
        }, '-=0.7')
        .to('.bp-outline-right', {
          strokeDashoffset: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power2.out',
        }, '-=0.7');

      // PHASE C — Structural beams rise
      master
        .to('.bp-beam', {
          scaleY: 1,
          duration: 0.8,
          stagger: 0.04,
          ease: 'power2.out',
        }, '-=0.5');

      // PHASE D — Floor lines and window grids appear
      master
        .to('.bp-floor', {
          strokeDashoffset: 0,
          duration: 0.7,
          stagger: 0.03,
          ease: 'power1.out',
        }, '-=0.5')
        .to('.bp-fade', {
          opacity: 0.7,
          duration: 0.6,
          stagger: 0.03,
          ease: 'power1.out',
        }, '-=0.4');

      // PHASE E — Blueprint pulse: subtle luminous breath
      master
        .to('.bp-pulse', {
          opacity: 0.7,
          duration: 1.2,
          ease: 'power1.inOut',
        }, '-=0.3');

      // Hold at fully drawn state before yoyo reverses
      master.to({}, { duration: 1.5 });
    }, containerRef);

    return () => {
      ctxRef.current?.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full" aria-hidden="true">
      <svg
        viewBox="0 0 800 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="bp-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.8" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
          <pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#193752" strokeWidth="0.4" strokeOpacity="0.35" />
          </pattern>
          <linearGradient id="bp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#086BB7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#07111E" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Background technical grid */}
        <rect x="40" y="30" width="720" height="400" fill="url(#bp-grid)" opacity="0.4" />
        <rect x="40" y="30" width="720" height="400" fill="url(#bp-gradient)" />

        {/* Technical registration crosshairs */}
        <g className="bp-fade" stroke="#607A91" strokeWidth="0.8" opacity="0">
          <path d="M 55 42 L 75 42 M 65 32 L 65 52" />
          <path d="M 725 42 L 745 42 M 735 32 L 735 52" />
          <path d="M 55 408 L 75 408 M 65 398 L 65 418" />
          <path d="M 725 408 L 745 408 M 735 398 L 735 418" />
        </g>

        {/* Left dimension ruler */}
        <g className="bp-fade" stroke="#607A91" strokeWidth="0.6" opacity="0">
          <line x1="90" y1="65" x2="90" y2="390" strokeDasharray="3 3" />
          <line x1="84" y1="65" x2="96" y2="65" />
          <line x1="84" y1="160" x2="96" y2="160" />
          <line x1="84" y1="235" x2="96" y2="235" />
          <line x1="84" y1="390" x2="96" y2="390" />
          <text x="78" y="69" fill="#607A91" fontSize="8" fontFamily="monospace" textAnchor="end">+52.0M</text>
          <text x="78" y="164" fill="#607A91" fontSize="8" fontFamily="monospace" textAnchor="end">+34.0M</text>
          <text x="78" y="239" fill="#607A91" fontSize="8" fontFamily="monospace" textAnchor="end">+22.0M</text>
          <text x="78" y="394" fill="#607A91" fontSize="8" fontFamily="monospace" textAnchor="end">±0.00</text>
        </g>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* FOUNDATION LINE                                         */}
        {/* ═══════════════════════════════════════════════════════ */}
        <line
          x1="80" y1="390" x2="720" y2="390"
          stroke="#2A8AE0" strokeWidth="2.5" strokeLinecap="round"
          className="bp-foundation bp-draw"
          filter="url(#bp-glow)"
        />
        <line
          x1="80" y1="394" x2="720" y2="394"
          stroke="#607A91" strokeWidth="0.8" strokeLinecap="round"
          className="bp-foundation bp-draw"
        />

        {/* Bedrock hatching */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = 110 + i * 20;
          return (
            <line
              key={`h-${i}`}
              x1={x} y1="397" x2={x - 12} y2="412"
              stroke="#607A91" strokeWidth="0.8" strokeLinecap="round"
              className="bp-hatch" opacity="0"
            />
          );
        })}

        {/* Foundation axis markers */}
        {[
          { x: 160, label: 'A' },
          { x: 280, label: 'B' },
          { x: 400, label: 'C' },
          { x: 520, label: 'D' },
          { x: 640, label: 'E' },
        ].map((axis) => (
          <g key={`ax-${axis.label}`} className="bp-axis-marker" opacity="0">
            <circle cx={axis.x} cy="430" r="10" stroke="#607A91" strokeWidth="0.8" fill="#07111E" />
            <text x={axis.x} y="434" fill="#2A8AE0" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {axis.label}
            </text>
            <line x1={axis.x} y1="394" x2={axis.x} y2="420" stroke="#607A91" strokeWidth="0.6" strokeDasharray="2 2" />
          </g>
        ))}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* BUILDING 1 — LEFT (Medium height)                       */}
        {/* x=140–280, top=170                                      */}
        {/* ═══════════════════════════════════════════════════════ */}
        <g id="bp-building-left">
          {/* Roof parapet */}
          <path
            d="M 168 170 L 168 152 L 252 152 L 252 170"
            stroke="#607A91" strokeWidth="1.2"
            className="bp-outline-left bp-draw"
          />
          {/* Main outline */}
          <polygon
            points="140,390 140,170 280,170 280,390"
            fill="rgba(15, 33, 55, 0.3)"
            stroke="#2A8AE0" strokeWidth="1.8" strokeLinejoin="round"
            className="bp-outline-left bp-draw"
          />
          {/* Diagonal bracing */}
          <line x1="140" y1="390" x2="280" y2="280" stroke="#193752" strokeWidth="0.7" strokeDasharray="3 3" className="bp-fade" opacity="0" />
          <line x1="280" y1="390" x2="140" y2="280" stroke="#193752" strokeWidth="0.7" strokeDasharray="3 3" className="bp-fade" opacity="0" />

          {/* Floor slabs */}
          {[210, 250, 290, 330, 360].map((y, idx) => (
            <line
              key={`fl-l-${idx}`}
              x1="140" y1={y} x2="280" y2={y}
              stroke="#607A91" strokeWidth="1"
              className="bp-floor bp-draw"
            />
          ))}
          {/* Vertical beams */}
          {[168, 196, 224, 252].map((x, idx) => (
            <line
              key={`bm-l-${idx}`}
              x1={x} y1="170" x2={x} y2="390"
              stroke="#086BB7" strokeWidth="1.2"
              className="bp-beam"
            />
          ))}
          {/* Window grids (subtle) */}
          {[215, 255, 295, 335].map((y) =>
            [152, 180, 208, 236].map((x) => (
              <rect
                key={`w-l-${x}-${y}`}
                x={x} y={y} width="12" height="16"
                stroke="#607A91" strokeWidth="0.4" fill="none"
                className="bp-fade" opacity="0"
              />
            ))
          )}
        </g>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* BUILDING 2 — CENTER (Tallest)                           */}
        {/* x=310–490, top=65                                       */}
        {/* ═══════════════════════════════════════════════════════ */}
        <g id="bp-building-center">
          {/* Architectural spire */}
          <line
            x1="400" y1="28" x2="400" y2="65"
            stroke="#2A8AE0" strokeWidth="1.8"
            className="bp-outline-center bp-draw"
            filter="url(#bp-glow)"
          />
          <circle cx="400" cy="28" r="2.5" fill="#2A8AE0" className="bp-fade" opacity="0" />
          {/* Crown */}
          <path
            d="M 340 65 L 368 42 L 432 42 L 460 65"
            stroke="#607A91" strokeWidth="1.2"
            fill="rgba(15, 33, 55, 0.4)"
            className="bp-outline-center bp-draw"
          />
          {/* Main high-rise outline */}
          <polygon
            points="310,390 310,65 490,65 490,390"
            fill="rgba(15, 33, 55, 0.45)"
            stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round"
            className="bp-outline-center bp-draw"
            filter="url(#bp-glow)"
          />
          {/* Core shear wall */}
          <rect
            x="387" y="65" width="26" height="325"
            fill="rgba(8, 107, 183, 0.08)"
            stroke="#607A91" strokeWidth="0.6" strokeDasharray="2 2"
            className="bp-beam"
          />
          {/* Floor slabs */}
          {[100, 135, 170, 205, 240, 275, 310, 345, 370].map((y, idx) => (
            <line
              key={`fl-c-${idx}`}
              x1="310" y1={y} x2="490" y2={y}
              stroke="#607A91" strokeWidth="1"
              className="bp-floor bp-draw"
            />
          ))}
          {/* Vertical beams */}
          {[335, 360, 387, 413, 440, 465].map((x, idx) => (
            <line
              key={`bm-c-${idx}`}
              x1={x} y1="65" x2={x} y2="390"
              stroke="#2A8AE0" strokeWidth="1.5"
              className="bp-beam"
            />
          ))}
          {/* X-bracing */}
          <g stroke="#193752" strokeWidth="0.7" strokeDasharray="2 2" className="bp-fade" opacity="0">
            <line x1="310" y1="240" x2="387" y2="170" />
            <line x1="387" y1="240" x2="310" y2="170" />
            <line x1="413" y1="240" x2="490" y2="170" />
            <line x1="490" y1="240" x2="413" y2="170" />
          </g>
          {/* Window grids (subtle) */}
          {[108, 143, 178, 213, 248, 283, 318].map((y) =>
            [320, 345, 370, 420, 445, 470].map((x) => (
              <rect
                key={`w-c-${x}-${y}`}
                x={x} y={y} width="10" height="14"
                stroke="#607A91" strokeWidth="0.3" fill="none"
                className="bp-fade" opacity="0"
              />
            ))
          )}
        </g>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* BUILDING 3 — RIGHT (Shorter)                            */}
        {/* x=510–650, top=230                                      */}
        {/* ═══════════════════════════════════════════════════════ */}
        <g id="bp-building-right">
          {/* Cantilever canopy */}
          <path
            d="M 496 230 L 664 230 L 650 244 L 510 244 Z"
            stroke="#607A91" strokeWidth="1.2"
            fill="rgba(15, 33, 55, 0.5)"
            className="bp-outline-right bp-draw"
          />
          {/* Main outline */}
          <polygon
            points="510,390 510,244 650,244 650,390"
            fill="rgba(15, 33, 55, 0.3)"
            stroke="#2A8AE0" strokeWidth="1.8" strokeLinejoin="round"
            className="bp-outline-right bp-draw"
          />
          {/* Floor slabs */}
          {[275, 310, 345, 365].map((y, idx) => (
            <line
              key={`fl-r-${idx}`}
              x1="510" y1={y} x2="650" y2={y}
              stroke="#607A91" strokeWidth="1"
              className="bp-floor bp-draw"
            />
          ))}
          {/* Vertical beams */}
          {[538, 566, 594, 622].map((x, idx) => (
            <line
              key={`bm-r-${idx}`}
              x1={x} y1="244" x2={x} y2="390"
              stroke="#086BB7" strokeWidth="1.2"
              className="bp-beam"
            />
          ))}
          {/* Window grids */}
          {[252, 282, 318, 350].map((y) =>
            [520, 548, 576, 604, 632].map((x) => (
              <rect
                key={`w-r-${x}-${y}`}
                x={x} y={y} width="10" height="14"
                stroke="#607A91" strokeWidth="0.3" fill="none"
                className="bp-fade" opacity="0"
              />
            ))
          )}
        </g>

        {/* Compass / North indicator */}
        <g className="bp-fade" transform="translate(700, 75)" opacity="0">
          <circle cx="0" cy="0" r="16" stroke="#607A91" strokeWidth="0.7" fill="#07111E" />
          <polygon points="0,-12 3.5,-2 0,0 -3.5,-2" fill="#2A8AE0" />
          <polygon points="0,12 3.5,2 0,0 -3.5,2" fill="#607A91" />
          <text x="0" y="-17" fill="#2A8AE0" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">N</text>
        </g>

        {/* Title block annotation */}
        <g className="bp-fade" opacity="0">
          <rect x="530" y="440" width="190" height="38" fill="#0F2137" stroke="#193752" strokeWidth="0.8" rx="2" />
          <text x="540" y="454" fill="#FFFFFF" fontSize="8" fontFamily="sans-serif" fontWeight="bold">JOBALE ENGINEERING PLC</text>
          <text x="540" y="464" fill="#607A91" fontSize="7" fontFamily="monospace">STRUCTURAL ELEVATION — REV 04</text>
          <text x="540" y="473" fill="#2A8AE0" fontSize="6.5" fontFamily="monospace">APPROVED • ADAMA, ETHIOPIA</text>
        </g>

        {/* Blueprint pulse overlay lines — subtle ambient motion */}
        <g className="bp-pulse" opacity="0.3">
          <line x1="80" y1="200" x2="720" y2="200" stroke="#086BB7" strokeWidth="0.3" strokeOpacity="0.2" />
          <line x1="400" y1="30" x2="400" y2="450" stroke="#086BB7" strokeWidth="0.3" strokeOpacity="0.15" />
        </g>
      </svg>
    </div>
  );
}
