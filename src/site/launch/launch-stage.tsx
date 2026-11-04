"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

import { timeLeft } from "@/lib/launch/countdown";
import { launchCopy, type LaunchProduct, type LaunchSetting } from "@/site/content/launch";
import { ChromeMark } from "@/site/ui/icons/chrome-mark";

import { CountdownTiles, type CountdownSize } from "./countdown";
import { useNow } from "./use-now";

const looks: Record<CountdownSize, { chip: string; mark: number; eyebrow: string; title: string; gap: { eyebrow: string; chrome: string }; line: string; timer: string; when: string }> = {
  lg: {
    chip: "h-16 w-16",
    mark: 34,
    eyebrow: "mt-7 text-[15px]",
    title: "text-[2.5rem] leading-[1.05] sm:text-5xl md:text-[4.25rem] md:leading-[1.02]",
    gap: { eyebrow: "mt-3", chrome: "mt-7" },
    line: "mt-5 max-w-xl text-lg",
    timer: "mt-14 md:mt-16",
    when: "mt-6 text-[14px] md:text-[15px]",
  },
  md: {
    chip: "h-11 w-11",
    mark: 24,
    eyebrow: "mt-4 text-[12px]",
    title: "text-[26px] leading-[1.08]",
    gap: { eyebrow: "mt-2", chrome: "mt-4" },
    line: "mt-3 max-w-md text-[13.5px]",
    timer: "mt-7",
    when: "mt-4 text-[12px]",
  },
};

/** The moment in the visitor's own words and zone, such as "Monday, November 23 at 9:00 AM PST", with the year only when it is not this one. */
function localMoment(ms: number, now: number): string {
  const year = new Date(ms).getFullYear() === new Date(now).getFullYear() ? undefined : "numeric";
  const date = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year }).format(ms);
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(ms);
  return `${date} at ${time}`;
}

/**
 * A coming soon page's top: the Chrome mark for Coere Connect, the heading,
 * a line, the countdown and whatever comes under it. The admin panel draws
 * the same component as its preview, at the smaller size, so what the
 * operator sees is what a visitor will. At the moment itself the heading
 * says the product is here and the timer rests at zero. With `show` off
 * there is no timer, only the words.
 */
export function LaunchStage({
  product,
  setting,
  size = "lg",
  heading = "h1",
  children,
}: {
  product: LaunchProduct;
  setting: LaunchSetting;
  size?: CountdownSize;
  heading?: "h1" | "h2";
  children?: ReactNode;
}) {
  const copy = launchCopy[product];
  const look = looks[size];
  const now = useNow();
  const target = Date.parse(setting.at);
  const left = now === null ? null : timeLeft(target, now);
  const here = setting.show && left?.done === true;
  const Heading = heading;

  return (
    <MotionConfig reducedMotion="user">
      <div className="text-center">
        {copy.chrome ? (
          <span className={`mx-auto grid place-items-center rounded-full border border-neutral-200 bg-white shadow-[0_18px_40px_-22px_rgba(8,14,36,0.35)] ${look.chip}`}>
            <ChromeMark size={look.mark} />
          </span>
        ) : null}
        {copy.eyebrow ? <p className={`font-medium text-brand-500 ${look.eyebrow}`}>{copy.eyebrow}</p> : null}
        <Heading className={`mx-auto max-w-4xl font-medium tracking-[-0.045em] text-neutral-950 text-balance ${look.title} ${copy.eyebrow ? look.gap.eyebrow : copy.chrome ? look.gap.chrome : ""}`}>
          {here ? copy.here : copy.title}
        </Heading>
        <p className={`mx-auto leading-relaxed text-neutral-600 text-pretty ${look.line}`}>{here ? copy.hereLine : copy.line}</p>
        {setting.show ? (
          <div className={look.timer}>
            <div className="relative">
              {/* One soft wash of the brand blue under the tiles, and no more. */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-[8%] -bottom-10 h-2/3 rounded-full bg-brand-200/45 blur-3xl" />
              <div className="relative">
                <CountdownTiles left={left} size={size} />
              </div>
            </div>
            <p className={`mx-auto min-h-[1.5em] max-w-md text-neutral-500 text-balance ${look.when}`}>
              {now === null ? null : here ? (
                <>Out now.</>
              ) : (
                <>
                  <span aria-hidden="true" className="relative mr-2 inline-flex h-2 w-2 align-middle">
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand-400 opacity-60 motion-reduce:animate-none" />
                    <span className="relative h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  Opens <time dateTime={setting.at}>{localMoment(target, now)}</time>
                </>
              )}
            </p>
          </div>
        ) : null}
        {children}
      </div>
    </MotionConfig>
  );
}
