"use client";

import { Canvas } from "@react-three/fiber";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WebGLRenderer } from "three";

import { defaultViewerCamera, viewerPerformance } from "@/config/viewer";
import type { ViewerMaterialMode } from "@/lib/three/modelMaterials";
import type {
  ModelLoadProgress,
  ModelPreparationPhase,
  ViewerModelState,
} from "@/lib/three/modelTypes";
import { getModelLabel, hasExternalModelSource } from "@/lib/three/modelUtils";
import type {
  GuidedViewRequest,
  SectionAxis,
  SectionState,
  ViewerPanel,
} from "@/lib/three/viewerTools";
import type { ArchitectureProject, ProjectView } from "@/types/project";

import { ArchitectureScene } from "../ArchitectureScene/ArchitectureScene";
import { ArchitectureToolsPanel } from "../ArchitectureToolsPanel/ArchitectureToolsPanel";
import { HotspotInfoPanel } from "../Hotspots/HotspotInfoPanel";
import { useResponsiveViewer } from "../hooks/useResponsiveViewer";
import { useViewerKeyboardShortcuts } from "../hooks/useViewerKeyboardShortcuts";
import { LoadingOverlay } from "../LoadingOverlay/LoadingOverlay";
import { ViewerPanels } from "../ViewerPanels/ViewerPanels";
import { ViewerToolbar } from "../ViewerToolbar/ViewerToolbar";
import { WebGLFallback } from "../WebGLFallback/WebGLFallback";
import styles from "./ArchitectureViewer.module.css";
import { ViewerErrorBoundary } from "./ViewerErrorBoundary";

type ArchitectureViewerProps = { project: ArchitectureProject };
type WebGLState = "supported" | "unsupported" | "lost";

const materialModes: readonly ViewerMaterialMode[] = [
  "original",
  "clay",
  "wireframe",
];

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!context) return false;

    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function getSourceStatus(modelState: ViewerModelState) {
  if (modelState.status === "procedural") return "Procedural placeholder";
  if (modelState.status === "loading") return "Loading";
  if (modelState.status === "error") return "Unavailable";
  if (modelState.usedFallback) return "Fallback source loaded";
  if (modelState.diagnostics.isHeavy) return "Heavy model / reduced rendering";
  if (modelState.warnings.length > 0) return "Loaded with warnings";
  return "Model loaded";
}

export function ArchitectureViewer({ project }: ArchitectureViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [webGLState, setWebGLState] = useState<WebGLState>(() =>
    supportsWebGL() ? "supported" : "unsupported",
  );
  const [modelState, setModelState] = useState<ViewerModelState>(() =>
    hasExternalModelSource(project.model)
      ? { status: "loading", phase: "downloading" }
      : { status: "procedural" },
  );
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(() =>
    hasExternalModelSource(project.model),
  );
  const [loadingOverlayProgress, setLoadingOverlayProgress] =
    useState<ModelLoadProgress>();
  const [loadingOverlayPhase, setLoadingOverlayPhase] =
    useState<ModelPreparationPhase>("downloading");
  const [activePanel, setActivePanel] = useState<ViewerPanel>(null);
  const [activeFloorId, setActiveFloorId] = useState("all");
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [guidedViewRequest, setGuidedViewRequest] =
    useState<GuidedViewRequest>(null);
  const guidedViewSequence = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenAvailable] = useState(
    () =>
      typeof document !== "undefined" &&
      document.fullscreenEnabled &&
      typeof HTMLElement.prototype.requestFullscreen === "function",
  );
  const [materialMode, setMaterialMode] = useState<ViewerMaterialMode>("original");
  const [resetRequest, setResetRequest] = useState(0);
  const [section, setSection] = useState<SectionState>({
    enabled: false,
    axis: "y",
    offset: 0.65,
  });
  const { isMobile, maxDpr, shadowsEnabled } = useResponsiveViewer();
  const isHeavyModel =
    modelState.status === "ready" && modelState.diagnostics.isHeavy;
  const effectiveMaxDpr = isHeavyModel
    ? Math.min(maxDpr, viewerPerformance.heavyModelMaxDpr)
    : maxDpr;
  const cameraPosition = project.model?.camera?.position ?? defaultViewerCamera.position;
  const background = project.model?.environment?.background ?? "#dedbd3";
  const exposure = project.model?.environment?.exposure ?? 1;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleContextLost = useCallback(() => setWebGLState("lost"), []);
  const handleModelStateChange = useCallback((state: ViewerModelState) => {
    if (state.status === "loading") {
      setShowLoadingOverlay(true);
      setLoadingOverlayPhase(state.phase);
      setLoadingOverlayProgress(state.progress);
    }
    setModelState(state);
  }, []);
  const handleLoadingExited = useCallback(
    () => setShowLoadingOverlay(false),
    [],
  );
  const configureRenderer = useCallback(
    ({ gl }: { gl: WebGLRenderer }) => {
      gl.setClearColor(background);
      gl.toneMappingExposure = exposure;
    },
    [background, exposure],
  );
  const handleReset = useCallback(() => {
    setActiveViewId(null);
    setGuidedViewRequest(null);
    setResetRequest((value) => value + 1);
  }, []);
  const handleCloseOverlay = useCallback(() => {
    setActivePanel(null);
    setActiveHotspotId(null);
  }, []);
  const handleTogglePanel = useCallback((panel: Exclude<ViewerPanel, null>) => {
    setActiveHotspotId(null);
    setActivePanel((current) => (current === panel ? null : panel));
  }, []);
  const handleSelectHotspot = useCallback((hotspotId: string) => {
    setActivePanel(null);
    setActiveHotspotId((current) => (current === hotspotId ? null : hotspotId));
  }, []);
  const handleSelectView = useCallback((view: ProjectView) => {
    guidedViewSequence.current += 1;
    setActiveViewId(view.id);
    setGuidedViewRequest({
      sequence: guidedViewSequence.current,
      view,
    });
  }, []);
  const handleToggleSection = useCallback(() => {
    setSection((current) => ({ ...current, enabled: !current.enabled }));
  }, []);
  const handleResetSection = useCallback(() => {
    setSection({ enabled: true, axis: "y", offset: 0.65 });
  }, []);
  const handleSectionAxisChange = useCallback((axis: SectionAxis) => {
    setSection((current) => ({ ...current, axis }));
  }, []);
  const handleSectionOffsetChange = useCallback((offset: number) => {
    setSection((current) => ({
      ...current,
      offset: Math.min(Math.max(offset, 0), 1),
    }));
  }, []);
  const handleCycleMaterialMode = useCallback(() => {
    setMaterialMode((current) => {
      const index = materialModes.indexOf(current);
      return materialModes[(index + 1) % materialModes.length];
    });
  }, []);
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenEnabled || !viewerRef.current?.requestFullscreen) return;

    const operation =
      document.fullscreenElement === viewerRef.current
        ? document.exitFullscreen()
        : document.fullscreenElement
          ? null
          : viewerRef.current.requestFullscreen();

    void operation?.catch((error: unknown) => {
      console.warn("The viewer could not change fullscreen state.", error);
    });
  }, []);
  const handleToggleInfo = useCallback(
    () => handleTogglePanel("info"),
    [handleTogglePanel],
  );
  const handleToggleHelp = useCallback(
    () => handleTogglePanel("help"),
    [handleTogglePanel],
  );

  useViewerKeyboardShortcuts({
    onClosePanel: handleCloseOverlay,
    onCycleMaterialMode: handleCycleMaterialMode,
    onReset: handleReset,
    onToggleFullscreen: handleToggleFullscreen,
    onToggleHelp: handleToggleHelp,
    onToggleInfo: handleToggleInfo,
  });

  if (webGLState === "unsupported") {
    return (
      <WebGLFallback
        project={project}
        status="WebGL unavailable"
        message="This browser cannot initialize the interactive scene. Project images and drawings remain available."
      />
    );
  }

  if (webGLState === "lost") {
    return (
      <WebGLFallback
        project={project}
        status="WebGL context lost"
        message="The graphics session ended unexpectedly. Return to the project page and reopen the viewer to try again."
      />
    );
  }

  if (modelState.status === "error") {
    return (
      <WebGLFallback
        project={project}
        status="3D model unavailable"
        message={`${modelState.error.publicMessage} Project images and drawings remain available.`}
      />
    );
  }

  const activeSource = modelState.status === "ready" ? modelState.source : undefined;
  const modelLabel = getModelLabel(activeSource);
  const sourceStatus = getSourceStatus(modelState);
  const activeHotspot =
    project.model?.hotspots?.find((hotspot) => hotspot.id === activeHotspotId) ??
    null;

  return (
    <ViewerErrorBoundary
      fallback={
        <WebGLFallback
          project={project}
          message="The interactive scene could not initialize. Project images and drawings remain available."
        />
      }
    >
      <div
        ref={viewerRef}
        className={styles.viewer}
        data-viewer-device={isMobile ? "mobile" : "desktop"}
      >
        <Canvas
          className={styles.canvas}
          aria-label={`Interactive architectural model for ${project.title}`}
          role="img"
          camera={{
            position: [...cameraPosition],
            fov: defaultViewerCamera.fov,
            near: defaultViewerCamera.near,
            far: defaultViewerCamera.far,
          }}
          dpr={[1, effectiveMaxDpr]}
          frameloop="demand"
          gl={{ antialias: !isMobile, alpha: false, powerPreference: "high-performance" }}
          shadows={shadowsEnabled}
          performance={{ min: 0.5 }}
          onCreated={configureRenderer}
        >
          <ArchitectureScene
            key={project.slug}
            activeFloorId={activeFloorId}
            activeHotspotId={activeHotspotId}
            guidedViewRequest={guidedViewRequest}
            materialMode={materialMode}
            project={project}
            resetRequest={resetRequest}
            section={section}
            shadowsEnabled={shadowsEnabled && !isHeavyModel}
            onContextLost={handleContextLost}
            onModelStateChange={handleModelStateChange}
            onSelectHotspot={handleSelectHotspot}
          />
        </Canvas>

        {showLoadingOverlay ? (
          <LoadingOverlay
            isActive={modelState.status === "loading"}
            phase={loadingOverlayPhase}
            project={project}
            progress={loadingOverlayProgress}
            onExited={handleLoadingExited}
          />
        ) : null}

        <div className={styles.chrome}>
          <header className={styles.topbar}>
            <div className={styles.projectInfo}>
              <p>{project.title}</p>
              <p>{project.location} / {project.year} / {project.category}</p>
            </div>
            <Link href={`/projects/${project.slug}`}>Close / Project</Link>
          </header>

          <div className={styles.placeholderLabel}>
            <span>{modelLabel}</span>
            <span>{sourceStatus}</span>
          </div>

          <div className={styles.bottomChrome}>
            <div className={styles.instructions} aria-label="Pointer controls">
              {isMobile ? (
                <><span>Drag - Orbit</span><span>Pinch - Zoom</span></>
              ) : (
                <><span>Drag - Orbit</span><span>Right drag - Pan</span><span>Scroll - Zoom</span></>
              )}
            </div>
            <ViewerToolbar
              activePanel={activePanel}
              isFullscreen={isFullscreen}
              isFullscreenAvailable={isFullscreenAvailable}
              isMobile={isMobile}
              materialMode={materialMode}
              sectionEnabled={section.enabled}
              onCycleMaterialMode={handleCycleMaterialMode}
              onMaterialModeChange={setMaterialMode}
              onReset={handleReset}
              onToggleSection={handleToggleSection}
              onToggleFullscreen={handleToggleFullscreen}
              onTogglePanel={handleTogglePanel}
            />
          </div>
        </div>

        <ViewerPanels
          activePanel={activePanel === "tools" ? null : activePanel}
          isMobile={isMobile}
          materialMode={materialMode}
          modelLabel={modelLabel}
          project={project}
          sourceStatus={sourceStatus}
          onClose={handleCloseOverlay}
        />

        <ArchitectureToolsPanel
          activeFloorId={activeFloorId}
          activeViewId={activeViewId}
          floors={project.model?.floors}
          isOpen={activePanel === "tools"}
          section={section}
          views={project.model?.views}
          onClose={handleCloseOverlay}
          onResetSection={handleResetSection}
          onSectionAxisChange={handleSectionAxisChange}
          onSectionOffsetChange={handleSectionOffsetChange}
          onSelectFloor={setActiveFloorId}
          onSelectView={handleSelectView}
          onToggleSection={handleToggleSection}
        />

        {activeHotspot ? (
          <HotspotInfoPanel
            hotspot={activeHotspot}
            onClose={handleCloseOverlay}
          />
        ) : null}
      </div>
    </ViewerErrorBoundary>
  );
}
