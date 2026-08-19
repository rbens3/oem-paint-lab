import type { CSSProperties, ReactNode } from "react";
import { isLightHex, normalizeHex } from "../lib/color";

type PaintStyle = CSSProperties & {
  "--paint-field": string;
  "--paint-field-ink": string;
};

interface PaintFieldProps {
  hex: string;
  className?: string;
  children?: ReactNode;
  label?: string;
}

export default function PaintField({
  hex,
  className = "",
  children,
  label,
}: PaintFieldProps) {
  const normalized = normalizeHex(hex) ?? "#6B8BC0";
  const style: PaintStyle = {
    "--paint-field": normalized,
    "--paint-field-ink": isLightHex(normalized)
      ? "var(--color-paint-field-dark-ink)"
      : "var(--color-paint-field-light-ink)",
  };

  return (
    <div
      className={`paint-field ${className}`.trim()}
      style={style}
      aria-label={label}
    >
      {children}
    </div>
  );
}
