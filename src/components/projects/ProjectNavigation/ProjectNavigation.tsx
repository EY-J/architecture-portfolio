import Image from "next/image";
import Link from "next/link";

import { projects } from "@/data/projects";
import type { ArchitectureProject } from "@/types/project";

import styles from "./ProjectNavigation.module.css";

type ProjectNavigationProps = {
  previous: ArchitectureProject;
  next: ArchitectureProject;
};

export function ProjectNavigation({
  previous,
  next,
}: ProjectNavigationProps) {
  const nextIndex = projects.findIndex((project) => project.slug === next.slug);
  const nextNumber = String(nextIndex + 1).padStart(2, "0");
  const nextTitle = next.shortTitle ?? next.title;
  const previousTitle = previous.shortTitle ?? previous.title;

  return (
    <nav className={styles.navigation} aria-label="Adjacent projects">
      <div className={styles.heading}>
        <span>Next project</span>
        <span>{nextNumber}</span>
      </div>

      <Link className={styles.nextLink} href={`/projects/${next.slug}`}>
        <span>{nextTitle}</span>
        <span aria-hidden="true">{"\u2197"}</span>
      </Link>

      <Link
        className={styles.preview}
        href={`/projects/${next.slug}`}
        aria-label={`View next project: ${nextTitle}`}
      >
        <Image
          src={next.thumbnailImage}
          alt=""
          fill
          sizes="100vw"
        />
      </Link>

      <Link className={styles.previousLink} href={`/projects/${previous.slug}`}>
        {"\u2190 Previous project"} / {previousTitle}
      </Link>
    </nav>
  );
}
