import Image from "next/image";
import { agents } from "@/lib/site";
import { SlantTiles } from "@/site/ui/slant-tiles";

/** The AIs Coere saves chats from, each on its own slanted tile. */
export function AiTiles({ columns = 3, limit }: { columns?: number; limit?: number }) {
  const apps = limit ? agents.slice(0, limit) : agents;
  return (
    <SlantTiles
      columns={columns}
      items={apps.map((app) => ({
        key: app.name,
        content: (
          <span className="flex flex-col items-center gap-2">
            <Image src={app.logo} alt="" width={30} height={30} unoptimized />
            <span className="text-[13px] text-neutral-700">{app.name}</span>
          </span>
        ),
      }))}
    />
  );
}
