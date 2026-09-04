"use client";
import * as React from "react";

type Variant = "primary" | "secondary" | "outlined" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const variantCls: Record<Variant, string> = {
  // Primary — Midnight Wine #421d24, the ONLY chromatic filled CTA (DESIGN.md)
  primary:
    "bg-midnight-wine text-paper-white hover:bg-[#2f151a] border border-midnight-wine focus-visible:ring-midnight-wine shadow-none",
  // Secondary — Lilac Mist #d4c7ff with ink text + ink border (Outlined Light Button)
  secondary:
    "bg-lilac-mist text-ink-charcoal hover:bg-[#c3b6f0] border border-ink-charcoal focus-visible:ring-royal-violet",
  // Outlined — keep for alternative secondary
  outlined:
    "bg-paper-white text-ink-charcoal hover:bg-warm-parchment border border-soft-mist focus-visible:ring-royal-violet",
  ghost:
    "bg-transparent text-ink-charcoal hover:bg-paper-white hover:shadow-subtle border border-transparent focus-visible:ring-royal-violet",
  destructive:
    "bg-destructive text-destructive-fg hover:bg-[#7f1515] border border-destructive focus-visible:ring-destructive",
};

const sizeCls: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-12 px-5 text-[15px]", // 48px per DESIGN — Primary Action height
  lg: "h-[48px] px-6 text-[15px]",
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-warm-parchment",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none",
        "active:scale-[0.98]",
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
