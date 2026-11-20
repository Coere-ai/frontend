import Image from "next/image";
import { BrandLockup } from "@/site/nav/brand-lockup";
import { SlantTiles } from "@/site/ui/slant-tiles";
import { storyApps } from "./story-data";

type App = (typeof storyApps)[number];

/** A logo; one drawn in a single dark colour turns white so it reads on the dark page. */
function Logo({ app, size = 30 }: { app: App; size?: number }) {
  return <Image src={app.logo} alt="" width={size} height={size} unoptimized className={`shrink-0 ${app.mono ? "invert" : ""}`} />;
}

/** The tiles as dark glass: a faint fill and a fine light outline. */
const DARK_TILES = "[&_path]:fill-white/[0.05] [&_path]:stroke-white/15";

/** A card in the dark glass style, for the two Coere screens. */
const GLASS_CARD = "mx-auto max-w-md rounded-3xl bg-[#12111c]/90 p-7 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10 backdrop-blur-md";

/** Step one: the AIs, each on its own tile. */
export function ScatteredApps() {
  return (
    <SlantTiles
      columns={3}
      className={DARK_TILES}
      items={storyApps.map((app) => ({
        key: app.name,
        content: (
          <span className="flex flex-col items-center gap-2">
            <Logo app={app} />
            <span className="text-[13px] text-white/75">{app.name}</span>
          </span>
        ),
      }))}
    />
  );
}

/** Step two: the same tiles, each holding the one piece of you it knows. */
export function AppPieces({ pieces }: { pieces: readonly string[] }) {
  return (
    <SlantTiles
      columns={3}
      className={DARK_TILES}
      items={storyApps.map((app, i) => ({
        key: app.name,
        content: (
          <span className="flex flex-col items-center gap-2">
            <Logo app={app} size={22} />
            <span className="text-[13px] text-white/75">{pieces[i] ?? app.piece}</span>
          </span>
        ),
      }))}
    />
  );
}

/** Step three: every piece in one Coere memory. */
export function OneMemory({ pieces, title, from }: { pieces: readonly string[]; title: string; from: string }) {
  return (
    <div className={GLASS_CARD}>
      <BrandLockup white height={22} />
      <p className="mt-5 text-[13px] text-white/55">{title}</p>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {storyApps.map((app, i) => (
          <li key={app.name} className="text-[14px] font-medium text-brand-200">
            {pieces[i] ?? app.piece}
          </li>
        ))}
      </ul>
      <p className="mt-6 flex items-center gap-2 text-[13px] text-white/55">
        {from}
        {storyApps.map((app) => (
          <Logo key={app.name} app={app} size={16} />
        ))}
      </p>
    </div>
  );
}

/** Step four: the person decides which AIs may read it. */
export function YourChoice({ title, allowed, notAllowed }: { title: string; allowed: string; notAllowed: string }) {
  return (
    <div className={GLASS_CARD}>
      <p className="text-[15px] font-medium text-white">{title}</p>
      <ul className="mt-4 divide-y divide-white/10">
        {storyApps.map((app) => (
          <li key={app.name} className="flex items-center gap-3 py-2.5">
            <Logo app={app} size={20} />
            <span className="flex-1 text-[14px] text-white/85">{app.name}</span>
            <span aria-label={app.allowed ? allowed : notAllowed} className={`relative h-5 w-9 rounded-full ${app.allowed ? "bg-brand-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${app.allowed ? "left-[18px]" : "left-0.5"}`} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
