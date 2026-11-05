import Image from "next/image";
import { agents } from "@/lib/site";

/** The AIs Coere saves chats from: each logo and name, plain on the page, with no tile or box around it. */
export function AiTiles({ columns = 3, limit }: { columns?: number; limit?: number }) {
  const apps = limit ? agents.slice(0, limit) : agents;
  return (
    <ul className="grid gap-x-6 gap-y-8" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {apps.map((app) => (
        <li key={app.name} className="flex flex-col items-center gap-2">
          <Image src={app.logo} alt="" width={30} height={30} unoptimized />
          <span className="text-[13px] text-neutral-700">{app.name}</span>
        </li>
      ))}
    </ul>
  );
}
