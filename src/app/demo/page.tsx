import type { Metadata } from "next";
import { DemoPlayer } from "@/components/demo/demo-player";

/** Unlisted: nothing links here and crawlers are told to skip it. */
export const metadata: Metadata = {
  title: "Demo",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
};

/** `/demo?t=24` jumps straight to that second, handy for grabbing stills. */
export default async function DemoPage({ searchParams }: PageProps<"/demo">) {
  const { t } = await searchParams;
  const startAt = Number(Array.isArray(t) ? t[0] : t);

  return (
    <DemoPlayer startAt={Number.isFinite(startAt) ? Math.max(0, startAt) : 0} />
  );
}
