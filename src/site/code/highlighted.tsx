import { tokenize } from "./highlight";
import "./code.css";

/** Code as colored spans, for a <pre> on a dark panel. */
export function Highlighted({ code, language }: { code: string; language: string }) {
  return (
    <code className="font-mono">
      {tokenize(code, language).map((token, index) =>
        token.kind === "plain" ? token.text : (
          <span key={index} className={`tok-${token.kind}`}>
            {token.text}
          </span>
        ),
      )}
    </code>
  );
}
