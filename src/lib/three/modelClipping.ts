import type { Material, Plane } from "three";

import type {
  OriginalMaterialMap,
  ViewerOverrideMaterials,
} from "./modelMaterials";

export type MaterialClippingSnapshot = Map<Material, Plane[] | null>;

function addMaterial(
  snapshot: MaterialClippingSnapshot,
  material: Material | Material[],
) {
  const materials = Array.isArray(material) ? material : [material];
  materials.forEach((item) => {
    if (!snapshot.has(item)) snapshot.set(item, item.clippingPlanes);
  });
}

export function captureMaterialClipping(
  originals: OriginalMaterialMap,
  overrides: ViewerOverrideMaterials,
): MaterialClippingSnapshot {
  const snapshot: MaterialClippingSnapshot = new Map();
  originals.forEach((material) => addMaterial(snapshot, material));
  addMaterial(snapshot, overrides.clay);
  addMaterial(snapshot, overrides.wireframe);
  return snapshot;
}

export function applyMaterialClipping(
  snapshot: MaterialClippingSnapshot,
  clippingPlane: Plane | null,
) {
  snapshot.forEach((originalPlanes, material) => {
    material.clippingPlanes = clippingPlane ? [clippingPlane] : originalPlanes;
    material.needsUpdate = true;
  });
}

export function restoreMaterialClipping(
  snapshot: MaterialClippingSnapshot | null,
) {
  snapshot?.forEach((originalPlanes, material) => {
    material.clippingPlanes = originalPlanes;
    material.needsUpdate = true;
  });
}
