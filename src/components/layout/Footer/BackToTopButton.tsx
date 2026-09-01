"use client";

import { useSmoothScroll } from "@/components/layout/SmoothScroll/SmoothScroll";
import { shouldReduceMotion } from "@/hooks/usePrefersReducedMotion";

import styles from "./Footer.module.css";

export function BackToTopButton() {
  const { scrollTo } = useSmoothScroll();

  const scrollToTop = () => {
    scrollTo(0, { immediate: shouldReduceMotion() });
  };

  return (
    <button className={styles.backToTop} type="button" onClick={scrollToTop}>
      Back to top <span aria-hidden="true">↑</span>
    </button>
  );
}
