import * as React from "react";

export function Card({
  className = "",
  muted = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { muted?: boolean }) {
  return (
    <div
      className={[
        "rounded-card border p-5 shadow-sm transition-shadow",
        muted ? "bg-muted" : "bg-background",
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
  return <h3 className={["font-sans text-sm font-semibold", className].join(" ")} {...props} />;
}

export function CardDesc({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={["text-sm leading-5 text-muted-fg", className].join(" ")} {...props} />;
}
