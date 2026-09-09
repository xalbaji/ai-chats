import React from 'react';

const join = (...values) => values.filter(Boolean).join(' ');

export function Marker({ className = '', variant = 'default', children, ...props }) {
  return (
    <div className={join('marker', `marker-${variant}`, className)} {...props}>
      {children}
    </div>
  );
}

export function MarkerIcon({ className = '', children, ...props }) {
  return <div className={join('marker-icon', className)} {...props}>{children}</div>;
}

export function MarkerContent({ className = '', children, ...props }) {
  return <div className={join('marker-content', className)} {...props}>{children}</div>;
}
