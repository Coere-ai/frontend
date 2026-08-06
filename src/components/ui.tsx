"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/** Shared page container. Wide, with tight side gutters. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[86rem] px-5 sm:px-8 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: { opacity: 1, y: 0 },
};

/** Fades its children into view once, on scroll. */
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
      variants={revealVariants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  title,
  description,
}: {
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink-900 sm:text-[2.5rem] sm:leading-[1.1]">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-900/60">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
