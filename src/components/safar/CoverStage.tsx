import { useEffect, useState, type ReactNode } from "react";

const AR = 1920 / 1088;

/**
 * Renders a fixed-aspect illustrated stage that covers the viewport, so that
 * percentage-positioned hotspots always line up with the artwork.
 */
export function CoverStage({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.max(vw, vh * AR);
      const h = Math.max(vh, vw / AR);
      setSize({ w: Math.ceil(w), h: Math.ceil(h) });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  return (
    <div
      className={`absolute left-1/2 top-1/2 ${className ?? ""}`}
      style={{
        width: size ? `${size.w}px` : "100vw",
        height: size ? `${size.h}px` : "100vh",
        visibility: size ? "visible" : "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}