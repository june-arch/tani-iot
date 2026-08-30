"use client";
import * as React from "react";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const variantCls: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-fg hover:bg-primary-hover focus-visible:ring-primary disabled:opacity-50",
  secondary:
    "bg-muted text-foreground hover:bg-border focus-visible:ring-ring disabled:opacity-50 border",
  accent:
    "bg-accent text-accent-fg hover:bg-accent-hover focus-visible:ring-accent disabled:opacity-50",
  ghost:
    "bg-transparent text-foreground hover:bg-muted focus-visible:ring-ring disabled:opacity-50",
  destructive:
    "bg-destructive text-destructive-fg hover:bg-[#B91C1C] focus-visible:ring-destructive disabled:opacity-50",
};

const sizeCls: Record<Size, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm", // 44px min
  lg: "h-12 px-6 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-button font-semibold",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:pointer-events-none",
        "active:scale-[0.97]",
        variantCls[variant],
        sizeCls[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
