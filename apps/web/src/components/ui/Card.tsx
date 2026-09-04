import * as React from "react";

export function Card({
  className = "",
  muted = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { muted?: boolean }) {
  return (
    <div
      className={[
        "rounded-card border p-4",
        // DESIGN: no drop shadow, edge defined by hairline Soft Mist #e3e3e2 on parchment
        muted ? "bg-warm-parchment" : "bg-paper-white",
        "border-soft-mist",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function CardHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["flex items-center justify-between gap-2", className].join(" ")} {...props} />;
}

export function CardTitle({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={["font-sans text-[15px] font-semibold leading-5 tracking-tight text-ink-charcoal", className].join(" ")} {...props} />;
}

export function CardDesc({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={["text-sm leading-5 text-stone-gray", className].join(" ")} {...props} />;
}
