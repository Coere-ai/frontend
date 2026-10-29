"use client";

import { motion } from "motion/react";
import { Container } from "@/site/ui/container";

const ease = [0.22, 1, 0.36, 1] as const;
const words = ["Own", "your", "Memory"];

/**
 * The home page's opening: a very large, centered line, each word rising out
 * of a soft blur in turn, and the reason under it.
 */
export function Hero() {
  return (
    <section className="pt-20 pb-16 md:pt-28 md:pb-20">
      <Container className="text-center">
        <h1 className="text-[clamp(3.25rem,9vw,7.5rem)] leading-[0.9] font-medium tracking-[-0.055em] text-neutral-950">
          {words.map((word, index) => (
            <motion.span
              key={word}
              className="inline-block"
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.1 + index * 0.12, ease }}
            >
              {word}
              {index < words.length - 1 ? " " : null}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease }}
          className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-neutral-600 text-balance md:text-[22px]"
        >
          The user owned memory layer that you, your team, and your app need, so your AI knows you or your customers better on day one.
        </motion.p>
      </Container>
    </section>
  );
}
