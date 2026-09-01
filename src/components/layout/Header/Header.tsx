"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { BrandLogo } from "@/components/branding/BrandLogo/BrandLogo";
import { useSmoothScroll } from "@/components/layout/SmoothScroll/SmoothScroll";
import { primaryNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./Header.module.css";

const CONTRAST_SAMPLE_SIZE = 48;
// Exact contrast crossover for the theme's #171714 and #f5f2ea text colors.
// Below this luminance the off-white token has stronger contrast; above it the
// dark token does.
const DARK_LUMINANCE_THRESHOLD = 0.184;

type ImageSample = {
  context: CanvasRenderingContext2D;
  size: number;
};

const imageSampleCache = new WeakMap<HTMLImageElement, ImageSample>();

function toLinearChannel(channel: number) {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
}

function getImageLuminance(image: HTMLImageElement, x: number, y: number) {
  if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
    return null;
  }

  let sample = imageSampleCache.get(image);

  if (!sample) {
    const canvas = document.createElement("canvas");
    canvas.width = CONTRAST_SAMPLE_SIZE;
    canvas.height = CONTRAST_SAMPLE_SIZE;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;

    try {
      context.drawImage(
        image,
        0,
        0,
        CONTRAST_SAMPLE_SIZE,
        CONTRAST_SAMPLE_SIZE,
      );
    } catch {
      return null;
    }

    sample = { context, size: CONTRAST_SAMPLE_SIZE };
    imageSampleCache.set(image, sample);
  }

  const rect = image.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const sourceAspect = image.naturalWidth / image.naturalHeight;
  const boxAspect = rect.width / rect.height;
  let sourceX = 0;
  let sourceY = 0;
  let visibleWidth = image.naturalWidth;
  let visibleHeight = image.naturalHeight;

  if (sourceAspect > boxAspect) {
    visibleWidth = image.naturalHeight * boxAspect;
    sourceX = (image.naturalWidth - visibleWidth) / 2;
  } else {
    visibleHeight = image.naturalWidth / boxAspect;
    sourceY = (image.naturalHeight - visibleHeight) / 2;
  }

  const normalizedX = Math.min(1, Math.max(0, (x - rect.left) / rect.width));
  const normalizedY = Math.min(1, Math.max(0, (y - rect.top) / rect.height));
  const pixelX = Math.round(
    ((sourceX + normalizedX * visibleWidth) / image.naturalWidth) *
      (sample.size - 1),
  );
  const pixelY = Math.round(
    ((sourceY + normalizedY * visibleHeight) / image.naturalHeight) *
      (sample.size - 1),
  );
  const startX = Math.max(0, pixelX - 1);
  const startY = Math.max(0, pixelY - 1);
  const width = Math.min(3, sample.size - startX);
  const height = Math.min(3, sample.size - startY);

  try {
    const pixels = sample.context.getImageData(
      startX,
      startY,
      width,
      height,
    ).data;
    let luminance = 0;
    let count = 0;

    for (let index = 0; index < pixels.length; index += 4) {
      luminance +=
        0.2126 * toLinearChannel(pixels[index]) +
        0.7152 * toLinearChannel(pixels[index + 1]) +
        0.0722 * toLinearChannel(pixels[index + 2]);
      count += 1;
    }

    return count > 0 ? luminance / count : null;
  } catch {
    return null;
  }
}

function getSurfaceAtPoint(header: HTMLElement, x: number, y: number) {
  const directSurface = document
    .elementsFromPoint(x, y)
    .find((element) => !header.contains(element))
    ?.closest<HTMLElement>("[data-header-surface]");

  if (directSurface) return directSurface;

  const surfaces = Array.from(
    document.querySelectorAll<HTMLElement>("[data-header-surface]"),
  );

  return surfaces.reverse().find((surface) => {
    const rect = surface.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  });
}

function pointNeedsLightText(header: HTMLElement, x: number, y: number) {
  const surface = getSurfaceAtPoint(header, x, y);
  if (!surface) return false;

  const surfaceType = surface.dataset.headerSurface;
  if (surfaceType === "dark") return true;
  if (surfaceType !== "image") return false;

  const image = Array.from(surface.querySelectorAll("img")).find((candidate) => {
    const rect = candidate.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  });
  if (!image) return false;

  const luminance = getImageLuminance(image, x, y);
  return luminance !== null && luminance < DARK_LUMINANCE_THRESHOLD;
}

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const prefersReducedMotion = usePrefersReducedMotion();
  const { acquireScrollLock, scrollTo: smoothScrollTo } = useSmoothScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const scrollbarThumbRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (pathname !== "/") return;

    const [navigationEntry] = performance.getEntriesByType("navigation");
    const isReload =
      (navigationEntry as PerformanceNavigationTiming | undefined)?.type ===
      "reload";
    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    const sectionTargets: Record<string, string> = {
      "#about": "about",
      "#selected-projects": "selected-projects",
    };
    const targetId = sectionTargets[window.location.hash];

    if (targetId) {
      const target = document.getElementById(targetId);

      if (target) {
        smoothScrollTo(target, { immediate: prefersReducedMotion });
        window.history.replaceState(null, "", cleanUrl);
        return;
      }
    }

    if (isReload) {
      window.history.replaceState(null, "", cleanUrl);
      smoothScrollTo(0, { force: true, immediate: true });
    }
  }, [pathname, prefersReducedMotion, smoothScrollTo]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setIsMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    const releaseScrollLock = acquireScrollLock();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      releaseScrollLock();
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [acquireScrollLock, isMenuOpen]);

  useEffect(() => {
    const root = document.documentElement;

    let idleTimer: number | undefined;

    const updateScrollbarThumb = () => {
      const header = headerRef.current;
      const thumb = scrollbarThumbRef.current;
      if (!header || !thumb) return;

      const contrastTargets = header.querySelectorAll<HTMLElement>(
        "[data-header-contrast-target]",
      );

      contrastTargets.forEach((target) => {
        const rect = target.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          target.removeAttribute("data-on-dark");
          return;
        }

        const sampleY = rect.top + rect.height / 2;
        const samplePositions = [0.15, 0.35, 0.5, 0.65, 0.85];
        const lightTextVotes = samplePositions.reduce(
          (votes, position) =>
            votes +
            Number(
              pointNeedsLightText(
                header,
                rect.left + rect.width * position,
                sampleY,
              ),
            ),
          0,
        );

        target.toggleAttribute(
          "data-on-dark",
          lightTextVotes > samplePositions.length / 2,
        );
      });

      const viewportHeight = window.innerHeight;
      const documentHeight = root.scrollHeight;
      const trackInset = 4;
      const trackHeight = Math.max(0, viewportHeight - trackInset * 2);
      const maximumScroll = Math.max(0, documentHeight - viewportHeight);
      const thumbHeight = Math.max(
        36,
        Math.min(trackHeight, (viewportHeight / documentHeight) * trackHeight),
      );
      const maximumOffset = Math.max(0, trackHeight - thumbHeight);
      const scrollProgress =
        maximumScroll > 0
          ? Math.min(1, Math.max(0, window.scrollY / maximumScroll))
          : 0;

      thumb.style.display = maximumScroll > 0 ? "block" : "none";
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translate3d(0, ${trackInset + scrollProgress * maximumOffset}px, 0)`;
    };

    const handleScroll = () => {
      updateScrollbarThumb();
      root.setAttribute("data-scroll-active", "");

      if (idleTimer !== undefined) {
        window.clearTimeout(idleTimer);
      }

      idleTimer = window.setTimeout(() => {
        root.removeAttribute("data-scroll-active");
      }, 650);
    };

    root.setAttribute("data-site-scrollbar", "");
    root.removeAttribute("data-scroll-active");
    updateScrollbarThumb();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollbarThumb, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollbarThumb);
    resizeObserver.observe(root);
    const pageImages = Array.from(document.images);
    pageImages.forEach((image) =>
      image.addEventListener("load", updateScrollbarThumb),
    );

    return () => {
      if (idleTimer !== undefined) {
        window.clearTimeout(idleTimer);
      }

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollbarThumb);
      resizeObserver.disconnect();
      pageImages.forEach((image) =>
        image.removeEventListener("load", updateScrollbarThumb),
      );
      root.removeAttribute("data-site-scrollbar");
      root.removeAttribute("data-scroll-active");
    };
  }, [pathname]);

  const handleIdentityClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setIsMenuOpen(false);

    if (
      !isHome ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    const hero = document.getElementById("hero");

    window.history.replaceState(null, "", cleanUrl);
    smoothScrollTo(hero ?? 0, { immediate: prefersReducedMotion });
  };

  const handleAboutClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setIsMenuOpen(false);

    if (
      !isHome ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const about = document.getElementById("about");
    if (!about) return;

    event.preventDefault();

    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    const scrollToAbout = () => {
      smoothScrollTo(about, { immediate: prefersReducedMotion });
      window.history.replaceState(null, "", cleanUrl);
    };

    if (isMenuOpen) {
      window.requestAnimationFrame(scrollToAbout);
      return;
    }

    scrollToAbout();
  };

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${isHome ? styles.homeHeader : ""}`}
      data-home-header={isHome ? "" : undefined}
    >
      <div className={`${styles.inner} site-shell`}>
        <Link
          className={styles.identity}
          href="/"
          aria-label={`${siteConfig.name} home`}
          onClick={handleIdentityClick}
        >
          <BrandLogo className={styles.identityLogo} priority />
          <span
            className={styles.identityName}
            data-header-contrast-target
            data-home-wordmark-target={isHome ? "" : undefined}
          >
            {siteConfig.name}
          </span>
        </Link>
        <button
          ref={menuButtonRef}
          className={styles.menuButton}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          aria-label={`${isMenuOpen ? "Close" : "Open"} primary navigation`}
          data-header-contrast-target
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span>{isMenuOpen ? "Close" : "Menu"}</span>
          <span className={styles.menuState} aria-hidden="true">
            {isMenuOpen ? "—" : "+"}
          </span>
        </button>

        <nav
          id="primary-navigation"
          className={`${styles.navigation} ${isMenuOpen ? styles.navigationOpen : ""}`}
          aria-label="Primary navigation"
        >
          <ul className={styles.navigationList}>
            {primaryNavigation.map((item) => {
              const isAboutLink = item.href === "/#about";
              const isActive = !isAboutLink && pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    className={styles.navigationLink}
                    href={item.href}
                    data-header-contrast-target
                    aria-current={isActive ? "page" : undefined}
                    onClick={
                      isAboutLink
                        ? handleAboutClick
                        : () => setIsMenuOpen(false)
                    }
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <a
                className={styles.navigationLink}
                href="/files/erika-joy-esplago-cv.pdf"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="CV (opens in a new tab)"
                data-header-contrast-target
                onClick={() => setIsMenuOpen(false)}
              >
                <span>CV ↗</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <span
        ref={scrollbarThumbRef}
        className={styles.scrollbarThumb}
        aria-hidden="true"
      />
    </header>
  );
}
