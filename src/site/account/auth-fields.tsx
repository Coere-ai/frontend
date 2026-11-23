"use client";

import { useState, type ComponentType, type InputHTMLAttributes } from "react";

import { inputClass } from "@/site/ui/form-field";
import type { IconProps } from "@/site/ui/icons/icon";
import { EyeIcon, EyeOffIcon } from "@/site/ui/icons/interface-icons";

/**
 * The input of the sign in and sign up cards: a field with a small icon at
 * its start. A password field also gets a button at its end that shows or
 * hides what was typed.
 */

/** The focus ring the account fields add to the shared input look. */
const focusRing = "focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-500/25";

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
  const password = props.type === "password";
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={password && shown ? "text" : props.type} className={`peer ${inputClass(invalid)} h-12 pl-11 ${password ? "pr-12" : ""} ${focusRing} ${className}`} />
      <span
        className={`pointer-events-none absolute bottom-0 left-0 grid h-12 w-11 place-items-center pl-1 transition-colors peer-focus:text-neutral-950 dark:peer-focus:text-white ${
          invalid ? "text-red-500 dark:text-red-400" : "text-neutral-500 dark:text-white/55"
        }`}
      >
        <Glyph size={18} />
      </span>
      {password ? <RevealButton shown={shown} onToggle={() => setShown((value) => !value)} /> : null}
    </div>
  );
}

/**
 * Shows or hides a password. It sits at the end of the field and says
 * what it will do next.
 */
export function RevealButton({ shown, onToggle, className = "bottom-1.5" }: { shown: boolean; onToggle: () => void; className?: string }) {
  const Glyph = shown ? EyeOffIcon : EyeIcon;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "Hide password" : "Show password"}
      aria-pressed={shown}
      className={`absolute right-1.5 ${className} grid h-9 w-9 place-items-center rounded-lg text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-white/55 dark:hover:text-white`}
    >
      <Glyph size={18} />
    </button>
  );
}

/** A plain password input with the same show and hide button at its end. */
export function PasswordInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative flex-1">
      <input {...props} type={shown ? "text" : "password"} className={`${className} pr-12`} />
      <RevealButton shown={shown} onToggle={() => setShown((value) => !value)} className="bottom-1" />
    </div>
  );
}
