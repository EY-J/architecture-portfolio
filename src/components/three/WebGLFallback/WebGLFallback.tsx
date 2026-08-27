import Image from "next/image";
import Link from "next/link";

import type { ArchitectureProject } from "@/types/project";

import styles from "./WebGLFallback.module.css";

type WebGLFallbackProps = {
  project: ArchitectureProject;
  status?: "3D model unavailable" | "WebGL unavailable" | "WebGL context lost";
  message?: string;
};

export function WebGLFallback({
  project,
  status = "3D model unavailable",
  message = "Project images and drawings are still available.",
}: WebGLFallbackProps) {
  return (
    <div className={styles.fallback} role="status" aria-live="polite">
      <Image
        className={styles.image}
        src={project.heroImage}
        alt={`Architectural fallback image for ${project.title}`}
        fill
        priority
        sizes="100vw"
      />
      <div className={styles.scrim} />

      <header className={styles.header}>
        <p className="eyebrow">{project.title}</p>
        <Link href={`/projects/${project.slug}`}>Close / Project page</Link>
      </header>

      <div className={styles.message}>
        <p className="eyebrow">Viewer status</p>
        <h1>{status}.</h1>
        <p>{message}</p>
        <Link href={`/projects/${project.slug}`}>Return to project →</Link>
      </div>
    </div>
  );
}
