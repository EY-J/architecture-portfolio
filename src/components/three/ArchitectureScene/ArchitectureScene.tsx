"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Plane, Sphere, Vector3 } from "three";
import type { Box3 } from "three";

import { viewerPerformance } from "@/config/viewer";
import type {
  NormalizedArchitectureModel,
  ViewerModelState,
} from "@/lib/three/modelTypes";
import type { ViewerMaterialMode } from "@/lib/three/modelMaterials";
import { hasExternalModelSource } from "@/lib/three/modelUtils";
import { setLocalClippingEnabled } from "@/lib/three/viewerTools";
import type {
  GuidedViewRequest,
  SectionState,
} from "@/lib/three/viewerTools";
import type { ArchitectureProject } from "@/types/project";

import { ArchitectureModel } from "../ArchitectureModel/ArchitectureModel";
import { getProceduralMassingBounds } from "../ArchitectureModel/ProceduralMassing";
import { CameraController } from "../CameraController/CameraController";
import { Hotspots } from "../Hotspots/Hotspots";

type ArchitectureSceneProps = {
  activeFloorId: string;
  activeHotspotId: string | null;
  guidedViewRequest: GuidedViewRequest;
  materialMode: ViewerMaterialMode;
  project: ArchitectureProject;
  resetRequest: number;
  section: SectionState;
  shadowsEnabled: boolean;
  onContextLost: () => void;
  onModelStateChange: (state: ViewerModelState) => void;
  onSelectHotspot: (hotspotId: string) => void;
};

function CanvasLifecycle({
  onContextLost,
  sectionEnabled,
}: Pick<ArchitectureSceneProps, "onContextLost"> & {
  sectionEnabled: boolean;
}) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    return () => canvas.removeEventListener("webglcontextlost", handleContextLost);
  }, [gl, onContextLost]);

  useEffect(() => {
    const previousLocalClipping = gl.localClippingEnabled;
    setLocalClippingEnabled(gl, sectionEnabled);
    return () => {
      setLocalClippingEnabled(gl, previousLocalClipping);
    };
  }, [gl, sectionEnabled]);

  return null;
}

export function ArchitectureScene({
  activeFloorId,
  activeHotspotId,
  guidedViewRequest,
  materialMode,
  project,
  resetRequest,
  section,
  shadowsEnabled,
  onContextLost,
  onModelStateChange,
  onSelectHotspot,
}: ArchitectureSceneProps) {
  const background = project.model?.environment?.background ?? "#dedbd3";
  const groundColor = project.model?.environment?.groundColor ?? "#c9c4b9";
  const [modelBounds, setModelBounds] = useState<Box3 | null>(() =>
    hasExternalModelSource(project.model) ? null : getProceduralMassingBounds(),
  );
  const handleModelReady = useCallback((model: NormalizedArchitectureModel) => {
    setModelBounds(model.bounds.clone());
  }, []);
  const fogRange = useMemo<[number, number]>(() => {
    if (!modelBounds) return [28, 64];

    const radius = modelBounds.getBoundingSphere(new Sphere()).radius;
    return [Math.max(28, radius * 4), Math.max(64, radius * 12)];
  }, [modelBounds]);
  const clippingPlane = useMemo(() => {
    if (!section.enabled || !modelBounds) return null;

    const minimum = modelBounds.min[section.axis];
    const maximum = modelBounds.max[section.axis];
    const cutPosition = minimum + (maximum - minimum) * section.offset;
    const normal = new Vector3(
      section.axis === "x" ? -1 : 0,
      section.axis === "y" ? -1 : 0,
      section.axis === "z" ? -1 : 0,
    );

    return new Plane(normal, cutPosition);
  }, [modelBounds, section.axis, section.enabled, section.offset]);

  return (
    <>
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[background, fogRange[0], fogRange[1]]} />
      <CanvasLifecycle
        onContextLost={onContextLost}
        sectionEnabled={section.enabled}
      />

      <hemisphereLight args={["#fffaf0", "#77746d", 1.45]} />
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[10, 16, 8]}
        intensity={2.35}
        color="#fff5e6"
        castShadow={shadowsEnabled}
        shadow-mapSize-width={viewerPerformance.shadowMapSize}
        shadow-mapSize-height={viewerPerformance.shadowMapSize}
        shadow-camera-near={1}
        shadow-camera-far={48}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.00015}
      />

      <ArchitectureModel
        activeFloorId={activeFloorId}
        clippingPlane={clippingPlane}
        materialMode={materialMode}
        project={project}
        onReady={handleModelReady}
        onStateChange={onModelStateChange}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={groundColor} roughness={0.94} />
      </mesh>

      <gridHelper
        args={[36, 36, "#777269", "#aaa49a"]}
        position={[0, 0.01, 0]}
      />

      <Hotspots
        activeHotspotId={activeHotspotId}
        hotspots={project.model?.hotspots}
        onSelect={onSelectHotspot}
      />

      <CameraController
        model={project.model}
        bounds={modelBounds}
        guidedViewRequest={guidedViewRequest}
        resetRequest={resetRequest}
      />
    </>
  );
}
