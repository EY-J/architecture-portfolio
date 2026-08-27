import type { Object3D } from "three";

import type { ProjectFloor } from "@/types/project";

export type FloorVisibilitySnapshot = {
  floorObjects: Map<string, Set<Object3D>>;
  originalVisibility: Map<Object3D, boolean>;
};

function matchesPattern(objectName: string, patterns: readonly string[]) {
  const normalizedName = objectName.toLocaleUpperCase();
  return patterns.some((pattern) =>
    normalizedName.includes(pattern.toLocaleUpperCase()),
  );
}

export function captureFloorVisibility(
  root: Object3D,
  floors: readonly ProjectFloor[],
): FloorVisibilitySnapshot {
  const floorObjects = new Map<string, Set<Object3D>>();
  const originalVisibility = new Map<Object3D, boolean>();

  floors.forEach((floor) => floorObjects.set(floor.id, new Set()));

  root.traverse((object) => {
    if (!object.name) return;

    floors.forEach((floor) => {
      if (!matchesPattern(object.name, floor.objectNamePatterns)) return;

      floorObjects.get(floor.id)?.add(object);
      originalVisibility.set(object, object.visible);
    });
  });

  return { floorObjects, originalVisibility };
}

export function applyFloorVisibility(
  snapshot: FloorVisibilitySnapshot,
  activeFloorId: string,
) {
  snapshot.originalVisibility.forEach((visible, object) => {
    object.visible = visible;
  });

  if (activeFloorId === "all") return;

  snapshot.floorObjects.forEach((objects, floorId) => {
    objects.forEach((object) => {
      const originallyVisible = snapshot.originalVisibility.get(object) ?? true;
      object.visible = floorId === activeFloorId && originallyVisible;
    });
  });
}

export function restoreFloorVisibility(
  snapshot: FloorVisibilitySnapshot | null,
) {
  snapshot?.originalVisibility.forEach((visible, object) => {
    object.visible = visible;
  });
}
