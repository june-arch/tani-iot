"use client";
import * as React from "react";

export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold tracking-wide text-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={!!error}
        className={[
          "h-11 w-full rounded-button border bg-background px-3.5 text-sm",
          "placeholder:text-muted-fg/60",
          "transition-colors",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
          error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : "border-border",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  id,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
}) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold tracking-wide text-foreground">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        aria-invalid={!!error}
        className={[
          "min-h-24 w-full rounded-button border bg-background px-3.5 py-3 text-sm",
          "placeholder:text-muted-fg/60",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          "disabled:opacity-50",
          error ? "border-destructive" : "border-border",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  error,
  id,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
}) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold tracking-wide text-foreground">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={[
          "h-11 w-full rounded-button border bg-background px-3.5 text-sm",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          "disabled:opacity-50",
          error ? "border-destructive" : "border-border",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
