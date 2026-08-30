"use client";

import { shouldReduceMotion } from "@/hooks/usePrefersReducedMotion";

import styles from "./Footer.module.css";

export function BackToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion() ? "auto" : "smooth",
    });
  };

  return (
    <button className={styles?.backToTop} type="button" onClick={scrollToTop}>Back to top <span aria-hidden="true">↑</span>
    </button>
  );
}
