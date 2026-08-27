"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ProjectGalleryCategory } from "@/types/project";

import styles from "./ProjectGalleryModal.module.css";

export type ProjectGalleryModalImage = {
  src: string;
  alt: string;
  title: string;
  category: ProjectGalleryCategory;
};

type ProjectGalleryModalProps = {
  projectTitle: string;
  images: readonly ProjectGalleryModalImage[];
  thumbnail: ProjectGalleryModalImage;
};

type GalleryFilter = "all" | ProjectGalleryCategory;

const categoryOrder: readonly ProjectGalleryCategory[] = [
  "design",
  "actual",
  "drawings",
  "process",
];

export function ProjectGalleryModal({
  images,
  thumbnail,
}: ProjectGalleryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<GalleryFilter>("all");
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  const lightboxOpenerRef = useRef<HTMLButtonElement | null>(null);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollPositionRef = useRef({ x: 0, y: 0 });
  const galleryScrollPositionRef = useRef(0);
  const wasOpenRef = useRef(false);
  const wasLightboxOpenRef = useRef(false);

  const availableCategories = useMemo(
    () =>
      categoryOrder.filter((category) =>
        images.some((image) => image.category === category),
      ),
    [images],
  );

  const filteredImages = useMemo(
    () =>
      activeCategory === "all"
        ? images
        : images.filter((image) => image.category === activeCategory),
    [activeCategory, images],
  );

  const openModal = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
    setActiveCategory("all");
    setIsClosing(false);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (closeTimerRef.current) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 220);
  }, []);

  const openLightbox = useCallback(
    (index: number, opener: HTMLButtonElement) => {
      galleryScrollPositionRef.current = galleryScrollRef.current?.scrollTop ?? 0;
      lightboxOpenerRef.current = opener;
      setActiveImageIndex(index);
    },
    [],
  );

  const closeLightbox = useCallback(() => {
    setActiveImageIndex(null);

    requestAnimationFrame(() => {
      if (galleryScrollRef.current) {
        galleryScrollRef.current.scrollTop = galleryScrollPositionRef.current;
      }
      lightboxOpenerRef.current?.focus();
    });
  }, []);

  const showPreviousImage = useCallback(() => {
    setActiveImageIndex((currentIndex) => {
      if (currentIndex === null || filteredImages.length === 0) return null;
      return (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    });
  }, [filteredImages.length]);

  const showNextImage = useCallback(() => {
    setActiveImageIndex((currentIndex) => {
      if (currentIndex === null || filteredImages.length === 0) return null;
      return (currentIndex + 1) % filteredImages.length;
    });
  }, [filteredImages.length]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      if (wasOpenRef.current) launcherRef.current?.focus();
      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;
    const previousOverflow = document.body.style.overflow;
    scrollPositionRef.current = { x: window.scrollX, y: window.scrollY };
    document.body.style.overflow = "hidden";
    document.body.classList.add("project-gallery-open");
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("project-gallery-open");
      window.scrollTo(scrollPositionRef.current.x, scrollPositionRef.current.y);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeImageIndex !== null) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeLightbox();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          showPreviousImage();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          showNextImage();
        }
        return;
      }

      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeImageIndex,
    closeLightbox,
    closeModal,
    isOpen,
    showNextImage,
    showPreviousImage,
  ]);

  useEffect(() => {
    if (activeImageIndex === null) {
      wasLightboxOpenRef.current = false;
      return;
    }

    if (!wasLightboxOpenRef.current) {
      wasLightboxOpenRef.current = true;
      lightboxCloseRef.current?.focus();
    }
  }, [activeImageIndex]);

  const selectCategory = (category: GalleryFilter) => {
    setActiveCategory(category);
    galleryScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <>
      <button
        className={styles.launcher}
        type="button"
        onClick={openModal}
        ref={launcherRef}
        data-reveal="section"
        aria-haspopup="dialog"
      >
        <span className={styles.launcherImage}>
          <Image
            src={thumbnail.src}
            alt=""
            fill
            sizes="(max-width: 1024px) 40vw, 15vw"
          />
        </span>
        <span className={styles.launcherCopy}>
          <span>
            Explore project
            <br />
            gallery
          </span>
          <span aria-hidden="true">{"\u2197"}</span>
        </span>
      </button>

      {isOpen && images.length && typeof document !== "undefined"
        ? createPortal(
            <div
              className={`${styles.overlay} ${isClosing ? styles.closing : ""}`}
            >
          <div
            className={styles.backdrop}
            onMouseDown={closeModal}
            aria-hidden="true"
          />

          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-gallery-title"
            aria-hidden={activeImageIndex !== null}
            inert={activeImageIndex !== null ? true : undefined}
          >
            <div className={styles.modalTop}>
              <header className={styles.header}>
                <h2 id="project-gallery-title">Project gallery</h2>
                <button
                  type="button"
                  onClick={closeModal}
                  ref={closeRef}
                  aria-label="Close project gallery"
                >
                  Close gallery {"\u00d7"}
                </button>
              </header>

              <nav className={styles.filters} aria-label="Gallery categories">
                <button
                  type="button"
                  className={
                    activeCategory === "all" ? styles.activeFilter : ""
                  }
                  onClick={() => selectCategory("all")}
                >
                  All
                </button>
                {availableCategories.map((category) => (
                  <button
                    type="button"
                    className={
                      activeCategory === category ? styles.activeFilter : ""
                    }
                    onClick={() => selectCategory(category)}
                    key={category}
                  >
                    {category}
                  </button>
                ))}
              </nav>
            </div>

            <div
              className={`${styles.galleryScroll} ${
                activeImageIndex !== null ? styles.galleryScrollLocked : ""
              }`}
              ref={galleryScrollRef}
            >
              <div className={styles.galleryScrollContent}>
                <div className={styles.galleryGrid}>
                  {filteredImages.map((image, index) => (
                    <figure className={styles.galleryItem} key={image.src}>
                      <button
                        className={styles.galleryImageButton}
                        type="button"
                        onClick={(event) =>
                          openLightbox(index, event.currentTarget)
                        }
                        aria-label={`View ${image.title || image.alt} full screen`}
                      >
                        <img
                          className={styles.galleryImage}
                          src={image.src}
                          alt={image.alt}
                          loading="lazy"
                        />
                      </button>
                      {image.title ? (
                        <figcaption>{image.title}</figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalBottomGutter} aria-hidden="true" />
          </section>

          {activeImageIndex !== null && filteredImages[activeImageIndex] ? (
            <section
              className={styles.lightbox}
              role="dialog"
              aria-modal="true"
              aria-label={
                filteredImages[activeImageIndex].title
                  ? `${filteredImages[activeImageIndex].title} full-screen image`
                  : "Full-screen project image"
              }
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeLightbox();
              }}
            >
              <button
                className={styles.lightboxClose}
                type="button"
                onClick={closeLightbox}
                ref={lightboxCloseRef}
                aria-label="Close full-screen image"
              >
                Close {"\u00d7"}
              </button>

              {filteredImages.length > 1 ? (
                <>
                  <button
                    className={`${styles.lightboxNavigation} ${styles.lightboxPrevious}`}
                    type="button"
                    onClick={showPreviousImage}
                    aria-label="View previous gallery image"
                  >
                    {"\u2190"}
                  </button>
                  <button
                    className={`${styles.lightboxNavigation} ${styles.lightboxNext}`}
                    type="button"
                    onClick={showNextImage}
                    aria-label="View next gallery image"
                  >
                    {"\u2192"}
                  </button>
                </>
              ) : null}

              <figure
                className={styles.lightboxFigure}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <img
                  className={styles.lightboxImage}
                  src={filteredImages[activeImageIndex].src}
                  alt={filteredImages[activeImageIndex].alt}
                />
                <figcaption className={styles.lightboxCaption}>
                  {filteredImages[activeImageIndex].title ? (
                    <span>{filteredImages[activeImageIndex].title}</span>
                  ) : (
                    <span />
                  )}
                  <span>
                    {String(activeImageIndex + 1).padStart(2, "0")} /{" "}
                    {String(filteredImages.length).padStart(2, "0")}
                  </span>
                  {filteredImages[activeImageIndex].title ? (
                    <span>{filteredImages[activeImageIndex].category}</span>
                  ) : (
                    <span />
                  )}
                </figcaption>
              </figure>
            </section>
          ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
