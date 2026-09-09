import React from 'react';

const join = (...values) => values.filter(Boolean).join(' ');

export function InputGroup({ className = '', children, ...props }) {
  return <div className={join('input-group', className)} {...props}>{children}</div>;
}

export function InputGroupInput({ className = '', ...props }) {
  return <input className={join('input-group-input', className)} {...props} />;
}

export function InputGroupAddon({ className = '', align = 'inline-start', children, ...props }) {
  return (
    <span className={join('input-group-addon', `input-group-addon-${align}`, className)} {...props}>
      {children}
    </span>
  );
}
