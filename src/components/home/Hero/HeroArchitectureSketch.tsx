import Image from "next/image";

import styles from "./Hero.module.css";

const revealRegions = [
  styles?.constructionRegion,
  styles?.siteRegion,
  styles?.lowerArchitectureRegion,
  styles?.cantileverRegion,
  styles?.primaryFrameRegion,
  styles?.glazingRegion,
  styles?.stairsRegion,
];

export function HeroArchitectureSketch() {
  return (
    <div className={styles?.sketchLayer} aria-hidden="true">
      {revealRegions?.map((regionClass) => (
        <Image
          key={regionClass}
          className={`${styles?.architectureSketch} ${styles?.revealLayer} ${regionClass}`}
          src="/images/ej-studio-hero-sketch.png"
          alt=""
          fill
          sizes="(max-width: 48rem) 140vw, 82vw"
          draggable={false}
        />
      ))}

      <Image
        className={`${styles?.architectureSketch} ${styles?.finalSketch}`}
        src="/images/ej-studio-hero-sketch.png"
        alt=""
        fill
        priority
        sizes="(max-width: 48rem) 140vw, 82vw"
        draggable={false}
      />
    </div>
  );
}
