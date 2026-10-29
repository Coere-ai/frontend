import { LogoMark } from "@/components/logo";
import { backgrounds } from "@/site/content/backgrounds";
import { SizedPhoto } from "@/site/ui/sized-photo";

/** How each card sits in the fan: turned in 3D, raised and tilted a little. */
const poses = {
  left: "translate-x-[-80%] translate-y-[12%] rotate-[-10deg] [transform:rotateY(20deg)]",
  middle: "z-10",
  right: "translate-x-[80%] translate-y-[12%] rotate-[10deg] [transform:rotateY(-20deg)]",
};

const cardShape = "absolute aspect-[5/7] w-[24%] overflow-hidden rounded-2xl";

/**
 * The back of a Coere card: deep blue with a fine diagonal weave, the mark
 * in the middle, and a sheen across the top as if it caught the light.
 */
function CardBack({ pose }: { pose: string }) {
  return (
    <div className={`${cardShape} ${pose} shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/25`}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-400 via-brand-700 to-[#0b1020]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-25"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 9px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 9px)" }}
      />
      <div className="absolute inset-[7%] rounded-xl ring-1 ring-white/40" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="grid h-[38%] w-[52%] place-items-center rounded-full bg-white/10 ring-1 ring-white/40 backdrop-blur-[2px]">
          <LogoMark className="h-1/2 w-1/2 text-white" />
        </span>
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-transparent" />
    </div>
  );
}

/** The face card no one holds yet: an empty portrait waiting for the next founding teammate. */
function OpenCard() {
  return (
    <div className={`${cardShape} ${poses.middle} -translate-y-[4%] bg-white p-[6%] shadow-[0_40px_70px_-20px_rgba(0,0,0,0.75)] ring-1 ring-white/60`}>
      <div className="flex items-center justify-between text-brand-500">
        <LogoMark className="h-4 w-4" />
        <span className="text-[10px] font-medium tracking-[0.12em] uppercase">Founding</span>
      </div>
      <div className="mt-[8%] grid aspect-square place-items-center rounded-xl border-2 border-dashed border-brand-300 bg-brand-50">
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 text-brand-300" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true">
          <circle cx="12" cy="9" r="3.5" />
          <path d="M5.5 19.5c1.2-3.2 3.7-5 6.5-5s5.3 1.8 6.5 5" />
        </svg>
      </div>
      <p className="mt-[9%] text-[14px] font-medium text-neutral-950">You</p>
      <p className="text-[11px] text-neutral-500">Founding team</p>
    </div>
  );
}

/**
 * The careers invitation: a fan of Coere cards over blue artwork, two
 * turned face down and the face card in the middle left open for whoever
 * joins next. Still, with no motion.
 */
export function JoinVisual({ className }: { className?: string }) {
  return (
    <div className={`relative isolate overflow-hidden rounded-2xl bg-neutral-950 ${className ?? ""}`}>
      <SizedPhoto src={backgrounds.waves.src} alt="" fill sizes="700px" className="-z-10 object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-950/55 to-neutral-950/0" />
      <p className="p-6 text-[22px] leading-tight font-medium tracking-[-0.02em] text-white text-balance">
        Come join us in building the future of AI infrastructure.
      </p>
      <div className="relative mx-auto mt-2 flex h-[300px] items-start justify-center [perspective:900px]" aria-hidden="true">
        <CardBack pose={poses.left} />
        <CardBack pose={poses.right} />
        <OpenCard />
      </div>
    </div>
  );
}
