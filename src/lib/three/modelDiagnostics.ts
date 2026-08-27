import {
  BufferAttribute,
  InterleavedBufferAttribute,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Texture,
} from "three";

import { viewerPerformance } from "@/config/viewer";

import type { ModelDiagnostics } from "./modelTypes";

type TextureImage = {
  width?: number;
  height?: number;
};

function collectMaterialTextures(material: Material, textures: Set<Texture>) {
  Object.values(material).forEach((value) => {
    if (value instanceof Texture) textures.add(value);
  });
}

function getAttributeArray(
  attribute: BufferAttribute | InterleavedBufferAttribute,
) {
  return attribute instanceof InterleavedBufferAttribute
    ? attribute.data.array
    : attribute.array;
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function getHeavyReasons(diagnostics: Omit<ModelDiagnostics, "heavyReasons" | "isHeavy">) {
  const thresholds = viewerPerformance.heavyModelThresholds;
  const reasons: string[] = [];

  if (diagnostics.nodeCount >= thresholds.nodes) {
    reasons.push(`${formatCount(diagnostics.nodeCount)} scene nodes`);
  }
  if (diagnostics.drawCallCount >= thresholds.drawCalls) {
    reasons.push(`${formatCount(diagnostics.drawCallCount)} estimated draw calls`);
  }
  if (diagnostics.triangleCount >= thresholds.triangles) {
    reasons.push(`${formatCount(diagnostics.triangleCount)} rendered triangles`);
  }
  if (diagnostics.estimatedTextureBytes >= thresholds.estimatedTextureBytes) {
    reasons.push(
      `${Math.round(diagnostics.estimatedTextureBytes / 1024 / 1024)} MB estimated texture memory`,
    );
  }

  return reasons;
}

export function analyzeAndPrepareLoadedObject(object: Object3D): ModelDiagnostics {
  const meshes: Mesh[] = [];
  const geometries = new Set<Mesh["geometry"]>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  const attributeArrays = new Set<ArrayBufferView>();
  let nodeCount = 0;
  let drawCallCount = 0;
  let triangleCount = 0;
  let fallbackMaterialCount = 0;

  object.traverse((node) => {
    nodeCount += 1;
    if (!(node instanceof Mesh)) return;

    meshes.push(node);
    geometries.add(node.geometry);
    drawCallCount += Math.max(node.geometry.groups.length, 1);

    const position = node.geometry.getAttribute("position");
    const renderedElements = node.geometry.index?.count ?? position?.count ?? 0;
    triangleCount += Math.floor(renderedElements / 3);

    if (!node.material || (Array.isArray(node.material) && node.material.length === 0)) {
      const fallbackMaterial = new MeshStandardMaterial({
        color: "#d8d3c9",
        roughness: 0.82,
        metalness: 0.01,
      });
      fallbackMaterial.userData.applicationCreated = true;
      node.material = fallbackMaterial;
      fallbackMaterialCount += 1;
    }

    const meshMaterials = Array.isArray(node.material) ? node.material : [node.material];
    meshMaterials.forEach((material) => {
      if (!material) return;
      materials.add(material);
      collectMaterialTextures(material, textures);
    });
  });

  geometries.forEach((geometry) => {
    Object.values(geometry.attributes).forEach((attribute) => {
      attributeArrays.add(getAttributeArray(attribute));
    });
    if (geometry.index) attributeArrays.add(getAttributeArray(geometry.index));
  });

  let estimatedTextureBytes = 0;
  let maximumTextureDimension = 0;
  textures.forEach((texture) => {
    const image = texture.image as TextureImage | undefined;
    const width = image?.width ?? 0;
    const height = image?.height ?? 0;
    maximumTextureDimension = Math.max(maximumTextureDimension, width, height);
    if (width > 0 && height > 0) {
      const mipFactor = texture.generateMipmaps ? 4 / 3 : 1;
      estimatedTextureBytes += width * height * 4 * mipFactor;
    }
  });

  const baseDiagnostics = {
    nodeCount,
    meshCount: meshes.length,
    drawCallCount,
    triangleCount,
    geometryCount: geometries.size,
    materialCount: materials.size,
    textureCount: textures.size,
    estimatedGeometryBytes: [...attributeArrays].reduce(
      (total, array) => total + array.byteLength,
      0,
    ),
    estimatedTextureBytes,
    maximumTextureDimension,
    fallbackMaterialCount,
    timings: {},
  } satisfies Omit<ModelDiagnostics, "heavyReasons" | "isHeavy">;
  const heavyReasons = getHeavyReasons(baseDiagnostics);
  const isHeavy = heavyReasons.length > 0;

  meshes.forEach((mesh) => {
    mesh.castShadow = !isHeavy;
    mesh.receiveShadow = !isHeavy;
  });

  return { ...baseDiagnostics, isHeavy, heavyReasons };
}
