import {
  BufferGeometry,
  Material,
  Mesh,
  Object3D,
  Texture,
} from "three";

import type { ArchitectureModel, ModelFormat } from "@/types/project";

import {
  ArchitectureModelError,
  type ResolvedModelSource,
} from "./modelTypes";

const supportedExtensions: Record<string, Exclude<ModelFormat, "auto">> = {
  fbx: "fbx",
  glb: "glb",
  gltf: "gltf",
};

function extensionFromSource(src: string) {
  const pathWithoutQuery = src.split(/[?#]/, 1)[0];
  const extension = pathWithoutQuery.split(".").pop()?.toLowerCase();

  return extension ? supportedExtensions[extension] : undefined;
}

function resolveFormat(src: string, configuredFormat?: ModelFormat) {
  const detectedFormat = extensionFromSource(src);

  if (detectedFormat) return detectedFormat;
  if (configuredFormat && configuredFormat !== "auto") return configuredFormat;

  throw new ArchitectureModelError({
    code: "unsupported-format",
    message: `Could not resolve a supported model format for ${src}.`,
    publicMessage: "The configured model format is not supported.",
  });
}

export function resolveModelSources(model?: ArchitectureModel): readonly ResolvedModelSource[] {
  if (!model) return [];

  const primarySrc = model.primarySrc ?? model.src;
  if (!primarySrc) return [];

  const sources: ResolvedModelSource[] = [
    {
      src: primarySrc,
      format: resolveFormat(primarySrc, model.format),
      isFallback: false,
    },
  ];

  if (model.fallbackSrc && model.fallbackSrc !== primarySrc) {
    sources.push({
      src: model.fallbackSrc,
      format: resolveFormat(model.fallbackSrc, "auto"),
      isFallback: true,
    });
  }

  return sources;
}

export function hasExternalModelSource(model?: ArchitectureModel) {
  return Boolean(model && (model.primarySrc || model.src));
}

export function getModelLabel(source?: ResolvedModelSource) {
  if (!source) return "Procedural massing";
  const filename = source.src.split(/[\\/]/).pop()?.split(/[?#]/, 1)[0];
  return filename || `${source.format.toUpperCase()} model`;
}

function collectTextures(material: Material, textures: Set<Texture>) {
  for (const value of Object.values(material)) {
    if (value instanceof Texture) textures.add(value);
  }
}

export function disposeLoadedObject(object: Object3D) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();

  object.traverse((node) => {
    if (!(node instanceof Mesh)) return;

    geometries.add(node.geometry);
    const meshMaterials = Array.isArray(node.material) ? node.material : [node.material];
    meshMaterials.forEach((material) => {
      if (!material) return;
      materials.add(material);
      collectTextures(material, textures);
    });
  });

  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}
