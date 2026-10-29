import Link from "next/link";
import { JoinVisual } from "@/site/careers/join-visual";
import { contactHref } from "@/site/content/navigation";
import { Underlined } from "@/site/ui/underlined";

const items = [
  { href: "/about", title: "Our story", summary: "Why memory should belong to you." },
  { href: "/about#team", title: "About Us", summary: "The people building Coere." },
];

/** About menu: two big links, one above the other, and the invitation to build Coere with us. */
export function AboutPanel() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-12">
      <ul className="flex flex-col justify-center gap-4">
        {items.map((item) => (
          <li key={item.title}>
            <Link href={item.href} className="group block py-2">
              <span className="block text-[28px] font-medium tracking-[-0.03em] text-neutral-950">
                <Underlined big>{item.title}</Underlined>
              </span>
              <span className="mt-1.5 block text-[15px] text-neutral-500">{item.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
      <JoinVisual href={contactHref} label="Contact us" />
    </div>
  );
}
