"use client";

import { useEffect, useRef, useState } from "react";
import { Container, Reveal, SectionHeading } from "@/components/ui";
import { agents, products, type Product } from "@/lib/site";

type Side = "connect" | "developer" | null;

/**
 * The Chrome wheel, drawn flat so it needs nothing behind it. The blades share
 * seams, so a one-unit underlay runs along each seam and the blade drawn next
 * covers it. That keeps a white hairline from showing between the colors.
 */
function ChromeMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
      <path
        fill="#30A24F"
        d="M13.608 30L3.215 12A24 24 0 0 0 24 48L34.392 30Z"
      />
      <path
        fill="none"
        stroke="#30A24F"
        d="M13.608 30L3.815 13.039M34.392 30L24.6 46.961"
      />
      <path
        fill="#E13A2D"
        d="M24 12L44.785 12A24 24 0 0 0 3.215 12L13.608 30Z"
      />
      <path fill="none" stroke="#E13A2D" d="M24 12L43.585 12" />
      <path fill="#FBBC04" d="M34.392 30L24 48A24 24 0 0 0 44.785 12L24 12Z" />
      <circle cx="24" cy="24" r="12" fill="#fff" />
      <circle cx="24" cy="24" r="9.72" fill="#1A73E8" />
    </svg>
  );
}

/** The product's symbol: the Chrome wheel, or code brackets. */
function ProductSymbol({ icon }: { icon: Product["icon"] }) {
  if (icon === "chrome") return <ChromeMark />;
  return (
    <svg
      viewBox="0 0 24 24"
      // The glyph's ink starts a few pixels into its box; pull it flush with the title.
      className="-ml-1 h-9 w-9 text-brand-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
    </svg>
  );
}

function ProductCard({
  product,
  active,
  onFocus,
}: {
  product: Product;
  active: boolean;
  onFocus: (focused: boolean) => void;
}) {
  return (
    <article
      onPointerEnter={() => onFocus(true)}
      onPointerLeave={() => onFocus(false)}
      className={`flex h-full flex-col rounded-3xl border bg-white p-7 transition-[border-color,box-shadow,transform] duration-500 sm:p-9 ${
        active
          ? "-translate-y-0.5 border-brand-500/35 shadow-[0_24px_60px_-28px_rgba(63,76,235,0.45)]"
          : "border-ink-900/8 shadow-[0_1px_0_rgba(8,14,36,0.02)]"
      }`}
    >
      {/* Fixed height, so both titles line up whatever each symbol's shape. */}
      <div className="flex h-10 items-center">
        <ProductSymbol icon={product.icon} />
      </div>
      <h3 className="mt-5 text-[1.6rem] leading-tight font-semibold tracking-[-0.03em] text-ink-900 sm:text-[1.85rem]">
        {product.name}
      </h3>
      <p className="mt-1.5 text-[14px] font-medium text-brand-600">
        {product.kind}
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-900/65">
        {product.description}
      </p>
    </article>
  );
}

/** Each card speaks for one side of the picture: sources, then readers. */
const sideOf = (index: number): Side => (index === 0 ? "connect" : "developer");

export function Products() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<{ setFocus: (side: Side) => void } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );
  const [cardSide, setCardSide] = useState<Side>(null);
  const [sceneSide, setSceneSide] = useState<Side>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    let engine: { dispose(): void } | null = null;
    let cancelled = false;
    const fail = () => {
      // No WebGL, or the scene failed: the cards stand on their own.
      engine?.dispose();
      engine = null;
      engineRef.current = null;
      if (!cancelled) setStatus("failed");
    };

    import("./three/products-scene")
      .then(async ({ ProductsScene }) => {
        if (cancelled) return;
        const scene = new ProductsScene({
          canvas,
          host: stage,
          agents,
          onHoverSide: setSceneSide,
          onFail: fail,
        });
        engine = scene;
        engineRef.current = scene;
        await scene.ready;
        if (!cancelled) setStatus("ready");
      })
      .catch(fail);

    return () => {
      cancelled = true;
      engineRef.current = null;
      engine?.dispose();
    };
  }, []);

  const focusCard = (side: Side) => {
    setCardSide(side);
    engineRef.current?.setFocus(side);
  };
  const active = cardSide ?? sceneSide;

  return (
    <section id="products" className="py-16 sm:py-24">
      <Container>
        <SectionHeading title="Products" />

        {status !== "failed" ? (
          <Reveal className="mx-auto mt-10 max-w-6xl sm:mt-12">
            <div
              ref={stageRef}
              className="relative h-[38rem] cursor-grab touch-pan-y overflow-hidden rounded-[2rem] border border-ink-900/8 bg-mist select-none md:h-[clamp(22rem,36vw,32rem)]"
            >
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={`Coere in the middle, an icon for each of ${agents
                  .map((agent) => agent.name)
                  .join(
                    ", ",
                  )} feeding it, and a laptop, a phone, a watch, a browser, a chat, a terminal, code, an SDK and a database reading from it`}
                className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${
                  status === "ready" ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </Reveal>
        ) : null}

        <div className="mx-auto mt-5 grid max-w-6xl gap-5 md:mt-6 md:grid-cols-2 md:gap-6">
          {products.map((product, index) => (
            <Reveal key={product.name} delay={index * 0.08}>
              <ProductCard
                product={product}
                active={active === sideOf(index)}
                onFocus={(focused) => focusCard(focused ? sideOf(index) : null)}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
