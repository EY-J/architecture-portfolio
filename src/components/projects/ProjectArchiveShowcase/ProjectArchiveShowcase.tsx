"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NextImage from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { ProjectHoverCursor } from "@/components/projects/ProjectHoverCursor/ProjectHoverCursor";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { ArchitectureProject } from "@/types/project";

import styles from "./ProjectArchiveShowcase.module.css";

gsap.registerPlugin(ScrollTrigger);

const SLIDE_HOLD_DURATION = 5200;
const CROSSFADE_DURATION = 950;
const TEXT_SWAP_DELAY = 500;
const TEXT_ENTRY_DELAY = 32;
const TRANSITION_SCRUB = 1.15;
const HERO_INTERACTION_DISABLE_PROGRESS = 0.6;
const heroFadeEase = (progress: number) => Math.pow(progress, 2.45);
const creamFadeEase = (progress: number) => Math.pow(progress, 1.9);
const scrimFadeEase = (progress: number) => Math.pow(progress, 1.65);

type TextPhase = "idle" | "out" | "before-in" | "in";

type ProjectArchiveShowcaseProps = {
  projects: readonly ArchitectureProject[];
};

export function ProjectArchiveShowcase({
  projects,
}: ProjectArchiveShowcaseProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLSpanElement>(null);
  const creamOverlayRef = useRef<HTMLSpanElement>(null);
  const archiveLabelRef = useRef<HTMLParagraphElement>(null);
  const projectInfoRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [textIndex, setTextIndex] = useState(0);
  const [textPhase, setTextPhase] = useState<TextPhase>("idle");
  const [imagesReady, setImagesReady] = useState(false);
  const [heroInteractionDisabled, setHeroInteractionDisabled] = useState(false);
  const heroInteractionDisabledRef = useRef(false);
  const decodedSlidesRef = useRef(new Set<string>());
  const prefersReducedMotion = usePrefersReducedMotion();

  const slides = projects;

  useEffect(() => {
    if (prefersReducedMotion || slides.length < 2 || !imagesReady) {
      return;
    }

    let cycleId = 0;
    let imageTransitionId = 0;
    let textSwapId = 0;
    let textEntryId = 0;

    const advance = () => {
      const currentIndex = activeIndexRef.current;
      const nextIndex = (currentIndex + 1) % slides.length;

      setTextPhase("out");
      setPreviousIndex(currentIndex);
      setActiveIndex(nextIndex);
      activeIndexRef.current = nextIndex;

      window.clearTimeout(imageTransitionId);
      imageTransitionId = window.setTimeout(() => {
        setPreviousIndex(null);
      }, CROSSFADE_DURATION);

      textSwapId = window.setTimeout(() => {
        setTextIndex((current) => (current + 1) % slides.length);
        setTextPhase("before-in");

        textEntryId = window.setTimeout(() => {
          setTextPhase("in");
        }, TEXT_ENTRY_DELAY);
      }, TEXT_SWAP_DELAY);
    };

    const runCycle = () => {
      advance();
      cycleId = window.setTimeout(
        runCycle,
        SLIDE_HOLD_DURATION + CROSSFADE_DURATION,
      );
    };

    const stop = () => {
      if (!cycleId) return;
      window.clearTimeout(cycleId);
      cycleId = 0;
    };

    const start = () => {
      stop();
      if (document.hidden) return;
      cycleId = window.setTimeout(runCycle, SLIDE_HOLD_DURATION);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stop();
        return;
      }

      start();
    };

    start();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stop();
      window.clearTimeout(imageTransitionId);
      window.clearTimeout(textSwapId);
      window.clearTimeout(textEntryId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [imagesReady, prefersReducedMotion, slides.length]);

  useEffect(() => {
    const root = rootRef.current;
    const layers = layersRef.current;
    const scrim = scrimRef.current;
    const creamOverlay = creamOverlayRef.current;
    const archiveLabel = archiveLabelRef.current;
    const projectInfo = projectInfoRef.current;
    const archiveIntro = document.getElementById("projects-title");
    const archiveEyebrow = archiveIntro?.children.item(0);
    const archiveTitle = archiveIntro?.children.item(1);
    const archiveRule = archiveEyebrow?.querySelector("[data-archive-rule]");

    if (
      prefersReducedMotion ||
      !root ||
      !layers ||
      !scrim ||
      !creamOverlay ||
      !archiveLabel ||
      !projectInfo ||
      !(archiveEyebrow instanceof HTMLElement) ||
      !(archiveTitle instanceof HTMLElement) ||
      !(archiveRule instanceof HTMLElement)
    ) {
      return;
    }

    const images = gsap.utils.toArray<HTMLImageElement>(
      `.${styles.image}`,
      root,
    );
    const headerTargets = gsap.utils.toArray<HTMLElement>(
      "[data-header-contrast-target]",
    );
    const rootStyles = getComputedStyle(document.documentElement);
    const inverseText = rootStyles.getPropertyValue("--color-inverse-text").trim();
    const pageText = rootStyles.getPropertyValue("--color-text").trim();

    const context = gsap.context(() => {
      gsap.set(creamOverlay, { opacity: 0 });
      gsap.set(archiveEyebrow, {
        letterSpacing: "0.18em",
        opacity: 0,
        x: -18,
      });
      gsap.set(archiveRule, { scaleX: 0 });
      gsap.set(archiveTitle, {
        opacity: 0,
        y: 24,
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: () => {
            const headerHeight =
              document.querySelector<HTMLElement>("header")?.offsetHeight ?? 0;
            return `top top+=${headerHeight}`;
          },
          endTrigger: archiveIntro,
          end: () => {
            const headerHeight =
              document.querySelector<HTMLElement>("header")?.offsetHeight ?? 0;
            return `top ${headerHeight + 32}px`;
          },
          scrub: TRANSITION_SCRUB,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            const disabled =
              progress >= HERO_INTERACTION_DISABLE_PROGRESS;

            if (disabled === heroInteractionDisabledRef.current) return;

            heroInteractionDisabledRef.current = disabled;
            root.toggleAttribute("data-transition-inactive", disabled);
            setHeroInteractionDisabled(disabled);
          },
        },
      });

      timeline
        .to(layers, { opacity: 0, duration: 1, ease: heroFadeEase }, 0)
        .to(scrim, { opacity: 0, duration: 1, ease: scrimFadeEase }, 0)
        .to(
          images,
          { filter: "brightness(0.92)", duration: 1, ease: heroFadeEase },
          0,
        )
        .to(
          creamOverlay,
          { opacity: 1, duration: 1, ease: creamFadeEase },
          0,
        )
        .to(projectInfo, { opacity: 0, y: -6, duration: 0.33 }, 0.25)
        .to(archiveLabel, { opacity: 0, duration: 0.3 }, 0.4)
        .to(
          archiveEyebrow,
          {
            duration: 0.18,
            ease: "power2.out",
            letterSpacing: "0.12em",
            opacity: 1,
            x: 0,
          },
          0.5,
        )
        .to(
          archiveRule,
          {
            duration: 0.08,
            ease: "power2.out",
            scaleX: 1,
          },
          0.6,
        )
        .to(
          archiveTitle,
          {
            duration: 0.22,
            ease: "power2.out",
            opacity: 1,
            y: 0,
          },
          0.62,
        );

      if (headerTargets.length && inverseText && pageText) {
        timeline.fromTo(
          headerTargets,
          { color: inverseText },
          { color: pageText, duration: 0.45 },
          0.55,
        );
      }

    }, root);

    const refreshFrame = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      context.revert();
      root.removeAttribute("data-transition-inactive");
      heroInteractionDisabledRef.current = false;
      setHeroInteractionDisabled(false);
    };
  }, [prefersReducedMotion]);

  if (!slides.length) return null;

  const textProject = slides[textIndex];
  const showcaseStyle = {
    "--archive-crossfade-duration": `${CROSSFADE_DURATION}ms`,
  } as CSSProperties;

  const markImageReady = (slug: string, image: HTMLImageElement) => {
    if (decodedSlidesRef.current.has(slug)) return;

    const recordDecodedImage = () => {
      decodedSlidesRef.current.add(slug);

      if (decodedSlidesRef.current.size >= slides.length) {
        setImagesReady(true);
      }
    };

    void image.decode().then(recordDecodedImage, recordDecodedImage);
  };

  return (
    <div
      ref={rootRef}
      className={styles.showcase}
      style={showcaseStyle}
      data-header-surface="dark"
    >
      <div className={styles.stage}>
        <Link
          className={styles.projectLink}
          href={`/projects/${textProject.slug}`}
          aria-label={`View project: ${textProject.title}`}
          data-project-media
        >
          <div ref={layersRef} className={styles.layers} aria-hidden="true">
            {slides.map((project, slideIndex) => {
              const isActive = slideIndex === activeIndex;
              const isOutgoing = slideIndex === previousIndex;

              return (
                <div
                  className={`${styles.layer} ${
                    isActive ? styles.activeLayer : ""
                  } ${isOutgoing ? styles.outgoingLayer : ""}`}
                  key={project.slug}
                >
                  <NextImage
                    className={styles.image}
                    src={project.heroImage}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    onLoad={(event) =>
                      markImageReady(project.slug, event.currentTarget)
                    }
                  />
                </div>
              );
            })}
          </div>

          <span ref={scrimRef} className={styles.scrim} aria-hidden="true" />
          <span
            ref={creamOverlayRef}
            className={styles.creamOverlay}
            aria-hidden="true"
          />

          <p ref={archiveLabelRef} className={styles.archiveLabel}>
            Project archives
          </p>

          <div
            ref={projectInfoRef}
            className={styles.projectInfo}
            data-phase={textPhase}
          >
            <h1 className={styles.title}>{textProject.title}</h1>
            <div className={styles.metadata}>
              <p>
                {textProject.category} / {textProject.year}
              </p>
              {textProject.role ? <p>{textProject.role}</p> : null}
            </div>
          </div>
        </Link>
      </div>
      <ProjectHoverCursor
        rootRef={rootRef}
        disabled={heroInteractionDisabled}
      />
    </div>
  );
}
