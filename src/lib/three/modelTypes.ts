import type { Box3, Group, Object3D, Vector3 } from "three";

import type { ModelFormat } from "@/types/project";

export type ResolvedModelSource = {
  src: string;
  format: Exclude<ModelFormat, "auto">;
  isFallback: boolean;
};

export type ModelLoadProgress = {
  src: string;
  format: ResolvedModelSource["format"];
  loadedBytes: number;
  totalBytes?: number;
  percentage?: number;
  isFallback: boolean;
};

export type ModelPreparationPhase =
  | "downloading"
  | "parsing"
  | "preparing"
  | "normalizing"
  | "mounting";

export type ModelDiagnostics = {
  nodeCount: number;
  meshCount: number;
  drawCallCount: number;
  triangleCount: number;
  geometryCount: number;
  materialCount: number;
  textureCount: number;
  estimatedGeometryBytes: number;
  estimatedTextureBytes: number;
  maximumTextureDimension: number;
  fallbackMaterialCount: number;
  isHeavy: boolean;
  heavyReasons: readonly string[];
  timings: {
    downloadMs?: number;
    parseMs?: number;
    preparationMs?: number;
    normalizationMs?: number;
  };
};

export type ModelRenderStats = {
  calls: number;
  triangles: number;
  points: number;
  lines: number;
};

export type LoadedArchitectureModel = {
  object: Object3D;
  source: ResolvedModelSource;
  usedFallback: boolean;
  warnings: readonly string[];
  diagnostics: ModelDiagnostics;
};

export type NormalizedArchitectureModel = {
  root: Group;
  bounds: Box3;
  center: Vector3;
  size: Vector3;
};

export type CameraFit = {
  position: Vector3;
  target: Vector3;
  distance: number;
  near: number;
  far: number;
  minDistance: number;
  maxDistance: number;
};

export type ModelLoadErrorCode =
  | "no-source"
  | "unsupported-format"
  | "not-found"
  | "network"
  | "parse-fbx"
  | "parse-gltf"
  | "empty-model"
  | "unknown";

export class ArchitectureModelError extends Error {
  readonly code: ModelLoadErrorCode;
  readonly publicMessage: string;
  readonly source?: ResolvedModelSource;
  readonly cause?: unknown;

  constructor(options: {
    code: ModelLoadErrorCode;
    message: string;
    publicMessage: string;
    source?: ResolvedModelSource;
    cause?: unknown;
  }) {
    super(options.message);
    this.name = "ArchitectureModelError";
    this.code = options.code;
    this.publicMessage = options.publicMessage;
    this.source = options.source;
    this.cause = options.cause;
  }
}

export type ViewerModelState =
  | { status: "procedural" }
  | {
      status: "loading";
      phase: ModelPreparationPhase;
      progress?: ModelLoadProgress;
    }
  | {
      status: "ready";
      source: ResolvedModelSource;
      usedFallback: boolean;
      warnings: readonly string[];
      diagnostics: ModelDiagnostics;
      renderStats: ModelRenderStats;
    }
  | { status: "error"; error: ArchitectureModelError };
