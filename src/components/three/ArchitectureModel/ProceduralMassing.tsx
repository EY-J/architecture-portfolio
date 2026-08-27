"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Box3, Group, Vector3 } from "three";
import type { Plane } from "three";

import type { ViewerMaterialMode } from "@/lib/three/modelMaterials";
import {
  applyFloorVisibility,
  captureFloorVisibility,
  restoreFloorVisibility,
  type FloorVisibilitySnapshot,
} from "@/lib/three/modelVisibility";
import type { ProjectFloor } from "@/types/project";

type MassProps = {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  clippingPlanes: Plane[] | null;
  materialMode: ViewerMaterialMode;
};

function Mass({
  position,
  size,
  color = "#d8d3c9",
  clippingPlanes,
  materialMode,
}: MassProps) {
  const activeColor =
    materialMode === "clay"
      ? "#d8d3c9"
      : materialMode === "wireframe"
        ? "#383833"
        : color;

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={activeColor}
        roughness={0.78}
        metalness={0.02}
        wireframe={materialMode === "wireframe"}
        clippingPlanes={clippingPlanes}
      />
    </mesh>
  );
}

export function ProceduralMassing({
  activeFloorId,
  clippingPlane,
  floors,
  materialMode,
}: {
  activeFloorId: string;
  clippingPlane: Plane | null;
  floors?: readonly ProjectFloor[];
  materialMode: ViewerMaterialMode;
}) {
  const rootRef = useRef<Group>(null);
  const floorSnapshot = useRef<FloorVisibilitySnapshot | null>(null);
  const clippingPlanes = useMemo(
    () => (clippingPlane ? [clippingPlane] : null),
    [clippingPlane],
  );
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!rootRef.current || !floors?.length) return;

    const snapshot = captureFloorVisibility(rootRef.current, floors);
    floorSnapshot.current = snapshot;
    return () => {
      restoreFloorVisibility(snapshot);
      floorSnapshot.current = null;
    };
  }, [floors]);

  useEffect(() => {
    if (!floorSnapshot.current) return;

    applyFloorVisibility(floorSnapshot.current, activeFloorId);
    invalidate();
  }, [activeFloorId, floors, invalidate]);

  return (
    <group ref={rootRef} name="PROCEDURAL_PLACEHOLDER_MASSING">
      <group name="FLOOR_00_GROUND">
        <Mass clippingPlanes={clippingPlanes} materialMode={materialMode} position={[2.75, 0.85, 2.45]} size={[3.5, 1.7, 2.35]} color="#e4dfd5" />
        <Mass clippingPlanes={clippingPlanes} materialMode={materialMode} position={[0, 0.15, 0]} size={[9.5, 0.3, 9.2]} color="#aaa397" />
        <Mass clippingPlanes={clippingPlanes} materialMode={materialMode} position={[0.25, 0.34, 1.05]} size={[1.85, 0.08, 2.5]} color="#67746d" />

        <group name="ENTRY_COLONNADE" position={[0, 0, -3.65]}>
          {[-3.7, -2.25, -0.8, 0.65, 2.1, 3.55].map((xPosition) => (
            <Mass
              key={xPosition}
              clippingPlanes={clippingPlanes}
              materialMode={materialMode}
              position={[xPosition, 1.35, 0]}
              size={[0.13, 2.7, 0.13]}
              color="#70503e"
            />
          ))}
          <Mass clippingPlanes={clippingPlanes} materialMode={materialMode} position={[0, 2.67, 0]} size={[7.7, 0.14, 0.45]} color="#70503e" />
        </group>
      </group>

      <group name="FLOOR_01_UPPER">
        <Mass clippingPlanes={clippingPlanes} materialMode={materialMode} position={[-2.8, 1.25, 0]} size={[3.7, 2.5, 6.6]} />
        <Mass clippingPlanes={clippingPlanes} materialMode={materialMode} position={[2.75, 1.65, -1.65]} size={[3.5, 3.3, 3.3]} color="#c9c4b9" />

        <group name="COURTYARD_FRAME" position={[0.25, 0, 0.95]}>
          <Mass clippingPlanes={clippingPlanes} materialMode={materialMode} position={[-1.12, 1.25, 0]} size={[0.16, 2.5, 3.05]} color="#8e624a" />
          <Mass clippingPlanes={clippingPlanes} materialMode={materialMode} position={[1.12, 1.25, 0]} size={[0.16, 2.5, 3.05]} color="#8e624a" />
          <Mass clippingPlanes={clippingPlanes} materialMode={materialMode} position={[0, 2.42, 0]} size={[2.4, 0.16, 3.05]} color="#8e624a" />
        </group>
      </group>
    </group>
  );
}

export function getProceduralMassingBounds() {
  return new Box3(new Vector3(-4.75, 0, -4.75), new Vector3(4.75, 3.3, 4.75));
}
