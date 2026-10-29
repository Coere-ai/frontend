import Image from "next/image";
import { films } from "@/site/content/films";
import { VideoPlayer } from "@/site/player/video-player";
import { Container } from "@/site/ui/container";
import { Reveal } from "@/site/ui/reveal";

/**
 * The full v2 demo, set like a product shot: the player floats over the
 * Connect artwork inside one large rounded frame.
 */
export function DemoSection() {
  return (
    <section id="demo" className="scroll-mt-24 pb-28">
      <Container>
        <div className="relative overflow-hidden rounded-[28px] bg-neutral-950 md:rounded-[36px]">
          <Image
            src="/preview/images/connect.webp"
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="scale-110 object-cover blur-[3px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/5 via-neutral-950/15 to-neutral-950/55" />
          <div className="relative px-3 py-6 sm:px-8 sm:py-10 md:px-[7%] md:py-[5.5%]">
            {/* Capped by the screen's height, so the whole player fits in view below the navbar. */}
            <Reveal className="mx-auto w-full max-w-[calc((100svh-13rem)*1.6)]">
              <VideoPlayer
                film={films.v2}
                className="shadow-[0_50px_120px_-30px_rgba(0,0,0,0.75)] ring-1 ring-white/10"
              />
            </Reveal>
          </div>
        </div>
        <p className="mt-5 text-center text-[14px] text-neutral-500">
          Filmed from the real extension with made up chats. Press play, or use the keyboard once the player has focus.
        </p>
      </Container>
    </section>
  );
}
