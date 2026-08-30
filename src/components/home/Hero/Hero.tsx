import { siteConfig } from "@/config/site";

import { HeroArchitectureSketch } from "./HeroArchitectureSketch";
import { HomeWordmarkTransition } from "./HomeWordmarkTransition";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section
      id="hero"
      className={styles?.hero}
      aria-labelledby="home-title"
      data-home-hero
    >
      <HeroArchitectureSketch />

      <div className={styles?.titleField}>
        <p className={`${styles?.discipline} eyebrow`} data-reveal="meta">
          Architecture / Spatial Design / Visualization
        </p>
        <div className={styles?.titleReveal} data-reveal="title">
          <h1
            id="home-title"
            className={styles?.title}
            data-home-wordmark-source
          >
            {siteConfig?.name}
          </h1>
        </div>

        <p className={styles?.descriptor} data-reveal="meta" data-reveal-order="1">
          Designing for the people, by the people
          <br />
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <div className={styles?.lower} data-reveal="meta" data-reveal-order="2">
        <a className={styles?.scrollCue} href="#selected-projects">
          <span className={styles?.mouse} aria-hidden="true">
            <span />
          </span>
          <span className={styles?.scrollDivider} aria-hidden="true" />
          <span>Scroll to explore</span>
        </a>
      </div>

      <HomeWordmarkTransition />
    </section>
  );
}
