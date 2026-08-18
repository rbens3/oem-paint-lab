import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "loading" | "success" | "error";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export default function CopyButton({
  value,
  label = "Copy",
  className = "",
}: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) {
        window.clearTimeout(resetTimer.current);
      }
    },
    [],
  );

  const copyValue = async () => {
    if (state === "loading") {
      return;
    }

    setState("loading");

    try {
      await navigator.clipboard.writeText(value);
      setState("success");
      resetTimer.current = window.setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      resetTimer.current = window.setTimeout(() => setState("idle"), 3000);
    }
  };

  const buttonLabel =
    state === "success"
      ? "Copied"
      : state === "error"
        ? "Copy failed"
        : state === "loading"
          ? "Copying"
          : label;

  return (
    <button
      type="button"
      className={`copy-button ${className}`.trim()}
      data-state={state}
      aria-busy={state === "loading"}
      onClick={copyValue}
    >
      <span aria-live="polite">{buttonLabel}</span>
    </button>
  );
}
