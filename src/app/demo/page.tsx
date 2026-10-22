import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoPlayer } from "@/components/demo/demo-player";

/**
 * Not public for now: the live site answers 404, while local runs and preview
 * deploys still play the film. Nothing links here, and its noindex keeps any
 * preview out of search.
 */
export const metadata: Metadata = {
  title: "Demo",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
};

/** `/demo?t=24` jumps straight to that second, handy for grabbing stills. */
export default async function DemoPage({ searchParams }: PageProps<"/demo">) {
  if (process.env.VERCEL_ENV === "production") notFound();

  const { t } = await searchParams;
  const startAt = Number(Array.isArray(t) ? t[0] : t);

  return (
    <DemoPlayer startAt={Number.isFinite(startAt) ? Math.max(0, startAt) : 0} />
  );
}
