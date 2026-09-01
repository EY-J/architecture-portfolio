import Image from "next/image";
import Link from "next/link";

import { ProjectCardOverlay } from "@/components/projects/ProjectCardOverlay/ProjectCardOverlay";
import type { ArchitectureProject } from "@/types/project";

import styles from "./ProjectCard.module.css";

type ProjectCardProps = {
  project: ArchitectureProject;
  index: number;
  priority?: boolean;
  reveal?: boolean;
  variant?: "grid" | "feature" | "portrait" | "panorama";
};

export function ProjectCard({
  project,
  index,
  priority = false,
  reveal = true,
  variant = "grid",
}: ProjectCardProps) {
  const sizes = {
    grid: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw",
    feature: "(max-width: 768px) 100vw, 86vw",
    portrait: "(max-width: 768px) 90vw, 48vw",
    panorama: "(max-width: 768px) 100vw, 68vw",
  }[variant];

  return (
    <article
      className={`${styles.card} ${styles[variant]}`}
      data-project-card
      data-project-featured={variant === "feature" ? "" : undefined}
      data-project-slug={project.slug}
    >
      <Link
        className={`${styles.link} project-card-overlay-link${
          variant === "grid" ? " project-card-hover-link" : ""
        }`}
        href={`/projects/${project.slug}`}
      >
        <div
          className={`${styles.imageFrame} project-card-overlay-trigger${
            variant === "grid" ? " project-card-hover-trigger" : ""
          }`}
          data-header-surface="image"
          data-project-media
          data-reveal={reveal ? "image" : undefined}
          data-reveal-order={reveal ? index % 3 : undefined}
        >
          <Image
            className={`${styles.image}${
              variant === "grid" ? " project-card-hover-media" : ""
            }`}
            src={project.thumbnailImage}
            alt={project.heroImageAlt ?? `Architectural view of ${project.title}`}
            fill
            priority={priority}
            sizes={sizes}
          />
          <span className={styles.index} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <ProjectCardOverlay
            project={project}
            featured={variant === "feature"}
            reveal={reveal}
            revealOrder={(index % 3) + 1}
          />
        </div>

        {variant === "feature" ? (
          <p className={styles.summary} data-project-meta>
            {project.summary}
          </p>
        ) : null}
      </Link>
    </article>
  );
}
