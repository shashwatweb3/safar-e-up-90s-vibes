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
        width: "max(100vw, calc(100dvh * 1920 / 1088))",
        height: "max(100dvh, calc(100vw * 1088 / 1920))",
        ...style,
      }}
    >
      {children}
    </div>
  );
}