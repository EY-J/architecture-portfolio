"use client";

import dynamic from "next/dynamic";

import type { ArchitectureProject } from "@/types/project";

import styles from "./ArchitectureViewer.module.css";

const DynamicArchitectureViewer = dynamic(
  () => import("./ArchitectureViewer").then((module) => module.ArchitectureViewer),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loading} role="status" aria-live="polite">
        <p className="eyebrow">Spatial viewer</p>
        <p>Loading interactive system…</p>
      </div>
    ),
  },
);

type ArchitectureViewerClientProps = {
  project: ArchitectureProject;
};

export function ArchitectureViewerClient({ project }: ArchitectureViewerClientProps) {
  return <DynamicArchitectureViewer project={project} />;
}
