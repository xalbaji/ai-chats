import React, { useRef, useState } from "react";

export function GlareHover({
  children,
  className = "",
  duration = 600,
  style = {},
  ...props
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className={`glare-hover-wrapper ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "1rem",
        transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        transform: isHovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: isHovered
          ? "0 20px 40px -15px rgba(242, 125, 38, 0.3), 0 0 25px 2px rgba(242, 125, 38, 0.2)"
          : "0 8px 30px rgba(0, 0, 0, 0.4)",
        ...style,
      }}
      {...props}
    >
      {children}

      {/* Dynamic Cursor Glare Reflection Overlay */}
      <div
        className="glare-hover-shine"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          borderRadius: "inherit",
          opacity: isHovered ? 1 : 0,
          transition: `opacity ${duration}ms ease`,
          background: `
            radial-gradient(
              600px circle at ${mousePos.x}% ${mousePos.y}%,
              rgba(255, 255, 255, 0.22),
              transparent 45%
            ),
            linear-gradient(
              125deg,
              transparent 25%,
              rgba(255, 255, 255, 0.15) 48%,
              rgba(255, 255, 255, 0.3) 50%,
              rgba(255, 255, 255, 0.15) 52%,
              transparent 75%
            )
          `,
          backgroundSize: "200% 200%",
          backgroundPosition: isHovered ? `${mousePos.x}% ${mousePos.y}%` : "0% 0%",
          zIndex: 30,
        }}
      />
    </div>
  );
}
