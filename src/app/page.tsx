import type { Metadata } from "next";

import { DesignFocus } from "@/components/home/DesignFocus/DesignFocus";
import { Hero } from "@/components/home/Hero/Hero";
import { IntroStatement } from "@/components/home/IntroStatement/IntroStatement";
import { SelectedProjects } from "@/components/home/SelectedProjects/SelectedProjects";
import { projects } from "@/data/projects";

import styles from "./page.module.css";

export const metadata: Metadata = {
  description:
    "Selected architecture, spatial research, and visualization projects presented through an editorial portfolio.",
};

export default function Home() {
  return (
    <div className={`${styles.page} site-shell`}>
      <Hero />
      <SelectedProjects
        projects={projects.filter((project) => project.featured)}
      />
      <DesignFocus />
      <IntroStatement />
    </div>
  );
}
