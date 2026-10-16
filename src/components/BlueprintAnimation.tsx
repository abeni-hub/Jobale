import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface BlueprintAnimationProps {
  /** If true, loops endlessly with yoyo (default: true) */
  loop?: boolean;
  /** Callback fired when the initial architectural drawing reaches 100% completion */
  onComplete?: () => void;
  /** Prefix for SVG defs to prevent ID collisions (default: 'bp') */
  idPrefix?: string;
  /** Optional container className */
  className?: string;
  /** SVG aspect ratio preservation (default: 'xMidYMid meet') */
  preserveAspectRatio?: string;
}

/**
 * BlueprintAnimation — Architectural CAD SVG drawing animation.
 *
 * Can run either in:
 * - Loop mode (default): for continuous ambient background motion in the hero.
 * - Single-draw mode (loop: false): for the full-screen intro sequence, firing
 *   onComplete once the drawing finishes to smoothly transition to the hero.
 *
 * Uses gsap.context() for cleanup and respects prefers-reduced-motion.
 */
export default function BlueprintAnimation({
  loop = true,
  onComplete,
  idPrefix = 'bp',
  className = '',
  preserveAspectRatio = 'xMidYMid meet',
}: BlueprintAnimationProps) {
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

      if (!loop) {
        const timer = setTimeout(() => onComplete?.(), 400);
        return () => clearTimeout(timer);
      }
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
      // MASTER TIMELINE — Infinite loop (hero) or single-run (intro)
      // ───────────────────────────────────────────────────────
      const master = gsap.timeline({
        repeat: loop ? -1 : 0,
        yoyo: loop,
        repeatDelay: 0.8,
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          if (!loop) {
            onComplete?.();
          }
        },
      });

      // PHASE A — Foundation line draws left to right
      master
        .to('.bp-foundation', {
          strokeDashoffset: 0,
          duration: 0.95,
          ease: 'power2.inOut',
        })
        .to('.bp-hatch', {
          opacity: 0.5,
          duration: 0.45,
          stagger: 0.018,
          ease: 'power1.out',
        }, '-=0.45')
        .to('.bp-axis-marker', {
          opacity: 1,
          duration: 0.3,
          stagger: 0.04,
        }, '-=0.25');

      // PHASE B — Building outlines trace progressively
      master
        .to('.bp-outline-center', {
          strokeDashoffset: 0,
          duration: 1.1,
          ease: 'power2.out',
        }, '-=0.15')
        .to('.bp-outline-left', {
          strokeDashoffset: 0,
          duration: 0.9,
          stagger: 0.07,
          ease: 'power2.out',
        }, '-=0.65')
        .to('.bp-outline-right', {
          strokeDashoffset: 0,
          duration: 0.85,
          stagger: 0.07,
          ease: 'power2.out',
        }, '-=0.65');

      // PHASE C — Structural beams rise
      master
        .to('.bp-beam', {
          scaleY: 1,
          duration: 0.75,
          stagger: 0.035,
          ease: 'power2.out',
        }, '-=0.45');

      // PHASE D — Floor lines and window grids appear
      master
        .to('.bp-floor', {
          strokeDashoffset: 0,
          duration: 0.65,
          stagger: 0.025,
          ease: 'power1.out',
        }, '-=0.45')
        .to('.bp-fade', {
          opacity: 0.7,
          duration: 0.55,
          stagger: 0.025,
          ease: 'power1.out',
        }, '-=0.35');

      // PHASE E — Blueprint pulse: subtle luminous breath
      master
        .to('.bp-pulse', {
          opacity: 0.75,
          duration: 0.9,
          ease: 'power1.inOut',
        }, '-=0.25');

      // Hold at fully drawn state before repeating or completing
      master.to({}, {
        duration: loop ? 1.5 : 0.7,
        onComplete: () => {
          if (!loop) {
            onComplete?.();
          }
        },
      });
    }, containerRef);

    return () => {
      ctxRef.current?.revert();
    };
  }, [loop, onComplete]);

  const glowId = `${idPrefix}-glow`;
  const gridId = `${idPrefix}-grid`;
  const gradientId = `${idPrefix}-gradient`;

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 800 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        preserveAspectRatio={preserveAspectRatio}
      >
        <defs>
          <filter id={glowId} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.8" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
          <pattern id={gridId} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#193752" strokeWidth="0.4" strokeOpacity="0.35" />
          </pattern>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#086BB7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#07111E" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Background technical grid */}
        <rect x="40" y="30" width="720" height="400" fill={`url(#${gridId})`} opacity="0.4" />
        <rect x="40" y="30" width="720" height="400" fill={`url(#${gradientId})`} />

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
          filter={`url(#${glowId})`}
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
        <g id={`${idPrefix}-building-left`}>
          {/* Main outline polygon */}
          <polygon
            points="140,390 140,170 280,170 280,390"
            fill="rgba(15, 33, 55, 0.45)"
            stroke="#2A8AE0" strokeWidth="1.8"
            className="bp-outline-left bp-draw"
          />
          {/* Stepped parapet top */}
          <polyline
            points="140,170 140,158 200,158 200,170"
            stroke="#2A8AE0" strokeWidth="1.4"
            className="bp-outline-left bp-draw"
          />
          {/* Horizontal floor slabs */}
          {[205, 245, 285, 325, 360].map((y) => (
            <line
              key={`fl-l-${y}`}
              x1="140" y1={y} x2="280" y2={y}
              stroke="#2A8AE0" strokeWidth="1.0"
              className="bp-floor bp-draw"
            />
          ))}
          {/* Vertical structural columns */}
          {[170, 205, 245].map((x) => (
            <line
              key={`bm-l-${x}`}
              x1={x} y1="170" x2={x} y2="390"
              stroke="#086BB7" strokeWidth="1.2"
              className="bp-beam"
            />
          ))}
          {/* Cross bracing in ground bays */}
          <g className="bp-fade" stroke="#086BB7" strokeWidth="0.6" strokeDasharray="2 2" opacity="0">
            <line x1="140" y1="360" x2="170" y2="390" />
            <line x1="170" y1="360" x2="140" y2="390" />
            <line x1="245" y1="360" x2="280" y2="390" />
            <line x1="280" y1="360" x2="245" y2="390" />
          </g>
          {/* Window pattern (fades in) */}
          {[213, 253, 293, 333].map((y) =>
            [148, 178, 213, 253].map((x) => (
              <rect
                key={`w-l-${x}-${y}`}
                x={x} y={y} width="16" height="22"
                stroke="#607A91" strokeWidth="0.4" fill="none"
                className="bp-fade" opacity="0"
              />
            ))
          )}
        </g>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* BUILDING 2 — CENTER TOWER (Tallest, Signature Structure)*/}
        {/* x=305–495, top=70                                       */}
        {/* ═══════════════════════════════════════════════════════ */}
        <g id={`${idPrefix}-building-center`}>
          {/* Main tower outline */}
          <polygon
            points="305,390 305,70 495,70 495,390"
            fill="rgba(15, 33, 55, 0.6)"
            stroke="#FFFFFF" strokeWidth="2.0"
            className="bp-outline-center bp-draw"
            filter={`url(#${glowId})`}
          />
          {/* Crown spire */}
          <polyline
            points="340,70 340,40 400,20 460,40 460,70"
            stroke="#2A8AE0" strokeWidth="1.8"
            className="bp-outline-center bp-draw"
          />
          {/* Spire antenna */}
          <line
            x1="400" y1="20" x2="400" y2="-5"
            stroke="#FFFFFF" strokeWidth="1.5"
            className="bp-outline-center bp-draw"
            filter={`url(#${glowId})`}
          />
          <circle cx="400" cy="-5" r="2.5" fill="#2A8AE0" className="bp-fade" opacity="0" />

          {/* Horizontal floor plates */}
          {[105, 140, 175, 210, 245, 280, 315, 350].map((y) => (
            <line
              key={`fl-c-${y}`}
              x1="305" y1={y} x2="495" y2={y}
              stroke="#2A8AE0" strokeWidth="1.2"
              className="bp-floor bp-draw"
            />
          ))}

          {/* Heavy vertical structural core columns */}
          {[340, 375, 425, 460].map((x) => (
            <line
              key={`bm-c-${x}`}
              x1={x} y1="70" x2={x} y2="390"
              stroke="#086BB7" strokeWidth="1.8"
              className="bp-beam"
            />
          ))}

          {/* Center core shear wall */}
          <line
            x1="400" y1="70" x2="400" y2="390"
            stroke="#FFFFFF" strokeWidth="1.0" strokeDasharray="4 2"
            className="bp-floor bp-draw"
            opacity="0.8"
          />

          {/* K-Truss structural cross bracing */}
          <g className="bp-fade" stroke="#2A8AE0" strokeWidth="0.8" opacity="0">
            <line x1="305" y1="280" x2="400" y2="315" />
            <line x1="495" y1="280" x2="400" y2="315" />
            <line x1="305" y1="350" x2="400" y2="315" />
            <line x1="495" y1="350" x2="400" y2="315" />
            <line x1="305" y1="210" x2="400" y2="245" />
            <line x1="495" y1="210" x2="400" y2="245" />
            <line x1="305" y1="280" x2="400" y2="245" />
            <line x1="495" y1="280" x2="400" y2="245" />
          </g>

          {/* Curtain wall grid pattern */}
          {[80, 115, 150, 185, 220, 255, 290, 325, 360].map((y) =>
            [315, 345, 380, 420, 450, 475].map((x) => (
              <rect
                key={`w-c-${x}-${y}`}
                x={x} y={y} width="18" height="18"
                stroke="#607A91" strokeWidth="0.35" fill="none"
                className="bp-fade" opacity="0"
              />
            ))
          )}

          {/* Mechanical floor indicator (level 5) */}
          <g className="bp-fade" opacity="0">
            <rect x="306" y="211" width="188" height="33" fill="#086BB7" fillOpacity="0.12" />
            <text x="400" y="230" fill="#2A8AE0" fontSize="7" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
              MECH PLANT LEVEL
            </text>
          </g>
        </g>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* BUILDING 3 — RIGHT (Tiered Modern Wing)                 */}
        {/* x=510–660, tiered heights 190 and 240                   */}
        {/* ═══════════════════════════════════════════════════════ */}
        <g id={`${idPrefix}-building-right`}>
          {/* Tier 1 (taller part, x=510-600) */}
          <polygon
            points="510,390 510,190 600,190 600,390"
            fill="rgba(15, 33, 55, 0.45)"
            stroke="#2A8AE0" strokeWidth="1.8"
            className="bp-outline-right bp-draw"
          />
          {/* Tier 2 (lower wing, x=600-660) */}
          <polygon
            points="600,390 600,240 660,240 660,390"
            fill="rgba(15, 33, 55, 0.4)"
            stroke="#2A8AE0" strokeWidth="1.6"
            className="bp-outline-right bp-draw"
          />
          {/* Angled architectural roof cantilever */}
          <polyline
            points="495,190 610,175 610,190"
            stroke="#2A8AE0" strokeWidth="1.4"
            className="bp-outline-right bp-draw"
            filter={`url(#${glowId})`}
          />
          {/* Horizontal floor plates */}
          {[220, 255, 290, 325, 360].map((y) => (
            <line
              key={`fl-r-${y}`}
              x1="510" y1={y} x2={y > 240 ? '660' : '600'} y2={y}
              stroke="#2A8AE0" strokeWidth="1.0"
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
