import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

const DEFAULT_AR = 1920 / 1088;

/**
 * Renders a fixed-aspect illustrated stage so that percentage-positioned
 * hotspots always line up with the artwork.
 *
 * - "center" (default): the stage covers the viewport and is centered; on
 *   mobile a `mobileShift` can slide it so a different part of the artwork is
 *   framed.
 * - "width-fit": on mobile (<640px) the stage fits the viewport width and is
 *   anchored to the top, so the entire artwork (and every hotspot) stays on
 *   screen; on larger screens it behaves like "center".
 * - `mobileAlign="left"`: on mobile (<640px) the covering stage is shifted so
 *   its left edge lines up with the viewport, framing the left part of the
 *   artwork; on larger screens the stage stays centered.
 */
export function CoverStage({
  children,
  className,
  style,
  layout = "center",
  mobileShift = 0,
  mobileAlign = "center",
  transform,
  aspect,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  layout?: "center" | "width-fit";
  mobileShift?: number;
  mobileAlign?: "center" | "left";
  transform?: (mobile: boolean) => string;
  aspect?: number;
}) {
  const AR = aspect ?? DEFAULT_AR;
  const [size, setSize] = useState<{ w: number; h: number; mobile: boolean; vw: number } | null>(
    null,
  );

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 640;
      let w: number;
      let h: number;
      if (mobile && layout === "width-fit") {
        w = vw;
        h = vw / AR;
      } else {
        w = Math.max(vw, vh * AR);
        h = Math.max(vh, vw / AR);
      }
      setSize({ w: Math.ceil(w), h: Math.ceil(h), mobile, vw });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [layout, AR]);

  const leftAlign = size?.mobile && mobileAlign === "left";
  const tx = leftAlign ? `-${(50 * size.vw) / size.w}%` : "-50%";
  const translate = `translate(${tx}, ${layout === "width-fit" ? "0%" : "-50%"})`;
  const shift = size?.mobile && mobileShift ? ` translateX(-${mobileShift}%)` : "";
  const extra = transform ? ` ${transform(size?.mobile ?? false)}` : "";

  return (
    <div
      className={`absolute left-1/2 ${layout === "width-fit" ? "top-0" : "top-1/2"} ${className ?? ""}`}
      style={{
        width: size ? `${size.w}px` : "100vw",
        height: size ? `${size.h}px` : layout === "width-fit" ? "56.6vw" : "100vh",
        visibility: size ? "visible" : "hidden",
        transform: size ? `${translate}${shift}${extra}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
