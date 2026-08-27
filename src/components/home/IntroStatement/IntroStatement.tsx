import Image from "next/image";

import { siteConfig } from "@/config/site";
import {
  capabilities,
  profileContent,
  software,
  toolsAndOthers,
} from "@/data/profile";

import styles from "./IntroStatement.module.css";

const skillGroups = [
  { id: "capabilities", label: "Capabilities", items: capabilities },
  { id: "software", label: "Software", items: software },
  {
    id: "tools-and-others",
    label: "Tools + Workflow",
    items: toolsAndOthers,
  },
] as const;

export function IntroStatement() {
  return (
    <section
      id="about"
      className={styles.about}
      aria-labelledby="about-title"
    >
      <h2 id="about-title" className={styles.label} data-reveal="meta">
        About Me
      </h2>

      <div className={styles.main}>
        <div className={styles.portraitColumn} data-reveal="image">
          <div className={styles.portrait}>
            <div className={styles.portraitCrop}>
              <Image
                className={styles.image}
                src="/images/about/profile.jpeg"
                alt="EJ Studio profile"
                width={2632}
                height={2632}
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </div>
          <p className={styles.verticalMark} aria-hidden="true">
            Designing space · Elevating experience
          </p>
        </div>

        <div className={styles.profile}>
          <header className={styles.identity} data-reveal="section">
            <p className={styles.discipline}>
              Architecture · Space · Experience
            </p>
            <h3 className={styles.name}>Erika Joy Esplago</h3>
            <p className={styles.statement}>
              I design spaces with purpose—where architecture meets experience.
            </p>
          </header>

          <div className={styles.copy}>
            {profileContent.introduction.map((paragraph, index) => (
              <p key={paragraph} data-reveal="section" data-reveal-order={index}>
                {paragraph}
              </p>
            ))}
          </div>

          <dl className={styles.details} data-reveal="section">
            <div>
              <div>
                <dt>Based in</dt>
                <dd>{siteConfig.location}</dd>
              </div>
              <svg
                className={styles.detailIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>
            <div>
              <div>
                <dt>Availability</dt>
                <dd>{siteConfig.contact.availability}</dd>
              </div>
              <svg
                className={styles.detailIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 19 19 5M8 5h11v11" />
              </svg>
            </div>
          </dl>

          <div className={styles.skills}>
            {skillGroups.map((group) => {
              const titleId = `home-${group.id}-title`;

              return (
                <section key={group.id} aria-labelledby={titleId}>
                  <h3 id={titleId}>{group.label}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
