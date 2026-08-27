import { Material, Mesh, MeshStandardMaterial, Object3D } from "three";

export type ViewerMaterialMode = "original" | "clay" | "wireframe";

export type OriginalMaterialMap = Map<Mesh, Material | Material[]>;

export type ViewerOverrideMaterials = {
  clay: MeshStandardMaterial;
  wireframe: MeshStandardMaterial;
};

export function captureOriginalMaterials(root: Object3D): OriginalMaterialMap {
  const materials: OriginalMaterialMap = new Map();

  root.traverse((node) => {
    if (node instanceof Mesh) materials.set(node, node.material);
  });

  return materials;
}

export function createViewerOverrideMaterials(): ViewerOverrideMaterials {
  return {
    clay: new MeshStandardMaterial({
      color: "#d8d3c9",
      roughness: 0.86,
      metalness: 0.01,
    }),
    wireframe: new MeshStandardMaterial({
      color: "#383833",
      roughness: 0.7,
      metalness: 0,
      wireframe: true,
    }),
  };
}

export function applyViewerMaterialMode(
  originals: OriginalMaterialMap,
  overrides: ViewerOverrideMaterials,
  mode: ViewerMaterialMode,
) {
  originals.forEach((originalMaterial, mesh) => {
    mesh.material = mode === "original" ? originalMaterial : overrides[mode];
  });
}

export function restoreOriginalMaterials(originals: OriginalMaterialMap | null) {
  originals?.forEach((originalMaterial, mesh) => {
    mesh.material = originalMaterial;
  });
}

export function disposeViewerOverrideMaterials(materials: ViewerOverrideMaterials) {
  materials.clay.dispose();
  materials.wireframe.dispose();
}
