"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import styles from "./Footer.module.css";

const revealRegions = [
  styles.siteRegion,
  styles.baseRegion,
  styles.primaryVolumesRegion,
  styles.upperVolumesRegion,
  styles.stairsRegion,
  styles.treeRegion,
];

export function FooterArchitectureSketch() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    if (!("IntersectionObserver" in window)) {
      layer.dataset.visible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        layer.dataset.visible = "true";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    observer.observe(layer);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={layerRef}
      className={styles.sketchLayer}
      data-visible="false"
      aria-hidden="true"
    >
      {revealRegions.map((regionClass) => (
        <Image
          key={regionClass}
          className={`${styles.footerSketch} ${styles.revealLayer} ${regionClass}`}
          src="/images/ej-studio-footer-sketch.png"
          alt=""
          fill
          sizes="(max-width: 48rem) 125vw, 66vw"
          draggable={false}
        />
      ))}

      <Image
        className={`${styles.footerSketch} ${styles.finalSketch}`}
        src="/images/ej-studio-footer-sketch.png"
        alt=""
        fill
        sizes="(max-width: 48rem) 125vw, 66vw"
        draggable={false}
      />
    </div>
  );
}
