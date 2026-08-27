import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectGallery } from "@/components/projects/ProjectGallery/ProjectGallery";
import {
  ProjectGalleryModal,
  type ProjectGalleryModalImage,
} from "@/components/projects/ProjectGalleryModal/ProjectGalleryModal";
import { ProjectCarousel } from "@/components/projects/ProjectCarousel/ProjectCarousel";
import { ProjectMetadata } from "@/components/projects/ProjectMetadata/ProjectMetadata";
import { ProjectNavigation } from "@/components/projects/ProjectNavigation/ProjectNavigation";
import { projects } from "@/data/projects";
import {
  getAdjacentProjects,
  getProjectBySlug,
  hasExplorableModel,
} from "@/lib/projects";
import type {
  ArchitectureProject,
  ProjectGalleryCategory,
  ProjectImage,
  ProjectImageType,
} from "@/types/project";

import styles from "./page.module.css";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

const drawingTypes = new Set<ProjectImageType>([
  "plan",
  "section",
  "elevation",
  "diagram",
]);

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

  const images = project.images ?? [];
  const projectImages = images.filter(
    (image) =>
      image.src !== project.heroImage &&
      (!image.type || !drawingTypes.has(image.type)),
  );
  const drawings = images.filter(
    (image) =>
      image.src !== project.heroImage &&
      image.type &&
      drawingTypes.has(image.type),
  );
  const adjacent = getAdjacentProjects(project);
  const modelAvailable = hasExplorableModel(project);
  const galleryImages = createGalleryImages(project);
  const galleryThumbnail =
    galleryImages.find((image) => image.src !== project.heroImage) ??
    galleryImages[0];

  return (
    <article className={`${styles.page} site-shell`}>
      <header className={styles.hero}>
        <div className={styles.heroImage} data-reveal="image">
          <Image
            src={project.heroImage}
            alt={
              project.heroImageAlt ??
              `Architectural concept hero view of ${project.title}`
            }
            fill
            priority
            sizes="100vw"
          />
          <div className={styles.heroOverlay}>
            <h1 data-reveal="title">{project.title}</h1>
            <div className={styles.heroOverlayInfo}>
              <div className={styles.heroType}>
                <span>Project type</span>
                <span>{project.category}</span>
              </div>
              {project.summary ? <p>{project.summary}</p> : null}
            </div>
          </div>
        </div>
      </header>

      {project.carousel?.length ? (
        <ProjectCarousel images={project.carousel} projectTitle={project.title} />
      ) : null}

      <div className={styles.caseStudy}>
        <div className={styles.caseStudyRail}>
          <ProjectGalleryModal
            projectTitle={project.title}
            images={galleryImages}
            thumbnail={galleryThumbnail}
          />

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
              <p className={styles.sectionMarker}>02 / Design intent</p>
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
              {project.designIntentImage ? (
                <figure className={styles.designIntentFigure} data-reveal="image">
                  <div className={styles.designIntentImage}>
                    <Image
                      src={project.designIntentImage.src}
                      alt={project.designIntentImage.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 70vw"
                    />
                  </div>
                  {project.designIntentImage.caption ? (
                    <figcaption>
                      01 — {project.designIntentImage.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}
            </section>
          ) : null}

          <ProjectGallery
            sectionNumber="03"
            eyebrow="Spatial record"
            title="Spatial record."
            images={projectImages}
            variant="spatial"
          />

          <ProjectGallery
            sectionNumber="04"
            eyebrow="Drawings"
            title="Plans & sections."
            images={drawings}
            variant="drawings"
          />

          {project.process?.length ? (
            <ProjectGallery
              sectionNumber="05"
              eyebrow="Process"
              title="Studies & iterations."
              images={project.process}
              variant="process"
            />
          ) : null}
        </div>
      </div>

      {modelAvailable ? (
        <section
          className={styles.viewerCta}
          aria-labelledby="viewer-title"
          data-reveal="section"
        >
          <p className={styles.inverseMarker}>06 / Interactive model</p>

          <div className={styles.viewerMain}>
            <h2 id="viewer-title">
              Enter the
              <br />
              <span>spatial study.</span>
            </h2>

            <div className={styles.viewerAction}>
              <p className={styles.viewerLabel}>Explore in 3D</p>
              <h3>
                Experience the project
                <br />
                beyond static drawings.
              </h3>
              <p className={styles.viewerDescription}>
                Orbit, inspect, and move through the architectural model in real
                time to understand the project from another perspective.
              </p>
              <Link href={`/experience/${project.slug}`}>
                {"Enter 3D experience \u2197"}
              </Link>
            </div>
          </div>

          <div className={styles.viewerMeta}>
            <span>Interactive architectural model</span>
            <span>
              {project.title} / {project.year}
            </span>
          </div>
        </section>
      ) : null}

      <ProjectNavigation previous={adjacent.previous} next={adjacent.next} />
    </article>
  );
}
