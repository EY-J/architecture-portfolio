import type { Metadata } from "next";

import { ProjectArchive } from "@/components/projects/ProjectArchive/ProjectArchive";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse residential, civic, and academic architecture projects from the portfolio index.",
};

export default function ProjectsPage() {
  return <ProjectArchive projects={projects} />;
}
