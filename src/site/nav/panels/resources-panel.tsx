import Image from "next/image";
import Link from "next/link";
import { films } from "@/site/content/films";
import { PlayIcon } from "@/site/ui/icons/player-icons";
import { PanelLabel, PanelLink } from "./panel-parts";

const links = [
  { href: "/#demo", title: "Product demo", summary: "Coere v2 from install to a finished memory." },
  { href: "/resources#films", title: "Feature films", summary: "A short film of each feature." },
  { href: "/resources#privacy", title: "Privacy", summary: "Where your chats and memory live." },
  { href: "/resources#faq", title: "Questions", summary: "Short answers about how Coere works." },
];

/** Resources menu: the learning links, and a card that jumps to the demo. */
export function ResourcesPanel() {
  const demo = films.v2;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12">
      <div>
        <PanelLabel>Learn</PanelLabel>
        <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <PanelLink {...link} />
            </li>
          ))}
        </ul>
      </div>

      <Link href="/#demo" className="group grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center gap-6 rounded-2xl bg-neutral-50 p-4">
        <div className="relative overflow-hidden rounded-xl">
          <Image src={demo.poster} alt="" width={1440} height={900} unoptimized className="aspect-[1440/900] w-full object-cover" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-neutral-950 shadow-lg transition-transform group-hover:scale-105">
              <PlayIcon size={20} />
            </span>
          </span>
        </div>
        <div>
          <p className="text-[13px] font-medium text-neutral-500">Watch</p>
          <p className="mt-1 text-xl font-medium tracking-[-0.02em] text-neutral-950">The full Coere v2 demo</p>
          <p className="mt-1 text-[14px] text-neutral-500">Three and a half minutes, with chapters.</p>
        </div>
      </Link>
    </div>
  );
}
