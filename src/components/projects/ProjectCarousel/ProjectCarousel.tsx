import Image from "next/image";

import type { ProjectImage } from "@/types/project";

import styles from "./ProjectCarousel.module.css";

type ProjectCarouselProps = {
  images: readonly ProjectImage[];
  projectTitle: string;
};

export function ProjectCarousel({
  images,
  projectTitle,
}: ProjectCarouselProps) {
  if (images.length === 0) return null;

  const renderSlides = (duplicate: boolean) =>
    images.map((image) => (
      <figure
        className={styles.slide}
        key={`${duplicate ? "duplicate" : "original"}-${image.src}`}
        aria-hidden={duplicate || undefined}
        data-header-surface="image"
      >
        <Image
          src={image.src}
          alt={duplicate ? "" : image.alt}
          fill
          sizes="(max-width: 768px) 76vw, (max-width: 1615px) 26vw, 420px"
        />
      </figure>
    ));

  return (
    <section
      className={styles.carousel}
      aria-label={`${projectTitle} project views`}
      aria-roledescription="carousel"
      data-reveal="section"
    >
      <h2 className={styles.visuallyHidden}>Project views</h2>
      <div className={styles.viewport}>
        <div className={styles.rail}>
          <div className={styles.group}>{renderSlides(false)}</div>
          <div className={styles.group} aria-hidden="true">
            {renderSlides(true)}
          </div>
        </div>
      </div>
    </section>
  );
}
