"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

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
        const metadata = gsap.utils.toArray<HTMLElement>(
          "[data-project-meta]",
          card,
        );

        if (!slug || !media || !image || metadata.length === 0) return;
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
  }, [prefersReducedMotion]);

  return (
    <div ref={archiveRef} className={styles.archive}>
      {projects.length ? (
        <div className={styles.grid}>
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              reveal={false}
            />
          ))}
        </div>
      ) : null}
      <ProjectHoverCursor rootRef={archiveRef} />
    </div>
  );
}
