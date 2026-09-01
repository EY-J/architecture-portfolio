import Image from "next/image";

import type { ProjectImage } from "@/types/project";

import styles from "./ProjectGallery.module.css";

type ProjectGalleryProps = {
  sectionNumber: string;
  eyebrow: string;
  title: string;
  images: readonly ProjectImage[];
  variant: "spatial" | "drawings" | "process";
};

const drawingTypes = new Set(["plan", "section", "elevation", "diagram"]);

export function ProjectGallery({
  sectionNumber,
  eyebrow,
  title,
  images,
  variant,
}: ProjectGalleryProps) {
  if (images.length === 0) return null;

  const sectionId = `${eyebrow
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}-gallery-title`;
  const variantClass = styles[variant];

  return (
    <section
      className={`${styles.section} ${variantClass}`}
      aria-labelledby={sectionId}
    >
      <header className={styles.heading} data-reveal="section">
        <p className={styles.marker}>
          {sectionNumber} / {eyebrow}
        </p>
        <h2 id={sectionId}>{title}</h2>
      </header>

      <div className={styles.grid}>
        {images.map((image, index) => {
          const isDrawing = image.type
            ? drawingTypes.has(image.type)
            : false;
          const isFull = index === 0 || image.layout === "full";

          return (
            <figure
              className={`${styles.figure} ${isFull ? styles.full : ""} ${
                index === 0 ? styles.primary : styles.secondary
              }`}
              key={`${image.src}-${image.type ?? "image"}-${index}`}
              data-reveal="image"
              data-reveal-order={index % 2}
            >
              <div
                className={`${styles.imageFrame} ${
                  isDrawing ? styles.drawing : ""
                }`}
                data-header-surface="image"
              >
                <Image
                  className={styles.image}
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={
                    isFull
                      ? "(max-width: 1024px) 100vw, 62vw"
                      : "(max-width: 768px) 100vw, 38vw"
                  }
                />
              </div>
              {image.caption ? (
                <figcaption className={styles.caption}>
                  <span>{String(index + 1).padStart(2, "0")} —</span>
                  <span>{image.caption}</span>
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
