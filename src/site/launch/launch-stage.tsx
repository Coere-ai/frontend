"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

import { timeLeft } from "@/lib/launch/countdown";
import { launchCopy, type LaunchProduct, type LaunchSetting } from "@/site/content/launch";
import { useLocale, useMessages } from "@/site/i18n/client";
import type { Locale } from "@/site/i18n/locales";
import { format } from "@/site/i18n/types";
import { ChromeMark } from "@/site/ui/icons/chrome-mark";

import { Countdown } from "./countdown";
import { useNow } from "./use-now";

/**
 * The moment in the visitor's own zone, such as "Monday, November 23 at
 * 9:00 AM PST", with the year only when it is not this one. An English page
 * keeps the visitor's own date style; another language writes the date its
 * way ("lunes, 23 de noviembre a las 9:00").
 */
function localMoment(ms: number, now: number, locale: Locale, at: string): string {
  const year = new Date(ms).getFullYear() === new Date(now).getFullYear() ? undefined : "numeric";
  const lang = locale === "en" ? undefined : locale;
  const date = new Intl.DateTimeFormat(lang, { weekday: "long", month: "long", day: "numeric", year }).format(ms);
  const time = new Intl.DateTimeFormat(lang, { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(ms);
  return format(at, { date, time });
}

/**
 * The title with the Chrome mark set in the text in front of `markBefore`,
 * sized to the letters. The mark and those words never wrap apart.
 */
function Title({ text, markBefore }: { text: string; markBefore: string | null }) {
  const at = markBefore ? text.indexOf(markBefore) : -1;
  if (!markBefore || at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="whitespace-nowrap">
        <ChromeMark className="mr-[0.16em] inline-block h-[0.82em] w-[0.82em] align-[-0.1em]" />
        {markBefore}
      </span>
      {text.slice(at + markBefore.length)}
    </>
  );
}

/** "Opens {moment}" with the moment as a <time>, wherever the language puts it. */
function Opens({ text, at, moment }: { text: string; at: string; moment: string }) {
  const [before, after = ""] = text.split("{moment}");
  return (
    <>
      {before}
      <time dateTime={at}>{moment}</time>
      {after}
    </>
  );
}

/**
 * A coming soon page's top: the heading, a line, the countdown and whatever
 * comes under it. Once the moment has passed the countdown goes, the
 * heading says where the product is (with the Chrome mark, for Coere
 * Connect) and `here` takes the place of what came under it, such as Add
 * to Chrome. With `show` off there is no timer, only the words.
 */
export function LaunchStage({ product, setting, children, here: after }: { product: LaunchProduct; setting: LaunchSetting; children?: ReactNode; here?: ReactNode }) {
  const t = useMessages("launch");
  const locale = useLocale();
  const copy = { ...t[product], markBefore: launchCopy[product].markBefore };
  const now = useNow();
  const target = Date.parse(setting.at);
  const left = now === null ? null : timeLeft(target, now);
  const here = setting.show && left?.done === true;

  return (
    <MotionConfig reducedMotion="user">
      <div className="text-center">
        <h1 className="mx-auto max-w-4xl text-[2.125rem] leading-[1.08] font-semibold tracking-[-0.045em] text-neutral-950 text-balance dark:text-white sm:text-5xl md:text-[4.25rem] md:leading-[1.02]">
          <Title text={here ? copy.here : copy.title} markBefore={copy.markBefore} />
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-neutral-600 text-pretty dark:text-white/65">{here ? copy.hereLine : copy.line}</p>
        {setting.show && !here ? (
          <div className="mt-14 text-neutral-950 md:mt-16 dark:text-white">
            <Countdown left={left} words={t} />
            <p className="mx-auto mt-5 min-h-[1.5em] max-w-md text-[14px] text-neutral-500 text-balance md:text-[15px] dark:text-white/60">
              {now === null ? null : <Opens text={t.opens} at={setting.at} moment={localMoment(target, now, locale, t.at)} />}
            </p>
          </div>
        ) : null}
        {here && after ? after : children}
      </div>
    </MotionConfig>
  );
}
