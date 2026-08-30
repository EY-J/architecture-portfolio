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
  const pageRef = useRef<HTMLDivElement>(null);

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

  const featuredProject = visibleProjects.find((p) => p.featured) ?? visibleProjects[0];
  const gridProjects = visibleProjects.filter((p) => p.slug !== featuredProject?.slug);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const heroTitle = page.querySelector<HTMLElement>("[data-hero-title]");
      const heroMeta = page.querySelector<HTMLElement>("[data-hero-meta]");
      const heroImg = page.querySelector<HTMLElement>("[data-hero-img]");
      const heroOverlay = page.querySelector<HTMLElement>("[data-hero-overlay]");

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      if (heroImg) tl.from(heroImg, { scale: 1.08, duration: 1.6 }, 0);
      if (heroOverlay) tl.from(heroOverlay, { autoAlpha: 0, duration: 0.8 }, 0);
      if (heroTitle) tl.from(heroTitle, { autoAlpha: 0, y: 40, duration: 1.1 }, 0.2);
      if (heroMeta) tl.from(heroMeta, { autoAlpha: 0, y: 20, duration: 0.8 }, 0.5);

      const bigNum = page.querySelector<HTMLElement>("[data-big-num]");
      if (bigNum) {
        gsap.from(bigNum, {
          autoAlpha: 0,
          x: -30,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: bigNum, start: "top 90%", once: true },
        });
      }

      const cards = gsap.utils.toArray<HTMLElement>("[data-grid-card]", page);
      cards.forEach((card, i) => {
        gsap.from(card, {
          autoAlpha: 0,
          y: 30,
          duration: 0.7,
          ease: "power3.out",
          delay: i * 0.06,
          scrollTrigger: { trigger: card, start: "top 92%", once: true },
        });
      });
    }, page);

    return () => ctx.revert();
  }, [activeCategory, prefersReducedMotion]);

  return (
    <div ref={pageRef} className={styles.page}>

      {/* ── Featured Hero (full viewport height) ── */}
      {featuredProject && (
        <section className={styles.featured}>
          <Link href={`/projects/${featuredProject.slug}`} className={styles.featuredLink}>
            <div className={styles.featuredMedia} data-hero-img>
              <Image
                src={featuredProject.thumbnailImage}
                alt={featuredProject.heroImageAlt ?? `Architectural view of ${featuredProject.title}`}
                fill
                priority
                sizes="100vw"
                className={styles.featuredImage}
              />
            </div>
            <div className={styles.featuredOverlay} data-hero-overlay />

            <div className={styles.featuredContent} data-hero-meta>
              <div className={styles.featuredEyebrow}>
                <span className={styles.featuredTag}>Featured Project</span>
                <span className={styles.featuredDot} aria-hidden="true" />
                <span className={styles.featuredCategory}>{featuredProject.category}</span>
                <span className={styles.featuredDot} aria-hidden="true" />
                <span className={styles.featuredYear}>{featuredProject.year}</span>
              </div>
              <h2 className={styles.featuredTitle} data-hero-title>
                {featuredProject.title}
              </h2>
              {featuredProject.summary && (
                <p className={styles.featuredSummary}>{featuredProject.summary}</p>
              )}
              <div className={styles.featuredCta}>
                <span className={styles.featuredCtaText}>View Project</span>
                <span className={styles.featuredCtaArrow} aria-hidden="true">↗</span>
              </div>
            </div>

            <div className={styles.featuredLocation}>
              <span>{featuredProject.location}</span>
            </div>
          </Link>
        </section>
      )}

      {/* ── Archive Header ── */}
      <div className={styles.archiveHeader}>
        <div className={styles.archiveHeaderInner}>
          <div className={styles.archiveTitleBlock}>
            <span className={styles.archiveBigNum} data-big-num>
              {String(visibleProjects.length).padStart(2, "0")}
            </span>
            <div className={styles.archiveTitleText}>
              <h1 className={styles.archiveTitle}>Project<br />Index</h1>
              <p className={styles.archiveSub}>
                Selected architectural work,<br />studies, and visual explorations.
              </p>
            </div>
          </div>

          {/* Filters */}
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
        <div className={styles.archiveRule} />
      </div>

      {/* ── Project Grid ── */}
      {gridProjects.length > 0 && (
        <div className={styles.grid}>
          {gridProjects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className={styles.gridCard}
              data-grid-card
            >
              <div className={styles.gridCardMedia}>
                <Image
                  src={project.thumbnailImage}
                  alt={project.heroImageAlt ?? `Architectural view of ${project.title}`}
                  fill
                  sizes="(max-width: 48rem) 100vw, (max-width: 72rem) 50vw, 33vw"
                  className={styles.gridCardImage}
                />
              </div>
              <div className={styles.gridCardOverlay} />
              <div className={styles.gridCardHoverBtn}>
                <span className={styles.gridCardHoverBtnText}>View Project</span>
                <span aria-hidden="true">↗</span>
              </div>
              <div className={styles.gridCardContent}>
                <h3 className={styles.gridCardTitle}>{project.title}</h3>
                <div className={styles.gridCardMeta}>
                  <span className={styles.gridCardCategory}>{project.category}</span>
                  <span className={styles.gridCardSep}>/</span>
                  <span className={styles.gridCardYear}>{project.year}</span>
                </div>
                {project.status && (
                  <span className={styles.gridCardStatus}>{project.status}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
