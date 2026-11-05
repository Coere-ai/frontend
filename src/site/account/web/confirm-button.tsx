"use client";

import type { ReactNode } from "react";

/**
 * A submit button that asks first, for the steps on /account that sign a
 * browser out. Without scripts the form still submits, so the page works
 * before it loads.
 */
export function ConfirmButton({ question, className, children }: { question: string; className: string; children: ReactNode }) {
  return (
    <button type="submit" className={className} onClick={(e) => (window.confirm(question) ? undefined : e.preventDefault())}>
      {children}
    </button>
  );
}
