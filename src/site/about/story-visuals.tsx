import Image from "next/image";
import { Brand } from "@/site/ui/brand";
import { SlantTiles } from "@/site/ui/slant-tiles";
import { storyApps } from "./story-data";

function Logo({ src, size = 30 }: { src: string; size?: number }) {
  return <Image src={src} alt="" width={size} height={size} unoptimized className="shrink-0" />;
}

/** Step one: the AIs, each on its own tile. */
export function ScatteredApps() {
  return (
    <SlantTiles
      columns={3}
      items={storyApps.map((app) => ({
        key: app.name,
        content: (
          <span className="flex flex-col items-center gap-2">
            <Logo src={app.logo} />
            <span className="text-[13px] text-neutral-700">{app.name}</span>
          </span>
        ),
      }))}
    />
  );
}

/** Step two: the same tiles, each holding the one piece of you it knows. */
export function AppPieces() {
  return (
    <SlantTiles
      columns={3}
      items={storyApps.map((app) => ({
        key: app.name,
        content: (
          <span className="flex flex-col items-center gap-2">
            <Logo src={app.logo} size={22} />
            <span className="rounded-full bg-white px-3 py-1 text-[13px] text-neutral-950 ring-1 ring-neutral-200">{app.piece}</span>
          </span>
        ),
      }))}
    />
  );
}

/** Step three: every piece in one Coere memory. */
export function OneMemory() {
  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-7 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.35)] ring-1 ring-neutral-200">
      <Brand />
      <p className="mt-5 text-[13px] text-neutral-500">Your memory</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {storyApps.map((app) => (
          <li key={app.name} className="rounded-full bg-brand-50 px-3 py-1 text-[13px] text-brand-700">
            {app.piece}
          </li>
        ))}
      </ul>
      <p className="mt-6 flex items-center gap-2 text-[13px] text-neutral-500">
        From
        {storyApps.map((app) => (
          <Logo key={app.name} src={app.logo} size={16} />
        ))}
      </p>
    </div>
  );
}

/** Step four: the person decides which AIs may read it. */
export function YourChoice() {
  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-7 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.35)] ring-1 ring-neutral-200">
      <p className="text-[15px] font-medium text-neutral-950">Who can read your memory</p>
      <ul className="mt-4 divide-y divide-neutral-100">
        {storyApps.map((app) => (
          <li key={app.name} className="flex items-center gap-3 py-2.5">
            <Logo src={app.logo} size={20} />
            <span className="flex-1 text-[14px] text-neutral-800">{app.name}</span>
            <span aria-label={app.allowed ? "Allowed" : "Not allowed"} className={`relative h-5 w-9 rounded-full ${app.allowed ? "bg-neutral-950" : "bg-neutral-200"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${app.allowed ? "left-[18px]" : "left-0.5"}`} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
