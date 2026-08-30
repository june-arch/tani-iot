import * as React from "react";

type Variant = "success" | "warning" | "destructive" | "info" | "neutral" | "primary";

const map: Record<Variant, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-[#92400E]",
  destructive: "bg-destructive-soft text-[#991B1B]",
  info: "bg-info-soft text-info border border-info/20",
  neutral: "bg-muted text-muted-fg border",
  primary: "bg-primary-soft text-primary-soft-fg",
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
