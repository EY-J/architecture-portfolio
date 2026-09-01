"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

import styles from "./ProjectHeroTransition.module.css";

type ProjectHeroTransitionProps = {
  category: string;
  imageAlt: string;
  imageSrc: string;
  summary?: string;
  title: string;
};

export function ProjectHeroTransition({
  category,
  imageAlt,
  imageSrc,
  summary,
  title,
}: ProjectHeroTransitionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    let frameId = 0;

    const updateProgress = () => {
      frameId = 0;

      const caseStudy = document.querySelector<HTMLElement>(
        "[data-project-case-study]",
      );
      const heroScrolled =
        stage.getBoundingClientRect().top - root.getBoundingClientRect().top;
      const overlayRange = Math.max(stage.offsetHeight * 0.55, 1);
      const overlayProgress = Math.min(
        Math.max(heroScrolled / overlayRange, 0),
        1,
      );

      let backgroundProgress = 0;

      if (caseStudy) {
        const caseStudyTop = caseStudy.getBoundingClientRect().top;
        const transitionStart = window.innerHeight * 1.05;
        const transitionEnd = Math.max(
          stage.getBoundingClientRect().top + window.innerHeight * 0.18,
          window.innerHeight * 0.3,
        );
        const transitionRange = Math.max(
          transitionStart - transitionEnd,
          1,
        );

        backgroundProgress = Math.min(
          Math.max(
            (transitionStart - caseStudyTop) / transitionRange,
            0,
          ),
          1,
        );
      }

      if (prefersReducedMotion) {
        root.style.setProperty(
          "--hero-overlay-progress",
          overlayProgress > 0 ? "1" : "0",
        );
        root.style.setProperty(
          "--hero-progress",
          backgroundProgress > 0 ? "1" : "0",
        );
        return;
      }

      root.style.setProperty(
        "--hero-overlay-progress",
        overlayProgress.toFixed(4),
      );
      root.style.setProperty(
        "--hero-progress",
        backgroundProgress.toFixed(4),
      );
    };

    const requestUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [prefersReducedMotion]);

  return (
    <header
      ref={rootRef}
      className={styles.hero}
      data-header-surface="image"
    >
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.media} data-reveal="image">
          <Image src={imageSrc} alt={imageAlt} fill priority sizes="100vw" />
        </div>

        <div className={styles.overlay}>
          <h1 data-reveal="title">{title}</h1>
          <div className={styles.overlayInfo}>
            <div className={styles.projectType}>
              <span>Project type</span>
              <span>{category}</span>
            </div>
            {summary ? <p>{summary}</p> : null}
          </div>
        </div>
      </div>
    </header>
  );
}
