"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Object3D, Plane } from "three";

import {
  applyMaterialClipping,
  captureMaterialClipping,
  restoreMaterialClipping,
  type MaterialClippingSnapshot,
} from "@/lib/three/modelClipping";
import { loadArchitectureModel } from "@/lib/three/modelLoader";
import {
  applyViewerMaterialMode,
  captureOriginalMaterials,
  createViewerOverrideMaterials,
  disposeViewerOverrideMaterials,
  restoreOriginalMaterials,
  type OriginalMaterialMap,
  type ViewerMaterialMode,
} from "@/lib/three/modelMaterials";
import { normalizeArchitectureModel } from "@/lib/three/modelNormalization";
import {
  ArchitectureModelError,
  type ModelDiagnostics,
  type ModelLoadProgress,
  type ModelPreparationPhase,
  type ModelRenderStats,
  type NormalizedArchitectureModel,
  type ResolvedModelSource,
  type ViewerModelState,
} from "@/lib/three/modelTypes";
import {
  disposeLoadedObject,
  hasExternalModelSource,
} from "@/lib/three/modelUtils";
import {
  applyFloorVisibility,
  captureFloorVisibility,
  restoreFloorVisibility,
  type FloorVisibilitySnapshot,
} from "@/lib/three/modelVisibility";
import type { ArchitectureProject } from "@/types/project";

import { ProceduralMassing } from "./ProceduralMassing";

type ArchitectureModelProps = {
  activeFloorId: string;
  clippingPlane: Plane | null;
  materialMode: ViewerMaterialMode;
  project: ArchitectureProject;
  onReady: (model: NormalizedArchitectureModel) => void;
  onStateChange: (state: ViewerModelState) => void;
};

type LoadedMetadata = {
  source: ResolvedModelSource;
  usedFallback: boolean;
  warnings: readonly string[];
  diagnostics: ModelDiagnostics;
};

type RenderedModelProps = {
  model: NormalizedArchitectureModel;
  onFirstFrame: (stats: ModelRenderStats) => void;
};

function nextBrowserFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function RenderedModel({ model, onFirstFrame }: RenderedModelProps) {
  const gl = useThree((state) => state.gl);
  const hasReported = useRef(false);
  const reportFrame = useRef<number | null>(null);

  useFrame(() => {
    if (hasReported.current) return;
    hasReported.current = true;
    reportFrame.current = requestAnimationFrame(() => {
      const render = gl.info.render;
      onFirstFrame({
        calls: render.calls,
        triangles: render.triangles,
        points: render.points,
        lines: render.lines,
      });
    });
  });

  useEffect(
    () => () => {
      if (reportFrame.current !== null) cancelAnimationFrame(reportFrame.current);
    },
    [],
  );

  return <primitive object={model.root} />;
}

export function ArchitectureModel({
  activeFloorId,
  clippingPlane,
  materialMode,
  project,
  onReady,
  onStateChange,
}: ArchitectureModelProps) {
  const [normalizedModel, setNormalizedModel] =
    useState<NormalizedArchitectureModel | null>(null);
  const loadedMetadata = useRef<LoadedMetadata | null>(null);
  const originalMaterials = useRef<OriginalMaterialMap | null>(null);
  const clippingSnapshot = useRef<MaterialClippingSnapshot | null>(null);
  const floorSnapshot = useRef<FloorVisibilitySnapshot | null>(null);
  const overrideMaterials = useMemo(() => createViewerOverrideMaterials(), []);
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  const modelConfig = project.model;
  const hasExternalSource = hasExternalModelSource(modelConfig);

  useEffect(() => {
    if (!modelConfig || !hasExternalSource) return;

    let isActive = true;
    let disposableObject: Object3D | undefined;
    let phase: ModelPreparationPhase = "downloading";
    let latestProgress: ModelLoadProgress | undefined;
    onStateChange({ status: "loading", phase });

    void loadArchitectureModel(modelConfig, {
      onProgress: (progress) => {
        latestProgress = progress;
        if (isActive) onStateChange({ status: "loading", phase, progress });
      },
      onPhaseChange: (nextPhase) => {
        phase = nextPhase;
        if (isActive) {
          onStateChange({ status: "loading", phase, progress: latestProgress });
        }
      },
    })
      .then(async (loadedModel) => {
        disposableObject = loadedModel.object;
        phase = "normalizing";
        if (isActive) {
          onStateChange({ status: "loading", phase, progress: latestProgress });
        }
        await nextBrowserFrame();

        const normalizationStartedAt = performance.now();
        const normalized = normalizeArchitectureModel(loadedModel.object, modelConfig);
        const diagnostics: ModelDiagnostics = {
          ...loadedModel.diagnostics,
          timings: {
            ...loadedModel.diagnostics.timings,
            normalizationMs: performance.now() - normalizationStartedAt,
          },
        };
        disposableObject = normalized.root;

        if (!isActive) {
          disposeLoadedObject(normalized.root);
          disposableObject = undefined;
          return;
        }

        floorSnapshot.current = modelConfig.floors?.length
          ? captureFloorVisibility(normalized.root, modelConfig.floors)
          : null;
        loadedMetadata.current = {
          source: loadedModel.source,
          usedFallback: loadedModel.usedFallback,
          warnings: loadedModel.warnings,
          diagnostics,
        };
        phase = "mounting";
        onStateChange({ status: "loading", phase, progress: latestProgress });
        setNormalizedModel(normalized);
      })
      .catch((error: unknown) => {
        if (!isActive) return;

        const modelError =
          error instanceof ArchitectureModelError
            ? error
            : new ArchitectureModelError({
                code: "unknown",
                message: error instanceof Error ? error.message : String(error),
                publicMessage: "The 3D model is unavailable.",
                cause: error,
              });
        onStateChange({ status: "error", error: modelError });
      });

    return () => {
      isActive = false;
      if (disposableObject) {
        restoreFloorVisibility(floorSnapshot.current);
        restoreMaterialClipping(clippingSnapshot.current);
        restoreOriginalMaterials(originalMaterials.current);
        disposeLoadedObject(disposableObject);
      }
      clippingSnapshot.current = null;
      floorSnapshot.current = null;
      originalMaterials.current = null;
      loadedMetadata.current = null;
    };
  }, [
    hasExternalSource,
    modelConfig,
    onReady,
    onStateChange,
    overrideMaterials,
  ]);

  useEffect(() => {
    if (!normalizedModel) return;
    onReady(normalizedModel);
    invalidate();
  }, [invalidate, normalizedModel, onReady]);

  const handleFirstFrame = useCallback(
    (renderStats: ModelRenderStats) => {
      const metadata = loadedMetadata.current;
      if (!metadata) return;

      const warnings = [...metadata.warnings];
      if (
        metadata.diagnostics.maximumTextureDimension > gl.capabilities.maxTextureSize
      ) {
        warnings.push(
          `A model texture exceeds this device's ${gl.capabilities.maxTextureSize}px WebGL texture limit.`,
        );
      }

      if (process.env.NODE_ENV === "development") {
        console.info("[ArchitectureViewer] First model frame rendered.", {
          diagnostics: metadata.diagnostics,
          renderStats,
          renderer: {
            isWebGL2: gl.capabilities.isWebGL2,
            maxTextureSize: gl.capabilities.maxTextureSize,
            maxTextures: gl.capabilities.maxTextures,
          },
        });
      }

      onStateChange({
        status: "ready",
        source: metadata.source,
        usedFallback: metadata.usedFallback,
        warnings,
        diagnostics: metadata.diagnostics,
        renderStats,
      });
    },
    [gl, onStateChange],
  );

  useEffect(() => {
    if (!normalizedModel) return;
    if (materialMode === "original" && !originalMaterials.current) return;

    originalMaterials.current ??= captureOriginalMaterials(normalizedModel.root);
    clippingSnapshot.current ??= captureMaterialClipping(
      originalMaterials.current,
      overrideMaterials,
    );

    applyViewerMaterialMode(
      originalMaterials.current,
      overrideMaterials,
      materialMode,
    );
    invalidate();
  }, [invalidate, materialMode, normalizedModel, overrideMaterials]);

  useEffect(() => {
    if (!normalizedModel || !floorSnapshot.current) return;

    applyFloorVisibility(floorSnapshot.current, activeFloorId);
    invalidate();
  }, [activeFloorId, invalidate, normalizedModel]);

  useEffect(() => {
    if (!normalizedModel || !clippingPlane) {
      if (clippingSnapshot.current) {
        applyMaterialClipping(clippingSnapshot.current, null);
        invalidate();
      }
      return;
    }

    originalMaterials.current ??= captureOriginalMaterials(normalizedModel.root);
    clippingSnapshot.current ??= captureMaterialClipping(
      originalMaterials.current,
      overrideMaterials,
    );

    applyMaterialClipping(clippingSnapshot.current, clippingPlane);
    invalidate();
  }, [clippingPlane, invalidate, normalizedModel, overrideMaterials]);

  useEffect(
    () => () => disposeViewerOverrideMaterials(overrideMaterials),
    [overrideMaterials],
  );

  if (!hasExternalSource) {
    return (
      <ProceduralMassing
        activeFloorId={activeFloorId}
        clippingPlane={clippingPlane}
        floors={modelConfig?.floors}
        materialMode={materialMode}
      />
    );
  }
  if (!normalizedModel) return null;

  return <RenderedModel model={normalizedModel} onFirstFrame={handleFirstFrame} />;
}
