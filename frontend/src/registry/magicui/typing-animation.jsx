import { useEffect, useRef, useState } from "react";

/**
 * TypingAnimation
 *
 * Reveals `text` character-by-character. When given children instead of a
 * text prop it stringifies them (plain text only).
 *
 * Props
 *   text        – string to animate (preferred)
 *   children    – fallback; stringified as plain text
 *   duration    – ms between characters (default 18)
 *   className   – extra class names
 *   onComplete  – called when animation finishes
 */
export function TypingAnimation({
  text,
  children,
  duration = 18,
  className = "",
  onComplete,
}) {
  const fullText =
    text ??
    (typeof children === "string"
      ? children
      : "");

  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const frameRef = useRef(null);
  const lastTimeRef = useRef(null);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    lastTimeRef.current = null;

    const step = (timestamp) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= duration) {
        const charsToAdd = Math.floor(elapsed / duration);
        const next = Math.min(indexRef.current + charsToAdd, fullText.length);
        indexRef.current = next;
        setDisplayed(fullText.slice(0, next));
        lastTimeRef.current = timestamp;

        if (next >= fullText.length) {
          onComplete?.();
          return;
        }
      }

      frameRef.current = requestAnimationFrame(step);
    };

    if (fullText.length > 0) {
      frameRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [fullText, duration, onComplete]);

  return (
    <span className={`typing-animation ${className}`}>
      {displayed}
      {displayed.length < fullText.length && (
        <span className="typing-cursor" aria-hidden="true" />
      )}
    </span>
  );
}
