import { useEffect } from "react";

interface HrReviewShortcutsOptions {
  onNext: () => void;
  onPrev: () => void;
  onApprove: () => void;
  onSendBack: () => void;
  onReject: () => void;
  onEscape: () => void;
  onToggleHelp: () => void;
  enabled?: boolean;
}

export function useHrReviewShortcuts({
  onNext,
  onPrev,
  onApprove,
  onSendBack,
  onReject,
  onEscape,
  onToggleHelp,
  enabled = true,
}: HrReviewShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input, textarea, or select
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.isContentEditable)
      ) {
        if (e.key === "Escape") {
          // Allow Escape to blur inputs or close dialogs even when focused, but Radix handles its own Escape.
          // For our global Esc handler, we'll let it pass through.
        } else {
          return; // Ignore all other shortcuts while typing
        }
      }

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          onNext();
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          onPrev();
          break;
        case "a":
        case "A":
          e.preventDefault();
          onApprove();
          break;
        case "s":
        case "S":
          e.preventDefault();
          onSendBack();
          break;
        case "r":
        case "R":
          e.preventDefault();
          onReject();
          break;
        case "Escape":
          // Don't prevent default, Radix uses it
          onEscape();
          break;
        case "?":
          e.preventDefault();
          onToggleHelp();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    onNext,
    onPrev,
    onApprove,
    onSendBack,
    onReject,
    onEscape,
    onToggleHelp,
  ]);
}
