import Link from "next/link";

import { BrandLogo } from "@/components/branding/BrandLogo/BrandLogo";
import { siteConfig } from "@/config/site";
import { getSocialLinks } from "@/lib/socials";

import { BackToTopButton } from "./BackToTopButton";
import { SocialIcon } from "./SocialIcon";
import styles from "./Footer.module.css";

const selectedWork = [
  "Residential",
  "Commercial",
  "Interior",
  "Conceptual",
] as const;

export function Footer() {
  const socialLinks = getSocialLinks();
  const phoneHref = siteConfig.phone.replace(/[^\d+]/g, "");

  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} site-shell`}>
        <div className={styles.main}>
          <div className={styles.brandColumn}>
            <div className={styles.identity}>
              <BrandLogo className={styles.logo} inverse />
              <span>{siteConfig.name}</span>
            </div>

            <p className={styles.statement}>
              A quiet pursuit of space, light, and purpose.
              <br />
              Architecture that is honest, enduring,
              <br />
              and deeply connected to life.
            </p>

            <ul className={styles.socials} aria-label="Social profiles">
              {socialLinks.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <h2>Selected work</h2>
            <ul>
              {selectedWork.map((category) => (
                <li key={category}>
                  <Link href="/projects">{category}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.column} ${styles.contactColumn}`}>
            <h2>Get in touch</h2>
            <address>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              <a href={`tel:${phoneHref}`}>{siteConfig.phone}</a>
              <span>{siteConfig.location}</span>
            </address>
          </div>
        </div>

        <div className={styles.footerActions}>
          <p className={styles.copyright}>
            © {siteConfig.name} {new Date().getFullYear()}. All rights reserved.
          </p>
          <BackToTopButton />
        </div>
      </div>
    </footer>
  );
}
