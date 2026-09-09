import React from 'react';
import { Sparkles } from 'lucide-react';

export function AppLogo({ size = 32, rounded = '12px', glow = false }) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`app-logo-frame ${glow ? 'has-glow' : ''}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        borderRadius: rounded,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fritzPrimary" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F9B26C" />
            <stop offset="35%" stopColor="#F28B3A" />
            <stop offset="70%" stopColor="#D9651C" />
            <stop offset="100%" stopColor="#B9490F" />
          </linearGradient>
          <linearGradient id="fritzSecondary" x1="12" y1="52" x2="52" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F6D9A8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id="fritzGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F6A65A" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#F6A65A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {glow && <circle cx="32" cy="32" r="28" fill="url(#fritzGlow)" opacity="0.7" />}

        <rect x="6" y="6" width="52" height="52" rx="16" fill="url(#fritzPrimary)" />
        <rect x="6" y="6" width="52" height="52" rx="16" fill="url(#fritzSecondary)" opacity="0.18" />

        <path d="M22 18H42V22H27V30H39V34H27V46H22V18Z" fill="white" fillOpacity="0.96" />
        <path d="M22 18H42V22H27V30H39V34H27V46H22V18Z" fill="url(#fritzSecondary)" fillOpacity="0.2" />
      </svg>

      <div
        style={{
          position: 'absolute',
          right: '4px',
          bottom: '4px',
          background: 'rgba(255,255,255,0.18)',
          border: '1px solid rgba(255,255,255,0.35)',
          borderRadius: '999px',
          width: '18px',
          height: '18px',
          display: 'grid',
          placeItems: 'center',
          backdropFilter: 'blur(6px)',
        }}
      >
        <Sparkles size={10} color="#fff7ed" strokeWidth={2.4} />
      </div>
    </div>
  );
}
