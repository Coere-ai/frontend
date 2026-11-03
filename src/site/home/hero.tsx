"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { buttonClass, CircleArrowLink } from "@/site/ui/button";
import { Container } from "@/site/ui/container";
import { ChromeMark } from "@/site/ui/icons/chrome-mark";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";

const ease = [0.22, 1, 0.36, 1] as const;
const words = ["Own", "your", "Memory"];

/** The two ways further down the page, to the team and developer products. On a phone the short words keep them on one row. */
const paths = [
  { href: "#solutions", label: "Coere for Teams", short: "For Teams" },
  { href: "#forge", label: "Coere for Developers", short: "For Developers" },
];

/**
 * The home page's opening: a very large, centered line, each word rising out
 * of a soft blur in turn, the reason under it, then the install button
 * with a way down to Coere for Teams and Coere for Developers.
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
          Coere is a portable AI memory layer that you, your team and your app own. Your context follows you across ChatGPT, Claude, Gemini and more, so every AI knows you on day one.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7, ease }} className="mt-10 flex flex-col items-center gap-4">
          <CircleArrowLink href="/install" size="lg" icon={<ChromeMark size={22} />}>
            Install Coere
          </CircleArrowLink>
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
            {paths.map((path) => (
              <Link key={path.href} href={path.href} className={buttonClass("secondary", "group")}>
                <span className="sm:hidden">{path.short}</span>
                <span className="hidden sm:inline">{path.label}</span>
                <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
