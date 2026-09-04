import * as React from "react";

type Variant = "success" | "warning" | "destructive" | "info" | "neutral" | "primary" | "lilac";

const map: Record<Variant, string> = {
  // keep semantics but on parchment palette
  success: "bg-[#d4f5e2] text-[#14532d] border border-[#a7e8c2]/50",
  warning: "bg-warning-soft text-[#92400E] border border-warning/15",
  destructive: "bg-destructive-soft text-destructive border border-destructive/10",
  info: "bg-lilac-mist text-ink-charcoal border border-royal-violet/15",
  neutral: "bg-paper-white text-stone-gray border border-soft-mist",
  primary: "bg-midnight-wine text-paper-white border border-midnight-wine",
  lilac: "bg-lilac-mist text-ink-charcoal border border-royal-violet/10",
};

export function Badge({
  variant = "neutral",
  className = "",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-semibold leading-none",
        map[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
