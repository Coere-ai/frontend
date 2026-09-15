"use client";

import { motion } from "motion/react";
import { Orbit } from "@/components/orbit";
import { Container } from "@/components/ui";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0 },
};

const ease = [0.22, 1, 0.36, 1] as const;

export function WhatWeDo() {
  return (
    <section id="what-we-do" className="pt-20 pb-16 sm:pt-28">
      <Container>
        <motion.div
          initial="hidden"
          animate="shown"
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5, ease }}
            className="text-[2.75rem] leading-[1.04] font-semibold tracking-[-0.04em] text-ink-900 sm:text-6xl"
          >
            Building the memory
            <br className="hidden sm:block" /> layer of the future
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease }}
          className="mt-12 sm:mt-16"
        >
          <Orbit />
        </motion.div>
      </Container>
    </section>
  );
}
