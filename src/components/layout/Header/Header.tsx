"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { BrandLogo } from "@/components/branding/BrandLogo/BrandLogo";
import { primaryNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import styles from "./Header.module.css";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        target.scrollIntoView({ block: "start" });
        window.history.replaceState(null, "", cleanUrl);
        return;
      }
    }

    if (isReload) {
      window.history.replaceState(null, "", cleanUrl);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setIsMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const root = document.documentElement;

    if (!isHome) {
      root.removeAttribute("data-home-scrollbar");
      root.removeAttribute("data-scroll-active");
      return;
    }

    let idleTimer: number | undefined;

    const updateScrollbarThumb = () => {
      const thumb = scrollbarThumbRef.current;
      if (!thumb) return;

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

    root.setAttribute("data-home-scrollbar", "");
    root.removeAttribute("data-scroll-active");
    updateScrollbarThumb();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollbarThumb, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollbarThumb);
    resizeObserver.observe(root);

    return () => {
      if (idleTimer !== undefined) {
        window.clearTimeout(idleTimer);
      }

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollbarThumb);
      resizeObserver.disconnect();
      root.removeAttribute("data-home-scrollbar");
      root.removeAttribute("data-scroll-active");
    };
  }, [isHome]);

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
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const hero = document.getElementById("hero");

    window.history.replaceState(null, "", cleanUrl);

    if (hero) {
      hero.scrollIntoView({
        block: "start",
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
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
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const scrollToAbout = () => {
      about.scrollIntoView({
        block: "start",
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
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
                onClick={() => setIsMenuOpen(false)}
              >
                <span>CV ↗</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      {isHome ? (
        <span
          ref={scrollbarThumbRef}
          className={styles.scrollbarThumb}
          aria-hidden="true"
        />
      ) : null}
    </header>
  );
}
