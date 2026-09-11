import React from 'react';
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
      <img
        src="/nivoai-logo-transparent.png"
        alt="NivoAi"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: rounded,
          filter: glow ? 'drop-shadow(0 0 8px rgba(37, 235, 239, 0.75))' : 'none',
        }}
      />

    </div>
  );
}
