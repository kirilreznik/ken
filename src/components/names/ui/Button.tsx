import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { buttonClass, iconButtonClass, type ButtonSize, type ButtonVariant } from "./classes";

type ButtonAttrs = ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkAttrs = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

// The peach circle has no visible text, so it needs a Hebrew aria-label like IconButton.
type ButtonProps = (ButtonAttrs | LinkAttrs) &
  ({ variant?: Exclude<ButtonVariant, "peach">; size?: ButtonSize } | { variant: "peach"; size?: ButtonSize; "aria-label": string });

function join(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

// Primary ink pill, secondary glass pill, peach circle or text link. With href it renders a Link.
export function Button({ variant = "primary", size = "lg", className, ...rest }: ButtonProps) {
  const cls = join(buttonClass(variant, size), className);
  if (rest.href !== undefined) {
    return <Link {...(rest as LinkAttrs)} data-control className={cls} />;
  }
  const { type = "button", ...attrs } = rest as ButtonAttrs;
  return <button {...attrs} type={type} className={cls} />;
}

type IconButtonProps = (ButtonAttrs | LinkAttrs) & { "aria-label": string };

// 44 px round glass button with an icon only; the Hebrew aria-label is required.
export function IconButton({ className, ...rest }: IconButtonProps) {
  const cls = join(iconButtonClass(), className);
  if (rest.href !== undefined) {
    return <Link {...(rest as LinkAttrs)} data-control className={cls} />;
  }
  const { type = "button", ...attrs } = rest as ButtonAttrs;
  return <button {...attrs} type={type} className={cls} />;
}
