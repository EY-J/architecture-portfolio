"use client";

import { useEffect, useState } from "react";

import { viewerPerformance } from "@/config/viewer";

export function useResponsiveViewer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(viewerPerformance.mobileQuery);
    const updateMatch = () => setIsMobile(mediaQuery.matches);

    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);

    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, []);

  return {
    isMobile,
    maxDpr: isMobile
      ? viewerPerformance.mobileMaxDpr
      : viewerPerformance.desktopMaxDpr,
    shadowsEnabled: !isMobile,
  };
}
