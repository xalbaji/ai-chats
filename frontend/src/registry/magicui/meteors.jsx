import React, { useMemo } from "react";

export function Meteors({ number = 30, className = "" }) {
  const meteors = useMemo(() => {
    return Array.from({ length: number }).map((_, i) => ({
      id: i,
      left: Math.floor(Math.random() * (typeof window !== "undefined" ? window.innerWidth + 600 : 1600) - 300) + "px",
      animationDelay: (Math.random() * 5).toFixed(2) + "s",
      animationDuration: Math.floor(Math.random() * 7 + 4) + "s",
    }));
  }, [number]);

  return (
    <div className={`meteors-container ${className}`}>
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="meteor-item"
          style={{
            top: "-50px",
            left: meteor.left,
            animationDelay: meteor.animationDelay,
            animationDuration: meteor.animationDuration,
          }}
        />
      ))}
    </div>
  );
}
