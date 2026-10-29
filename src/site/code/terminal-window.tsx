import { Highlighted } from "./highlighted";

/** A terminal: the command, colored, then what it printed. */
export function TerminalWindow({ command, output, className }: { command: string; output: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl bg-[#0b1020] text-white ring-1 ring-white/10 ${className ?? ""}`}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-3 text-[11px] text-white/50">Terminal</span>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 text-[11px] leading-relaxed">
        <span className="text-white/45">$ </span>
        <Highlighted code={command} language="bash" />
        {"\n"}
        <code className="font-mono text-white/75">{output}</code>
      </pre>
    </div>
  );
}
