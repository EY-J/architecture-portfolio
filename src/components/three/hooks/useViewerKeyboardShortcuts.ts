"use client";

import { useEffect } from "react";

type ViewerKeyboardShortcutOptions = {
  onClosePanel: () => void;
  onCycleMaterialMode: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onToggleHelp: () => void;
  onToggleInfo: () => void;
};

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName))
  );
}

export function useViewerKeyboardShortcuts({
  onClosePanel,
  onCycleMaterialMode,
  onReset,
  onToggleFullscreen,
  onToggleHelp,
  onToggleInfo,
}: ViewerKeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "escape") onClosePanel();
      else if (key === "r") onReset();
      else if (key === "m") onCycleMaterialMode();
      else if (key === "i") onToggleInfo();
      else if (key === "h" || event.key === "?") onToggleHelp();
      else if (key === "f") onToggleFullscreen();
      else return;

      if (key !== "escape") event.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onClosePanel,
    onCycleMaterialMode,
    onReset,
    onToggleFullscreen,
    onToggleHelp,
    onToggleInfo,
  ]);
}
