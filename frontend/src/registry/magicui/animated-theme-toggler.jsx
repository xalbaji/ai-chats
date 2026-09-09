import React, { useRef } from "react";
import { Sun, Moon } from "lucide-react";

export function AnimatedThemeToggler({
  isDark = true,
  onToggle = () => {},
  className = "",
  duration = 600,
  ...props
}) {
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const rect = buttonRef.current
        ? buttonRef.current.getBoundingClientRect()
        : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };

      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = document.startViewTransition(() => {
        onToggle(!isDark);
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];
        document.documentElement.animate(
          {
            clipPath: isDark ? [...clipPath].reverse() : clipPath,
          },
          {
            duration: duration,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: isDark
              ? "::view-transition-old(root)"
              : "::view-transition-new(root)",
          }
        );
      });
    } else {
      onToggle(!isDark);
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      className={`animated-theme-toggler ${isDark ? "dark" : "light"} ${className}`}
      aria-label="Toggle dark mode"
      {...props}
    >
      <span className="toggler-track">
        <span className="toggler-thumb">
          {isDark ? (
            <Moon className="toggler-icon moon-icon" size={14} strokeWidth={2.2} />
          ) : (
            <Sun className="toggler-icon sun-icon" size={14} strokeWidth={2.2} />
          )}
        </span>
      </span>
    </button>
  );
}
