import type { ReactNode } from "react";

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
  return (
    <div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className ?? ""}`}
      style={{
        width: "max(100vw, 176.5dvh)",
        aspectRatio: "1920 / 1088",
        minHeight: "100dvh",
        ...style,
      }}
    >
      {children}
    </div>
  );
}