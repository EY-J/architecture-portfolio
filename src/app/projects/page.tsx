import type { Metadata } from "next";

import { ProjectArchiveShowcase } from "@/components/projects/ProjectArchiveShowcase/ProjectArchiveShowcase";
import { ProjectGrid } from "@/components/projects/ProjectGrid/ProjectGrid";
import { projects } from "@/data/projects";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse residential, civic, and academic architecture projects from the portfolio index.",
};

export default function ProjectsPage() {
  const featuredProjects = projects
    .filter((project) => project.featured)
    .slice(0, 3);

  return (
    <>
      <ProjectArchiveShowcase projects={featuredProjects} />

      <section className={styles.gallery} aria-labelledby="projects-title">
        <div className={`${styles.galleryInner} site-shell`}>
          <h2 className={styles.galleryIntro} id="projects-title">
            <span className={styles.galleryEyebrow}>
              <span>ARCHITECTURAL WORKS</span>
              <span
                className={styles.galleryEyebrowRule}
                data-archive-rule
                aria-hidden="true"
              />
            </span>
            <span className={styles.galleryTitle}>PROJECT ARCHIVES</span>
          </h2>
          <ProjectGrid projects={projects} />
        </div>
      </section>
    </>
  );
}
