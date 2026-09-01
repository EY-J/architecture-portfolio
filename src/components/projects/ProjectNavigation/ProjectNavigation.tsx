import Image from "next/image";
import Link from "next/link";

import { ProjectCardOverlay } from "@/components/projects/ProjectCardOverlay/ProjectCardOverlay";
import { projects } from "@/data/projects";
import type { ArchitectureProject } from "@/types/project";

import styles from "./ProjectNavigation.module.css";

type ProjectNavigationProps = {
  current: ArchitectureProject;
};

export function ProjectNavigation({ current }: ProjectNavigationProps) {
  const currentIndex = projects.findIndex(
    (project) => project.slug === current.slug,
  );
  const orderedProjects =
    currentIndex === -1
      ? projects
      : [
          ...projects.slice(currentIndex + 1),
          ...projects.slice(0, currentIndex),
        ];
  const nextProjects = orderedProjects
    .filter((project) => project.slug !== current.slug)
    .slice(0, 2);

  return (
    <section className={styles.navigation} aria-labelledby="more-projects-title">
      <div className={styles.heading}>
        <h2 id="more-projects-title">More projects</h2>
        <Link className={styles.archiveLink} href="/projects">
          <span>View all projects</span>
          <span className={styles.archiveArrow} aria-hidden="true">
            {"\u2197"}
          </span>
        </Link>
      </div>

      {nextProjects.length ? (
        <div className={styles.grid}>
          {nextProjects.map((project) => (
            <article className={styles.card} key={project.slug}>
              <Link
                className={`${styles.cardLink} project-card-hover-link project-card-overlay-link`}
                href={`/projects/${project.slug}`}
                aria-label={`View project: ${project.title}`}
              >
                <div
                  className={`${styles.imageFrame} project-card-hover-trigger project-card-overlay-trigger`}
                  data-header-surface="image"
                >
                  <Image
                    className={`${styles.image} project-card-hover-media`}
                    src={project.thumbnailImage}
                    alt={
                      project.heroImageAlt ??
                      `Architectural view of ${project.title}`
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <ProjectCardOverlay project={project} />
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
