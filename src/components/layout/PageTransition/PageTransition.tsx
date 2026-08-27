"use client";

import { gsap } from "gsap";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

import {
  shouldReduceMotion,
  usePrefersReducedMotion,
} from "@/hooks/usePrefersReducedMotion";

import styles from "./PageTransition.module.css";

type PageTransitionProps = {
  children: React.ReactNode;
};

type RevealKind = "image" | "meta" | "section" | "title";

function getRevealStart(kind: RevealKind, compact: boolean) {
  const distanceScale = compact ? 0.6 : 1;

  if (kind === "image") {
    return { autoAlpha: 0, y: 22 * distanceScale, scale: 1.02 };
  }
  if (kind === "title") {
    return { autoAlpha: 0, y: 40 * distanceScale, scale: 1 };
  }
  if (kind === "meta") {
    return { autoAlpha: 0, y: 12 * distanceScale, scale: 1 };
  }
  return { autoAlpha: 0, y: 24 * distanceScale, scale: 1 };
}

function getRevealDuration(kind: RevealKind) {
  if (kind === "title") return 0.9;
  if (kind === "image") return 0.8;
  return 0.68;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const elements = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (!elements.length) return;

    if (
      prefersReducedMotion ||
      shouldReduceMotion() ||
      !("IntersectionObserver" in window)
    ) {
      gsap.set(elements, {
        clearProps: "opacity,visibility,transform,willChange",
      });
      return;
    }

    const compact = window.matchMedia("(max-width: 48rem)").matches;
    const tweens: gsap.core.Tween[] = [];
    const context = gsap.context(() => {
      elements.forEach((element) => {
        const kind = (element.dataset.reveal || "section") as RevealKind;
        gsap.set(element, {
          ...getRevealStart(kind, compact),
          willChange: "transform, opacity",
        });
      });
    }, root);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          const order = Number(element.dataset.revealOrder ?? 0);
          const kind = (element.dataset.reveal || "section") as RevealKind;
          const tween = gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: getRevealDuration(kind),
            delay: Math.min(Math.max(order, 0) * 0.07, 0.21),
            ease: "power3.out",
            overwrite: "auto",
            clearProps: "opacity,visibility,transform,willChange",
          });
          tweens.push(tween);
          observer.unobserve(element);
        });
      },
      { rootMargin: "0px 0px -7%", threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      tweens.forEach((tween) => tween.kill());
      context.revert();
    };
  }, [pathname, prefersReducedMotion]);

  return (
    <div ref={rootRef} className={styles.root} data-route={pathname}>
      {children}
    </div>
  );
}
