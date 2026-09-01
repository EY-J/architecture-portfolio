"use client";

import { gsap } from "gsap";
import { type RefObject, useEffect, useRef } from "react";

import styles from "./ProjectHoverCursor.module.css";

type ProjectHoverCursorProps = {
  rootRef: RefObject<HTMLDivElement | null>;
  disabled?: boolean;
};

export function ProjectHoverCursor({
  rootRef,
  disabled = false,
}: ProjectHoverCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    const label = labelRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (!root || !cursor || !label || !finePointer.matches) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (disabled) {
      delete root.dataset.projectCursor;
      gsap.to(label, {
        autoAlpha: 0,
        duration: reducedMotion ? 0 : 0.2,
        ease: "power3.out",
        overwrite: true,
        scale: reducedMotion ? 1 : 0.8,
      });

      return () => gsap.killTweensOf(label);
    }

    const followDuration = reducedMotion ? 0 : 0.24;
    const xTo = gsap.quickTo(cursor, "x", {
      duration: followDuration,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(cursor, "y", {
      duration: followDuration,
      ease: "power3.out",
    });
    let activeMedia: HTMLElement | null = null;

    gsap.set(label, { autoAlpha: 0, scale: reducedMotion ? 1 : 0.8 });

    const hideCursor = () => {
      delete root.dataset.projectCursor;
      if (!activeMedia) return;

      activeMedia = null;
      gsap.to(label, {
        autoAlpha: 0,
        duration: reducedMotion ? 0 : 0.28,
        ease: "power3.out",
        overwrite: true,
        scale: reducedMotion ? 1 : 0.8,
      });
    };

    const moveCursor = (event: PointerEvent) => {
      const target = event.target;
      const media =
        target instanceof Element
          ? target.closest<HTMLElement>("[data-project-media]")
          : null;

      if (!media || !root.contains(media)) {
        hideCursor();
        return;
      }

      root.dataset.projectCursor = "enabled";

      if (media !== activeMedia) {
        activeMedia = media;
        gsap.set(cursor, { x: event.clientX, y: event.clientY });
        gsap.to(label, {
          autoAlpha: 1,
          duration: reducedMotion ? 0 : 0.22,
          ease: "power3.out",
          overwrite: true,
          scale: 1,
        });
        return;
      }

      xTo(event.clientX);
      yTo(event.clientY);
    };

    root.addEventListener("pointermove", moveCursor);
    root.addEventListener("pointerleave", hideCursor);
    window.addEventListener("scroll", hideCursor, { passive: true });
    window.addEventListener("wheel", hideCursor, { passive: true });
    window.addEventListener("blur", hideCursor);

    return () => {
      root.removeEventListener("pointermove", moveCursor);
      root.removeEventListener("pointerleave", hideCursor);
      window.removeEventListener("scroll", hideCursor);
      window.removeEventListener("wheel", hideCursor);
      window.removeEventListener("blur", hideCursor);
      delete root.dataset.projectCursor;
      gsap.killTweensOf(cursor);
      gsap.killTweensOf(label);
    };
  }, [disabled, rootRef]);

  return (
    <div ref={cursorRef} className={styles.cursor} aria-hidden="true">
      <span ref={labelRef}>View project ↗</span>
    </div>
  );
}
