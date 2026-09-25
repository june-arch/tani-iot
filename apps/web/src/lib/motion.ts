// Tani IoT — varian motion bersama (pengganti duplikasi di 4 pages).
import type { Variants } from "motion/react";

export const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};
