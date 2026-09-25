"use client";
import * as React from "react";
import { Button as HeroButton } from "@heroui/react";

type Variant = "primary" | "secondary" | "outlined" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const variantCls: Record<Variant, string> = {
  // Primary — Midnight Wine #421d24, the ONLY chromatic filled CTA (DESIGN.md)
  primary:
    "bg-midnight-wine text-paper-white hover:bg-[#2f151a] border border-midnight-wine",
  // Secondary — Lilac Mist #d4c7ff with ink text + ink border
  secondary:
    "bg-lilac-mist text-ink-charcoal hover:bg-[#c3b6f0] border border-ink-charcoal",
  outlined:
    "bg-paper-white text-ink-charcoal hover:bg-warm-parchment border border-soft-mist",
  ghost: "bg-transparent text-ink-charcoal hover:bg-paper-white border border-transparent",
  destructive: "bg-destructive text-destructive-fg hover:bg-[#7f1515] border border-destructive",
};

const sizeCls: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-12 px-5 text-[15px]",
  lg: "h-[48px] px-6 text-[15px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <HeroButton
      className={[
        "inline-flex items-center justify-center gap-2 rounded-button font-semibold",
        "transition-colors duration-150 active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none",
        variantCls[variant],
        sizeCls[size],
        className,
      ].join(" ")}
      {...(props as React.ComponentProps<typeof HeroButton>)}
    >
      {children}
    </HeroButton>
  );
}
