import { Box3, Group, MathUtils, Object3D, Sphere, Vector3 } from "three";

import type { ArchitectureModel } from "@/types/project";

import {
  ArchitectureModelError,
  type CameraFit,
  type NormalizedArchitectureModel,
} from "./modelTypes";

function assertUsableBounds(bounds: Box3) {
  const size = bounds.getSize(new Vector3());
  const isFiniteSize = [size.x, size.y, size.z].every(Number.isFinite);

  if (bounds.isEmpty() || !isFiniteSize || size.lengthSq() === 0) {
    throw new ArchitectureModelError({
      code: "empty-model",
      message: "The loaded model does not contain finite, visible geometry bounds.",
      publicMessage: "The model loaded without usable architectural geometry.",
    });
  }
}

export function normalizeArchitectureModel(
  object: Object3D,
  config: ArchitectureModel,
): NormalizedArchitectureModel {
  const root = new Group();
  root.name = "ARCHITECTURE_MODEL_ROOT";
  root.add(object);

  const rotation = config.rotation ?? [0, 0, 0];
  root.rotation.set(rotation[0], rotation[1], rotation[2]);

  const scale = config.scale ?? 1;
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new ArchitectureModelError({
      code: "empty-model",
      message: `Invalid model scale: ${scale}.`,
      publicMessage: "The configured model scale is invalid.",
    });
  }
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(root);
  assertUsableBounds(bounds);

  const translation = new Vector3();

  if (config.autoCenter !== false) {
    const center = bounds.getCenter(new Vector3());
    translation.x -= center.x;
    translation.z -= center.z;
  }

  if (config.groundToZero !== false) {
    translation.y -= bounds.min.y;
  }

  if (config.position) {
    translation.x += config.position[0];
    translation.y += config.position[1];
    translation.z += config.position[2];
  }

  root.position.copy(translation);
  root.updateMatrixWorld(true);
  bounds.translate(translation);
  assertUsableBounds(bounds);

  return {
    root,
    bounds,
    center: bounds.getCenter(new Vector3()),
    size: bounds.getSize(new Vector3()),
  };
}

export function calculateCameraFit(
  bounds: Box3,
  verticalFovDegrees: number,
  aspect: number,
): CameraFit {
  assertUsableBounds(bounds);

  const sphere = bounds.getBoundingSphere(new Sphere());
  const target = bounds.getCenter(new Vector3());
  const verticalFov = MathUtils.degToRad(verticalFovDegrees);
  const safeAspect = Math.max(aspect, 0.2);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * safeAspect);
  const limitingFov = Math.min(verticalFov, horizontalFov);
  const radius = Math.max(sphere.radius, 0.01);
  const distance = (radius / Math.sin(limitingFov / 2)) * 1.15;
  const direction = new Vector3(1, 0.72, 1).normalize();
  const position = target.clone().addScaledVector(direction, distance);

  return {
    position,
    target,
    distance,
    near: Math.max(radius / 250, 0.01),
    far: Math.max(distance + radius * 10, 100),
    minDistance: Math.max(radius * 0.15, 0.5),
    maxDistance: Math.max(distance * 3.5, radius * 5),
  };
}
