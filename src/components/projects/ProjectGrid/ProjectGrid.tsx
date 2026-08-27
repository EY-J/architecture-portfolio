"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  shouldReduceMotion,
  usePrefersReducedMotion,
} from "@/hooks/usePrefersReducedMotion";
import type { ArchitectureProject } from "@/types/project";

import { ProjectCard } from "../ProjectCard/ProjectCard";
import { ProjectHoverCursor } from "../ProjectHoverCursor/ProjectHoverCursor";
import styles from "./ProjectGrid.module.css";

gsap.registerPlugin(ScrollTrigger);

type ProjectGridProps = {
  projects: readonly ArchitectureProject[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  const archiveRef = useRef<HTMLDivElement>(null);
  const revealedProjectsRef = useRef(new Set<string>());
  const prefersReducedMotion = usePrefersReducedMotion();
  const categories = useMemo(
    () =>
      Array.from(new Set(projects.map((project) => project.category))).sort(
        (first, second) => first.localeCompare(second),
      ),
    [projects],
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const visibleProjects = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((project) => project.category === activeCategory),
    [activeCategory, projects],
  );
  const featuredProject = useMemo(
    () =>
      visibleProjects.find((project) => project.featured) ?? visibleProjects[0],
    [visibleProjects],
  );
  const archiveProjects = useMemo(
    () =>
      featuredProject
        ? visibleProjects.filter((project) => project.slug !== featuredProject.slug)
        : [],
    [featuredProject, visibleProjects],
  );

  const getProjectIndex = (project: ArchitectureProject) =>
    projects.findIndex((candidate) => candidate.slug === project.slug);

  useLayoutEffect(() => {
    const archive = archiveRef.current;
    if (!archive || prefersReducedMotion || shouldReduceMotion()) return;

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-project-card]",
        archive,
      );

      cards.forEach((card) => {
        const slug = card.dataset.projectSlug;
        const media = card.querySelector<HTMLElement>("[data-project-media]");
        const image = media?.querySelector<HTMLElement>("img");
        const metadata = card.querySelector<HTMLElement>("[data-project-meta]");

        if (!slug || !media || !image || !metadata) return;
        if (revealedProjectsRef.current.has(slug)) return;

        const isFeatured = card.hasAttribute("data-project-featured");
        const revealDuration = isFeatured ? 1.2 : 1;

        gsap.set(media, {
          autoAlpha: 0,
          clipPath: "inset(8% 0% 0% 0%)",
          y: isFeatured ? 34 : 26,
        });
        gsap.set(image, { scale: isFeatured ? 1.075 : 1.06 });
        gsap.set(metadata, { autoAlpha: 0, y: 13 });

        gsap
          .timeline({
            onComplete: () => revealedProjectsRef.current.add(slug),
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              once: true,
            },
          })
          .to(
            media,
            {
              autoAlpha: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: revealDuration,
              ease: "power3.out",
              y: 0,
              clearProps: "opacity,visibility,transform,clipPath",
            },
            0,
          )
          .to(
            image,
            {
              duration: revealDuration,
              ease: "power3.out",
              scale: 1,
              clearProps: "transform",
            },
            0,
          )
          .to(
            metadata,
            {
              autoAlpha: 1,
              duration: 0.62,
              ease: "power3.out",
              y: 0,
              clearProps: "opacity,visibility,transform",
            },
            isFeatured ? 0.16 : 0.13,
          );
      });
    }, archive);

    return () => context.revert();
  }, [activeCategory, prefersReducedMotion]);

  return (
    <div>
      {categories.length > 1 ? (
        <div
          className={styles.filters}
          role="group"
          aria-label="Filter projects by category"
          data-reveal="meta"
        >
          {["All", ...categories].map((category) => (
            <button
              key={category}
              className={styles.filter}
              type="button"
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      ) : null}

      <p className={styles.resultCount} aria-live="polite">
        {visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"}
      </p>

      <div ref={archiveRef} className={styles.archive}>
        {featuredProject ? (
          <div className={styles.featured}>
            <p className={styles.featuredLabel}>
              Featured / {String(getProjectIndex(featuredProject) + 1).padStart(2, "0")}
            </p>
            <ProjectCard
              project={featuredProject}
              index={getProjectIndex(featuredProject)}
              priority
              reveal={false}
              variant="feature"
            />
          </div>
        ) : null}

        {archiveProjects.length ? (
          <div className={styles.grid}>
            {archiveProjects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={getProjectIndex(project)}
                reveal={false}
              />
            ))}
          </div>
        ) : null}
        <ProjectHoverCursor rootRef={archiveRef} />
      </div>
    </div>
  );
}
