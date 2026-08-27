"use client";

import { useEffect, useRef } from "react";

import type { SectionAxis, SectionState } from "@/lib/three/viewerTools";
import type { ProjectFloor, ProjectView } from "@/types/project";

import styles from "./ArchitectureToolsPanel.module.css";

type ArchitectureToolsPanelProps = {
  activeFloorId: string;
  activeViewId: string | null;
  floors?: readonly ProjectFloor[];
  isOpen: boolean;
  section: SectionState;
  views?: readonly ProjectView[];
  onClose: () => void;
  onResetSection: () => void;
  onSectionAxisChange: (axis: SectionAxis) => void;
  onSectionOffsetChange: (offset: number) => void;
  onSelectFloor: (floorId: string) => void;
  onSelectView: (view: ProjectView) => void;
  onToggleSection: () => void;
};

const sectionAxes: readonly SectionAxis[] = ["x", "y", "z"];

export function ArchitectureToolsPanel({
  activeFloorId,
  activeViewId,
  floors,
  isOpen,
  section,
  views,
  onClose,
  onResetSection,
  onSectionAxisChange,
  onSectionOffsetChange,
  onSelectFloor,
  onSelectView,
  onToggleSection,
}: ArchitectureToolsPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current ??=
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      closeButtonRef.current?.focus();
      return;
    }

    if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    previousFocusRef.current = null;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <section
      id="viewer-tools-panel"
      className={`${styles.panel} motion-panel`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="viewer-tools-title"
    >
      <header className={styles.header}>
        <div>
          <p className="eyebrow">Architecture tools</p>
          <h2 id="viewer-tools-title">Inspect the model</h2>
        </div>
        <button ref={closeButtonRef} type="button" onClick={onClose}>
          Close / Esc
        </button>
      </header>

      <div className={styles.content}>
        {views?.length ? (
          <fieldset className={styles.toolGroup}>
            <legend>Saved views</legend>
            <div className={styles.buttonGrid}>
              {views.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  aria-pressed={activeViewId === view.id}
                  onClick={() => onSelectView(view)}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {floors?.length ? (
          <fieldset className={styles.toolGroup}>
            <legend>Floor isolation</legend>
            <div className={styles.buttonGrid}>
              <button
                type="button"
                aria-pressed={activeFloorId === "all"}
                onClick={() => onSelectFloor("all")}
              >
                All
              </button>
              {floors.map((floor) => (
                <button
                  key={floor.id}
                  type="button"
                  aria-pressed={activeFloorId === floor.id}
                  onClick={() => onSelectFloor(floor.id)}
                >
                  {floor.label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <fieldset className={styles.toolGroup}>
          <legend>Section plane</legend>
          <div className={styles.sectionHeader}>
            <p>{section.enabled ? "Section active" : "Section inactive"}</p>
            <button
              type="button"
              aria-pressed={section.enabled}
              onClick={onToggleSection}
            >
              {section.enabled ? "Turn off" : "Turn on"}
            </button>
          </div>

          <div className={styles.axisGroup} role="group" aria-label="Section axis">
            {sectionAxes.map((axis) => (
              <button
                key={axis}
                type="button"
                aria-pressed={section.axis === axis}
                disabled={!section.enabled}
                onClick={() => onSectionAxisChange(axis)}
              >
                {axis.toUpperCase()}
              </button>
            ))}
          </div>

          <label className={styles.rangeLabel}>
            <span>Cut position</span>
            <span>{Math.round(section.offset * 100)}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={section.offset}
              disabled={!section.enabled}
              aria-valuetext={`${Math.round(section.offset * 100)} percent along ${section.axis.toUpperCase()} axis`}
              onChange={(event) =>
                onSectionOffsetChange(Number(event.currentTarget.value))
              }
            />
          </label>

          <button
            className={styles.resetButton}
            type="button"
            disabled={!section.enabled}
            onClick={onResetSection}
          >
            Reset section
          </button>
        </fieldset>
      </div>
    </section>
  );
}
