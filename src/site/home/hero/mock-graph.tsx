import { LIGHT_COLORS } from "@/site/graph/theme";

/** Maya's sections, each with how many memories hang off it, in the memory graph's colours. */
const sections = [
  { name: "Work", leaves: 5, hue: 0 },
  { name: "Clients", leaves: 4, hue: 1 },
  { name: "People", leaves: 3, hue: 3 },
  { name: "Health", leaves: 2, hue: 4 },
  { name: "Travel", leaves: 3, hue: 2 },
  { name: "Projects", leaves: 4, hue: 5 },
];

const W = 300;
const H = 196;
const CX = W / 2;
const CY = H / 2 + 4;

/** Where each section and its memories sit: sections on an oval round the person, memories fanned outside them. */
const placed = sections.map((s, i) => {
  const angle = (i / sections.length) * Math.PI * 2 - Math.PI / 2 + 0.3;
  const x = CX + Math.cos(angle) * 78;
  const y = CY + Math.sin(angle) * 52;
  const leaves = Array.from({ length: s.leaves }, (_, j) => {
    const a = angle + (j - (s.leaves - 1) / 2) * 0.32;
    return { x: CX + Math.cos(a) * 128, y: CY + Math.sin(a) * 82 };
  });
  return { ...s, x, y, leaves, color: LIGHT_COLORS[s.hue] };
});

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * The memory graph as a small drawing for the hero: the person in the
 * middle, the sections of their life round them, and the memories in each,
 * drawn the way the dashboard's Memory page draws them.
 */
export function MockGraph({ className = "" }: { className?: string }) {
  const memories = sections.reduce((a, s) => a + s.leaves, 0);
  return (
    <div className={`rounded-[16px] bg-white p-4 shadow-[0_2px_4px_rgba(20,17,15,0.04),0_24px_50px_-20px_rgba(23,27,77,0.35)] ring-1 ring-neutral-950/[0.07] ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-neutral-950">Memory graph</p>
        <p className="text-[10.5px] text-neutral-500">
          {memories} memories in {sections.length} sections
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 block h-auto w-full" role="img" aria-label="A memory graph: the person in the middle, six sections round them and the memories in each">
        {placed.map((s) => (
          <g key={s.name}>
            <line x1={CX} y1={CY} x2={round(s.x)} y2={round(s.y)} stroke="rgba(8,14,36,0.16)" strokeWidth="1" />
            {s.leaves.map((l, j) => (
              <line key={j} x1={round(s.x)} y1={round(s.y)} x2={round(l.x)} y2={round(l.y)} stroke="rgba(8,14,36,0.12)" strokeWidth="0.8" />
            ))}
          </g>
        ))}
        {placed.map((s) => (
          <g key={`${s.name}-dots`}>
            {s.leaves.map((l, j) => (
              <circle key={j} cx={round(l.x)} cy={round(l.y)} r="3.2" fill={s.color} opacity="0.75" />
            ))}
            <circle cx={round(s.x)} cy={round(s.y)} r="6.5" fill={s.color} stroke="#fff" strokeWidth="2" />
            <text x={round(s.x)} y={round(s.y + (s.y > CY ? 17 : -11))} textAnchor="middle" fontSize="9.5" fontWeight="500" fill="#080e24" stroke="rgba(255,255,255,0.9)" strokeWidth="3" paintOrder="stroke">
              {s.name}
            </text>
          </g>
        ))}
        <circle cx={CX} cy={CY} r="15" fill="#080e24" />
        <text x={CX} y={CY + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#fff">
          You
        </text>
      </svg>
    </div>
  );
}
