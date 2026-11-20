import Link from "@/site/i18n/link";
import { JoinVisual } from "@/site/careers/join-visual";
import { emailHref } from "@/site/content/navigation";
import { useMessages } from "@/site/i18n/client";
import { Underlined } from "@/site/ui/underlined";


/** About menu: three big links, one above the other (our story, our team and the blog), and the invitation to build Coere with us. */
export function AboutPanel() {
  const t = useMessages("chrome").nav;
  const items = [
    { href: "/about", title: t.ourStory, summary: t.ourStoryLine },
    { href: "/about#team", title: t.ourTeam, summary: t.ourTeamLine },
    { href: "/blog", title: t.blog, summary: t.blogLine },
  ];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-12">
      <ul className="flex flex-col justify-center gap-4">
        {items.map((item) => (
          <li key={item.title}>
            <Link href={item.href} className="group block py-2">
              <span className="block text-[28px] font-medium tracking-[-0.03em] text-white">
                <Underlined big>{item.title}</Underlined>
              </span>
              <span className="mt-1.5 block text-[15px] text-white/60">{item.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
      <JoinVisual href={emailHref} label={t.contactUs} line={t.join} />
    </div>
  );
}
