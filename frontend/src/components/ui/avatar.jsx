import React from 'react';

const join = (...values) => values.filter(Boolean).join(' ');

export function Avatar({ className = '', children, ...props }) {
  return <span className={join('avatar', className)} {...props}>{children}</span>;
}

export function AvatarImage({ className = '', alt = '', ...props }) {
  return <img className={join('avatar-image', className)} alt={alt} {...props} />;
}

export function AvatarFallback({ className = '', children, ...props }) {
  return <span className={join('avatar-fallback', className)} {...props}>{children}</span>;
}

export function AvatarBadge({ className = '', children, ...props }) {
  return <span className={join('avatar-badge', className)} {...props}>{children}</span>;
}

export function AvatarGroup({ className = '', children, ...props }) {
  return <div className={join('avatar-group', className)} {...props}>{children}</div>;
}

export function AvatarGroupCount({ className = '', children, ...props }) {
  return <span className={join('avatar-group-count', className)} {...props}>{children}</span>;
}
