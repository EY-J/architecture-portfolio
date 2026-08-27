"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect } from "react";

import { shouldReduceMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

function getDocumentPosition(element: HTMLElement) {
  let left = 0;
  let top = 0;
  let current: HTMLElement | null = element;

  while (current) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  return { left, top };
}

export function HomeWordmarkTransition() {
  useLayoutEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-home-hero]");
    const header = document.querySelector<HTMLElement>("[data-home-header]");
    const source = document.querySelector<HTMLElement>(
      "[data-home-wordmark-source]",
    );
    const target = document.querySelector<HTMLElement>(
      "[data-home-wordmark-target]",
    );

    if (!hero || !header || !source || !target || shouldReduceMotion()) return;

    const movingTitle = source.cloneNode(true) as HTMLElement;
    movingTitle.removeAttribute("id");
    movingTitle.removeAttribute("data-home-wordmark-source");
    movingTitle.setAttribute("aria-hidden", "true");
    document.body.appendChild(movingTitle);

    const getScrollDistance = () =>
      Math.max(hero.offsetHeight * 0.6, window.innerHeight * 0.48);

    const getStartScroll = () => {
      const heroPosition = getDocumentPosition(hero);
      return Math.max(heroPosition.top - header.offsetHeight, 0);
    };

    const context = gsap.context(() => {
      gsap.set(movingTitle, {
        position: "fixed",
        zIndex: 101,
        top: 0,
        left: 0,
        maxWidth: "none",
        margin: 0,
        opacity: 0,
        pointerEvents: "none",
        transformOrigin: "left top",
        willChange: "transform, opacity",
      });
      gsap.set(target, { opacity: 0, willChange: "opacity" });

      let visibleOwner: "source" | "moving" | "target" | null = null;
      const setVisibleOwner = (owner: typeof visibleOwner) => {
        if (owner === visibleOwner) return;
        visibleOwner = owner;

        gsap.set(source, { opacity: owner === "source" ? 1 : 0 });
        gsap.set(movingTitle, { opacity: owner === "moving" ? 1 : 0 });
        gsap.set(target, { opacity: owner === "target" ? 1 : 0 });
      };

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: () => `top ${header.offsetHeight}px`,
          end: () => `+=${getScrollDistance()}`,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            if (progress >= 0.999) {
              setVisibleOwner("target");
            } else if (progress > 0.001) {
              setVisibleOwner("moving");
            } else {
              setVisibleOwner("source");
            }
          },
        },
      });

      timeline
        .fromTo(
          movingTitle,
          {
            x: () => getDocumentPosition(source).left,
            y: () => getDocumentPosition(source).top - getStartScroll(),
            scaleX: 1,
            scaleY: 1,
          },
          {
            x: () => target.getBoundingClientRect().left,
            y: () => target.getBoundingClientRect().top,
            scaleX: () => target.offsetWidth / source.offsetWidth,
            scaleY: () => target.offsetHeight / source.offsetHeight,
            duration: 1,
          },
          0,
        )
        .to(
          header,
          {
            "--header-rule-opacity": 1,
            duration: 1,
          },
          0,
        );

      setVisibleOwner("source");
    });

    return () => {
      context.revert();
      movingTitle.remove();
    };
  }, []);

  return null;
}
