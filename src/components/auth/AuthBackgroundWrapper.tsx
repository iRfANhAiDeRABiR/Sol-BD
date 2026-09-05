import React from 'react';

// Subtle decorative digital particles (around outer perimeter to keep form perfectly legible)
const PARTICLES = [
  { top: '12%', left: '15%', size: 3, color: '#a855f7', opacity: 0.4, shadow: true },
  { top: '24%', left: '84%', size: 3.5, color: '#38bdf8', opacity: 0.45, shadow: true },
  { top: '38%', left: '10%', size: 2.5, color: '#818cf8', opacity: 0.35, shadow: false },
  { top: '50%', left: '90%', size: 3, color: '#06b6d4', opacity: 0.4, shadow: true },
  { top: '68%', left: '14%', size: 3.5, color: '#7c3aed', opacity: 0.35, shadow: true },
  { top: '78%', left: '85%', size: 3, color: '#3b82f6', opacity: 0.45, shadow: true },
  { top: '86%', left: '22%', size: 2.5, color: '#06b6d4', opacity: 0.3, shadow: false },
  { top: '16%', left: '72%', size: 2.5, color: '#c084fc', opacity: 0.3, shadow: false },
  { top: '62%', left: '80%', size: 3, color: '#60a5fa', opacity: 0.35, shadow: true },
  { top: '30%', left: '22%', size: 2, color: '#38bdf8', opacity: 0.35, shadow: false },
  { top: '74%', left: '30%', size: 2.5, color: '#818cf8', opacity: 0.25, shadow: false },
];

export default function AuthBackgroundWrapper({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12 overflow-hidden auth-bg-base transition-colors duration-300">
      {/* 1. Large Ambient Glow Elements (Z-Index 1) */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-violet-600/25 via-purple-700/20 to-transparent blur-[120px] animate-ambient-1 select-none z-[1]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-36 -right-36 w-[560px] h-[560px] rounded-full bg-gradient-to-tl from-cyan-500/20 via-blue-600/15 to-transparent blur-[130px] animate-ambient-2 select-none z-[1]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-indigo-600/10 blur-[130px] select-none z-[1]"
        aria-hidden="true"
      />

      {/* 2. Modern Technical Grid Pattern with Center Mask (Z-Index 1) */}
      <div
        className="pointer-events-none absolute inset-0 auth-grid-pattern opacity-60 dark:opacity-80 select-none z-[1]"
        aria-hidden="true"
      />

      {/* 3. Subtle Orbital Tech Lines (Z-Index 1) */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] rounded-full border border-indigo-500/[0.08] dark:border-indigo-400/[0.07] select-none hidden md:block z-[1]"
        style={{
          maskImage: 'radial-gradient(circle, transparent 40%, black 52%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 40%, black 52%, transparent 72%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-violet-500/[0.07] dark:border-violet-400/[0.06] select-none hidden lg:block z-[1]"
        style={{
          maskImage: 'radial-gradient(circle, transparent 35%, black 48%, transparent 68%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 35%, black 48%, transparent 68%)',
        }}
        aria-hidden="true"
      />

      {/* 4. Soft Glowing Digital Particles (Z-Index 1) */}
      <div className="pointer-events-none absolute inset-0 select-none hidden sm:block z-[1]" aria-hidden="true">
        {PARTICLES.map((p, idx) => (
          <span
            key={idx}
            className="absolute rounded-full"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
              boxShadow: p.shadow ? `0 0 8px ${p.color}` : undefined,
            }}
          />
        ))}
      </div>

      {/* 5. Login Card Elevated Spotlight Glow (Z-Index 2) */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full auth-card-spotlight select-none z-[2]"
        aria-hidden="true"
      />

      {/* 6. Subtle Perimeter Vignette (Z-Index 2) */}
      <div className="pointer-events-none absolute inset-0 auth-vignette select-none z-[2]" aria-hidden="true" />

      {/* 7. Foreground Content (Z-Index 10) */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </section>
  );
}
