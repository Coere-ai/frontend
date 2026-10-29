"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Fades its children up into place the first time they scroll into view.
 * Motion honors reduced motion settings, and the root layout's noscript rule
 * shows everything when scripts are off.
 */
export function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
