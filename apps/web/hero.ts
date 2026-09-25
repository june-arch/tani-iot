// Tani IoT — HeroUI v3 (CSS-first) design tokens.
// Tidak ada tailwind plugin `heroui()` di v3 — tema diwarisi via
// `@import "@heroui/react/styles"` di globals.css + token kanonik di theme.css.
// File ini adalah sumber tunggal token brand untuk dokumentasi & tooling.
export const heroTokens = {
  colors: {
    "midnight-wine": "#421d24",
    "royal-violet": "#714cb6",
    "lilac-mist": "#d4c7ff",
    "deep-lagoon": "#0c4243",
    "warm-parchment": "#f2f0eb",
    "soft-mist": "#e3e3e2",
    "ink-charcoal": "#292827",
    "stone-gray": "#666666",
    "paper-white": "#ffffff",
  },
  radius: { card: "16px", button: "16px", "small-button": "8px", pill: "999px" },
} as const;
