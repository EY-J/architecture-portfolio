import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ProjectGalleryModal,
  type ProjectGalleryModalImage,
} from "@/components/projects/ProjectGalleryModal/ProjectGalleryModal";
import { ProjectCarousel } from "@/components/projects/ProjectCarousel/ProjectCarousel";
import { ProjectHeroTransition } from "@/components/projects/ProjectHeroTransition/ProjectHeroTransition";
import { ProjectMetadata } from "@/components/projects/ProjectMetadata/ProjectMetadata";
import { ProjectNavigation } from "@/components/projects/ProjectNavigation/ProjectNavigation";
import { projects } from "@/data/projects";
import { getProjectBySlug, hasExplorableModel } from "@/lib/projects";
import type {
  ArchitectureProject,
  ProjectGalleryCategory,
  ProjectImage,
} from "@/types/project";

import styles from "./page.module.css";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

function inferGalleryCategory(
  image: ProjectImage,
  fallback?: ProjectGalleryCategory,
): ProjectGalleryCategory {
  if (image.galleryCategory) return image.galleryCategory;
  if (fallback) return fallback;
  if (image.type === "photo") return "actual";
  if (
    image.type === "plan" ||
    image.type === "section" ||
    image.type === "elevation"
  ) {
    return "drawings";
  }
  if (image.type === "diagram") return "process";
  return "design";
}

function createGalleryImages(
  project: ArchitectureProject,
): ProjectGalleryModalImage[] {
  const gallery = new Map<string, ProjectGalleryModalImage>();

  const addImages = (
    images: readonly ProjectImage[] | undefined,
    fallback?: ProjectGalleryCategory,
  ) => {
    images?.forEach((image) => {
      gallery.set(image.src, {
        src: image.src,
        alt: image.alt,
        title: image.caption ?? image.alt,
        category: inferGalleryCategory(image, fallback),
      });
    });
  };

  addImages(project.carousel);
  addImages(project.images);
  addImages(
    project.designIntentImage ? [project.designIntentImage] : undefined,
  );
  addImages(project.process, "process");

  if (gallery.size === 0) {
    gallery.set(project.heroImage, {
      src: project.heroImage,
      alt:
        project.heroImageAlt ??
        `Architectural concept view of ${project.title}`,
      title: project.title,
      category: "design",
    });
  }

  return Array.from(gallery.values());
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      type: "article",
      images: [{ url: project.heroImage, alt: project.title }],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const modelAvailable = hasExplorableModel(project);
  const galleryImages = createGalleryImages(project);

  return (
    <article className={styles.page}>
      <ProjectHeroTransition
        category={project.category}
        imageAlt={
          project.heroImageAlt ??
          `Architectural concept hero view of ${project.title}`
        }
        imageSrc={project.heroImage}
        summary={project.summary}
        title={project.title}
      />

      <div className={`${styles.projectBody} site-shell`}>
        {project.carousel?.length ? (
          <ProjectCarousel
            images={project.carousel}
            projectTitle={project.title}
          />
        ) : null}

        <div className={styles.galleryLauncherRow}>
          <ProjectGalleryModal
            projectTitle={project.title}
            images={galleryImages}
          />
        </div>

        <div className={styles.caseStudy} data-project-case-study>
          <div className={styles.caseStudyRail}>
            <section
              className={styles.projectDetails}
              aria-labelledby="project-details-title"
              data-reveal="section"
            >
              <h2 className={styles.sectionMarker} id="project-details-title">
                Project details
              </h2>
              <ProjectMetadata project={project} compact />
            </section>
          </div>

          <div className={styles.caseStudyContent}>
            <section
              className={styles.overview}
              aria-labelledby="project-overview-title"
              data-reveal="section"
            >
              <p className={styles.sectionMarker}>01 / Overview</p>
              <h2 id="project-overview-title">Overview</h2>
              <p className={styles.projectStatement}>{project.summary}</p>
            </section>

            {project.narrative?.length ? (
              <section
                className={styles.narrative}
                aria-labelledby="design-narrative-title"
                data-reveal="section"
              >
                <p className={styles.sectionMarker}>02 / Design approach</p>
                <div className={styles.narrativeContent}>
                  <h2 id="design-narrative-title">
                    Intent &amp;
                    <br />
                    spatial strategy.
                  </h2>
                  <div className={styles.narrativeCopy}>
                    {project.narrative.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                {project.keyDesignMoves?.length ? (
                  <ol className={styles.designMovesList}>
                    {project.keyDesignMoves.map((move, index) => (
                      <li key={move.title}>
                        <span className={styles.designMoveNumber}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3>{move.title}</h3>
                          <p>{move.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </section>
            ) : null}

            {modelAvailable ? (
              <section
                className={styles.compactModel}
                aria-labelledby="viewer-title"
                data-reveal="section"
              >
                <p className={styles.sectionMarker}>03 / Interactive model</p>
                <h2 id="viewer-title">
                  Enter the
                  <br />
                  <span>spatial study.</span>
                </h2>
                <Link
                  className={styles.compactModelLink}
                  href={`/experience/${project.slug}`}
                >
                  {"Open 3D experience \u2197"}
                </Link>
              </section>
            ) : null}
          </div>
        </div>

        <ProjectNavigation current={project} />
      </div>
    </article>
  );
}
