"use client";

import { useEffect } from "react";

const SCROLL_IDLE_DELAY = 700;

export function ScrollActivityController() {
  useEffect(() => {
    const idleTimers = new Map<HTMLElement, number>();

    const markScrollableElementActive = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target === document.documentElement || target === document.body) {
        return;
      }

      target.setAttribute("data-scroll-active", "");

      const existingTimer = idleTimers.get(target);
      if (existingTimer !== undefined) window.clearTimeout(existingTimer);

      const idleTimer = window.setTimeout(() => {
        target.removeAttribute("data-scroll-active");
        idleTimers.delete(target);
      }, SCROLL_IDLE_DELAY);

      idleTimers.set(target, idleTimer);
    };

    document.addEventListener("scroll", markScrollableElementActive, {
      capture: true,
      passive: true,
    });

    return () => {
      document.removeEventListener("scroll", markScrollableElementActive, {
        capture: true,
      });

      idleTimers.forEach((timer, element) => {
        window.clearTimeout(timer);
        element.removeAttribute("data-scroll-active");
      });
      idleTimers.clear();
    };
  }, []);

  return null;
}
