"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

import { designFocusAreas } from "@/data/designFocus";
import { shouldReduceMotion } from "@/hooks/usePrefersReducedMotion";

import styles from "./DesignFocus.module.css";

gsap.registerPlugin(ScrollTrigger);

export function DesignFocus() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || shouldReduceMotion()) return;

    const context = gsap.context(() => {
      const heading = section.querySelector<HTMLElement>(
        "[data-focus-heading]",
      );
      const cards = gsap.utils.toArray<HTMLElement>("[data-focus-card]", section);

      if (!heading || !cards.length) return;

      gsap.set(heading, { autoAlpha: 0 });
      gsap.set(cards, { autoAlpha: 0, y: 20 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        })
        .to(heading, {
          autoAlpha: 1,
          duration: 0.45,
          ease: "power2.out",
        })
        .to(
          cards,
          {
            autoAlpha: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            y: 0,
          },
          "-=0.18",
        );
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="design-focus-title"
    >
      <header className={styles.heading} data-focus-heading>
        <h2 id="design-focus-title">Design Focus</h2>
      </header>

      <div className={styles.grid}>
        {designFocusAreas.map((focus) => (
          <article
            key={focus.title}
            className={styles.card}
            data-focus-card
            data-header-surface="image"
          >
            <Image
              className={styles.image}
              src={focus.image}
              alt={focus.imageAlt}
              fill
              sizes="(max-width: 768px) 82vw, (max-width: 1152px) 33vw, 20vw"
            />
            <div className={styles.overlay} aria-hidden="true" />
            <div className={styles.content}>
              <h3>{focus.title}</h3>
              <p>{focus.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
