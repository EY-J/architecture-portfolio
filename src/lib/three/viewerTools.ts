import type { ProjectView } from "@/types/project";
import type { WebGLRenderer } from "three";

export type SectionAxis = "x" | "y" | "z";

export type ViewerPanel = "info" | "help" | "tools" | null;

export type SectionState = {
  enabled: boolean;
  axis: SectionAxis;
  offset: number;
};

export type GuidedViewRequest = {
  sequence: number;
  view: ProjectView;
} | null;

export function setLocalClippingEnabled(
  renderer: WebGLRenderer,
  enabled: boolean,
) {
  renderer.localClippingEnabled = enabled;
}
