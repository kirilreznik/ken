import type { ButtonHTMLAttributes } from "react";
import { chipClass } from "./classes";

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & { selected: boolean };

// Toggle chip: ink when selected, glass (sand on "ללא רקע") otherwise; state via aria-pressed.
export function Chip({ selected, className, type = "button", ...rest }: ChipProps) {
  const cls = className ? `${chipClass(selected)} ${className}` : chipClass(selected);
  return <button {...rest} type={type} aria-pressed={selected} className={cls} />;
}
