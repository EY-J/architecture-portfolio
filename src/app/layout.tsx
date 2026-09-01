import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";

import { ContactSection } from "@/components/home/ContactSection/ContactSection";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { PageTransition } from "@/components/layout/PageTransition/PageTransition";
import { ScrollActivityController } from "@/components/layout/ScrollActivityController/ScrollActivityController";
import { SmoothScroll } from "@/components/layout/SmoothScroll/SmoothScroll";
import { siteConfig } from "@/config/site";

import "lenis/dist/lenis.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const aboutSerif = Bodoni_Moda({
  variable: "--font-about-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Architecture + Visualization`,
    template: `%s — ${siteConfig.name}`,
  },
  icons: {
    icon: {
      url: "/images/ej-studio-logo-original.png",
      type: "image/png",
    },
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  category: "Architecture",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f2f0eb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${aboutSerif.variable}`}>
      <body>
        <SmoothScroll>
          <ScrollActivityController />
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <div className="page-frame">
            <Header />
            <main id="main-content">
              <PageTransition>{children}</PageTransition>
            </main>
            <ContactSection />
            <Footer />
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
