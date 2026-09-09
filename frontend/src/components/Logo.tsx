import React from 'react';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon';
  className?: string;
  glow?: boolean;
}

/**
 * Logo component - auto-documented
 */
export default function Logo({
  size = 36,
  variant = 'full',
  className = '',
  glow = true,
}: LogoProps) {
  const iconSize = size;
  const heightRatio = variant === 'full' ? size : size;

  return (
    <div
      className={`logo-container inline-flex items-center gap-2.5 select-none ${className}`}
      style={{ height: heightRatio }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`logo-emblem ${glow ? 'logo-glow' : ''}`}
      >
        <defs>
          <linearGradient id="ns-violet-rose" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>

          <linearGradient id="ns-core" x1="16" y1="14" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          <linearGradient id="ns-glow-grad" x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.08" />
          </linearGradient>

          <filter id="ns-filter-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circular Null-Boundary with Cutaways */}
        <circle
          cx="24"
          cy="24"
          r="19"
          fill="url(#ns-glow-grad)"
          stroke="url(#ns-violet-rose)"
          strokeWidth="2"
          strokeDasharray="9 3"
        />

        {/* Mid Quantum Orbit Ring */}
        <circle
          cx="24"
          cy="24"
          r="13"
          stroke="url(#ns-violet-rose)"
          strokeWidth="1.5"
          strokeOpacity="0.5"
        />

        {/* Diagonal Null Ray (Ø symbol element) */}
        <line
          x1="12"
          y1="36"
          x2="36"
          y2="12"
          stroke="url(#ns-violet-rose)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Inner Core Singularity (Zero-Knowledge Witness Node) */}
        <circle
          cx="24"
          cy="24"
          r="4.5"
          fill="url(#ns-core)"
        />

        {/* Satellite Witness Dots */}
        <circle cx="24" cy="7" r="1.75" fill="#C084FC" />
        <circle cx="41" cy="24" r="1.75" fill="#F43F5E" />
        <circle cx="7" cy="24" r="1.75" fill="#A855F7" />
        <circle cx="24" cy="41" r="1.75" fill="#E879F9" />
      </svg>

      {variant === 'full' && (
        <div className="flex items-center tracking-tight leading-none font-bold">
          <span className="logo-brand-null text-xl font-syne tracking-wide antialiased tracking-tight">
            Null
          </span>
          <span className="logo-brand-shield text-xl font-syne tracking-wide ml-0.5">
            Shield
          </span>
          <span className="ml-2 text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/30 uppercase font-semibold">
            ZK
          </span>
        </div>
      )}
    </div>
  );
}
