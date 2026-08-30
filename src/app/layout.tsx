import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";

import { ContactSection } from "@/components/home/ContactSection/ContactSection";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { PageTransition } from "@/components/layout/PageTransition/PageTransition";
import { siteConfig } from "@/config/site";

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
    <html
      lang="en"
      className={`${inter.variable} ${aboutSerif.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
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

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Farchitectu1452back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.20" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}
