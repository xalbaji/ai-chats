import React from 'react';

const join = (...values) => values.filter(Boolean).join(' ');

export function Attachment({ className = '', orientation = 'horizontal', state = 'default', children, ...props }) {
  return (
    <div className={join('attachment', `attachment-${orientation}`, `attachment-${state}`, className)} {...props}>
      {children}
    </div>
  );
}

export function AttachmentGroup({ className = '', children, ...props }) {
  return <div className={join('attachment-group', className)} {...props}>{children}</div>;
}

export function AttachmentMedia({ className = '', variant = 'file', children, ...props }) {
  return <div className={join('attachment-media', `attachment-media-${variant}`, className)} {...props}>{children}</div>;
}

export function AttachmentContent({ className = '', children, ...props }) {
  return <div className={join('attachment-content', className)} {...props}>{children}</div>;
}

export function AttachmentTitle({ className = '', children, ...props }) {
  return <div className={join('attachment-title', className)} {...props}>{children}</div>;
}

export function AttachmentDescription({ className = '', children, ...props }) {
  return <div className={join('attachment-description', className)} {...props}>{children}</div>;
}

export function AttachmentActions({ className = '', children, ...props }) {
  return <div className={join('attachment-actions', className)} {...props}>{children}</div>;
}

export function AttachmentAction({ className = '', children, type = 'button', ...props }) {
  return <button type={type} className={join('attachment-action', className)} {...props}>{children}</button>;
}
