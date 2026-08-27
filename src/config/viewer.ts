export const viewerPerformance = {
  mobileQuery: "(max-width: 48rem), (pointer: coarse)",
  mobileMaxDpr: 1.25,
  desktopMaxDpr: 1.75,
  heavyModelMaxDpr: 1.25,
  shadowMapSize: 1024,
  heavyModelThresholds: {
    nodes: 10_000,
    drawCalls: 1_200,
    triangles: 1_500_000,
    estimatedTextureBytes: 256 * 1024 * 1024,
  },
} as const;

export const defaultViewerCamera = {
  position: [10, 7, 13] as const,
  target: [0, 1.2, 0] as const,
  fov: 38,
  near: 0.1,
  far: 500,
  minDistance: 4,
  maxDistance: 32,
} as const;
