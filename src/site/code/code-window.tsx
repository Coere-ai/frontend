import { Highlighted } from "./highlighted";

/**
 * A small editor window: three dots, a file name, and colored code. For
 * covers and cards where the code is a picture of the work, not the docs.
 */
export function CodeWindow({ file, code, language, className }: { file: string; code: string; language: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl bg-[#0b1020] text-white shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)] ring-1 ring-white/10 ${className ?? ""}`}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-3 font-mono text-[11px] text-white/50">{file}</span>
      </div>
      <pre className="overflow-hidden px-4 py-3.5 text-[11px] leading-relaxed text-white/85">
        <Highlighted code={code} language={language} />
      </pre>
    </div>
  );
}
