"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { shouldReduceMotion } from "@/hooks/usePrefersReducedMotion";
import type { ArchitectureProject } from "@/types/project";

import styles from "./SelectedProjects.module.css";

gsap.registerPlugin(ScrollTrigger);

type SelectedProjectsProps = {
  projects: readonly ArchitectureProject[];
};

const visibleProjectCount = 3;

export function SelectedProjects({ projects }: SelectedProjectsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const hasAdvancedRef = useRef(false);
  const [startIndex, setStartIndex] = useState(0);

  const visibleProjects = useMemo(() => {
    if (projects.length <= visibleProjectCount) return projects;

    return Array.from(
      { length: visibleProjectCount },
      (_, offset) => projects[(startIndex + offset) % projects.length],
    );
  }, [projects, startIndex]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || shouldReduceMotion()) return;

    const context = gsap.context(() => {
      const heading = section.querySelector<HTMLElement>(
        "[data-projects-heading]",
      );
      const gallery = section.querySelector<HTMLElement>(
        "[data-projects-gallery]",
      );
      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-project-card]",
        section,
      );

      if (!heading || !gallery) return;

      gsap.set(heading, { autoAlpha: 0 });
      gsap.set(gallery, { y: 15 });
      gsap.set(cards, { autoAlpha: 0 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
        })
        .to(heading, {
          autoAlpha: 1,
          duration: 0.45,
          ease: "power2.out",
        })
        .to(
          gallery,
          {
            duration: 0.65,
            ease: "power3.out",
            y: 0,
          },
          "-=0.18",
        )
        .to(
          cards,
          {
            autoAlpha: 1,
            duration: 0.55,
            ease: "power2.out",
            stagger: 0.07,
          },
          "<",
        );
    }, section);

    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!hasAdvancedRef.current || !galleryRef.current || shouldReduceMotion()) {
      return;
    }

    gsap.fromTo(
      galleryRef.current,
      { autoAlpha: 0, x: 10 },
      { autoAlpha: 1, duration: 0.4, ease: "power2.out", x: 0 },
    );
  }, [startIndex]);

  const showNextProjects = () => {
    if (projects.length <= visibleProjectCount) return;

    const advance = () => {
      hasAdvancedRef.current = true;
      setStartIndex((current) => (current + visibleProjectCount) % projects.length);
    };

    if (!galleryRef.current || shouldReduceMotion()) {
      advance();
      return;
    }

    gsap.to(galleryRef.current, {
      autoAlpha: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: advance,
      x: -10,
    });
  };

  return (
    <section
      ref={sectionRef}
      id="selected-projects"
      className={styles.section}
      aria-labelledby="selected-title"
    >
      <header className={styles.heading} data-projects-heading>
        <h2 id="selected-title">Selected Projects</h2>
      </header>

      <div className={styles.galleryShell}>
        <div
          ref={galleryRef}
          className={styles.gallery}
          data-projects-gallery
        >
          {visibleProjects.map((project, index) => (
            <article
              key={project.slug}
              className={styles.project}
              data-project-card
              data-header-surface="image"
            >
              <Link
                className={styles.projectLink}
                href={`/projects/${project.slug}`}
              >
                <Image
                  className={styles.image}
                  src={project.thumbnailImage}
                  alt={
                    project.heroImageAlt ??
                    `Architectural view of ${project.title}`
                  }
                  fill
                  priority={startIndex === 0 && index === 0}
                  sizes="(max-width: 768px) 86vw, (max-width: 1200px) 46vw, 50vw"
                />

                <div className={styles.overlay} aria-hidden="true" />

                <div className={styles.projectContent}>
                  <h3>{project.title}</h3>
                  <span className={styles.viewProject}>View project</span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {projects.length > visibleProjectCount ? (
          <button
            className={styles.nextButton}
            type="button"
            aria-label="Show next projects"
            onClick={showNextProjects}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </button>
        ) : null}
      </div>

      <Link className={styles.viewMore} href="/projects">
        View more
      </Link>
    </section>
  );
}
