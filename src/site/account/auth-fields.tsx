"use client";

import { useRef, useState, type ClipboardEvent, type ComponentType, type InputHTMLAttributes, type KeyboardEvent } from "react";

import { inputClass } from "@/site/ui/form-field";
import type { IconProps } from "@/site/ui/icons/icon";

/**
 * The inputs of the sign in, sign up and connect cards: a field with a small
 * icon at its start, and the six boxes of the emailed code.
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

const LENGTH = 6;
const digitsOf = (text: string) => text.replace(/\D/g, "");

/**
 * The emailed code as six boxes. Typing moves to the next box, Backspace on
 * an empty box goes back, and a pasted or autofilled code fills every box.
 * The boxes have no name: the hidden input posts the joined code as `name`,
 * which is what the action reads.
 */
export function CodeInput({ id, name, invalid, describedBy }: { id: string; name: string; invalid: boolean; describedBy?: string }) {
  const [digits, setDigits] = useState<string[]>(() => Array(LENGTH).fill(""));
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  const focusBox = (index: number) => {
    const box = boxes.current[Math.max(0, Math.min(LENGTH - 1, index))];
    box?.focus();
    box?.select();
  };

  /** Writes `text` into the boxes from `start` on, then focuses the box after the last digit. */
  function fill(start: number, text: string) {
    const typed = digitsOf(text).slice(0, LENGTH - start);
    if (!typed) return;
    setDigits((current) => current.map((d, i) => (i >= start && i < start + typed.length ? typed[i - start] : d)));
    focusBox(start + typed.length);
  }

  function onChange(index: number, value: string) {
    const typed = digitsOf(value);
    if (!typed) {
      setDigits((current) => current.map((d, i) => (i === index ? "" : d)));
      return;
    }
    // A whole code (autofill, or a paste the browser typed in) starts from the first box.
    if (typed.length >= LENGTH) return fill(0, typed);
    // A digit typed beside the one already in the box replaces it.
    const fresh = typed.length === 2 && digits[index] ? typed.replace(digits[index], "") || typed[0] : typed;
    fill(index, fresh);
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigits((current) => current.map((d, i) => (i === index - 1 ? "" : d)));
      focusBox(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  }

  function onPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = digitsOf(event.clipboardData.getData("text"));
    fill(pasted.length >= LENGTH ? 0 : index, pasted);
  }

  return (
    <div role="group" aria-labelledby={`${id}-label`} className="mt-2 flex gap-2 sm:gap-2.5">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(box) => {
            boxes.current[index] = box;
          }}
          id={index === 0 ? id : undefined}
          value={digit}
          onChange={(event) => onChange(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => onPaste(index, event)}
          onFocus={(event) => event.target.select()}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={index === 0}
          aria-label={`Digit ${index + 1} of ${LENGTH}`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`h-14 w-full min-w-0 rounded-xl border bg-white text-center text-2xl font-medium text-neutral-950 tabular-nums outline-none transition-colors focus:border-neutral-950 ${focusRing} ${
            invalid ? "border-red-500" : digit ? "border-neutral-400" : "border-neutral-200"
          }`}
        />
      ))}
      <input type="hidden" name={name} value={digits.join("")} />
    </div>
  );
}
