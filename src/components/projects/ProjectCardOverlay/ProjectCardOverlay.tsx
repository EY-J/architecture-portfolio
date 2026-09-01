import type { ArchitectureProject } from "@/types/project";

import styles from "./ProjectCardOverlay.module.css";

type ProjectCardOverlayProps = {
  project: ArchitectureProject;
  featured?: boolean;
  reveal?: boolean;
  revealOrder?: number;
};

export function ProjectCardOverlay({
  project,
  featured = false,
  reveal = false,
  revealOrder,
}: ProjectCardOverlayProps) {
  return (
    <>
      <span className={styles.gradient} aria-hidden="true" />
      <div
        className={`${styles.content} ${featured ? styles.featured : ""}`}
        data-project-meta
        data-reveal={reveal ? "meta" : undefined}
        data-reveal-order={reveal ? revealOrder : undefined}
      >
        <h3 className={styles.title}>{project.title}</h3>
        <div className={styles.metadata}>
          <p>
            {project.category} / {project.year}
          </p>
          {project.role ? <p className={styles.role}>{project.role}</p> : null}
        </div>
      </div>
    </>
  );
}
