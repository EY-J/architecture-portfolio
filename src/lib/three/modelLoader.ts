import { LoadingManager, Object3D } from "three";

import type { ArchitectureModel } from "@/types/project";

import { analyzeAndPrepareLoadedObject } from "./modelDiagnostics";
import { toArchitectureModelError } from "./modelErrors";
import {
  ArchitectureModelError,
  type LoadedArchitectureModel,
  type ModelLoadProgress,
  type ModelPreparationPhase,
  type ResolvedModelSource,
} from "./modelTypes";
import { resolveModelSources } from "./modelUtils";

type ModelLoaderOptions = {
  onProgress?: (progress: ModelLoadProgress) => void;
  onPhaseChange?: (phase: ModelPreparationPhase) => void;
};

type SingleLoadResult = {
  object: Object3D;
  warnings: string[];
  diagnostics: LoadedArchitectureModel["diagnostics"];
};

function nextBrowserFrame() {
  return new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
      return;
    }
    setTimeout(resolve, 0);
  });
}

function createProgressHandler(
  source: ResolvedModelSource,
  options: ModelLoaderOptions,
  onDownloadComplete: () => void,
) {
  return (event: ProgressEvent<EventTarget>) => {
    const totalBytes = event.lengthComputable && event.total > 0 ? event.total : undefined;
    if (totalBytes && event.loaded >= totalBytes) onDownloadComplete();
    options.onProgress?.({
      src: source.src,
      format: source.format,
      loadedBytes: event.loaded,
      totalBytes,
      percentage: totalBytes
        ? Math.min(100, Math.round((event.loaded / totalBytes) * 100))
        : undefined,
      isFallback: source.isFallback,
    });
  };
}

async function loadSingleSource(
  source: ResolvedModelSource,
  options: ModelLoaderOptions,
): Promise<SingleLoadResult> {
  const warnings: string[] = [];
  const loadStartedAt = performance.now();
  let downloadCompletedAt: number | undefined;
  const manager = new LoadingManager();
  manager.onError = (resourceUrl) => {
    const warning = `A model dependency could not be loaded: ${resourceUrl}`;
    warnings.push(warning);
    if (process.env.NODE_ENV === "development") console.warn(warning);
  };

  try {
    const handleDownloadComplete = () => {
      if (downloadCompletedAt !== undefined) return;
      downloadCompletedAt = performance.now();
      options.onPhaseChange?.("parsing");
    };
    let object: Object3D;

    if (source.format === "fbx") {
      const { FBXLoader } = await import("three/addons/loaders/FBXLoader.js");
      const loader = new FBXLoader(manager);
      object = await loader.loadAsync(
        source.src,
        createProgressHandler(source, options, handleDownloadComplete),
      );
    } else {
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      const loader = new GLTFLoader(manager);
      const gltf = await loader.loadAsync(
        source.src,
        createProgressHandler(source, options, handleDownloadComplete),
      );
      object = gltf.scene;
    }

    const parsedAt = performance.now();
    downloadCompletedAt ??= parsedAt;
    options.onPhaseChange?.("preparing");
    await nextBrowserFrame();

    const preparationStartedAt = performance.now();
    const diagnostics = analyzeAndPrepareLoadedObject(object);
    const preparationFinishedAt = performance.now();
    diagnostics.timings = {
      downloadMs: downloadCompletedAt - loadStartedAt,
      parseMs: parsedAt - downloadCompletedAt,
      preparationMs: preparationFinishedAt - preparationStartedAt,
    };

    if (diagnostics.isHeavy) {
      const warning = `Heavy model safeguards enabled: ${diagnostics.heavyReasons.join(", ")}.`;
      warnings.push(warning);
      if (process.env.NODE_ENV === "development") {
        console.warn(warning, diagnostics);
      }
    }

    return { object, warnings, diagnostics };
  } catch (error) {
    throw toArchitectureModelError(source, error);
  }
}

export async function loadArchitectureModel(
  model: ArchitectureModel,
  options: ModelLoaderOptions = {},
): Promise<LoadedArchitectureModel> {
  const sources = resolveModelSources(model);

  if (sources.length === 0) {
    throw new ArchitectureModelError({
      code: "no-source",
      message: "No FBX, GLB, or GLTF source was configured.",
      publicMessage: "No 3D model is configured for this project.",
    });
  }

  let lastError: ArchitectureModelError | undefined;

  for (const source of sources) {
    try {
      options.onProgress?.({
        src: source.src,
        format: source.format,
        loadedBytes: 0,
        isFallback: source.isFallback,
      });
      options.onPhaseChange?.("downloading");
      const result = await loadSingleSource(source, options);
      return {
        object: result.object,
        source,
        usedFallback: source.isFallback,
        warnings: result.warnings,
        diagnostics: result.diagnostics,
      };
    } catch (error) {
      lastError =
        error instanceof ArchitectureModelError
          ? error
          : toArchitectureModelError(source, error);

      if (process.env.NODE_ENV === "development") {
        console.warn(lastError.message);
        if (!source.isFallback && sources.length > 1) {
          console.warn("Attempting the configured fallback model once.");
        }
      }
    }
  }

  throw (
    lastError ??
    new ArchitectureModelError({
      code: "unknown",
      message: "The model loader failed without a diagnostic error.",
      publicMessage: "The 3D model is unavailable.",
    })
  );
}
