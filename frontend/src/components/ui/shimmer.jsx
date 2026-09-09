import React from 'react';

export function ShimmerDemo({ children = 'Generating response…' }) {
  return (
    <span className="shimmer" role="status" aria-live="polite">
      {children}
    </span>
  );
}
