import { InstallButton } from "@/components/install-button";
import { Container, Reveal } from "@/components/ui";

export function ClosingCta() {
  return (
    <section className="pb-20">
      <Container>
        <Reveal>
          <div className="rounded-2xl bg-ink-900 px-6 py-16 text-center sm:py-20">
            <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[2.4rem] sm:leading-[1.1]">
              Your next chat already knows
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-white/55">
              Install Coere once. Every AI you open starts with the context you
              have already given.
            </p>
            <div className="mt-8 flex justify-center">
              <InstallButton />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
