import type { Metadata } from "next";

import { ProjectGrid } from "@/components/projects/ProjectGrid/ProjectGrid";
import { projects } from "@/data/projects";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse residential, civic, and academic architecture projects from the portfolio index.",
};

export default function ProjectsPage() {
  return (
    <div className={`${styles.page} site-shell`}>
      <header className={styles.intro}>
        <div className={styles.introMeta} data-reveal="meta">
          <p className="eyebrow">
            Project Archieves
          </p>
        </div>
        <h1 data-reveal="title">Built, drawn, and imagined spaces.</h1>
        <p className={styles.summary} data-reveal="section" data-reveal-order="1">
          Selected architectural work, studies, and visual explorations.
        </p>
      </header>

      <ProjectGrid projects={projects} />
    </div>
  );
}
