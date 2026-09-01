"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis, { type ScrollToOptions } from "lenis";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

type ScrollTarget = HTMLElement | number | string;
type SmoothScrollOptions = Pick<
  ScrollToOptions,
  "duration" | "force" | "immediate" | "lock" | "offset" | "onComplete"
>;

type SmoothScrollContextValue = {
  acquireScrollLock: () => () => void;
  scrollTo: (target: ScrollTarget, options?: SmoothScrollOptions) => void;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(
  null,
);

const coarsePointerQuery = "(hover: none), (pointer: coarse)";

function subscribeToCoarsePointer(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(coarsePointerQuery);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getCoarsePointerSnapshot() {
  return window.matchMedia(coarsePointerQuery).matches;
}

function getServerCoarsePointerSnapshot() {
  return false;
}

function getNativeScrollTop(target: ScrollTarget, offset = 0) {
  if (typeof target === "number") return target + offset;
  if (target === "top" || target === "start") return offset;
  if (target === "bottom" || target === "end") {
    return document.documentElement.scrollHeight - window.innerHeight + offset;
  }

  const element =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : target;

  return element
    ? element.getBoundingClientRect().top + window.scrollY + offset
    : window.scrollY;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();
  const usesCoarsePointer = useSyncExternalStore(
    subscribeToCoarsePointer,
    getCoarsePointerSnapshot,
    getServerCoarsePointerSnapshot,
  );
  const lenisRef = useRef<Lenis | null>(null);
  const scrollLockCountRef = useRef(0);
  const previousPathnameRef = useRef(pathname);
  const isExperienceRoute = pathname.startsWith("/experience/");

  const scrollTo = useCallback(
    (target: ScrollTarget, options: SmoothScrollOptions = {}) => {
      const lenis = lenisRef.current;

      if (lenis) {
        lenis.scrollTo(target, options);
        return;
      }

      const top = getNativeScrollTop(target, options.offset);
      window.scrollTo({
        top: Math.max(0, top),
        behavior:
          options.immediate || prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [prefersReducedMotion],
  );

  const acquireScrollLock = useCallback(() => {
    let released = false;
    scrollLockCountRef.current += 1;
    lenisRef.current?.stop();

    return () => {
      if (released) return;
      released = true;
      scrollLockCountRef.current = Math.max(0, scrollLockCountRef.current - 1);

      if (scrollLockCountRef.current === 0) {
        lenisRef.current?.start();
      }
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || usesCoarsePointer || isExperienceRoute) {
      return;
    }

    const lenis = new Lenis({
      anchors: true,
      autoRaf: false,
      duration: 1.3,
      overscroll: true,
      prevent: (node) => Boolean(node.closest("[data-lenis-prevent]")),
      respectReducedMotion: true,
      smoothWheel: true,
      stopInertiaOnNavigate: true,
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 0.85,
    });

    lenisRef.current = lenis;
    if (scrollLockCountRef.current > 0) lenis.stop();

    const updateScrollTrigger = () => ScrollTrigger.update();
    const removeScrollListener = lenis.on("scroll", updateScrollTrigger);
    const updateLenis = (time: number) => lenis.raf(time * 1000);

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      removeScrollListener();
      gsap.ticker.remove(updateLenis);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      if (lenisRef.current === lenis) lenisRef.current = null;
    };
  }, [isExperienceRoute, prefersReducedMotion, usesCoarsePointer]);

  useEffect(() => {
    const routeChanged = previousPathnameRef.current !== pathname;
    previousPathnameRef.current = pathname;

    if (routeChanged && !window.location.hash) {
      scrollTo(0, { force: true, immediate: true });
    }

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        lenisRef.current?.resize();
        ScrollTrigger.refresh();
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [pathname, scrollTo]);

  const value = useMemo(
    () => ({ acquireScrollLock, scrollTo }),
    [acquireScrollLock, scrollTo],
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  const context = useContext(SmoothScrollContext);
  if (!context) {
    throw new Error("useSmoothScroll must be used inside SmoothScroll.");
  }
  return context;
}
