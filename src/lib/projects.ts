import { projects } from "@/data/projects";
import type { ArchitectureProject } from "@/types/project";

export function getProjectBySlug(slug: string): ArchitectureProject | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getFeaturedProjects(): readonly ArchitectureProject[] {
  return projects.filter((project) => project.featured);
}

export function getAdjacentProjects(project: ArchitectureProject): {
  previous: ArchitectureProject;
  next: ArchitectureProject;
} {
  const currentIndex = projects.findIndex((candidate) => candidate.slug === project.slug);
  const previousIndex = (currentIndex - 1 + projects.length) % projects.length;
  const nextIndex = (currentIndex + 1) % projects.length;

  return {
    previous: projects[previousIndex],
    next: projects[nextIndex],
  };
}

export function hasExplorableModel(project: ArchitectureProject): boolean {
  const model = project.model;

  return Boolean(
    model && (model.placeholder || model.src || model.primarySrc || model.fallbackSrc),
  );
}
