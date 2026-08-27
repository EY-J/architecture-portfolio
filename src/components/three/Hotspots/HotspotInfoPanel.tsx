"use client";

import { useEffect, useRef } from "react";

import type { ProjectHotspot } from "@/types/project";

import styles from "./HotspotInfoPanel.module.css";

export function HotspotInfoPanel({
  hotspot,
  onClose,
}: {
  hotspot: ProjectHotspot;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();
    return () => {
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [hotspot.id]);

  return (
    <aside
      className={`${styles.panel} motion-panel`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="hotspot-panel-title"
    >
      <div className={styles.index}>Configured point / {hotspot.id}</div>
      <h2 id="hotspot-panel-title">{hotspot.label}</h2>
      {hotspot.description ? <p>{hotspot.description}</p> : null}
      <p className={styles.coordinates}>
        Position / {hotspot.position.map((value) => value.toFixed(2)).join(" / ")}
      </p>
      <button ref={closeButtonRef} type="button" onClick={onClose}>
        Close / Esc
      </button>
    </aside>
  );
}
