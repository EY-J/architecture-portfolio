"use client";

import type { ViewerMaterialMode } from "@/lib/three/modelMaterials";
import type { ViewerPanel } from "@/lib/three/viewerTools";

import styles from "./ViewerToolbar.module.css";

type ViewerToolbarProps = {
  activePanel: ViewerPanel;
  isFullscreen: boolean;
  isFullscreenAvailable: boolean;
  isMobile: boolean;
  materialMode: ViewerMaterialMode;
  sectionEnabled: boolean;
  onCycleMaterialMode: () => void;
  onMaterialModeChange: (mode: ViewerMaterialMode) => void;
  onReset: () => void;
  onToggleSection: () => void;
  onToggleFullscreen: () => void;
  onTogglePanel: (panel: Exclude<ViewerPanel, null>) => void;
};

const materialModes: readonly ViewerMaterialMode[] = [
  "original",
  "clay",
  "wireframe",
];

function formatMode(mode: ViewerMaterialMode) {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export function ViewerToolbar({
  activePanel,
  isFullscreen,
  isFullscreenAvailable,
  isMobile,
  materialMode,
  sectionEnabled,
  onCycleMaterialMode,
  onMaterialModeChange,
  onReset,
  onToggleSection,
  onToggleFullscreen,
  onTogglePanel,
}: ViewerToolbarProps) {
  return (
    <nav className={styles.toolbar} aria-label="3D viewer tools">
      <button
        type="button"
        aria-controls="viewer-info-panel"
        aria-expanded={activePanel === "info"}
        aria-keyshortcuts="I"
        onClick={() => onTogglePanel("info")}
      >
        Info
      </button>

      {isMobile ? (
        <button
          type="button"
          aria-keyshortcuts="M"
          aria-label={`Material mode: ${formatMode(materialMode)}. Activate to change mode.`}
          onClick={onCycleMaterialMode}
        >
          Mode / {formatMode(materialMode)}
        </button>
      ) : (
        <div className={styles.modeGroup} role="group" aria-label="Material mode">
          <span>Material</span>
          {materialModes.map((mode) => (
            <button
              key={mode}
              type="button"
              aria-keyshortcuts={mode === materialMode ? "M" : undefined}
              aria-pressed={mode === materialMode}
              onClick={() => onMaterialModeChange(mode)}
            >
              {formatMode(mode)}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        aria-pressed={sectionEnabled}
        onClick={onToggleSection}
      >
        Section
      </button>
      <button
        type="button"
        aria-controls="viewer-tools-panel"
        aria-expanded={activePanel === "tools"}
        onClick={() => onTogglePanel("tools")}
      >
        Tools
      </button>

      <button type="button" aria-keyshortcuts="R" onClick={onReset}>
        Reset
      </button>
      <button
        type="button"
        aria-keyshortcuts="F"
        aria-pressed={isFullscreen}
        disabled={!isFullscreenAvailable}
        title={isFullscreenAvailable ? undefined : "Fullscreen is unavailable in this browser"}
        onClick={onToggleFullscreen}
      >
        {isFullscreen ? "Exit full" : "Fullscreen"}
      </button>
      <button
        type="button"
        aria-controls="viewer-help-panel"
        aria-expanded={activePanel === "help"}
        aria-keyshortcuts="H"
        onClick={() => onTogglePanel("help")}
      >
        Help
      </button>
    </nav>
  );
}
