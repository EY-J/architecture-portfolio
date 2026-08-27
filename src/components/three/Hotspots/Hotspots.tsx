"use client";

import { Html } from "@react-three/drei";

import type { ProjectHotspot } from "@/types/project";

import styles from "./Hotspots.module.css";

type HotspotsProps = {
  activeHotspotId: string | null;
  hotspots?: readonly ProjectHotspot[];
  onSelect: (hotspotId: string) => void;
};

export function Hotspots({
  activeHotspotId,
  hotspots,
  onSelect,
}: HotspotsProps) {
  if (!hotspots?.length) return null;

  return (
    <group name="CONFIGURED_HOTSPOTS">
      {hotspots.map((hotspot, index) => (
        <Html
          key={hotspot.id}
          center
          position={[...hotspot.position]}
          zIndexRange={[1, 0]}
        >
          <button
            type="button"
            className={styles.marker}
            aria-label={`Open hotspot: ${hotspot.label}`}
            aria-pressed={activeHotspotId === hotspot.id}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(hotspot.id);
            }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
          </button>
        </Html>
      ))}
    </group>
  );
}
