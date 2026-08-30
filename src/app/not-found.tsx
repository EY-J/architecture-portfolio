import Link from "next/link";

import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={`${styles?.page} site-shell`}>
      <p className="eyebrow muted" data-reveal="meta">404 / Outside the index</p>
      <div className={styles?.content} data-reveal="section">
        <p className={styles?.code} aria-hidden="true">
          404
        </p>
        <div>
          <h1>This space has not been drawn.</h1>
          <p>
            The page or project may have moved, or its slug may not match the project
            configuration.
          </p>
          <div className={styles?.links}>
            <Link href="/">Return home</Link>
            <Link href="/projects">Open project index</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
