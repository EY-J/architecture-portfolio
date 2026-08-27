import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArchitectureViewerClient } from "@/components/three/ArchitectureViewer/ArchitectureViewerClient";
import { WebGLFallback } from "@/components/three/WebGLFallback/WebGLFallback";
import { projects } from "@/data/projects";
import { getProjectBySlug, hasExplorableModel } from "@/lib/projects";

type ExperiencePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ExperiencePageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) return { title: "Experience unavailable" };

  return {
    title: `${project.title} — 3D Experience`,
    description: `Interactive architectural massing experience for ${project.title}.`,
    robots: { index: false, follow: true },
  };
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  if (!hasExplorableModel(project)) {
    return (
      <WebGLFallback
        project={project}
        message="No 3D source is configured for this project. Project images and drawings are still available."
      />
    );
  }

  return <ArchitectureViewerClient project={project} />;
}
