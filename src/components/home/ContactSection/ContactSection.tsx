"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef } from "react";

import { siteConfig } from "@/config/site";
import { shouldReduceMotion } from "@/hooks/usePrefersReducedMotion";

import { ContactForm } from "./ContactForm";
import styles from "./ContactSection.module.css";

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (
      !section ||
      shouldReduceMotion() ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const elements = section.querySelectorAll<HTMLElement>(
      "[data-contact-reveal]",
    );
    let tween: gsap.core.Tween | undefined;
    gsap.set(elements, { autoAlpha: 0, y: 18 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        tween = gsap.to(elements, {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "opacity,visibility,transform",
        });
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      tween?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="project-inquiry"
      aria-labelledby="project-inquiry-title"
    >
      <div className={styles.shell}>
        <div className={styles.card}>
          <div className={styles.introduction} data-contact-reveal>
            <h2 id="project-inquiry-title">
              Let’s create
              <br />
              something
              <br />
              timeless.
            </h2>

            <p className={styles.copy}>
              I’m always excited to hear about meaningful ideas, thoughtful
              spaces, and new collaborations. Whether it’s architecture,
              visualization, or a concept still taking shape, feel free to reach
              out.
            </p>

            <div className={styles.location}>
              <p>Based in {siteConfig.location}.</p>
              <p>Available for select projects worldwide.</p>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
