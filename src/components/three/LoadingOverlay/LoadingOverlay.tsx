"use client";

import { gsap } from "gsap";
import type {
  ModelLoadProgress,
  ModelPreparationPhase,
} from "@/lib/three/modelTypes";
import { getModelLabel } from "@/lib/three/modelUtils";
import type { ArchitectureProject } from "@/types/project";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

import {
  shouldReduceMotion,
  usePrefersReducedMotion,
} from "@/hooks/usePrefersReducedMotion";

import styles from "./LoadingOverlay.module.css";

type LoadingOverlayProps = {
  isActive: boolean;
  onExited: () => void;
  phase: ModelPreparationPhase;
  project: ArchitectureProject;
  progress?: ModelLoadProgress;
};

const phaseLabels: Record<ModelPreparationPhase, string> = {
  downloading: "Downloading model",
  parsing: "Parsing geometry and textures",
  preparing: "Analyzing scene complexity",
  normalizing: "Centering and fitting model",
  mounting: "Rendering first frame",
};

export function LoadingOverlay({
  isActive,
  onExited,
  phase,
  project,
  progress,
}: LoadingOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const percentage = phase === "downloading" ? progress?.percentage : undefined;

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    if (!isActive) {
      if (prefersReducedMotion || shouldReduceMotion()) {
        onExited();
        return;
      }

      const exitTween = gsap.to(overlay, {
        autoAlpha: 0,
        yPercent: -2,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: onExited,
      });
      return () => {
        exitTween.kill();
      };
    }

    gsap.set(overlay, { autoAlpha: 1, yPercent: 0 });
    if (prefersReducedMotion || shouldReduceMotion()) return;

    const entranceTween = gsap.fromTo(
      overlay.querySelectorAll<HTMLElement>("[data-loading-reveal]"),
      { autoAlpha: 0, y: 12 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "opacity,visibility,transform",
      },
    );
    return () => {
      entranceTween.kill();
    };
  }, [isActive, onExited, prefersReducedMotion]);

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="status"
      aria-live="polite"
    >
      <div className={styles.header} data-loading-reveal>
        <p className="eyebrow">{phaseLabels[phase]}</p>
        <Link href={`/projects/${project.slug}`}>Close / {project.title}</Link>
      </div>

      <div className={styles.progressGroup} data-loading-reveal>
        <div className={styles.progressMeta}>
          <span>
            {progress
              ? getModelLabel({
                  src: progress.src,
                  format: progress.format,
                  isFallback: progress.isFallback,
                })
              : "Architecture model"}
          </span>
          <span>
            {percentage !== undefined
              ? `${percentage}%`
              : phase === "downloading"
                ? "Loading…"
                : "Working…"}
          </span>
        </div>
        <div
          className={`${styles.track} ${percentage === undefined ? styles.indeterminate : ""}`}
          aria-hidden="true"
        >
          <span style={percentage !== undefined ? { width: `${percentage}%` } : undefined} />
        </div>
        <p className={styles.note}>
          {phase === "downloading"
            ? "Architectural files can be large. Geometry is prepared after download."
            : "The download is complete. Keep this tab open while the model is prepared for WebGL."}
          {progress?.isFallback ? " Trying configured fallback source." : ""}
        </p>
      </div>
    </div>
  );
}
