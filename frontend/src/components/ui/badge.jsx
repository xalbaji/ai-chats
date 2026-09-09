import React from "react";

export function Badge({ className = "", children, ...props }) {
  return (
    <span className={`ui-badge ${className}`} {...props}>
      {children}
    </span>
  );
}
