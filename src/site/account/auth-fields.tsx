"use client";

import { type ComponentType, type InputHTMLAttributes } from "react";

import { inputClass } from "@/site/ui/form-field";
import type { IconProps } from "@/site/ui/icons/icon";

/**
 * The input of the sign in and sign up cards: a field with a small icon at
 * its start.
 */

/** The focus ring the account fields add to the shared input look. */
const focusRing = "focus:ring-4 focus:ring-brand-100";

/**
 * An input with an icon inside it, at the start. The icon follows the
 * field's state: grey at rest, ink while focused, red with an error.
 */
export function IconInput({
  icon: Glyph,
  invalid,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon: ComponentType<IconProps>; invalid: boolean }) {
  return (
    <div className="relative">
      <input {...props} className={`peer ${inputClass(invalid)} h-12 pl-11 ${focusRing} ${className}`} />
      <span
        className={`pointer-events-none absolute bottom-0 left-0 grid h-12 w-11 place-items-center pl-1 transition-colors peer-focus:text-neutral-950 ${
          invalid ? "text-red-500" : "text-neutral-500"
        }`}
      >
        <Glyph size={18} />
      </span>
    </div>
  );
}
