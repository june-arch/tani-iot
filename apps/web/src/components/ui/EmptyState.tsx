"use client";
import { motion } from "motion/react";
import { Leaf, SearchX, WifiOff, Sprout, Droplets } from "lucide-react";
import { Button } from "./Button";

type Variant = "kebun" | "sensor" | "tanaman" | "search" | "offline";

const ILLUSTRATION: Record<Variant, React.ReactNode> = {
  kebun: (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="90" cy="108" rx="62" ry="10" fill="#E7E5E4" />
      <rect x="52" y="56" width="76" height="48" rx="10" fill="#FFFCF8" stroke="#E7E5E4" strokeWidth="1.5" />
      <rect x="62" y="66" width="56" height="6" rx="3" fill="#E8F5E9" />
      <rect x="62" y="76" width="36" height="6" rx="3" fill="#F5F5F0" />
      <rect x="62" y="88" width="52" height="6" rx="3" fill="#FFFBEB" />
      <circle cx="90" cy="38" r="22" fill="#E8F5E9" />
      <path d="M82 46 C82 30 94 22 100 32 C94 36 92 42 90 46 Z" fill="#2E7D32" opacity="0.95" />
      <path d="M98 46 C98 30 86 22 80 32 C86 36 88 42 90 46 Z" fill="#4CAF50" opacity="0.9" />
      <circle cx="108" cy="26" r="3" fill="#F59E0B" opacity="0.9" />
      <circle cx="72" cy="28" r="2" fill="#F59E0B" opacity="0.6" />
    </svg>
  ),
  sensor: (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="90" cy="108" rx="62" ry="10" fill="#E7E5E4" />
      <rect x="58" y="40" width="64" height="56" rx="14" fill="#FFFCF8" stroke="#E7E5E4" strokeWidth="1.5" />
      <circle cx="90" cy="58" r="10" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="1.2" />
      <circle cx="90" cy="58" r="4" fill="#2E7D32" />
      <path d="M74 78 H106" stroke="#E7E5E4" strokeWidth="2" strokeLinecap="round" />
      <path d="M74 86 H96" stroke="#F5F5F0" strokeWidth="2" strokeLinecap="round" />
      <circle cx="90" cy="24" r="2.5" fill="#F59E0B" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite" />
      </circle>
      <path d="M86 30 C88 26 92 26 94 30" stroke="#2E7D32" strokeWidth="1" opacity="0.5" fill="none" />
      <path d="M82 32 C85 26 95 26 98 32" stroke="#2E7D32" strokeWidth="1" opacity="0.35" fill="none" />
    </svg>
  ),
  tanaman: (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="90" cy="108" rx="62" ry="10" fill="#E7E5E4" />
      <path d="M70 88 C70 88 74 52 90 32 C106 52 110 88 110 88 Z" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="1.2" />
      <path d="M90 88 C90 52 78 64 82 40" stroke="#2E7D32" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M90 72 C96 66 102 62 106 54 C102 58 96 62 90 68" fill="#4CAF50" />
      <path d="M90 68 C84 62 78 58 74 50 C78 54 84 58 90 64" fill="#388E3C" />
      <circle cx="118" cy="36" r="3" fill="#F59E0B" />
      <circle cx="64" cy="42" r="2.2" fill="#F59E0B" opacity="0.7" />
    </svg>
  ),
  search: (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="90" cy="108" rx="62" ry="10" fill="#E7E5E4" />
      <circle cx="84" cy="54" r="22" fill="#FFFCF8" stroke="#E7E5E4" strokeWidth="1.5" />
      <circle cx="84" cy="54" r="12" fill="none" stroke="#A8A29E" strokeWidth="1.6" />
      <path d="M94 64 L106 76" stroke="#A8A29E" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 52 L88 52 M84 48 L84 56" stroke="#D6D3D1" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="122" cy="38" r="2" fill="#F59E0B" opacity="0.6" />
    </svg>
  ),
  offline: (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="90" cy="108" rx="62" ry="10" fill="#E7E5E4" />
      <rect x="56" y="44" width="68" height="48" rx="12" fill="#FFFCF8" stroke="#E7E5E4" strokeWidth="1.5" />
      <path d="M70 66 L100 66 M70 74 L92 74 M70 82 L84 82" stroke="#D6D3D1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="114" cy="30" r="10" fill="#FEE2E2" stroke="#FECACA" />
      <path d="M110 30 L118 30 M114 26 L114 34" stroke="#DC2626" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

export function EmptyState({
  variant = "search",
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  variant?: Variant;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center rounded-card border bg-background p-8 py-12 text-center shadow-sm sm:p-10 sm:py-16"
    >
      <div className="relative">
        {ILLUSTRATION[variant]}
        {icon && (
          <span className="absolute -right-2 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-fg shadow-md">
            {icon}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-sans text-lg font-bold tracking-tight [text-wrap:balance]">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-fg [text-wrap:pretty]">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}

// compact inline variant for card empty
export function EmptyInline({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-soft-fg">
        <Icon className="h-6 w-6" />
      </span>
      <p className="font-sans text-sm font-semibold [text-wrap:balance]">{title}</p>
      <p className="max-w-xs text-xs leading-5 text-muted-fg [text-wrap:pretty]">{desc}</p>
    </div>
  );
}
