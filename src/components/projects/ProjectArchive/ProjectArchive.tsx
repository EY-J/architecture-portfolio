"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { ArchitectureProject } from "@/types/project";

import styles from "./ProjectArchive.module.css";

gsap.registerPlugin(ScrollTrigger);

type ProjectArchiveProps = {
  projects: readonly ArchitectureProject[];
};

export function ProjectArchive({ projects }: ProjectArchiveProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () =>
      Array.from(new Set(projects.map((p) => p.category))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [projects],
  );

  const [activeCategory, setActiveCategory] = useState("All");

  const visibleProjects = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((p) => p.category === activeCategory),
    [activeCategory, projects],
  );

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const line = header.querySelector<HTMLElement>("[data-line]");
      const counter = header.querySelector<HTMLElement>("[data-counter]");
      const title = header.querySelector<HTMLElement>("[data-title]");
      const sub = header.querySelector<HTMLElement>("[data-sub]");

      if (line) gsap.from(line, { scaleX: 0, duration: 1.1, ease: "power3.out", transformOrigin: "left" });
      if (counter) gsap.from(counter, { autoAlpha: 0, y: 14, duration: 0.7, ease: "power3.out", delay: 0.15 });
      if (title) gsap.from(title, { autoAlpha: 0, y: 28, duration: 1, ease: "power3.out", delay: 0.1 });
      if (sub) gsap.from(sub, { autoAlpha: 0, y: 16, duration: 0.8, ease: "power3.out", delay: 0.3 });
    }, header);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-archive-card]", grid);
      cards.forEach((card, i) => {
        gsap.from(card, {
          autoAlpha: 0,
          y: 40,
          duration: 0.9,
          ease: "power3.out",
          delay: (i % 3) * 0.08,
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true,
          },
        });
      });
    }, grid);

    return () => ctx.revert();
  }, [activeCategory, prefersReducedMotion]);

  const totalCount = String(visibleProjects.length).padStart(2, "0");

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header ref={headerRef} className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.label} data-counter>
            Archive — {totalCount} {visibleProjects.length === 1 ? "project" : "projects"}
          </span>
          <p className={styles.headerSub} data-sub>
            Selected architectural work,<br />studies, and visual explorations.
          </p>
        </div>

        <div className={styles.titleRow}>
          <div className={styles.titleLine} data-line />
          <h1 className={styles.title} data-title>
            Project<br />Archives
          </h1>
        </div>
      </header>

      {/* ── Filters ── */}
      <div className={styles.filtersWrap}>
        <div
          className={styles.filters}
          role="group"
          aria-label="Filter projects by category"
        >
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              className={styles.filterBtn}
              aria-pressed={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <div ref={gridRef} className={styles.grid}>
        {visibleProjects.map((project, i) => {
          const isFeatured = project.featured && i === 0;
          return (
            <article
              key={project.slug}
              className={`${styles.card} ${isFeatured ? styles.cardFeatured : ""}`}
              data-archive-card
            >
              <Link href={`/projects/${project.slug}`} className={styles.cardLink}>
                <div className={styles.cardMedia}>
                  <Image
                    src={project.thumbnailImage}
                    alt={project.heroImageAlt ?? `Architectural view of ${project.title}`}
                    fill
                    sizes={
                      isFeatured
                        ? "(max-width: 768px) 100vw, 66vw"
                        : "(max-width: 768px) 100vw, 33vw"
                    }
                    priority={i < 2}
                    className={styles.cardImage}
                  />
                  <div className={styles.cardOverlay} />
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardCategory}>{project.category}</span>
                    <span className={styles.cardYear}>{project.year}</span>
                  </div>
                  <h2 className={styles.cardTitle}>{project.title}</h2>
                  {isFeatured && project.summary ? (
                    <p className={styles.cardSummary}>{project.summary}</p>
                  ) : null}
                  <div className={styles.cardFooter}>
                    <span className={styles.cardLocation}>{project.location}</span>
                    <span className={styles.cardArrow} aria-hidden="true">→</span>
                  </div>
                </div>

                <span className={styles.cardIndex} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
