"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useMemo, useRef } from "react";
import type { ElementRef } from "react";
import type { Box3, PerspectiveCamera as ThreePerspectiveCamera } from "three";

import { defaultViewerCamera } from "@/config/viewer";
import {
  shouldReduceMotion,
  usePrefersReducedMotion,
} from "@/hooks/usePrefersReducedMotion";
import { calculateCameraFit } from "@/lib/three/modelNormalization";
import type { GuidedViewRequest } from "@/lib/three/viewerTools";
import type { ArchitectureModel } from "@/types/project";

type CameraControllerProps = {
  model?: ArchitectureModel;
  bounds: Box3 | null;
  guidedViewRequest: GuidedViewRequest;
  resetRequest: number;
};

export function CameraController({
  model,
  bounds,
  guidedViewRequest,
  resetRequest,
}: CameraControllerProps) {
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const camera = model?.camera;
  const fit = useMemo(
    () =>
      bounds
        ? calculateCameraFit(
            bounds,
            defaultViewerCamera.fov,
            size.width / Math.max(size.height, 1),
          )
        : null,
    [bounds, size.height, size.width],
  );
  const target = useMemo<[number, number, number]>(
    () =>
      camera?.target
        ? [...camera.target]
        : fit
          ? [fit.target.x, fit.target.y, fit.target.z]
          : [...defaultViewerCamera.target],
    [camera, fit],
  );
  const position = useMemo<[number, number, number]>(
    () =>
      camera?.position
        ? [...camera.position]
        : fit
          ? [fit.position.x, fit.position.y, fit.position.z]
          : [...defaultViewerCamera.position],
    [camera, fit],
  );
  const minDistance =
    camera?.minDistance ?? fit?.minDistance ?? defaultViewerCamera.minDistance;
  const maxDistance =
    camera?.maxDistance ?? fit?.maxDistance ?? defaultViewerCamera.maxDistance;

  useEffect(() => {
    const activeCamera = cameraRef.current;
    const controls = controlsRef.current;
    if (!activeCamera || !controls || guidedViewRequest) return;

    gsap.killTweensOf(activeCamera.position);
    gsap.killTweensOf(controls.target);
    activeCamera.position.set(...position);
    controls.target.set(...target);
    controls.update();
    invalidate();
  }, [guidedViewRequest, invalidate, position, resetRequest, target]);

  useEffect(() => {
    const activeCamera = cameraRef.current;
    const controls = controlsRef.current;
    if (!activeCamera || !controls || !guidedViewRequest) return;

    const { view } = guidedViewRequest;
    if (prefersReducedMotion || shouldReduceMotion()) {
      activeCamera.position.set(...view.position);
      controls.target.set(...view.target);
      controls.update();
      invalidate();
      return;
    }

    const cameraTween = gsap.to(activeCamera.position, {
      x: view.position[0],
      y: view.position[1],
      z: view.position[2],
      duration: 1.1,
      ease: "power3.inOut",
      onUpdate: invalidate,
    });
    const targetTween = gsap.to(controls.target, {
      x: view.target[0],
      y: view.target[1],
      z: view.target[2],
      duration: 1.1,
      ease: "power3.inOut",
      onUpdate: () => {
        controls.update();
        invalidate();
      },
    });

    return () => {
      cameraTween.kill();
      targetTween.kill();
    };
  }, [guidedViewRequest, invalidate, prefersReducedMotion]);

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={position}
        fov={defaultViewerCamera.fov}
        near={fit?.near ?? defaultViewerCamera.near}
        far={fit?.far ?? defaultViewerCamera.far}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={target}
        enableDamping
        dampingFactor={0.075}
        enablePan
        enableZoom
        minDistance={minDistance}
        maxDistance={maxDistance}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2.04}
        rotateSpeed={0.65}
        zoomSpeed={0.8}
        panSpeed={0.65}
        screenSpacePanning={false}
      />
    </>
  );
}
