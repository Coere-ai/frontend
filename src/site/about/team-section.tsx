import { founders } from "@/lib/site";
import { getLocale, getMessages } from "@/site/i18n/server";
import { AsciiStream } from "@/site/art/ascii-stream";
import { Container } from "@/site/ui/container";
import { Reveal } from "@/site/ui/reveal";
import { TeamCard } from "./team-card";
import { TeamLanyards } from "./team-lanyards";

/**
 * Lets the stream rise out of the page above and run out before the
 * founders' records, so the page stays flat near black round it.
 */
const STREAM_EDGES = "linear-gradient(to bottom, transparent 0%, #000 24%, #000 80%, transparent 100%)";

/** Thins the stream behind the heading and its line, so the words stay in front and readable. */
const HEADING_CALM = "radial-gradient(ellipse 34% 22% at 50% 15%, rgba(0,0,0,0.15), rgba(0,0,0,0.55) 60%, #000 100%)";

/**
 * The people behind Coere, on the dark page: their lanyards, then each
 * founder's record in two columns. Behind the heading and the lanyards,
 * ribbons of light and glyphs stream out from a bright seam that runs
 * level with the cards. It takes no clicks, so the cards drag and flip
 * as before.
 */
export async function TeamSection() {
  const [locale, { about }] = await Promise.all([getLocale(), getMessages()]);
  const t = about.team;
  // The founders' facts in the page's language; names, schools and photos stay as they are.
  const members = founders.map((member, i) => {
    const words = t.founders[i];
    return words ? { ...member, role: words.role, majors: [...words.majors], highlights: [...words.highlights] } : member;
  });
  return (
    <section id="team" className="relative isolate scroll-mt-24 overflow-hidden pt-24 pb-28 md:pt-32">
      <Container>
        <div className="relative">
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 bottom-0 left-1/2 -z-10 w-screen -translate-x-1/2 md:-top-32" style={{ maskImage: STREAM_EDGES, WebkitMaskImage: STREAM_EDGES }}>
            <div className="absolute inset-0" style={{ maskImage: HEADING_CALM, WebkitMaskImage: HEADING_CALM }}>
              <AsciiStream seamY={0.62} />
            </div>
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-brand-300">{t.eyebrow}</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-white text-balance md:text-[3.5rem] md:leading-[1.04]">
              {t.title}
            </h2>
          </div>
          <div className="mx-auto mt-4 max-w-6xl">
            <TeamLanyards members={members} />
          </div>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
          {members.map((member, index) => (
            <Reveal key={member.name} delay={index * 0.06} className="h-full">
              <TeamCard member={member} locale={locale} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
