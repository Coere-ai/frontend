/**
 * The Coere Agents hero's backdrop slot: near black with a soft pool of
 * each agent's colour behind the lineup, and a shade behind the words so
 * white type reads. It holds the place for the page's own animated
 * background, which drops in here without touching the hero.
 */
export function AgentsBackdrop() {
  return (
    <div className="absolute inset-0 bg-[#07080f]">
      <div className="absolute inset-0 bg-[radial-gradient(38%_45%_at_62%_42%,rgba(82,103,247,0.42),transparent_70%),radial-gradient(30%_40%_at_80%_60%,rgba(224,123,36,0.24),transparent_70%),radial-gradient(32%_42%_at_70%_78%,rgba(20,160,106,0.22),transparent_70%),radial-gradient(30%_40%_at_92%_32%,rgba(8,145,178,0.28),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,15,0.3),rgba(7,8,15,0.7)_25%,rgba(7,8,15,0.55)_60%,rgba(7,8,15,0.2))] lg:bg-[radial-gradient(ellipse_55%_80%_at_18%_55%,rgba(7,8,15,0.85),rgba(7,8,15,0.5)_55%,transparent_85%)]" />
    </div>
  );
}
