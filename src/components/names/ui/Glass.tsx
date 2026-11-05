import type { HTMLAttributes, ReactNode } from "react";
import { glassClass, type GlassVariant } from "./classes";

type GlassProps = HTMLAttributes<HTMLElement> & {
  variant?: GlassVariant;
  as?: "div" | "section" | "article" | "header" | "nav" | "aside";
  children?: ReactNode;
};

// Liquid glass panel. Solid white on the "ללא רקע" background, under reduced
// transparency and without backdrop-filter support (names.css).
export function Glass({ variant = "strong", as: Tag = "div", className, ...rest }: GlassProps) {
  return <Tag {...rest} className={className ? `${glassClass(variant)} ${className}` : glassClass(variant)} />;
}
