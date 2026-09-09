import React from 'react';

export function Spinner({ className = '' }) {
  return <span className={`attachment-spinner ${className}`} aria-label="Loading" role="status" />;
}
