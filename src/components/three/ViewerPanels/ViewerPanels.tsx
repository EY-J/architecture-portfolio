"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import type { ViewerMaterialMode } from "@/lib/three/modelMaterials";
import type { ArchitectureProject } from "@/types/project";

import styles from "./ViewerPanels.module.css";

type ViewerPanelProps = {
  activePanel: "info" | "help" | null;
  isMobile: boolean;
  materialMode: ViewerMaterialMode;
  modelLabel: string;
  project: ArchitectureProject;
  sourceStatus: string;
  onClose: () => void;
};

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className={styles.detail}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function ViewerPanels({
  activePanel,
  isMobile,
  materialMode,
  modelLabel,
  project,
  sourceStatus,
  onClose,
}: ViewerPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (activePanel) {
      previousFocusRef.current ??=
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      closeButtonRef.current?.focus();
      return;
    }

    if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    previousFocusRef.current = null;
  }, [activePanel]);

  if (!activePanel) return null;

  const isInfo = activePanel === "info";
  const panelId = isInfo ? "viewer-info-panel" : "viewer-help-panel";

  return (
    <section
      id={panelId}
      className={`${styles.panel} motion-panel`}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${panelId}-title`}
    >
      <header className={styles.header}>
        <p className="eyebrow">{isInfo ? "Project information" : "Viewer guide"}</p>
        <button ref={closeButtonRef} type="button" onClick={onClose}>
          Close / Esc
        </button>
      </header>

      {isInfo ? (
        <div className={styles.content}>
          <div>
            <h2 id={`${panelId}-title`}>{project.title}</h2>
            <p className={styles.summary}>{project.summary}</p>
          </div>
          <dl className={styles.details}>
            <Detail label="Location" value={project.location} />
            <Detail label="Year" value={project.year} />
            <Detail label="Category" value={project.category} />
            <Detail label="Status" value={project.status} />
            <Detail label="Area" value={project.area} />
            <Detail label="Role" value={project.role} />
            <Detail label="Model" value={modelLabel} />
            <Detail label="Source state" value={sourceStatus} />
            <Detail label="Material" value={materialMode} />
          </dl>
          <Link className={styles.projectLink} href={`/projects/${project.slug}`}>
            View full project
          </Link>
        </div>
      ) : (
        <div className={styles.content}>
          <div>
            <h2 id={`${panelId}-title`}>Navigate the model</h2>
            <p className={styles.summary}>
              {isMobile
                ? "Drag to orbit, pinch to zoom, and use two fingers to pan." :"Drag to orbit, right-drag to pan, and scroll to zoom."}
            </p>
          </div>
          <dl className={styles.shortcuts}>
            <Detail label="R" value="Reset view" />
            <Detail label="M" value="Cycle material" />
            <Detail label="I" value="Project info" />
            <Detail label="H or ?" value="Viewer help" />
            <Detail label="F" value="Toggle fullscreen" />
            <Detail label="Esc" value="Close panel / exit fullscreen" />
          </dl>
          <p className={styles.note}>
            The model is a visual aid. Complete project information remains available on the
            project page.
          </p>
        </div>
      )}
    </section>
  );
}
